import { defineStore } from 'pinia'
import {
  getProductTypes as getProductTypesApi,
  getProducts as getProductsApi,
  getProductById as getProductByIdApi,
  createProduct as createProductApi,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi,
  batchCreateProducts as batchCreateProductsApi,
  batchDeleteProducts as batchDeleteProductsApi
} from '@/api/product'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    productTypes: [],
    pagination: {
      total: 0,
      page: 1,
      pagesize: 10,
      totalPages: 0
    },
    currentType: ''
  }),

  actions: {
    async fetchProductTypes() {
      try {
        const response = await getProductTypesApi()
        if (response.success && response.data) {
          this.productTypes = response.data.types || []
        }
        return response
      } catch (error) {
        console.error('获取产品类型列表失败:', error)
        throw error
      }
    },

    async fetchProducts(type, params = {}) {
      try {
        const response = await getProductsApi(type, params)
        
        if (response.success && response.data) {
          this.products = response.data.products || []
          this.pagination = {
            ...this.pagination,
            ...response.data.pagination
          }
          if (type) {
            this.currentType = type
          }
        }
      } catch (error) {
        console.error('获取产品列表失败:', error)
        throw error
      }
    },

    async fetchProductById(id) {
      try {
        const response = await getProductByIdApi(id)
        return response.success ? response.data.product : null
      } catch (error) {
        console.error('获取产品详情失败:', error)
        throw error
      }
    },

    async createProduct(data) {
      try {
        const response = await createProductApi(data)
        if (response.success) {
          // 重新获取列表
          await this.fetchProducts(data.type, {
            page: this.pagination.page,
            pagesize: this.pagination.pagesize
          })
        }
        return response
      } catch (error) {
        console.error('创建产品失败:', error)
        throw error
      }
    },

    async updateProduct(id, data) {
      try {
        const response = await updateProductApi(id, data)
        if (response.success) {
          // 重新获取列表
          await this.fetchProducts(data.type || this.currentType, {
            page: this.pagination.page,
            pagesize: this.pagination.pagesize
          })
        }
        return response
      } catch (error) {
        console.error('更新产品失败:', error)
        throw error
      }
    },

    async removeProduct(id) {
      try {
        const response = await deleteProductApi(id)
        if (response.success) {
          // 重新获取列表
          await this.fetchProducts(this.currentType, {
            page: this.pagination.page,
            pagesize: this.pagination.pagesize
          })
        }
        return response
      } catch (error) {
        console.error('删除产品失败:', error)
        throw error
      }
    },

    async batchCreateProducts(products) {
      try {
        const response = await batchCreateProductsApi(products)
        if (response.success) {
          // 重新获取列表
          await this.fetchProducts(this.currentType, {
            page: this.pagination.page,
            pagesize: this.pagination.pagesize
          })
        }
        return response
      } catch (error) {
        console.error('批量创建产品失败:', error)
        throw error
      }
    },

    async batchDeleteProducts(ids) {
      try {
        const response = await batchDeleteProductsApi(ids)
        if (response.success) {
          // 重新获取列表
          await this.fetchProducts(this.currentType, {
            page: this.pagination.page,
            pagesize: this.pagination.pagesize
          })
        }
        return response
      } catch (error) {
        console.error('批量删除产品失败:', error)
        throw error
      }
    }
  }
})

