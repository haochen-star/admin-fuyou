import request from '@/utils/request'

/**
 * 获取产品类型列表
 */
export const getProductTypes = () => {
  return request({
    url: '/api/product/types',
    method: 'get'
  })
}

/**
 * 获取产品列表
 * @param {string} type - 产品类型（可选）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pagesize - 每页数量
 * @param {string} params.cnName - 产品名称（搜索）
 */
export const getProducts = (type, params = {}) => {
  const queryParams = { ...params }
  if (type) {
    queryParams.type = type
  }
  return request({
    url: '/api/product',
    method: 'get',
    params: queryParams
  })
}

/**
 * 获取单个产品
 * @param {number} id - 产品ID
 */
export const getProductById = (id) => {
  return request({
    url: `/api/product/${id}`,
    method: 'get'
  })
}

/**
 * 创建产品
 * @param {Object} data - 产品数据
 * @param {string} data.type - 产品类型（可选）
 * @param {string} data.productNo - 货号（必填）
 * @param {string} data.cnName - 产品名称
 * @param {string} data.productSpec - 产品规格
 * @param {string} data.price - 价格
 */
export const createProduct = (data) => {
  return request({
    url: '/api/product',
    method: 'post',
    data
  })
}

/**
 * 更新产品
 * @param {number} id - 产品ID
 * @param {Object} data - 产品数据
 * @param {string} data.type - 产品类型（可选）
 */
export const updateProduct = (id, data) => {
  return request({
    url: `/api/product/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除产品
 * @param {number} id - 产品ID
 */
export const deleteProduct = (id) => {
  return request({
    url: `/api/product/${id}`,
    method: 'delete'
  })
}

/**
 * 批量创建产品
 * @param {Array} products - 产品数组
 */
export const batchCreateProducts = (products) => {
  return request({
    url: '/api/product/batch/create',
    method: 'post',
    data: {
      products
    }
  })
}

/**
 * 批量删除产品
 * @param {Array} ids - 产品ID数组
 */
export const batchDeleteProducts = (ids) => {
  return request({
    url: '/api/product/batch/delete',
    method: 'delete',
    data: { ids }
  })
}

