import { defineStore } from 'pinia'
import {
  getProducts as getProductsApi,
  getProductById as getProductByIdApi,
  createProduct as createProductApi,
  updateProduct as updateProductApi,
  deleteProduct as deleteProductApi
} from '@/api/product'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    pagination: {
      total: 0,
      page: 1,
      pagesize: 10,
      totalPages: 0
    },
    currentType: '产品管理'
  }),

  actions: {
    async fetchProducts(type, params = {}) {
      try {
        const response = await getProductsApi(type, params)
        
        if (response.success && response.data) {
          this.products = response.data.products || []
          this.pagination = {
            ...this.pagination,
            ...response.data.pagination
          }
          this.currentType = type
        }
      } catch (error) {
        console.error('获取产品列表失败:', error)
        throw error
      }
    },

    async fetchProductById(type, id) {
      try {
        const response = await getProductByIdApi(type, id)
        return response.success ? response.data.product : null
      } catch (error) {
        console.error('获取产品详情失败:', error)
        throw error
      }
    },

    async createProduct(type, data) {
      try {
        const response = await createProductApi(type, data)
        if (response.success) {
          // 重新获取列表
          await this.fetchProducts(type, {
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

    async updateProduct(type, id, data) {
      try {
        const response = await updateProductApi(type, id, data)
        if (response.success) {
          // 重新获取列表
          await this.fetchProducts(type, {
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

    async removeProduct(type, id) {
      try {
        const response = await deleteProductApi(type, id)
        if (response.success) {
          // 重新获取列表
          await this.fetchProducts(type, {
            page: this.pagination.page,
            pagesize: this.pagination.pagesize
          })
        }
        return response
      } catch (error) {
        console.error('删除产品失败:', error)
        throw error
      }
    }
  }
})

