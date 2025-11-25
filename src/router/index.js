import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/product',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/product',
        name: 'Product',
        component: () => import('@/views/Product/ProductList.vue'),
        meta: { title: '产品管理', requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isLoggedIn = authStore.isLoggedIn

  if (to.meta.requiresAuth === false) {
    // 登录页，如果已登录则跳转到首页
    if (isLoggedIn) {
      next('/')
    } else {
      next()
    }
  } else {
    // 需要登录的页面
    if (isLoggedIn) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router

