# AI 零代码应用生成平台 - 前端

基于 Vue 3 + TypeScript + Ant Design Vue 构建的 AI 零代码应用生成平台前端。

## 技术栈

- **框架**：Vue 3 + Composition API
- **构建工具**：Vite 8
- **类型检查**：TypeScript + vue-tsc
- **UI 组件库**：Ant Design Vue 4
- **状态管理**：Pinia
- **路由**：Vue Router 5 (History 模式)
- **HTTP 客户端**：Axios (Cookie 认证)
- **Markdown 渲染**：marked + highlight.js

## 环境要求

- Node.js: ^22.18.0 或 >=24.12.0
- npm 或其他包管理器

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，按需修改：

```bash
cp .env.example .env
```

环境变量说明：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_APP_API_BASE_URL` | 后端 API 地址 | `http://localhost:8123/api` |
| `VITE_APP_DEPLOY_BASE_URL` | 应用部署域名 | `http://localhost` |
| `VITE_APP_PREVIEW_BASE_URL` | 代码预览域名 | `http://localhost:8123/api/static` |

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 4. 生产构建

```bash
npm run build        # 类型检查 + 构建
npm run build-only   # 仅构建（跳过类型检查）
```

### 5. 预览构建产物

```bash
npm run preview
```

## 项目结构

```
src/
├── api/                    # API 接口（自动生成）
│   ├── appController.ts    # 应用管理接口
│   ├── userController.ts   # 用户接口
│   └── typings.d.ts        # 类型定义
├── assets/                 # 静态资源
├── components/             # 公共组件
│   ├── GlobalHeader.vue    # 全局导航栏
│   ├── GlobalFooter.vue    # 全局页脚
│   └── app/                # 应用相关组件
├── constants/              # 常量定义
├── layouts/                # 布局组件
│   └── BasicLayout.vue     # 基础布局
├── pages/                  # 页面组件
│   ├── admin/              # 管理后台页面
│   ├── app/                # 应用相关页面
│   └── user/               # 用户页面
├── router/                 # 路由配置
├── stores/                 # Pinia 状态管理
├── utils/                  # 工具函数
├── App.vue                 # 根组件
└── main.ts                 # 入口文件
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run build-only` | 仅构建（跳过类型检查） |
| `npm run type-check` | TypeScript 类型检查 |
| `npm run format` | Prettier 格式化 |
| `npm run openapi2ts` | 从 OpenAPI 生成 API 代码 |

## API 代码生成

后端提供 OpenAPI/Swagger 规范，通过 `@umijs/openapi` 自动生成 API 代码：

- 数据源：`http://localhost:8123/v3/api-docs`
- 配置文件：`openapi2ts.config.ts`
- 生成目录：`src/api/`

运行 `npm run openapi2ts` 重新生成。

## IDE 推荐配置

- **VS Code** + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 扩展
- 禁用 Vetur 扩展（与 Volar 冲突）

## 代码规范

- **Prettier**：无分号、单引号、100 字符宽度
- **文件扩展名**：统一使用小写 `.vue`
- **路径别名**：`@` 指向 `src/`
