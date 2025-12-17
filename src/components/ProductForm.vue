<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑产品' : '新增产品'"
    :width="isResearchTestReagent ? '1200px' : '600px'"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="产品类型" prop="type">
        <el-select
          v-model="formData.type"
          placeholder="请选择产品类型"
          style="width: 100%"
        >
          <el-option
            v-for="type in productTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="货号" prop="productNo">
        <el-input
          v-model="formData.productNo"
          placeholder="请输入货号"
        />
      </el-form-item>
      <el-form-item label="产品名称" prop="cnName">
        <el-input
          v-model="formData.cnName"
          placeholder="请输入产品名称"
        />
      </el-form-item>
      <el-form-item v-if="!isResearchTestReagent" label="产品规格" prop="productSpec">
        <el-input
          v-model="formData.productSpec"
          placeholder="请输入产品规格"
        />
      </el-form-item>
      <el-form-item v-if="!isResearchTestReagent" label="价格" prop="price">
        <el-input
          v-model="formData.price"
          placeholder="请输入价格"
        />
      </el-form-item>

      <!-- 科研监测试剂详细信息 -->
      <template v-if="isResearchTestReagent">
        <el-divider content-position="left">详细信息</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品名称">
              <el-input v-model="formData.details.productName" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="二级分类">
              <el-input v-model="formData.details.category" placeholder="请输入二级分类" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类路径">
              <el-input v-model="formData.details.categoryPath" placeholder="请输入分类路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="基因名称">
              <el-input v-model="formData.details.geneName" placeholder="请输入基因名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="蛋白名称">
              <el-input v-model="formData.details.proteinName" placeholder="请输入蛋白名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="推荐应用">
              <el-input v-model="formData.details.recommendedApplication" placeholder="请输入推荐应用" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="反应种属">
              <el-input v-model="formData.details.reactiveSpecies" placeholder="请输入反应种属" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="浓度">
              <el-input v-model="formData.details.concentration" placeholder="请输入浓度" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="存储缓冲液">
          <el-input
            v-model="formData.details.storageBuffer"
            type="textarea"
            :rows="2"
            placeholder="请输入存储缓冲液"
          />
        </el-form-item>

        <el-divider content-position="left">Human 基因信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="Gene ID">
              <el-input v-model.number="formData.details.humanGeneId" type="number" placeholder="Gene ID" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Gene Link">
              <el-input v-model="formData.details.humanGeneLink" placeholder="Gene Link" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Swissprot No.">
              <el-input v-model="formData.details.humanSwissprotNo" placeholder="Swissprot No." />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Swissprot Link">
              <el-input v-model="formData.details.humanSwissprotLink" placeholder="Swissprot Link" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">Mouse 基因信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="Gene ID">
              <el-input v-model.number="formData.details.mouseGeneId" type="number" placeholder="Gene ID" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Gene Link">
              <el-input v-model="formData.details.mouseGeneLink" placeholder="Gene Link" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Swissprot No.">
              <el-input v-model="formData.details.mouseSwissprotNo" placeholder="Swissprot No." />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Swissprot Link">
              <el-input v-model="formData.details.mouseSwissprotLink" placeholder="Swissprot Link" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">Rat 基因信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="Gene ID">
              <el-input v-model.number="formData.details.ratGeneId" type="number" placeholder="Gene ID" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Gene Link">
              <el-input v-model="formData.details.ratGeneLink" placeholder="Gene Link" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Swissprot No.">
              <el-input v-model="formData.details.ratSwissprotNo" placeholder="Swissprot No." />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="Swissprot Link">
              <el-input v-model="formData.details.ratSwissprotLink" placeholder="Swissprot Link" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">其他信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="免疫原">
              <el-input
                v-model="formData.details.immunogen"
                type="textarea"
                :rows="2"
                placeholder="请输入免疫原"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="特异性">
              <el-input
                v-model="formData.details.specificity"
                type="textarea"
                :rows="2"
                placeholder="请输入特异性"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="稀释度">
              <el-input v-model="formData.details.dilution" placeholder="请输入稀释度" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参考分子量">
              <el-input v-model="formData.details.referenceMolecularWeight" placeholder="请输入参考分子量" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="运输及保存条件">
              <el-input v-model="formData.details.storageCondition" placeholder="请输入运输及保存条件" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="宿主">
              <el-input v-model="formData.details.host" placeholder="请输入宿主" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="细胞定位">
          <el-input
            v-model="formData.details.cellLocalization"
            type="textarea"
            :rows="2"
            placeholder="请输入细胞定位"
          />
        </el-form-item>

        <el-form-item label="功能">
          <el-input
            v-model="formData.details.function"
            type="textarea"
            :rows="2"
            placeholder="请输入功能"
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="期货">
              <el-input v-model="formData.details.stockStatus" placeholder="请输入期货状态" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纯化">
              <el-input
                v-model="formData.details.purification"
                type="textarea"
                :rows="2"
                placeholder="请输入纯化"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="标记">
              <el-input v-model="formData.details.tags" placeholder="请输入标记" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图片地址">
              <el-input v-model="formData.details.img" placeholder="请输入图片地址（支持多图，用逗号分隔）" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="多图描述">
          <el-input
            v-model="formData.details.imgDesc"
            type="textarea"
            :rows="3"
            placeholder="请输入多图描述"
          />
        </el-form-item>

        <el-form-item label="背景介绍">
          <el-input
            v-model="formData.details.background"
            type="textarea"
            :rows="3"
            placeholder="请输入背景介绍"
          />
        </el-form-item>

        <el-form-item label="组织表达">
          <el-input
            v-model="formData.details.tissueExpression"
            type="textarea"
            :rows="3"
            placeholder="请输入组织表达"
          />
        </el-form-item>
      </template>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  },
  productTypes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)
