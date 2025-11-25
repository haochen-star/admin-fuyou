<template>
  <div class="product-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>产品管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增产品
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-select
          v-model="selectedType"
          placeholder="选择产品类型"
          style="width: 200px; margin-right: 10px"
          @change="handleTypeChange"
        >
          <el-option
            v-for="type in productTypes"
            :key="type"
            :label="type"
            :value="type"
          />
        </el-select>
        
        <el-input
          v-model="searchName"
          placeholder="搜索产品名称"
          style="width: 300px; margin-right: 10px"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="productStore.products"
        style="width: 100%; margin-top: 20px"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="productNo" label="货号" width="150" />
        <el-table-column prop="cnName" label="产品名称" min-width="200" />
        <el-table-column prop="productSpec" label="产品规格" min-width="200" />
        <el-table-column prop="price" label="价格" width="120" />
        <el-table-column prop="type" label="产品类型" width="150" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pagesize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <ProductForm
      v-model="formVisible"
      :product="currentProduct"
      :product-types="productTypes"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product'
import ProductForm from '@/components/ProductForm.vue'

const productStore = useProductStore()
const loading = ref(false)
const formVisible = ref(false)
const currentProduct = ref(null)
const searchName = ref('')
const selectedType = ref('产品管理')

const productTypes = ['产品管理', '电子产品', '服装', '食品', '其他']

// 使用 ref 来管理分页，从 store 同步初始值
const pagination = ref({
  page: 1,
  pagesize: 10,
  total: 0,
  totalPages: 0
})

// 监听 store 的 pagination 变化
watch(() => productStore.pagination, (newPagination) => {
  pagination.value = { ...newPagination }
}, { immediate: true, deep: true })

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 获取产品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    await productStore.fetchProducts(selectedType.value, {
      page: pagination.value.page,
      pagesize: pagination.value.pagesize,
      cnName: searchName.value || undefined
    })
    // 同步 store 的 pagination 到本地
    pagination.value = { ...productStore.pagination }
  } catch (error) {
    ElMessage.error('获取产品列表失败')
  } finally {
    loading.value = false
  }
}

// 产品类型改变
const handleTypeChange = () => {
  pagination.value.page = 1
  productStore.pagination.page = 1
  fetchProducts()
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  productStore.pagination.page = 1
  fetchProducts()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.value.pagesize = size
  pagination.value.page = 1
  productStore.pagination.pagesize = size
  productStore.pagination.page = 1
  fetchProducts()
}

// 页码改变
const handlePageChange = (page) => {
  pagination.value.page = page
  productStore.pagination.page = page
  fetchProducts()
}

// 新增产品
const handleAdd = () => {
  currentProduct.value = null
  formVisible.value = true
}

// 编辑产品
const handleEdit = (row) => {
  currentProduct.value = { ...row }
  formVisible.value = true
}

// 删除产品
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除产品 "${row.cnName || row.productNo}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    await productStore.removeProduct(row.type, row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  } finally {
    loading.value = false
  }
}

// 表单提交
const handleFormSubmit = async (formData) => {
  try {
    loading.value = true
    
    if (currentProduct.value) {
      // 编辑
      await productStore.updateProduct(
        formData.type,
        currentProduct.value.id,
        {
          productNo: formData.productNo,
          cnName: formData.cnName,
          productSpec: formData.productSpec,
          price: formData.price
        }
      )
      ElMessage.success('更新成功')
    } else {
      // 新增
      await productStore.createProduct(formData.type, {
        productNo: formData.productNo,
        cnName: formData.cnName,
        productSpec: formData.productSpec,
        price: formData.price
      })
      ElMessage.success('创建成功')
    }
    
    formVisible.value = false
    currentProduct.value = null
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.product-list {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

