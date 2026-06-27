// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** 创建应用 用户创建新的应用，需要登录 POST /app/add */
export async function addApp(body: API.AppAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseString>('/app/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 管理员删除应用 管理员删除任意应用，需要管理员权限 POST /app/admin/delete */
export async function adminDeleteApp(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/app/admin/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 管理员获取应用详情 管理员获取任意应用详情，需要管理员权限 GET /app/admin/get */
export async function adminGetAppVo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.adminGetAppVOParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseAppVO>('/app/admin/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 管理员查询应用列表 管理员分页查询所有应用列表，需要管理员权限 POST /app/admin/list */
export async function adminListAppByPage(
  body: API.AppQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageAppVO>('/app/admin/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 管理员更新应用 管理员更新应用信息，需要管理员权限 POST /app/admin/update */
export async function adminUpdateApp(
  body: API.AppAdminUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>('/app/admin/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** AI生成代码 根据用户提示词生成代码，返回 SSE 流式响应，需要登录 GET /app/chat/gen/code */
export async function chatToGenCode(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.chatToGenCodeParams,
  options?: { [key: string]: any }
) {
  return request<API.ServerSentEventString[]>('/app/chat/gen/code', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 删除应用 用户删除自己创建的应用，需要登录 POST /app/delete */
export async function deleteApp(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/app/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 部署应用 部署应用并返回访问 URL，需要登录 POST /app/deploy */
export async function deployApp(body: API.AppDeployRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseString>('/app/deploy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 分页查询精选应用 分页查询精选应用列表，无需登录 POST /app/featured/list */
export async function listFeaturedAppByPage(
  body: API.AppQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageAppVO>('/app/featured/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 获取应用详情 根据 id 获取应用详情，返回脱敏后的应用信息 GET /app/get/vo */
export async function getAppVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAppVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseAppVO>('/app/get/vo', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 分页查询我的应用 分页查询当前登录用户创建的应用列表，需要登录 POST /app/my/list */
export async function listMyAppByPage(body: API.AppQueryRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponsePageAppVO>('/app/my/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 更新应用 用户更新自己创建的应用，需要登录 POST /app/update */
export async function updateApp(body: API.AppUpdateRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>('/app/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
