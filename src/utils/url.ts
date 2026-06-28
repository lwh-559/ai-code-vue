import { CODE_GEN_TYPE } from '../constants/codegen'

/**
 * URL 工具函数
 */

// 获取部署应用的完整URL
export const getDeployUrl = (deployKey: string) => {
  return `${import.meta.env.VITE_APP_DEPLOY_BASE_URL}/${deployKey}`
}

// 获取静态资源预览URL
export const getStaticPreviewUrl = (codeGenType: string, appId: string) => {
  const baseUrl = `${import.meta.env.VITE_APP_PREVIEW_BASE_URL}/${codeGenType}_${appId}/`
  // 如果是 Vue 项目，浏览地址需要添加 dist 后缀
  if (codeGenType === CODE_GEN_TYPE.VUE_PROJECT.value) {
    return `${baseUrl}dist/index.html`
  }
  return baseUrl
}
