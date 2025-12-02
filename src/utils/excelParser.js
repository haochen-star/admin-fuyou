import * as XLSX from 'xlsx'

/**
 * 根据文件名识别产品类型
 * @param {string} fileName - 文件名
 * @returns {string|null} 产品类型值，如果无法识别返回 null
 */
export function identifyProductType(fileName) {
  if (!fileName) return null
  
  const lowerFileName = fileName.toLowerCase()
  
  if (lowerFileName.includes('elisa试剂盒') || lowerFileName.includes('elisa')) {
    return 'ELISA Kit'
  }
  
  if (lowerFileName.includes('酪酰胺多色荧光染色试剂盒') || lowerFileName.includes('tyramide')) {
    return 'Tyramide TSA Kit'
  }
  
  if (lowerFileName.includes('科研检测试剂') || lowerFileName.includes('research')) {
    return 'Research Test Reagent'
  }
  
  return null
}

/**
 * 解析 ELISA Kit 或 Tyramide TSA Kit 类型的产品数据
 * @param {Array} rows - Excel 行数据
 * @returns {Object} { products: Array, errors: Array }
 */
function parseSimpleProductData(rows) {
  const products = []
  const errors = []
  
  rows.forEach((row, index) => {
    const rowNum = index + 2 // Excel 行号（从2开始，因为第1行是表头）
    const errorsForRow = []
    
    // 获取字段值
    const productNo = row['货号'] || row['产品货号'] || ''
    const cnName = row['中文名称'] || row['产品名称'] || ''
    const productSpec = row['规格'] || ''
    const price = row['价格'] || ''
    
    // 验证必填字段
    if (!productNo || productNo.toString().trim() === '') {
      errorsForRow.push('货号不能为空')
    }
    
    if (errorsForRow.length > 0) {
      errors.push({
        row: rowNum,
        errors: errorsForRow,
        data: row
      })
    } else {
      products.push({
        productNo: productNo.toString().trim(),
        cnName: cnName.toString().trim(),
        productSpec: productSpec.toString().trim(),
        price: price.toString().trim()
      })
    }
  })
  
  return { products, errors }
}

/**
 * 解析 Research Test Reagent 类型的产品数据
 * @param {Array} rows - Excel 行数据
 * @returns {Object} { products: Array, errors: Array }
 */
function parseResearchTestReagentData(rows) {
  const products = []
  const errors = []
  
  rows.forEach((row, index) => {
    const rowNum = index + 2 // Excel 行号
    const errorsForRow = []
    
    // 获取必填字段
    const productNo = row['产品货号'] || ''
    
    // 验证必填字段
    if (!productNo || productNo.toString().trim() === '') {
      errorsForRow.push('产品货号不能为空')
    }
    
    // 构建 details 对象
    const details = {
      productName: (row['产品名称'] || '').toString().trim(),
      category: (row['二级分类'] || '').toString().trim(),
      categoryPath: (row['分类路径'] || '').toString().trim(),
      geneName: (row['基因名称'] || '').toString().trim(),
      proteinName: (row['蛋白名称'] || '').toString().trim(),
      recommendedApplication: (row['推荐应用'] || '').toString().trim(),
      reactiveSpecies: (row['反应种属'] || '').toString().trim(),
      concentration: (row['浓度'] || '').toString().trim(),
      storageBuffer: (row['存储缓冲液'] || '').toString().trim(),
      humanGeneId: row['Human Gene ID'] ? Number(row['Human Gene ID']) : null,
      humanGeneLink: (row['Human Gene Link'] || '').toString().trim(),
      humanSwissprotNo: (row['Human Swissprot No.'] || '').toString().trim(),
      humanSwissprotLink: (row['Human Swissprot Link'] || '').toString().trim(),
      mouseGeneId: row['Mouse Gene ID'] ? Number(row['Mouse Gene ID']) : null,
      mouseGeneLink: (row['Mouse Gene Link'] || '').toString().trim(),
      mouseSwissprotNo: (row['Mouse Swissprot No.'] || '').toString().trim(),
      mouseSwissprotLink: (row['Mouse Swissprot Link'] || '').toString().trim(),
      ratGeneId: row['Rat Gene ID'] ? Number(row['Rat Gene ID']) : null,
      ratGeneLink: (row['Rat Gene Link'] || '').toString().trim(),
      ratSwissprotNo: (row['Rat Swissprot No.'] || '').toString().trim(),
      ratSwissprotLink: (row['Rat Swissprot Link'] || '').toString().trim(),
      immunogen: (row['免疫原'] || '').toString().trim(),
      specificity: (row['特异性'] || '').toString().trim(),
      dilution: (row['稀释度'] || '').toString().trim(),
      referenceMolecularWeight: (row['参考分子量'] || '').toString().trim(),
      storageCondition: (row['运输及保存条件'] || '').toString().trim(),
      host: (row['宿主'] || '').toString().trim(),
      cellLocalization: (row['细胞定位'] || '').toString().trim(),
      function: (row['功能'] || '').toString().trim(),
      stockStatus: (row['期货'] || '').toString().trim(),
      purification: (row['纯化'] || '').toString().trim(),
      tags: (row['标记'] || '').toString().trim(),
      img: (row['img'] || row['图片地址'] || '').toString().trim(),
      background: (row['背景介绍'] || '').toString().trim(),
      tissueExpression: (row['组织表达'] || '').toString().trim()
    }
    
    if (errorsForRow.length > 0) {
      errors.push({
        row: rowNum,
        errors: errorsForRow,
        data: row
      })
    } else {
      const productName = details.productName || ''
      products.push({
        productNo: productNo.toString().trim(),
        cnName: productName,
        details: details
      })
    }
  })
  
  return { products, errors }
}

