<script setup lang="ts">
import { MessageOutlined, EyeOutlined } from '@ant-design/icons-vue'
import { getDeployUrl } from '@/utils/url'

interface Props {
  app: API.AppVO
  placeholderIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholderIcon: '🚀',
})

const emit = defineEmits<{
  (e: 'view-chat', appId: string): void
  (e: 'view-deploy', deployKey: string): void
}>()

const handleViewChat = () => {
  emit('view-chat', String(props.app.id))
}

const handleViewDeploy = () => {
  if (props.app.deployKey) {
    emit('view-deploy', props.app.deployKey)
  }
}
</script>

<template>
  <div class="app-card">
    <div class="app-card-cover" @click="handleViewChat">
      <img v-if="app.cover" :src="app.cover" :alt="app.appName" />
      <div v-else class="cover-placeholder">
        <span class="cover-icon">{{ placeholderIcon }}</span>
      </div>
      <div class="app-card-actions">
        <a-button
          size="small"
          class="action-btn action-btn-dark"
          @click="handleViewChat"
        >
          <template #icon><MessageOutlined /></template>
          查看对话
        </a-button>
        <a-button
          v-if="app.deployKey"
          size="small"
          class="action-btn action-btn-light"
          @click.stop="handleViewDeploy"
        >
          <template #icon><EyeOutlined /></template>
          查看作品
        </a-button>
      </div>
    </div>
    <div class="app-card-info">
      <div class="app-card-info-left">
        <a-avatar v-if="app.user" :src="app.user.userAvatar" :size="36" />
        <a-avatar v-else :size="36">U</a-avatar>
      </div>
      <div class="app-card-info-right">
        <div class="app-card-name">{{ app.appName || '未命名应用' }}</div>
        <div v-if="app.user" class="app-card-author">{{ app.user.userName }}</div>
        <div v-else class="app-card-date">
          {{ app.createTime ? new Date(app.createTime).toLocaleDateString() : '' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: box-shadow 0.3s, transform 0.2s;
  position: relative;
}

.app-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.app-card:hover .app-card-cover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
}

.app-card-cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #f5f5f5;
  position: relative;
}

.app-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8f4fd 0%, #f0f5ff 100%);
}

.cover-icon {
  font-size: 36px;
}

.app-card-info {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-card-info-left {
  flex-shrink: 0;
}

.app-card-info-right {
  flex: 1;
  min-width: 0;
}

.app-card-name {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-card-author {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-card-date {
  font-size: 13px;
  color: #999;
}

.app-card-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}

.app-card:hover .app-card-actions {
  opacity: 1;
}

.action-btn {
  min-width: 140px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
}

.action-btn-dark {
  background: #1a1a1a;
  border-color: #1a1a1a;
  color: #fff;
}

.action-btn-dark:hover {
  background: #333;
  border-color: #333;
  color: #fff;
}

.action-btn-light {
  background: #fff;
  border-color: #e8e8e8;
  color: #1a1a1a;
}

.action-btn-light:hover {
  border-color: #1890ff;
  color: #1890ff;
}
</style>
