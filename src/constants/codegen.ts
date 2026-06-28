/**
 * 代码生成类型枚举
 * 参考后端 CodeGenTypeEnum
 */
export const CODE_GEN_TYPE = {
  HTML: {
    label: '原生 HTML 模式',
    value: 'html',
    shortLabel: 'HTML',
    color: 'blue',
  },
  MULTI_FILE: {
    label: '原生多文件模式',
    value: 'multi_file',
    shortLabel: '多文件',
    color: 'green',
  },
  VUE_PROJECT: {
    label: 'Vue 项目模式',
    value: 'vue_project',
    shortLabel: 'Vue',
    color: 'orange',
  },
} as const

export type CodeGenTypeValue = (typeof CODE_GEN_TYPE)[keyof typeof CODE_GEN_TYPE]['value']

/**
 * 根据值获取类型配置
 */
export const getCodeGenTypeByValue = (value: string | undefined) => {
  if (!value) return null
  return Object.values(CODE_GEN_TYPE).find((item) => item.value === value) || null
}

/**
 * 获取类型短标签
 */
export const getCodeGenTypeLabel = (value: string | undefined): string => {
  const type = getCodeGenTypeByValue(value)
  return type?.shortLabel || value || '-'
}

/**
 * 获取类型颜色
 */
export const getCodeGenTypeColor = (value: string | undefined): string => {
  const type = getCodeGenTypeByValue(value)
  return type?.color || 'default'
}
