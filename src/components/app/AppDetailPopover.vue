<script setup lang="ts">
import { UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { getDeployUrl } from '@/utils/url'
import { getCodeGenTypeLabel, getCodeGenTypeColor } from '@/constants/codegen'

interface Props {
  app: API.AppVO
  isOwner: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()
</script>

<template>
  <div class="app-detail-popover">
    <!-- 自己的应用：显示所有基本信息 -->
    <template v-if="isOwner">
      <div class="detail-section">
        <div class="detail-label">基本信息</div>
        <div class="detail-item">
          <span class="item-label">应用名称：</span>
          <span>{{ app.appName || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="item-label">生成类型：</span>
          <a-tag :color="getCodeGenTypeColor(app.codeGenType)" size="small">
            {{ getCodeGenTypeLabel(app.codeGenType) }}
          </a-tag>
        </div>
        <div class="detail-item" v-if="app.cover">
          <span class="item-label">应用封面：</span>
          <a-image :src="app.cover" :width="48" :height="48" style="border-radius: 4px" />
        </div>
        <div class="detail-item" v-else>
          <span class="item-label">应用封面：</span>
          <span class="field-readonly">未设置</span>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-label">初始化提示词</div>
        <div class="init-prompt">{{ app.initPrompt || '无' }}</div>
      </div>

      <div class="detail-section">
        <div class="detail-label">部署信息</div>
        <div class="detail-item">
          <span class="item-label">部署状态：</span>
          <a-tag :color="app.deployKey ? 'success' : 'default'">
            {{ app.deployKey ? '已部署' : '未部署' }}
          </a-tag>
        </div>
        <div class="detail-item" v-if="app.deployKey">
          <span class="item-label">访问地址：</span>
          <a :href="getDeployUrl(app.deployKey)" target="_blank" class="deploy-link">
            {{ getDeployUrl(app.deployKey) }}
          </a>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-label">创建者</div>
        <div class="detail-item" v-if="app.user">
          <div class="creator-info">
            <a-avatar
              v-if="app.user.userAvatar"
              :src="app.user.userAvatar"
              :size="24"
            />
            <a-avatar v-else :size="24" style="background-color: #1890ff">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <span class="creator-name">{{ app.user.userName || app.user.userAccount }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <div class="detail-label">时间信息</div>
        <div class="detail-item">
          <span class="item-label">创建时间：</span>
          <span class="field-readonly">{{ app.createTime || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="item-label">更新时间：</span>
          <span class="field-readonly">{{ app.updateTime || '-' }}</span>
        </div>
      </div>

      <!-- 操作栏（本人可见） -->
      <div class="detail-section">
        <a-divider style="margin: 12px 0" />
        <div class="action-buttons">
          <a-button type="primary" size="small" @click="emit('edit')">
            <template #icon><EditOutlined /></template>
            修改
          </a-button>
          <a-button danger size="small" @click="emit('delete')">
            <template #icon><DeleteOutlined /></template>
            删除
          </a-button>
        </div>
      </div>
    </template>

    <!-- 别人的应用：只显示创建者和创建时间 -->
    <template v-else>
      <div class="detail-item" v-if="app.user">
        <span class="item-label">创建者：</span>
        <div class="creator-info">
          <a-avatar
            v-if="app.user.userAvatar"
            :src="app.user.userAvatar"
            :size="24"
          />
          <a-avatar v-else :size="24" style="background-color: #1890ff">
            <template #icon><UserOutlined /></template>
          </a-avatar>
          <span class="creator-name">{{ app.user.userName || app.user.userAccount }}</span>
        </div>
      </div>
      <div class="detail-item">
        <span class="item-label">创建时间：</span>
        <span>{{ app.createTime || '-' }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.app-detail-popover {
  width: 300px;
}

.detail-section {
  margin-bottom: 8px;
}

.detail-label {
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 8px;
  font-size: 14px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 13px;
  color: #333;
}

.item-label {
  color: #666;
  white-space: nowrap;
}

.field-readonly {
  color: #999;
}

.init-prompt {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 8px 10px;
  border-radius: 6px;
  max-height: 80px;
  overflow-y: auto;
  line-height: 1.5;
  word-break: break-word;
}

.deploy-link {
  color: #1890ff;
  font-size: 12px;
  word-break: break-all;
  text-decoration: none;
}

.deploy-link:hover {
  text-decoration: underline;
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.creator-name {
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
</style>
