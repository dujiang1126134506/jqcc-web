import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { message } from 'antd'

// 通用响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 后续如需 token 鉴权，可在这里加
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    // 如果是文件流等非 JSON 响应，直接返回
    if (typeof res === 'string' || response.config.responseType === 'blob') {
      return response as any
    }
    if (res && res.code !== undefined && res.code !== 200 && res.code !== 0) {
      message.error(res.message || '请求失败')
      return Promise.reject(res)
    }
    return response
  },
  (error) => {
    const msg = error?.response?.data?.message || error.message || '网络异常'
    message.error(msg)
    return Promise.reject(error)
  },
)

/**
 * 通用 GET
 */
export async function get<T = any>(url: string, params?: any): Promise<T> {
  const res = await request.get<ApiResponse<T>>(url, { params })
  return res.data.data
}

/**
 * 通用 POST
 */
export async function post<T = any>(url: string, data?: any): Promise<T> {
  const res = await request.post<ApiResponse<T>>(url, data)
  return res.data.data
}

/**
 * 通用 PUT
 */
export async function put<T = any>(url: string, data?: any): Promise<T> {
  const res = await request.put<ApiResponse<T>>(url, data)
  return res.data.data
}

/**
 * 通用 DELETE
 */
export async function del<T = any>(url: string, data?: any): Promise<T> {
  const res = await request.delete<ApiResponse<T>>(url, { data })
  return res.data.data
}

/**
 * 文件上传 (FormData)
 */
export async function upload<T = any>(
  url: string,
  formData: FormData,
  params?: any,
): Promise<T> {
  const res = await request.post<ApiResponse<T>>(url, formData, {
    params,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data.data
}

export default request
