import request from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {string} data.username - 用户名（可选）
 * @param {string} data.email - 邮箱（可选）
 * @param {string} data.password - 密码
 */
export const login = (data) => {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

