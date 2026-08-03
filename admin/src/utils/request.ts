import axios from 'axios'
import { message } from 'antd'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 后端统一返回格式：{ code, message, data }
    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code === 200) {
        return res.data
      }
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    // 非统一格式（比如文件流）直接返回
    return response
  },
  (error) => {
    message.error(error.message || '网络错误')
    return Promise.reject(error)
  },
)

export default request
