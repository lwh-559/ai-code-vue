# 用户模块开发计划

## 项目概述
完成 AI 零代码应用生成平台的用户相关功能模块开发，包括登录、注册、用户管理和全局状态管理。

---

## 一、开发任务清单

### 任务 1：完善全局状态管理 (`src/stores/loginUser.ts`)

**目标**：增强用户状态管理，支持登录状态判断和用户信息存储

**修改内容**：
- 优化 `loginUser` store，添加 `isLoggedIn` 计算属性
- 添加用户头像、用户名等字段
- 提供 `clearLoginUser()` 方法用于注销

---

### 任务 2：改造 GlobalHeader 组件 (`src/components/GlobalHeader.vue`)

**目标**：实现登录状态显示和注销功能

**功能需求**：
- 已登录：显示用户头像 + 用户名，鼠标悬停显示下拉菜单（注销选项）
- 未登录：显示登录按钮，点击跳转 `/user/login`
- 注销功能：调用 `userLogout` 接口，清除本地状态，跳转首页

**技术方案**：
- 使用 Ant Design Vue 的 `a-dropdown` 组件实现下拉菜单
- 使用 `a-avatar` 显示用户头像
- 从 `loginUser` store 获取登录状态

---

### 任务 3：开发用户登录页面 (`src/pages/user/UserLoginPage.Vue`)

**目标**：实现用户登录功能

**功能需求**：
- 表单字段：用户账号（username）、密码（password）
- 表单验证：账号和密码不能为空
- 登录成功：存储用户信息到 store，跳转首页
- 登录失败：显示错误提示

**技术方案**：
- 使用 Ant Design Vue 的 `a-form`、`a-input`、`a-button` 组件
- 调用 `userLogin` API 接口
- 使用 `useLoginUserStore` 存储登录状态
- 使用 `useRouter` 实现页面跳转

**UI 设计**：
- 居中卡片布局，带阴影效果
- 渐变背景色
- 响应式设计

---

### 任务 4：开发用户注册页面 (`src/pages/user/UserRegisterPage.Vue`)

**目标**：实现用户注册功能

**功能需求**：
- 表单字段：用户账号、密码、确认密码
- 表单验证：
  - 账号长度 4-20 位
  - 密码长度 8-20 位
  - 两次密码输入一致
- 注册成功：自动跳转登录页面
- 注册失败：显示错误提示

**技术方案**：
- 使用 Ant Design Vue 表单组件
- 调用 `userRegister` API 接口
- 注册成功后使用 `router.push('/user/login')` 跳转

**UI 设计**：
- 与登录页风格一致
- 居中卡片布局

---

### 任务 5：开发用户管理页面 (`src/pages/admin/UserManagePage.Vue`)

**目标**：实现用户信息的增删改查功能

**功能需求**：

#### 5.1 分页查询
- 查询条件：用户名、用户 ID
- 使用 `a-table` 展示用户列表
- 支持分页切换
- 调用 `listUserVoByPage` 接口

#### 5.2 编辑用户
- 点击编辑按钮弹出模态框
- 可修改字段：用户名、用户头像、用户简介
- 调用 `updateUser` 接口

#### 5.3 删除用户
- 点击删除按钮弹出确认框
- 确认后调用 `deleteUser` 接口

#### 5.4 创建用户
- 点击"创建用户"按钮弹出模态框
- 表单字段：用户账号、密码、用户名等
- 调用 `addUser` 接口

**技术方案**：
- 使用 `a-table` 组件展示数据
- 使用 `a-modal` 组件实现编辑/创建弹窗
- 使用 `a-form` 组件实现表单
- 使用 `a-popconfirm` 组件实现删除确认

**UI 设计**：
- 搜索区域：顶部卡片内放置查询条件和操作按钮
- 表格区域：清晰的表格展示用户信息
- 操作列：编辑、删除按钮

---

### 任务 6：路由配置更新 (`src/router/index.ts`)

**目标**：添加路由守卫，保护需要登录的页面

**修改内容**：
- 为 `/admin/userManage` 添加路由守卫
- 未登录用户访问管理页面时跳转登录页

---

## 二、文件修改清单

| 文件路径 | 操作类型 | 说明 |
|---------|---------|------|
| `src/stores/loginUser.ts` | 修改 | 增强用户状态管理 |
| `src/components/GlobalHeader.vue` | 修改 | 添加登录状态显示和注销功能 |
| `src/pages/user/UserLoginPage.Vue` | 重写 | 实现登录页面 |
| `src/pages/user/UserRegisterPage.Vue` | 重写 | 实现注册页面 |
| `src/pages/admin/UserManagePage.Vue` | 重写 | 实现用户管理页面 |
| `src/router/index.ts` | 修改 | 添加路由守卫 |

---

## 三、API 接口使用

| 接口函数 | 用途 | 调用位置 |
|---------|------|---------|
| `userLogin` | 用户登录 | UserLoginPage |
| `userRegister` | 用户注册 | UserRegisterPage |
| `userLogout` | 用户注销 | GlobalHeader |
| `getLoginUser` | 获取当前登录用户 | stores/loginUser |
| `listUserVoByPage` | 分页查询用户 | UserManagePage |
| `addUser` | 创建用户 | UserManagePage |
| `updateUser` | 更新用户 | UserManagePage |
| `deleteUser` | 删除用户 | UserManagePage |

---

## 四、开发顺序

1. **第一步**：完善 `stores/loginUser.ts` 状态管理
2. **第二步**：改造 `GlobalHeader.vue` 实现登录状态显示
3. **第三步**：开发 `UserLoginPage.Vue` 登录页面
4. **第四步**：开发 `UserRegisterPage.Vue` 注册页面
5. **第五步**：开发 `UserManagePage.Vue` 用户管理页面
6. **第六步**：更新路由配置添加守卫

---

## 五、UI 设计规范

### 颜色方案
- 主色：`#1890ff`（Ant Design 默认蓝）
- 背景渐变：`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- 卡片背景：白色，带圆角和阴影

### 组件样式
- 卡片圆角：`8px`
- 卡片阴影：`0 4px 12px rgba(0, 0, 0, 0.1)`
- 按钮圆角：`4px`
- 间距：使用 Ant Design 的 8px 倍数系统

### 响应式断点
- 移动端：< 576px
- 平板：576px - 768px
- 桌面：> 768px

---

## 六、注意事项

1. **文件命名**：统一使用小写 `.vue` 扩展名
2. **代码风格**：遵循 Prettier 配置（无分号、单引号）
3. **类型安全**：使用 TypeScript 类型定义
4. **错误处理**：统一使用 `message.error()` 显示错误信息
5. **加载状态**：表单提交时显示 loading 状态

---

## 七、预期效果

### 登录页面
- 美观的居中卡片布局
- 渐变背景
- 表单验证提示
- 登录成功跳转首页

### 注册页面
- 与登录页风格一致
- 密码强度提示
- 注册成功自动跳转登录页

### 用户管理页面
- 清晰的搜索区域
- 响应式表格
- 便捷的操作按钮
- 友好的确认对话框

### 全局 Header
- 登录状态实时显示
- 用户头像和用户名展示
- 下拉菜单注销功能

---

## 八、审批确认

请确认以上开发计划，确认后将开始逐步实现各功能模块。

**预计开发时间**：约 2-3 小时

**需要确认的问题**：
1. 用户表单字段是否需要调整？
2. 是否需要添加其他查询条件？
3. UI 风格是否符合预期？
