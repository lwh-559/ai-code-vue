<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, computed, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  SendOutlined,
  LoadingOutlined,
  RocketOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  TagOutlined,
} from '@ant-design/icons-vue'
import { getAppVoById, deployApp } from '@/api/appController'
import { listAppChatHistory } from '@/api/chatHistoryController'
import { chatToGenCode } from '@/utils/sseRequest'
import { useLoginUserStore } from '@/stores/loginUser'
import { getStaticPreviewUrl } from '@/utils/url'
import { downloadAppCodeZip } from '@/utils/downloadAppCode'
import { CODE_GEN_TYPE, getCodeGenTypeLabel, getCodeGenTypeColor } from '@/constants/codegen'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import AppDetailPopover from '@/components/app/AppDetailPopover.vue'

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

const router = useRouter()
const route = useRoute()
const loginUserStore = useLoginUserStore()

const appId = computed(() => route.params.id as string)
const isOwner = computed(() => {
  if (!loginUserStore.loginUser?.id || !appInfo.value.userId) return false
  return loginUserStore.loginUser.id === appInfo.value.userId
})

// ========== 应用信息 ==========
const appInfo = ref<API.AppVO>({})
const loadingApp = ref(false)

// ========== 对话相关 ==========
interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  createTime?: string
}

const messages = ref<ChatMessage[]>([])
const userInput = ref('')
const sending = ref(false)
const sseController = ref<AbortController | null>(null)
const messagesEndRef = ref<HTMLElement>()

// ========== 历史消息分页相关 ==========
const loadingHistory = ref(false)
const hasMoreHistory = ref(false)
const lastCreateTime = ref<string | undefined>(undefined)
const PAGE_SIZE = 10

// ========== 预览相关 ==========
type PreviewStatus = 'not_generated' | 'preview_ready' | 'preview_error'
const previewStatus = ref<PreviewStatus>('not_generated')
const previewUrl = ref('')

// ========== 部署相关 ==========
const deploying = ref(false)

// ========== 下载相关 ==========
const downloading = ref(false)
const detailPopoverVisible = ref(false)

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

/**
 * 加载对话历史消息（游标分页）
 */
