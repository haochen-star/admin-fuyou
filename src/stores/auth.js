import { defineStore } from 'pinia'
import { login as loginApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.user?.username || ''
  },

  actions: {
    async login(loginData) {
      try {
        const response = await loginApi(loginData)
        
        if (response.success && response.data) {
          this.token = response.data.token
          this.user = response.data.user
          
          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
          
          return { success: true }
        } else {
          return { success: false, message: response.message || '登录失败' }
        }
      } catch (error) {
        return { success: false, message: error.message || '登录失败' }
      }
    },

    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})

