<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { UserOutlined, CopyOutlined } from '@ant-design/icons-vue'
import { getDeployUrl } from '@/utils/url'

interface Props {
  open: boolean
  app: API.AppVO
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const handleClose = () => {
  emit('update:open', false)
}

/**
 * 复制文本到剪贴板
 */
const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    message.success('已复制到剪贴板')
  } catch {
    message.error('复制失败')
  }
}
</script>

<template>
  <a-drawer
    :open="open"
    title="应用详情"
    width="480"
    placement="right"
    @close="handleClose"
  >
    <div class="detail-drawer">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h4 class="section-title">基本信息</h4>
        <div class="detail-item">
          <span class="item-label">应用名称：</span>
          <span class="item-value">{{ app.appName || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="item-label">应用 ID：</span>
          <span class="item-value item-id copyable" @click="handleCopy(String(app.id || ''))">
            {{ app.id || '-' }}
            <a-tooltip title="点击复制"><CopyOutlined class="copy-icon" /></a-tooltip>
          </span>
        </div>
        <div class="detail-item">
          <span class="item-label">生成类型：</span>
          <a-tag :color="app.codeGenType === 'html' ? 'blue' : 'green'" size="small">
            {{ app.codeGenType === 'html' ? 'HTML' : '多文件' }}
          </a-tag>
        </div>
        <div class="detail-item">
          <span class="item-label">应用封面：</span>
          <a-avatar
            v-if="app.cover"
            :src="app.cover"
            :size="64"
            shape="square"
          />
          <span v-else class="no-cover">未设置</span>
        </div>
        <div class="detail-item">
          <span class="item-label">优先级：</span>
          <a-tag :color="(app.priority ?? 0) >= 99 ? 'gold' : 'default'">
            {{ app.priority ?? 0 }}
            <span v-if="(app.priority ?? 0) >= 99">（精选）</span>
          </a-tag>
        </div>
      </div>

      <a-divider />

      <!-- 应用信息 -->
      <div class="detail-section">
        <h4 class="section-title">应用信息</h4>
        <div class="detail-item">
          <span class="item-label">初始化提示词：</span>
        </div>
        <div class="init-prompt-box">{{ app.initPrompt || '无' }}</div>
      </div>

      <a-divider />

      <!-- 部署信息 -->
      <div class="detail-section">
        <h4 class="section-title">部署信息</h4>
        <div class="detail-item">
          <span class="item-label">部署状态：</span>
          <a-tag :color="app.deployKey ? 'success' : 'default'">
            {{ app.deployKey ? '已部署' : '未部署' }}
          </a-tag>
        </div>
        <div class="detail-item" v-if="app.deployKey">
          <span class="item-label">部署标识：</span>
          <span class="item-value item-id copyable" @click="handleCopy(String(app.deployKey || ''))">
            {{ app.deployKey }}
            <a-tooltip title="点击复制"><CopyOutlined class="copy-icon" /></a-tooltip>
          </span>
        </div>
        <div class="detail-item" v-if="app.deployKey">
          <span class="item-label">访问地址：</span>
          <a
            :href="getDeployUrl(app.deployKey)"
            target="_blank"
            class="deploy-link"
          >
            {{ getDeployUrl(app.deployKey) }}
          </a>
        </div>
      </div>

      <a-divider />

      <!-- 时间信息 -->
      <div class="detail-section">
        <h4 class="section-title">时间信息</h4>
        <div class="detail-item">
          <span class="item-label">创建时间：</span>
          <span class="item-value">{{ app.createTime || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="item-label">更新时间：</span>
          <span class="item-value">{{ app.updateTime || '-' }}</span>
        </div>
      </div>

      <a-divider />

      <!-- 创建者信息 -->
      <div class="detail-section" v-if="app.user">
        <h4 class="section-title">创建者信息</h4>
        <div class="detail-item">
          <span class="item-label">用户 ID：</span>
          <span class="item-value item-id copyable" @click="handleCopy(String(app.userId || ''))">
            {{ app.userId }}
            <a-tooltip title="点击复制"><CopyOutlined class="copy-icon" /></a-tooltip>
          </span>
        </div>
        <div class="detail-item">
          <span class="item-label">用户名：</span>
          <div class="creator-info">
            <a-avatar
              v-if="app.user.userAvatar"
              :src="app.user.userAvatar"
              :size="28"
            />
            <a-avatar v-else :size="28" style="background-color: #1890ff">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <span class="item-value">{{ app.user.userName || app.user.userAccount }}</span>
          </div>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<style scoped>
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

.copyable {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.copyable:hover {
  background-color: #e8e8e8;
}

.copy-icon {
  font-size: 12px;
  color: #999;
}

.copyable:hover .copy-icon {
  color: #1890ff;
}

.no-cover {
  color: #999;
}

.init-prompt-box {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.deploy-link {
  color: #1890ff;
  font-size: 13px;
  word-break: break-all;
  text-decoration: none;
}

.deploy-link:hover {
  text-decoration: underline;
}
</style>