const loadChatHistory = async (isLoadMore = false) => {
  if (loadingHistory.value) return

  loadingHistory.value = true
  try {
    const params: any = {
      appId: appId.value,
      pageSize: PAGE_SIZE,
    }

    // 如果是加载更多，传入游标
    if (isLoadMore && lastCreateTime.value) {
      params.lastCreateTime = lastCreateTime.value
    }

    const res = await listAppChatHistory(params)
    if (res.data.code === 0 && res.data.data) {
      const records = res.data.data.records || []

      // 将历史记录转换为 ChatMessage 格式
      const historyMessages: ChatMessage[] = records.map((record) => ({
        id: String(record.id),
        role: record.messageType === 'user' ? 'user' : 'assistant',
        content: record.message || '',
        createTime: record.createTime,
      }))

      if (isLoadMore) {
        // 加载更多：将新消息插入到现有消息的前面
        messages.value = [...historyMessages, ...messages.value]
      } else {
        // 首次加载：反转为倒序（最新的在底部）
        messages.value = historyMessages.reverse()
      }

      // 更新游标（取最后一条记录的创建时间）
      const lastRecord = records[records.length - 1]
      if (lastRecord && lastRecord.createTime) {
        lastCreateTime.value = lastRecord.createTime
      }

      // 判断是否还有更多数据
      const totalRow = res.data.data.totalRow || 0
      hasMoreHistory.value = messages.value.length < totalRow
    } else {
      message.error('加载对话历史失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    message.error('加载对话历史失败，请稍后重试')
  } finally {
    loadingHistory.value = false
  }
}

/**
 * 加载应用信息
 * @param redirectOnError 失败时是否跳转首页
 */
const loadAppInfo = async (redirectOnError = true) => {
  loadingApp.value = true
  try {
    const res = await getAppVoById({ id: appId.value } as any)
    if (res.data.code === 0 && res.data.data) {
      appInfo.value = res.data.data
    } else if (redirectOnError) {
      message.error('获取应用信息失败')
      router.push('/')
    }
  } catch (error) {
    if (redirectOnError) {
      message.error('获取应用信息失败')
      router.push('/')
    }
  } finally {
    loadingApp.value = false
  }
}

/**
 * 发送消息给 AI
 */
const sendMessage = async (text?: string) => {
  const msg = (text || userInput.value).trim()
  if (!msg || sending.value) return

  // 添加用户消息
  messages.value.push({ role: 'user', content: msg })
  userInput.value = ''
  scrollToBottom()

  // 添加 AI 占位消息
  messages.value.push({ role: 'assistant', content: '' })
  sending.value = true
  scrollToBottom()

  // 调用 SSE 接口
  sseController.value = chatToGenCode(
    appId.value,
    msg,
    // onMessage
    (data: string) => {
      const lastMsg = messages.value[messages.value.length - 1]
      if (lastMsg && lastMsg.role === 'assistant') {
        lastMsg.content += data
        scrollToBottom()
      }
    },
    // onDone
    async () => {
      sending.value = false
      sseController.value = null
      // 流结束后重新获取应用信息，确保有 codeGenType
      await loadAppInfo(false)
      scrollToBottom()
      // 延迟5秒后尝试加载预览
      setTimeout(async () => {
        await tryLoadPreview()
      }, 5000)
    },
    // onError
    (error: Error) => {
      sending.value = false
      sseController.value = null
      // 将错误信息显示在对话框中
      const lastMsg = messages.value[messages.value.length - 1]
      if (lastMsg && lastMsg.role === 'assistant') {
        lastMsg.content = `❌ 错误：${error.message}`
      } else {
        messages.value.push({ role: 'assistant', content: `❌ 错误：${error.message}` })
      }
      scrollToBottom()
    },
  )
}

/**
 * 检查预览资源是否存在（不是404）
 */
const checkPreviewAvailable = async (url: string): Promise<boolean> => {
  try {
    const res = await fetch(url)
    return res.ok
  } catch {
    return false
  }
}

/**
 * 尝试加载预览，失败重试最多3次
 */
const tryLoadPreview = async (retryCount = 0) => {
  const MAX_RETRY = 3
  if (!appInfo.value.codeGenType || !appInfo.value.id) {
    previewStatus.value = 'not_generated'
    return
  }
  const codeGenType = appInfo.value.codeGenType
  const id = appInfo.value.id
  const url = getStaticPreviewUrl(codeGenType, String(id))
  const available = await checkPreviewAvailable(url)
  if (available) {
    previewUrl.value = url
    previewStatus.value = 'preview_ready'
  } else if (retryCount < MAX_RETRY) {
    // 1秒后重试
    setTimeout(() => {
      tryLoadPreview(retryCount + 1)
    }, 1000)
  } else {
    previewStatus.value = 'preview_error'
  }
}

/**
 * 初始化预览状态（页面加载时调用）
 */
const initPreviewStatus = async () => {
  // 如果没有对话历史，直接显示未生成
  if (messages.value.length === 0) {
    previewStatus.value = 'not_generated'
    return
  }
  // 有对话历史，检查预览资源是否存在
  await tryLoadPreview()
}

/**
 * 删除应用
 */
const handleDelete = () => {
  // 关闭 Popover
  detailPopoverVisible.value = false

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除应用「${appInfo.value.appName}」吗？删除后无法恢复。`,
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        const { deleteApp } = await import('@/api/appController')
        const res = await deleteApp({ id: appId.value } as any)
        if (res.data.code === 0) {
          message.success('删除成功')
          router.push('/')
        } else {
          message.error('删除失败：' + (res.data.message || '未知错误'))
        }
      } catch (error) {
        message.error('删除失败，请稍后重试')
      }
    },
  })
}

/**
 * 跳转到编辑页
 */
const goToEdit = () => {
  router.push(`/app/edit/${appId.value}`)
}

/**
 * 部署应用
 */
const handleDeploy = async () => {
  deploying.value = true
  try {
    const res = await deployApp({ appId: appId.value } as any)
    if (res.data.code === 0 && res.data.data) {
      Modal.success({
        title: '部署成功',
        content: h('div', [
          '应用已部署，访问地址：',
          h('a', { href: res.data.data, target: '_blank', style: 'color: #1890ff' }, res.data.data),
        ]),
        okText: '我知道了',
      })
    } else {
      message.error('部署失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    message.error('部署失败，请稍后重试')
  } finally {
    deploying.value = false
  }
}

/**
 * 下载应用代码
 */
const handleDownloadCode = async () => {
  downloading.value = true
  try {
    await downloadAppCodeZip({ appId: Number(appId.value) })
    message.success('代码下载成功')
  } catch (error) {
    message.error('下载失败，请稍后重试')
  } finally {
    downloading.value = false
  }
}

/**
 * 返回主页
 */
const goBack = () => {
  router.push('/')
}

/**
 * 渲染 markdown 为 HTML
 */
const renderMarkdown = (text: string): string => {
  return marked.parse(text) as string
}

onMounted(async () => {
  await loadAppInfo()
  // 加载对话历史
  await loadChatHistory()
  // 滚动到底部
  scrollToBottom()
  // 初始化预览状态
  await initPreviewStatus()
  // 如果是自己的应用且没有对话历史，自动发送初始提示词
  if (isOwner.value && messages.value.length === 0 && appInfo.value.initPrompt) {
    await sendMessage(appInfo.value.initPrompt)
  }
})

onUnmounted(() => {
  // 取消进行中的 SSE 请求
  sseController.value?.abort()
})
</script>

<template>
  <div class="chat-page">
    <!-- 顶部栏 -->
    <div class="chat-header">
      <div class="header-left">
        <a-button type="text" @click="goBack">
          <template #icon><ArrowLeftOutlined /></template>
        </a-button>
        <span class="app-name">{{ appInfo.appName || '应用生成中...' }}</span>
        <a-tag
          v-if="appInfo.codeGenType"
          :class="['gen-type-tag', `gen-type-${getCodeGenTypeColor(appInfo.codeGenType)}`]"
        >
          <template #icon><TagOutlined /></template>
          {{ getCodeGenTypeLabel(appInfo.codeGenType) }}
        </a-tag>
      </div>
      <div class="header-right">
        <!-- 应用详情按钮 -->
        <a-popover
          v-model:visible="detailPopoverVisible"
          placement="bottomRight"
          trigger="click"
        >
          <template #content>
            <AppDetailPopover
              :app="appInfo"
              :is-owner="isOwner"
              @edit="goToEdit"
              @delete="handleDelete"
            />
          </template>
          <a-button>
            <template #icon><InfoCircleOutlined /></template>
            应用详情
          </a-button>
        </a-popover>

        <a-button
          :loading="downloading"
          @click="handleDownloadCode"
        >
          <template #icon><DownloadOutlined /></template>
          下载代码
        </a-button>

        <a-button
          type="primary"
          :loading="deploying"
          @click="handleDeploy"
        >
          <template #icon><RocketOutlined /></template>
          部署
        </a-button>
      </div>
    </div>

    <!-- 核心内容区域 -->
    <div class="chat-body">
      <!-- 左侧对话区域 -->
      <div class="chat-left">
        <div class="messages-container">
          <a-spin :spinning="loadingApp || loadingHistory" tip="加载中...">
            <!-- 加载更多按钮 -->
            <div v-if="hasMoreHistory" class="load-more-container">
              <a-button
                type="link"
                :loading="loadingHistory"
                @click="loadChatHistory(true)"
              >
                加载更多历史消息
              </a-button>
            </div>

            <div v-if="messages.length === 0 && !loadingApp && !loadingHistory" class="empty-chat">
              <div class="empty-icon">💬</div>
              <p>开始与 AI 对话来生成你的应用</p>
            </div>

            <div
              v-for="(msg, index) in messages"
              :key="msg.id || index"
              class="message"
              :class="msg.role"
            >
              <div v-if="msg.role === 'user'" class="message-content user-message">
                {{ msg.content }}
              </div>
              <div v-else class="message-content assistant-message">
                <div v-if="msg.content" v-html="renderMarkdown(msg.content)"></div>
                <div v-else-if="sending && index === messages.length - 1" class="typing-indicator">
                  <LoadingOutlined /> AI 正在思考...
                </div>
              </div>
            </div>
          </a-spin>
          <div ref="messagesEndRef" />
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <a-tooltip :title="!isOwner ? '无法在别人的作品下对话哦~' : ''" :disabled="isOwner">
            <a-input-search
              v-model:value="userInput"
              :placeholder="isOwner ? '请描述你想生成的网站，越详细效果越好哦' : '无法在别人的作品下对话哦~'"
              enter-button
              :loading="sending"
              :disabled="!isOwner"
              size="large"
              class="chat-input"
              @search="isOwner && sendMessage()"
            >
              <template #enterButton>
                <a-button type="primary" :disabled="sending || !isOwner">
                  <template #icon><SendOutlined /></template>
                </a-button>
              </template>
            </a-input-search>
          </a-tooltip>
          <div v-if="isOwner" class="input-tip">按 Enter 发送，Ctrl+Enter 换行</div>
          <div v-else class="input-tip input-tip-warning">只有作品作者才能进行对话</div>
        </div>
      </div>

      <!-- 右侧预览区域 -->
      <div class="chat-right">
        <!-- 预览就绪：显示 iframe -->
        <div v-if="previewStatus === 'preview_ready' && previewUrl" class="preview-container">
          <iframe
            :src="previewUrl"
            class="preview-iframe"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
        <!-- 预览失败 -->
        <div v-else-if="previewStatus === 'preview_error'" class="preview-error">
          <div class="preview-error-icon">⚠️</div>
          <p>预览出现问题</p>
        </div>
        <!-- 未生成 -->
        <div v-else class="preview-not-generated">
          <div class="preview-not-generated-icon">🖥️</div>
          <p>AI 生成完成后将在此展示网页预览</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* 顶部栏 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  height: 48px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-name {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.gen-type-tag {
  font-size: 12px;
  font-weight: normal;
  border-radius: 12px;
  margin-left: 8px;
}

.gen-type-blue {
  background-color: #e6f7ff;
  color: #1890ff;
  border-color: #91d5ff;
}

.gen-type-green {
  background-color: #f6ffed;
  color: #52c41a;
  border-color: #b7eb8f;
}

.gen-type-orange {
  background-color: #fff7e6;
  color: #fa8c16;
  border-color: #ffd591;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 核心内容区域 */
.chat-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧对话区域 */
.chat-left {
  flex: 2;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.load-more-container {
  display: flex;
  justify-content: center;
  padding: 12px 0;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 40px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.message {
  margin-bottom: 12px;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.user-message {
  background: #1890ff;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.assistant-message {
  background: #fff;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.assistant-message :deep(pre) {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 13px;
  margin: 8px 0;
}

.assistant-message :deep(code) {
  background: #f0f0f0;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 13px;
}

.assistant-message :deep(pre code) {
  background: none;
  padding: 0;
}

.assistant-message :deep(h1),
.assistant-message :deep(h2),
.assistant-message :deep(h3),
.assistant-message :deep(h4) {
  margin: 12px 0 6px;
  line-height: 1.4;
}

.assistant-message :deep(h1) { font-size: 20px; }
.assistant-message :deep(h2) { font-size: 17px; }
.assistant-message :deep(h3) { font-size: 15px; }

.assistant-message :deep(p) {
  margin: 6px 0;
}

.assistant-message :deep(ul),
.assistant-message :deep(ol) {
  padding-left: 20px;
  margin: 6px 0;
}

.assistant-message :deep(li) {
  margin: 2px 0;
}

.assistant-message :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 8px 0;
  font-size: 13px;
}

.assistant-message :deep(th),
.assistant-message :deep(td) {
  border: 1px solid #ddd;
  padding: 6px 10px;
  text-align: left;
}

.assistant-message :deep(th) {
  background: #f6f8fa;
  font-weight: 600;
}

.assistant-message :deep(blockquote) {
  border-left: 3px solid #ddd;
  margin: 8px 0;
  padding: 4px 12px;
  color: #666;
}

.typing-indicator {
  color: #999;
  font-size: 13px;
}

/* 输入区域 */
.input-area {
  padding: 8px 12px;
  background: #fff;
  border-top: 1px solid #e8e8e8;
}

.chat-input :deep(.ant-input-search-button) {
  height: 40px;
}

.input-tip {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
  text-align: right;
}

.input-tip-warning {
  color: #ff7875;
}

/* 右侧预览区域 */
.chat-right {
  flex: 3;
  border-left: 1px solid #e8e8e8;
  background: #fff;
}

.preview-container {
  width: 100%;
  height: 100%;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-not-generated {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.preview-not-generated-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.preview-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ff4d4f;
}

.preview-error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
</style>
