// 将后端返回的相对路径（如 /uploads/xxx.jpg）转换为完整可访问的 URL
// 前端开发环境通过 vite 代理访问后端 8800 端口
// 生产环境可通过 VITE_API_BASE_URL 环境变量配置

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || ''

/**
 * 转换后端返回的图片路径为前端可访问的 URL
 * - 绝对路径（http:// 或 https://）直接返回
 * - 相对路径（/uploads/...）拼上 API base
 * - 空值返回空字符串
 */
export function getImageUrl(path?: string | null): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }
  // 以 / 开头的相对路径，拼上 API base（开发时通过 vite 代理到后端）
  if (path.startsWith('/')) {
    return API_BASE + path
  }
  // 其他情况直接返回
  return path
}

export default getImageUrl
