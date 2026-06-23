# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

AI 零代码应用生成平台前端，基于 Vue 3 + TypeScript + Ant Design Vue 构建。后端 API 地址：`http://localhost:8123/api`

## 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 类型检查 + 生产构建
npm run build-only   # 仅构建（跳过类型检查）
npm run type-check   # TypeScript 类型检查
npm run format       # Prettier 格式化 src/
npm run openapi2ts   # 从 OpenAPI 规范生成 API 代码
```

## 代码规范

- Prettier 配置：无分号、单引号、100 字符宽度
- 文件扩展名统一使用小写 `.vue`（避免大小写不一致问题）
- 路径别名：`@` 指向 `src/`

## 架构要点

### API 层 (`src/api/`)
- **自动生成**：通过 `@umijs/openapi` 从后端 OpenAPI/Swagger 规范生成，不要手动生成
- 生成配置在 `openapi2ts.config.ts`，数据源：`http://localhost:8123/api/v3/api-docs`
- 生成的代码包括控制器文件和 `typings.d.ts` 类型定义

### HTTP 客户端 (`src/request.ts`)
- 基于 Axios，`withCredentials: true`（Cookie 认证）
- 响应拦截器处理错误码 `40100`（未授权）自动跳转登录页

### 状态管理 (`src/stores/`)
- 使用 Pinia
- `loginUser.ts`：管理登录用户状态，App 挂载时自动调用 `fetchLoginUser()`

### 路由 (`src/router/index.ts`)
- HTML5 History 模式
- 页面组件在 `src/pages/` 下，按功能模块分目录（`admin/`、`user/`）

### 布局 (`src/layouts/BasicLayout.vue`)
- Ant Design Vue Layout 结构：Header + Content + Footer
- GlobalHeader 和 GlobalFooter 是全局组件

## 注意事项

- Ant Design Vue 全量引入，如需优化包体积可改为按需引入
- GlobalHeader 中"关于"菜单指向 `/about` 但路由未定义
- 页面文件尚处于早期开发阶段（login、register、admin 页面为空）
