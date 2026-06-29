import { downloadAppCode } from '@/api/appController'
import type { downloadAppCodeParams } from '@/api/typings.d'

/**
 * 下载应用代码
 * @param params 下载参数
 */
export const downloadAppCodeZip = async (params: downloadAppCodeParams) => {
  try {
    // 使用 axios 的直接请求，确保能正确处理二进制数据
    const response = await fetch(`/api/app/download/${params.appId}`, {
      method: 'GET',
      credentials: 'include', // 保持 Cookie 认证
    })

    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`)
    }

    // 文件名固定使用应用 ID
    const downloadFileName = `${params.appId}.zip`

    // 获取二进制数据
    const blob = await response.blob()

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = downloadFileName

    // 触发下载
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error('下载失败:', error)
    throw error
  }
}