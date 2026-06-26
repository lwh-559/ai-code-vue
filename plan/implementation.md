# AI 零代码应用生成平台 - 前端实现计划

## 执行步骤

### Step 1：SSE 工具函数
- 创建 `src/utils/sseRequest.ts`
- 封装 fetch + ReadableStream 解析 SSE 流

### Step 2：主页
- Hero 区域：标题 + textarea + 快捷标签
- 我的作品分页列表
- 精选案例分页列表

### Step 3：应用生成对话页
- 全屏布局，左侧对话 + 右侧预览
- SSE 流式接收 AI 回复
- 部署功能

### Step 4：应用管理页（管理员）
- 表格管理，参考 UserManagePage
- 搜索、编辑、删除、精选

### Step 5：应用信息修改页
- 普通用户编辑应用名称
- 管理员编辑名称、封面、优先级

### Step 6：路由与菜单更新
- 新增路由
- GlobalHeader 增加菜单项

### Step 7：BasicLayout 适配
- 对话页隐藏 Header/Footer
