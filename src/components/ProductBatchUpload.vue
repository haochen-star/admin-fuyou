<template>
  <el-dialog
    v-model="visible"
    title="批量上传产品"
    width="1200px"
    @close="handleClose"
  >
    <div class="upload-container">
      <!-- 文件上传区域 -->
      <div class="upload-section" v-loading="parsing && parseProgress.total === 0" element-loading-text="正在读取文件，请稍候...">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          :limit="1"
          accept=".xlsx,.xls"
          :disabled="parsing"
          drag
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 .xlsx 或 .xls 文件
            </div>
          </template>
        </el-upload>
      </div>
      
      <!-- 解析进度条（独立区域，显示在遮罩层之上） -->
      <div v-if="parsing && parseProgress.total > 0" class="parse-progress-wrapper">
        <div class="parse-progress">
          <div class="progress-header">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span class="progress-title">正在解析 Excel 文件</span>
          </div>
          <el-progress 
            :percentage="parseProgress.percentage" 
            :status="parseProgress.percentage === 100 ? 'success' : 'active'"
            :stroke-width="24"
            class="progress-bar"
          >
            <template #default="{ percentage }">
              <span class="progress-text">
                已处理: {{ parseProgress.processed }} / {{ parseProgress.total }} 行 ({{ percentage }}%)
              </span>
            </template>
          </el-progress>
        </div>
      </div>

      <!-- 产品类型选择（如果无法自动识别） -->
      <div v-if="needTypeSelection" class="type-selection" v-loading="parsing" element-loading-text="正在解析 Excel 文件，请稍候...">
        <el-alert
          title="无法自动识别产品类型，请手动选择"
          type="warning"
          :closable="false"
          style="margin-bottom: 15px"
        />
        <el-select
          v-model="selectedType"
          placeholder="请选择产品类型"
          style="width: 100%"
          :disabled="parsing"
        >
          <el-option
            v-for="type in productTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
        <el-button
          type="primary"
          style="margin-top: 10px; width: 100%"
          :disabled="!selectedType || parsing"
          :loading="parsing"
          @click="handleReParse"
        >
          {{ parsing ? '解析中...' : '重新解析' }}
        </el-button>
      </div>

      <!-- 解析结果预览 -->
      <div v-if="previewData && previewData.products.length > 0" class="preview-section" v-loading="parsing">
        <div class="preview-header">
          <div class="preview-stats">
            <el-tag type="info">总行数: {{ previewData.totalRows }}</el-tag>
            <el-tag type="success">有效: {{ previewData.validRows }}</el-tag>
            <el-tag v-if="previewData.errorRows > 0" type="danger">
              错误: {{ previewData.errorRows }}
            </el-tag>
            <el-tag type="primary">产品类型: {{ getTypeLabel(previewData.productType) }}</el-tag>
            <el-tag v-if="previewData.hasMore" type="warning">
              预览: 仅显示前 {{ previewData.previewLimit }} 条
            </el-tag>
          </div>
        </div>
        
        <el-alert
          v-if="previewData.hasMore"
          :title="`共 ${previewData.validRows} 条有效数据，仅预览前 ${previewData.previewLimit} 条。上传时将上传全部 ${previewData.validRows} 条数据。`"
          type="info"
          :closable="false"
          style="margin-top: 10px"
        />

        <!-- 预览表格 -->
        <el-table
          :data="previewTableData"
          border
          max-height="400"
          style="margin-top: 15px"
          :row-class-name="getRowClassName"
        >
          <el-table-column type="index" label="序号" width="60" />
          
          <!-- ELISA Kit / Tyramide TSA Kit 列 -->
          <template v-if="previewData.productType !== 'research_test_reagent'">
            <el-table-column prop="productNo" label="货号" min-width="150" />
            <el-table-column prop="cnName" label="产品名称" min-width="200" />
            <el-table-column prop="productSpec" label="规格" min-width="120" />
            <el-table-column prop="price" label="价格" min-width="100" />
          </template>
          
          <!-- Research Test Reagent 列 -->
          <template v-else>
            <el-table-column prop="productNo" label="产品货号" min-width="150" />
            <el-table-column prop="cnName" label="产品名称" min-width="200" />
            <el-table-column label="基因名称" min-width="150">
              <template #default="{ row }">
                {{ row.details?.geneName || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="推荐应用" min-width="150">
              <template #default="{ row }">
                {{ row.details?.recommendedApplication || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="反应种属" min-width="120">
              <template #default="{ row }">
                {{ row.details?.reactiveSpecies || '-' }}
              </template>
            </el-table-column>
          </template>
          
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag v-if="row._hasError" type="danger" size="small">
                错误: {{ row._errorMessages?.join(', ') || '数据有误' }}
              </el-tag>
              <el-tag v-else type="success" size="small">有效</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 错误详情 -->
        <div v-if="previewData.errors.length > 0" class="error-section">
          <el-alert
            :title="`发现 ${previewData.errors.length} 行数据有误`"
            type="warning"
            :closable="false"
            style="margin-top: 15px"
          />
          <el-collapse style="margin-top: 10px">
            <el-collapse-item
              v-for="error in previewData.errors"
              :key="error.row"
              :title="`第 ${error.row} 行: ${error.errors.join(', ')}`"
            >
              <pre>{{ JSON.stringify(error.data, null, 2) }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="parseError" class="error-message">
        <el-alert
          :title="parseError"
          type="error"
          :closable="false"
        />
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="uploading || parsing"
          :disabled="!canUpload || parsing"
          @click="handleUpload"
        >
          {{ uploading ? '上传中...' : parsing ? '解析中...' : '确认上传' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { UploadFilled, Loading } from '@element-plus/icons-vue'
import { parseExcelFileWithWorker, parseExcelFile, identifyProductType } from '@/utils/excelParser'
import { useProductStore } from '@/stores/product'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  productTypes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const productStore = useProductStore()
const uploadRef = ref(null)
const fileList = ref([])
const previewData = ref(null)
const parseError = ref('')
const needTypeSelection = ref(false)
const selectedType = ref('')
const uploading = ref(false)
const parsing = ref(false)
const parseProgress = ref({ processed: 0, total: 0, percentage: 0 })

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const canUpload = computed(() => {
  return previewData.value && 
         previewData.value.success && 
         previewData.value.products.length > 0 &&
         !uploading.value &&
         !parsing.value
})

// 获取预览表格数据（包含错误标记和错误行，限制预览数量）
const previewTableData = computed(() => {
  if (!previewData.value) return []
  
  const result = []
  const previewLimit = previewData.value.previewLimit || 1000
  
  // 添加有效产品（限制预览数量）
  const productsToShow = previewData.value.previewProducts || previewData.value.products.slice(0, previewLimit)
  productsToShow.forEach((product, index) => {
    result.push({
      ...product,
      _hasError: false,
      _rowNum: index + 2 // Excel 行号（从2开始，因为第1行是表头）
    })
  })
  
  // 添加错误行（限制预览数量）
  const errorsToShow = previewData.value.errors.slice(0, previewLimit)
  errorsToShow.forEach((error) => {
    const errorProduct = {
      productNo: error.data['货号'] || error.data['产品货号'] || '',
      cnName: error.data['中文名称'] || error.data['产品名称'] || '',
      productSpec: error.data['规格'] || '',
      price: error.data['价格'] || '',
      details: error.data,
      _hasError: true,
      _rowNum: error.row,
      _errorMessages: error.errors
    }
    result.push(errorProduct)
  })
  
  // 按行号排序
  result.sort((a, b) => a._rowNum - b._rowNum)
  
  return result
})

// 根据类型值获取标签
const getTypeLabel = (typeValue) => {
  if (!typeValue) return '-'
  const type = props.productTypes.find(t => t.value === typeValue)
  return type ? type.label : typeValue
}

// 获取行的类名（用于高亮错误行）
const getRowClassName = ({ row }) => {
  return row._hasError ? 'error-row' : ''
}

// 处理文件变化
const handleFileChange = async (file) => {
  fileList.value = [file]
  parseError.value = ''
  previewData.value = null
  needTypeSelection.value = false
  selectedType.value = ''
  parsing.value = true
  parseProgress.value = { processed: 0, total: 0, percentage: 0 }
  
  try {
    // 使用 Web Worker 解析（支持大文件）
    const result = await parseExcelFileWithWorker(
      file.raw,
      null,
      (progress) => {
        parseProgress.value = progress
      }
    )
    
    if (result.needTypeSelection) {
      needTypeSelection.value = true
      return
    }
    
    if (!result.success) {
      parseError.value = result.message || '解析失败'
      return
    }
    
    // 限制预览数量（只显示前1000条）
    const previewLimit = 1000
    if (result.products.length > previewLimit) {
      result.previewProducts = result.products.slice(0, previewLimit)
      result.hasMore = true
      result.previewLimit = previewLimit
    } else {
      result.previewProducts = result.products
      result.hasMore = false
      result.previewLimit = result.products.length
    }
    
    previewData.value = result
  } catch (error) {
    parseError.value = error.message || '解析文件时发生错误'
    console.error('解析 Excel 文件失败:', error)
  } finally {
    parsing.value = false
    parseProgress.value = { processed: 0, total: 0, percentage: 0 }
  }
}

// 重新解析（当用户选择了产品类型后）
const handleReParse = async () => {
  if (!fileList.value.length || !selectedType.value) return
  
  parseError.value = ''
  previewData.value = null
  needTypeSelection.value = false
  parsing.value = true
  parseProgress.value = { processed: 0, total: 0, percentage: 0 }
  
  try {
    // 使用 Web Worker 解析（支持大文件）
    const result = await parseExcelFileWithWorker(
      fileList.value[0].raw,
      selectedType.value,
      (progress) => {
        parseProgress.value = progress
      }
    )
    
    if (!result.success) {
      parseError.value = result.message || '解析失败'
      return
    }
    
    // 限制预览数量（只显示前1000条）
    const previewLimit = 1000
    if (result.products.length > previewLimit) {
      result.previewProducts = result.products.slice(0, previewLimit)
      result.hasMore = true
      result.previewLimit = previewLimit
    } else {
      result.previewProducts = result.products
      result.hasMore = false
      result.previewLimit = result.products.length
    }
    
    previewData.value = result
  } catch (error) {
    parseError.value = error.message || '解析文件时发生错误'
    console.error('解析 Excel 文件失败:', error)
  } finally {
    parsing.value = false
    parseProgress.value = { processed: 0, total: 0, percentage: 0 }
  }
}

// 处理上传
const handleUpload = async () => {
  if (!canUpload.value) return
  
  uploading.value = true
  
  try {
    // 上传全部有效的数据（不是预览数据，而是完整的 products 数组）
    // 即使预览只显示前1000条，上传时也会上传全部数据
    const validProducts = previewData.value.products
    
    await productStore.batchCreateProducts(validProducts)
    
    ElMessage.success(`成功上传 ${validProducts.length} 个产品`)
    
    emit('success')
    handleClose()
  } catch (error) {
    ElMessage.error(error.message || '上传失败')
    console.error('批量上传产品失败:', error)
  } finally {
    uploading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  fileList.value = []
  previewData.value = null
  parseError.value = ''
  needTypeSelection.value = false
  selectedType.value = ''
  uploading.value = false
  parsing.value = false
  parseProgress.value = { processed: 0, total: 0, percentage: 0 }
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 监听 visible 变化，重置状态
watch(visible, (val) => {
  if (!val) {
    handleClose()
  }
})
</script>

<style scoped>
.upload-container {
  padding: 10px 0;
}

.upload-section {
  margin-bottom: 20px;
}

.type-selection {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.preview-section {
  margin-top: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.error-section {
  margin-top: 15px;
}

.error-message {
  margin-top: 15px;
}

.parse-progress-wrapper {
  margin-top: 20px;
  margin-bottom: 20px;
  position: relative;
  z-index: 2000; /* 确保在 loading 遮罩层之上 */
}

.parse-progress {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.progress-title {
  flex: 1;
}

.progress-bar {
  width: 100%;
}

.progress-text {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

pre {
  margin: 0;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}

:deep(.error-row) {
  background-color: #fef0f0;
}

:deep(.error-row:hover) {
  background-color: #fde2e2;
}
</style>