/**
 * 使用 Web Worker 解析 Excel 文件（支持大文件，不阻塞主线程）
 * @param {File} file - Excel 文件对象
 * @param {string} productType - 产品类型（可选）
 * @param {Function} onProgress - 进度回调函数 (progress) => void
 * @returns {Promise<Object>} 解析结果
 */
export async function parseExcelFileWithWorker(file, productType = null, onProgress = null) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const fileData = new Uint8Array(e.target.result)
        
        // 使用 Vite 的 Worker 语法，自动处理模块导入
        const worker = new Worker(
          new URL('./excelParser.worker.js', import.meta.url),
          { type: 'module' }
        )
        
        // 监听 Worker 消息
        worker.onmessage = (event) => {
          const { type, result, error, processed, total, percentage } = event.data
          
          if (type === 'progress') {
            // 更新进度
            if (onProgress) {
              onProgress({ processed, total, percentage })
            }
          } else if (type === 'complete') {
            worker.terminate()
            resolve(result)
          } else if (type === 'error') {
            worker.terminate()
            reject(error)
          }
        }
        
        worker.onerror = (error) => {
          worker.terminate()
          reject({
            success: false,
            message: `Worker 错误: ${error.message}`,
            error
          })
        }
        
        // 发送文件数据到 Worker
        worker.postMessage({
          fileData,
          productType,
          fileName: file.name,
          chunkSize: 1000 // 每批处理1000行
        })
        
      } catch (error) {
        reject({
          success: false,
          message: `解析 Excel 文件失败: ${error.message}`,
          error
        })
      }
    }
    
    reader.onerror = () => {
      reject({
        success: false,
        message: '读取文件失败'
      })
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 解析 Excel 文件（小文件时使用，同步解析）
 * @param {File} file - Excel 文件对象
 * @param {string} productType - 产品类型（可选，如果不提供则根据文件名识别）
 * @returns {Promise<Object>} 解析结果
 */
export async function parseExcelFile(file, productType = null) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // 转换为 JSON 数组
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        if (jsonData.length === 0) {
          resolve({
            success: false,
            message: 'Excel 文件中没有数据',
            products: [],
            errors: []
          })
          return
        }
        
        // 识别产品类型
        let identifiedType = productType
        if (!identifiedType) {
          identifiedType = identifyProductType(file.name)
        }
        
        if (!identifiedType) {
          resolve({
            success: false,
            message: '无法识别产品类型，请手动选择',
            products: [],
            errors: [],
            needTypeSelection: true
          })
          return
        }
        
        // 根据类型解析数据
        let result
        if (identifiedType === 'Research Test Reagent') {
          result = parseResearchTestReagentData(jsonData)
        } else {
          // ELISA Kit 或 Tyramide TSA Kit
          result = parseSimpleProductData(jsonData)
        }
        
        // 为每个产品添加类型
        result.products = result.products.map(product => ({
          ...product,
          type: identifiedType
        }))
        
        resolve({
          success: true,
          productType: identifiedType,
          products: result.products,
          errors: result.errors,
          totalRows: jsonData.length,
          validRows: result.products.length,
          errorRows: result.errors.length
        })
      } catch (error) {
        reject({
          success: false,
          message: `解析 Excel 文件失败: ${error.message}`,
          error: error
        })
      }
    }
    
    reader.onerror = () => {
      reject({
        success: false,
        message: '读取文件失败'
      })
    }
    
    reader.readAsArrayBuffer(file)
  })
}