const loading = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.product)

// 初始化详细信息字段
const initDetails = () => ({
  productName: '',
  category: '',
  categoryPath: '',
  geneName: '',
  proteinName: '',
  recommendedApplication: '',
  reactiveSpecies: '',
  concentration: '',
  storageBuffer: '',
  humanGeneId: null,
  humanGeneLink: '',
  humanSwissprotNo: '',
  humanSwissprotLink: '',
  mouseGeneId: null,
  mouseGeneLink: '',
  mouseSwissprotNo: '',
  mouseSwissprotLink: '',
  ratGeneId: null,
  ratGeneLink: '',
  ratSwissprotNo: '',
  ratSwissprotLink: '',
  immunogen: '',
  specificity: '',
  dilution: '',
  referenceMolecularWeight: '',
  storageCondition: '',
  host: '',
  cellLocalization: '',
  function: '',
  stockStatus: '',
  purification: '',
  tags: '',
  img: '',
  imgDesc: '',
  background: '',
  tissueExpression: ''
})

const formData = reactive({
  type: '',
  productNo: '',
  cnName: '',
  productSpec: '',
  price: '',
  details: initDetails()
})

const isResearchTestReagent = computed(() => formData.type === 'research_test_reagent')

// 同步 cnName 和 details.productName
watch(() => formData.cnName, (newVal) => {
  if (isResearchTestReagent.value) {
    formData.details.productName = newVal
  }
})

watch(() => formData.details.productName, (newVal) => {
  if (isResearchTestReagent.value) {
    formData.cnName = newVal
  }
})

const formRules = {
  type: [
    { required: true, message: '请选择产品类型', trigger: 'change' }
  ],
  productNo: [
    { required: true, message: '请输入货号', trigger: 'blur' }
  ]
}

const resetForm = () => {
  formData.type = props.productTypes[0]?.value || ''
  formData.productNo = ''
  formData.cnName = ''
  formData.productSpec = ''
  formData.price = ''
  formData.details = initDetails()
  formRef.value?.clearValidate()
}

// 监听 product 变化，填充表单
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    formData.type = newProduct.type || ''
    formData.productNo = newProduct.productNo || ''
    formData.cnName = newProduct.cnName || ''
    formData.productSpec = newProduct.productSpec || ''
    formData.price = newProduct.price || ''
    
    // 如果是科研监测试剂且有 details 字段，填充详细信息
    if (newProduct.type === 'research_test_reagent' && newProduct.details) {
      formData.details = { ...initDetails(), ...newProduct.details }
    } else {
      formData.details = initDetails()
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听 visible 变化，重置表单
watch(visible, (val) => {
  if (!val) {
    resetForm()
  } else if (props.product) {
    formData.type = props.product.type || ''
    formData.productNo = props.product.productNo || ''
    formData.cnName = props.product.cnName || ''
    formData.productSpec = props.product.productSpec || ''
    formData.price = props.product.price || ''
    
    // 如果是科研监测试剂且有 details 字段，填充详细信息
    if (props.product.type === 'research_test_reagent' && props.product.details) {
      formData.details = { ...initDetails(), ...props.product.details }
    } else {
      formData.details = initDetails()
    }
  }
})

const handleClose = () => {
  visible.value = false
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      
      try {
        const submitData = { ...formData }
        
        // 如果是科研监测试剂，确保包含 details 字段
        if (formData.type === 'research_test_reagent') {
          submitData.details = { ...formData.details }
        } else {
          // 非科研监测试剂，不提交 details
          delete submitData.details
        }
        
        emit('submit', submitData)
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

