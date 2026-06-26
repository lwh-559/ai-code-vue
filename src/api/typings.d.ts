declare namespace API {
  type adminGetAppVOParams = {
    /** 应用 id */
    id: number
  }

  type AppAddRequest = {
    /** 应用初始化的 prompt */
    initPrompt: string
    /** 代码生成类型 */
    codeGenType?: 'html' | 'multi_file'
  }

  type AppAdminUpdateRequest = {
    /** 应用 id */
    id: number
    /** 应用名称 */
    appName?: string
    /** 应用封面 URL */
    cover?: string
    /** 优先级，数值越大优先级越高，用于精选应用排序 */
    priority?: number
  }

  type AppDeployRequest = {
    /** 应用 ID */
    appId: number
  }

  type AppQueryRequest = {
    /** 当前页号，从 1 开始 */
    pageNum?: number
    /** 每页数量，最大 20 */
    pageSize?: number
    /** 排序字段 */
    sortField?: string
    /** 排序顺序 */
    sortOrder?: 'ascend' | 'descend'
    /** 应用 id */
    id?: number
    /** 应用名称，支持模糊查询 */
    appName?: string
    /** 代码生成类型 */
    codeGenType?: 'html' | 'multi_file'
    /** 部署标识 */
    deployKey?: string
    /** 优先级 */
    priority?: number
    /** 创建用户 id */
    userId?: number
  }

  type AppUpdateRequest = {
    /** 应用 id */
    id: number
    /** 应用名称 */
    appName?: string
  }

  type AppVO = {
    id?: number
    appName?: string
    cover?: string
    initPrompt?: string
    codeGenType?: string
    deployKey?: string
    deployedTime?: string
    priority?: number
    userId?: number
    createTime?: string
    updateTime?: string
    user?: UserVO
  }

  type BaseResponseAppVO = {
    code?: number
    data?: AppVO
    message?: string
  }

  type BaseResponseBoolean = {
    code?: number
    data?: boolean
    message?: string
  }

  type BaseResponseLoginUserVO = {
    code?: number
    data?: LoginUserVO
    message?: string
  }

  type BaseResponseLong = {
    code?: number
    data?: number
    message?: string
  }

  type BaseResponsePageAppVO = {
    code?: number
    data?: PageAppVO
    message?: string
  }

  type BaseResponsePageUserVO = {
    code?: number
    data?: PageUserVO
    message?: string
  }

  type BaseResponseString = {
    code?: number
    data?: string
    message?: string
  }

  type BaseResponseUser = {
    code?: number
    data?: User
    message?: string
  }

  type BaseResponseUserVO = {
    code?: number
    data?: UserVO
    message?: string
  }

  type chatToGenCodeParams = {
    /** 应用 ID */
    appId: number
    /** 用户提示词 */
    message: string
  }

  type DeleteRequest = {
    id?: number
  }

  type getAppVOByIdParams = {
    /** 应用 id */
    id: number
  }

  type getUserByIdParams = {
    /** 用户 ID */
    id: number
  }

  type getUserVOByIdParams = {
    /** 用户 ID */
    id: number
  }

  type LoginUserVO = {
    id?: number
    userAccount?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    createTime?: string
    updateTime?: string
  }

  type PageAppVO = {
    records?: AppVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type PageUserVO = {
    records?: UserVO[]
    pageNumber?: number
    pageSize?: number
    totalPage?: number
    totalRow?: number
    optimizeCountQuery?: boolean
  }

  type ServerSentEventString = true

  type serveStaticResourceParams = {
    /** 应用部署标识 key */
    deployKey: string
  }

  type User = {
    id?: number
    userAccount?: string
    userPassword?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    editTime?: string
    createTime?: string
    updateTime?: string
    isDelete?: number
  }

  type UserAddRequest = {
    /** 用户昵称 */
    userName?: string
    /** 用户账号 */
    userAccount: string
    /** 用户头像 URL */
    userAvatar?: string
    /** 用户简介 */
    userProfile?: string
    /** 用户角色 */
    userRole?: 'user' | 'admin'
  }

  type UserLoginRequest = {
    /** 用户账号 */
    userAccount: string
    /** 用户密码 */
    userPassword: string
  }

  type UserQueryRequest = {
    /** 当前页号，从 1 开始 */
    pageNum?: number
    /** 每页数量，最大 20 */
    pageSize?: number
    /** 排序字段 */
    sortField?: string
    /** 排序顺序 */
    sortOrder?: 'ascend' | 'descend'
    /** 用户 ID */
    id?: number
    /** 用户昵称，支持模糊查询 */
    userName?: string
    /** 用户账号 */
    userAccount?: string
    /** 用户简介 */
    userProfile?: string
    /** 用户角色 */
    userRole?: 'user' | 'admin' | 'ban'
  }

  type UserRegisterRequest = {
    /** 用户账号 */
    userAccount: string
    /** 用户密码 */
    userPassword: string
    /** 确认密码 */
    checkPassword: string
  }

  type UserUpdateRequest = {
    /** 用户 ID */
    id?: number
    /** 用户昵称 */
    userName?: string
    /** 用户头像 URL */
    userAvatar?: string
    /** 用户简介 */
    userProfile?: string
    /** 用户角色 */
    userRole?: 'user' | 'admin'
  }

  type UserVO = {
    id?: number
    userAccount?: string
    userName?: string
    userAvatar?: string
    userProfile?: string
    userRole?: string
    createTime?: string
  }
}
