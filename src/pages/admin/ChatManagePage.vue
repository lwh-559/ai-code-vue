<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons-vue'
import { adminListAppChatHistoryByPage } from '@/api/chatHistoryController'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 配置 marked：GFM + 换行 + 代码高亮
marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value
      }
      return hljs.highlightAuto(code).value
    },
  }),
)
marked.use({ breaks: true, gfm: true })

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 180,
  },
  {
    title: '应用 ID',
    dataIndex: 'appId',
    key: 'appId',
    width: 180,
  },
  {
    title: '用户 ID',
    dataIndex: 'userId',
    key: 'userId',
    width: 180,
  },
  {
    title: '消息内容',
    dataIndex: 'message',
    key: 'message',
    ellipsis: true,
  },
  {
    title: '消息类型',
    dataIndex: 'messageType',
    key: 'messageType',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
    sorter: true,
    defaultSortOrder: 'descend' as const,
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right' as const,
    width: 120,
  },
]

// 搜索条件
const searchForm = reactive({
  id: '' as string,
  appId: '' as string,
  userId: '' as string,
  messageType: '' as string,
  message: '' as string,
})

// 排序状态
const sortState = reactive({
  field: 'create_time',
  order: 'descend' as 'ascend' | 'descend' | null,
})

// 表格数据
const dataSource = ref<API.ChatHistory[]>([])
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条数据`,
})

/**
 * 加载表格数据
 */
const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      sortField: sortState.field || 'create_time',
      sortOrder: sortState.order || 'descend',
    }
    if (searchForm.id.trim()) {
      params.id = searchForm.id.trim()
    }
    if (searchForm.appId.trim()) {
      params.appId = searchForm.appId.trim()
    }
    if (searchForm.userId.trim()) {
      params.userId = searchForm.userId.trim()
    }
    if (searchForm.messageType) {
      params.messageType = searchForm.messageType
    }
    if (searchForm.message.trim()) {
      params.message = searchForm.message.trim()
    }

    const res = await adminListAppChatHistoryByPage(params)
    if (res.data.code === 0 && res.data.data) {
      dataSource.value = res.data.data.records || []
      pagination.total = Number(res.data.data.totalRow) || 0
    } else {
      message.error('查询失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    message.error('查询失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 搜索
 */
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

/**
 * 重置
 */
const handleReset = () => {
  searchForm.id = ''
  searchForm.appId = ''
  searchForm.userId = ''
  searchForm.messageType = ''
  searchForm.message = ''
  pagination.current = 1
  loadData()
}

/**
 * 表格分页和排序变化
 */
const handleTableChange = (pag: any, _filters: any, sorter: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize

  // 处理排序
  if (sorter && sorter.field) {
    // 字段名映射：前端 camelCase -> 后端 snake_case
    const fieldMap: Record<string, string> = {
      createTime: 'create_time',
    }
    sortState.field = fieldMap[sorter.field] || sorter.field
    sortState.order = sorter.order || 'descend'
  } else {
    // 没有排序时恢复默认
    sortState.field = 'create_time'
    sortState.order = 'descend'
  }

  loadData()
}

// ========== 查看详情相关 ==========
const detailVisible = ref(false)
const detailRecord = ref<API.ChatHistory>({})

// ========== 消息内容弹窗相关 ==========
const messageModalVisible = ref(false)
const messageModalContent = ref('')

/**
 * 渲染 markdown 为 HTML
 */
const renderMarkdown = (text: string): string => {
  return marked.parse(text) as string
}

/**
 * 显示消息内容弹窗
 */
const showMessageDetail = (record: API.ChatHistory) => {
  messageModalContent.value = record.message || ''
  messageModalVisible.value = true
}

/**
 * 查看对话详情
 */
const handleViewDetail = (record: API.ChatHistory) => {
  detailRecord.value = record
  detailVisible.value = true
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="chat-manage-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <a-card :bordered="false">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="对话 ID">
            <a-input
              v-model:value="searchForm.id"
              placeholder="请输入对话 ID"
              allow-clear
              style="width: 120px"
              @pressEnter="handleSearch"
            />
          </a-form-item>
          <a-form-item label="应用 ID">
            <a-input
              v-model:value="searchForm.appId"
              placeholder="请输入应用 ID"
              allow-clear
              style="width: 120px"
              @pressEnter="handleSearch"
            />
          </a-form-item>
          <a-form-item label="用户 ID">
            <a-input
              v-model:value="searchForm.userId"
              placeholder="请输入用户 ID"
              allow-clear
              style="width: 120px"
              @pressEnter="handleSearch"
            />
          </a-form-item>
          <a-form-item label="消息类型">
            <a-select
              v-model:value="searchForm.messageType"
              placeholder="请选择类型"
              allow-clear
              style="width: 120px"
              @change="handleSearch"
            >
              <a-select-option value="user">用户消息</a-select-option>
              <a-select-option value="ai">AI 消息</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="消息内容">
            <a-input
              v-model:value="searchForm.message"
              placeholder="请输入消息内容"
              allow-clear
              style="width: 180px"
              @pressEnter="handleSearch"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon><SearchOutlined /></template>
                搜索
              </a-button>
              <a-button @click="handleReset">
                <template #icon><ReloadOutlined /></template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <a-card :bordered="false">
        <div class="table-header">
          <h3>对话记录列表</h3>
        </div>

        <a-table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
          :scroll="{ x: 1000 }"
        >
          <template #bodyCell="{ column, record }">
            <!-- 消息内容列 -->
            <template v-if="column.key === 'message'">
              <a-tooltip title="点击查看详情">
                <span class="message-preview clickable" @click="showMessageDetail(record)">
                  {{ record.message || '-' }}
                </span>
              </a-tooltip>
            </template>

            <!-- 消息类型列 -->
            <template v-if="column.key === 'messageType'">
              <a-tag :color="record.messageType === 'user' ? 'blue' : 'green'">
                {{ record.messageType === 'user' ? '用户消息' : 'AI 消息' }}
              </a-tag>
            </template>

            <!-- 创建时间列 -->
            <template v-if="column.key === 'createTime'">
              {{ record.createTime ? new Date(record.createTime).toLocaleString() : '-' }}
            </template>

            <!-- 操作列 -->
            <template v-if="column.key === 'action'">
              <a-space>
                <a-tooltip title="查看详情">
                  <a-button type="text" size="small" @click="handleViewDetail(record)">
                    <template #icon><EyeOutlined /></template>
                  </a-button>
                </a-tooltip>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 对话详情抽屉 -->
    <a-drawer
      v-model:open="detailVisible"
      title="对话详情"
      width="480"
      placement="right"
    >
      <div class="detail-drawer">
        <div class="detail-section">
          <h4 class="section-title">基本信息</h4>
          <div class="detail-item">
            <span class="item-label">对话 ID：</span>
            <span class="item-value item-id">{{ String(detailRecord.id) || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="item-label">应用 ID：</span>
            <span class="item-value item-id">{{ String(detailRecord.appId) || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="item-label">用户 ID：</span>
            <span class="item-value item-id">{{ String(detailRecord.userId) || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="item-label">消息类型：</span>
            <a-tag :color="detailRecord.messageType === 'user' ? 'blue' : 'green'">
              {{ detailRecord.messageType === 'user' ? '用户消息' : 'AI 消息' }}
            </a-tag>
          </div>
        </div>

        <a-divider />

        <div class="detail-section">
          <h4 class="section-title">消息内容</h4>
          <div class="message-content-box">{{ detailRecord.message || '无' }}</div>
        </div>

        <a-divider />

        <div class="detail-section">
          <h4 class="section-title">时间信息</h4>
          <div class="detail-item">
            <span class="item-label">创建时间：</span>
            <span class="item-value">{{ detailRecord.createTime || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="item-label">更新时间：</span>
            <span class="item-value">{{ detailRecord.updateTime || '-' }}</span>
          </div>
        </div>
      </div>
    </a-drawer>

    <!-- 消息内容弹窗 -->
    <a-modal
      v-model:open="messageModalVisible"
      title="消息内容"
      :footer="null"
      width="700px"
    >
      <div class="message-modal-content" v-html="renderMarkdown(messageModalContent)"></div>
    </a-modal>
  </div>
</template>

<style scoped>
.chat-manage-container {
  padding: 24px;
}

.search-section {
  margin-bottom: 16px;
}

.search-section :deep(.ant-card) {
  border-radius: 8px;
}

.table-section :deep(.ant-card) {
  border-radius: 8px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.message-preview {
  display: inline-block;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-preview.clickable {
  cursor: pointer;
  color: #1890ff;
}

.message-preview.clickable:hover {
  text-decoration: underline;
}

.message-modal-content {
  max-height: 600px;
  overflow-y: auto;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.6;
}

.message-modal-content :deep(pre) {
  background: #fff;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 13px;
  margin: 8px 0;
}

.message-modal-content :deep(code) {
  background: #f0f0f0;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 13px;
}

.message-modal-content :deep(pre code) {
  background: none;
  padding: 0;
}

:deep(.ant-table) {
  border-radius: 8px;
}

:deep(.ant-btn-link) {
  padding: 0 4px;
}

/* 抽屉样式 */
.detail-drawer {
  padding: 0 8px;
}

.detail-section {
  margin-bottom: 8px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
}

.item-label {
  color: #666;
  white-space: nowrap;
  min-width: 90px;
}

.item-value {
  color: #333;
}

.item-id {
  font-family: monospace;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.message-content-box {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
