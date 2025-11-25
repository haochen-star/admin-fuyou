<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑产品' : '新增产品'"
    width="600px"
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
            :key="type"
            :label="type"
            :value="type"
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
      <el-form-item label="产品规格" prop="productSpec">
        <el-input
          v-model="formData.productSpec"
          placeholder="请输入产品规格"
        />
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input
          v-model="formData.price"
          placeholder="请输入价格"
        />
      </el-form-item>
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
    default: () => ['产品管理']
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

const formData = reactive({
  type: '',
  productNo: '',
  cnName: '',
  productSpec: '',
  price: ''
})

const formRules = {
  type: [
    { required: true, message: '请选择产品类型', trigger: 'change' }
  ],
  productNo: [
    { required: true, message: '请输入货号', trigger: 'blur' }
  ]
}

// 监听 product 变化，填充表单
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    formData.type = newProduct.type || ''
    formData.productNo = newProduct.productNo || ''
    formData.cnName = newProduct.cnName || ''
    formData.productSpec = newProduct.productSpec || ''
    formData.price = newProduct.price || ''
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
  }
})

const resetForm = () => {
  formData.type = props.productTypes[0] || ''
  formData.productNo = ''
  formData.cnName = ''
  formData.productSpec = ''
  formData.price = ''
  formRef.value?.clearValidate()
}

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
        emit('submit', { ...formData })
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

