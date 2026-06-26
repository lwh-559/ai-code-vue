/**
 * URL 工具函数
 */

// 获取部署应用的完整URL
export const getDeployUrl = (deployKey: string) => {
  return `${import.meta.env.VITE_APP_DEPLOY_BASE_URL}/${deployKey}`
}

// 获取静态资源预览URL
export const getStaticPreviewUrl = (codeGenType: string, appId: string) => {
  return `${import.meta.env.VITE_APP_PREVIEW_BASE_URL}/${codeGenType}_${appId}/`
}
