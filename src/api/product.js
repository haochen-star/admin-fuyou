import request from '@/utils/request'

/**
 * 获取产品列表
 * @param {string} type - 产品类型
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pagesize - 每页数量
 * @param {string} params.cnName - 产品名称（搜索）
 */
export const getProducts = (type, params = {}) => {
  return request({
    url: `/api/product/${type}`,
    method: 'get',
    params
  })
}

/**
 * 获取单个产品
 * @param {string} type - 产品类型
 * @param {number} id - 产品ID
 */
export const getProductById = (type, id) => {
  return request({
    url: `/api/product/${type}/${id}`,
    method: 'get'
  })
}

/**
 * 创建产品
 * @param {string} type - 产品类型
 * @param {Object} data - 产品数据
 * @param {string} data.productNo - 货号（必填）
 * @param {string} data.cnName - 产品名称
 * @param {string} data.productSpec - 产品规格
 * @param {string} data.price - 价格
 */
export const createProduct = (type, data) => {
  return request({
    url: `/api/product/${type}`,
    method: 'post',
    data
  })
}

/**
 * 更新产品
 * @param {string} type - 产品类型
 * @param {number} id - 产品ID
 * @param {Object} data - 产品数据
 */
export const updateProduct = (type, id, data) => {
  return request({
    url: `/api/product/${type}/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除产品
 * @param {string} type - 产品类型
 * @param {number} id - 产品ID
 */
export const deleteProduct = (type, id) => {
  return request({
    url: `/api/product/${type}/${id}`,
    method: 'delete'
  })
}

