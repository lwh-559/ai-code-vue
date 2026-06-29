<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons-vue'
import { getAppVoById, updateApp, adminUpdateApp } from '@/api/appController'
import { useLoginUserStore } from '@/stores/loginUser'
import { getCodeGenTypeLabel, getCodeGenTypeColor } from '@/constants/codegen'

const router = useRouter()
const route = useRoute()
const loginUserStore = useLoginUserStore()

const appId = computed(() => route.params.id as string)
const isAdmin = computed(() => loginUserStore.loginUser?.userRole === 'admin')

// ========== 应用信息 ==========
const appInfo = ref<API.AppVO>({})
const loadingApp = ref(false)
const saving = ref(false)

// 表单数据
const form = reactive({
  appName: '',
  cover: '',
  priority: 0 as number,
})

// 表单校验规则
const formRules = {
  appName: [
    { required: true, message: '请输入应用名称', trigger: 'blur' },
    { max: 50, message: '应用名称不能超过 50 个字符', trigger: 'blur' },
  ],
}
const formRef = ref()

/**
 * 加载应用信息
 */
const loadAppInfo = async () => {
  loadingApp.value = true
  try {
    const res = await getAppVoById({ id: appId.value } as any)
    if (res.data.code === 0 && res.data.data) {
      appInfo.value = res.data.data
      form.appName = res.data.data.appName || ''
      form.cover = res.data.data.cover || ''
      form.priority = res.data.data.priority ?? 0
    } else {
      message.error('获取应用信息失败')
      router.push('/')
    }
  } catch (error) {
    message.error('获取应用信息失败')
    router.push('/')
  } finally {
    loadingApp.value = false
  }
}

/**
 * 保存修改
 */
const handleSave = async () => {
  // 表单验证
  try {
    await formRef.value?.validate()
  } catch (error) {
    return
  }

  saving.value = true
  try {
    let res
    if (isAdmin.value) {
      // 管理员可以修改所有字段
      res = await adminUpdateApp({
        id: appId.value,
        appName: form.appName,
        cover: form.cover || undefined,
        priority: form.priority,
      } as any)
    } else {
      // 普通用户只能修改应用名称
      res = await updateApp({
        id: appId.value,
        appName: form.appName,
      } as any)
    }

    if (res.data.code === 0) {
      message.success('保存成功')
      router.back()
    } else {
      message.error('保存失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    message.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

/**
 * 返回
 */
const goBack = () => {
  router.back()
}

onMounted(() => {
  loadAppInfo()
})
</script>

<template>
  <div class="edit-page">
    <div class="edit-container">
      <!-- 顶部栏 -->
      <div class="edit-header">
        <a-button type="text" @click="goBack">
          <template #icon><ArrowLeftOutlined /></template>
          返回
        </a-button>
        <h2 class="edit-title">编辑应用信息</h2>
      </div>

      <!-- 表单区域 -->
      <a-card :bordered="false" :loading="loadingApp" class="edit-card">
        <a-form
          ref="formRef"
          :model="form"
          :rules="formRules"
          layout="vertical"
          class="edit-form"
        >
          <!-- 基本信息 -->
          <div class="section-title">基本信息</div>

          <a-form-item label="应用名称" name="appName">
            <a-input
              v-model:value="form.appName"
              placeholder="请输入应用名称"
              :maxlength="50"
              show-count
              allow-clear
            />
          </a-form-item>

          <!-- 以下字段全部只读，不可修改 -->
          <a-form-item label="代码生成类型">
            <a-tag class="field-disabled">
              {{ getCodeGenTypeLabel(appInfo.codeGenType) }}
            </a-tag>
          </a-form-item>

          <a-form-item label="初始化提示词">
            <a-textarea
              :value="appInfo.initPrompt || ''"
              disabled
              :auto-size="{ minRows: 2, maxRows: 6 }"
              class="field-disabled"
            />
          </a-form-item>

          <!-- 管理员可见字段 -->
          <template v-if="isAdmin">
            <a-form-item label="应用封面 URL">
              <a-input
                v-model:value="form.cover"
                placeholder="请输入封面图片链接"
                allow-clear
              />
              <div class="field-tip">设置后将在应用列表中展示该封面</div>
            </a-form-item>

            <a-form-item label="优先级">
              <a-input-number
                v-model:value="form.priority"
                :min="0"
                :max="999"
                style="width: 200px"
              />
              <div class="field-tip">数值越大优先级越高，设为 99 可加入精选</div>
            </a-form-item>
          </template>

          <!-- 部署信息 -->
          <div class="section-title">部署信息</div>

          <a-form-item label="部署状态">
            <a-input
              :value="appInfo.deployKey ? '已部署' : '未部署'"
              disabled
              class="field-disabled"
            />
          </a-form-item>

          <a-form-item label="部署标识">
            <a-input
              :value="appInfo.deployKey || '无'"
              disabled
              class="field-disabled"
            />
          </a-form-item>

          <a-form-item label="部署时间" v-if="appInfo.deployedTime">
            <a-input
              :value="appInfo.deployedTime"
              disabled
              class="field-disabled"
            />
          </a-form-item>

          <!-- 时间信息 -->
          <div class="section-title">时间信息</div>

          <a-form-item label="创建时间">
            <a-input
              :value="appInfo.createTime || '-'"
              disabled
              class="field-disabled"
            />
          </a-form-item>

          <a-form-item label="更新时间">
            <a-input
              :value="appInfo.updateTime || '-'"
              disabled
              class="field-disabled"
            />
          </a-form-item>

          <!-- 创建者信息 -->
          <div class="section-title">创建者信息</div>

          <a-form-item label="创建者" v-if="appInfo.user">
            <div class="creator-display">
              <a-avatar
                v-if="appInfo.user.userAvatar"
                :src="appInfo.user.userAvatar"
                :size="32"
              />
              <a-avatar v-else :size="32" style="background-color: #1890ff">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="creator-name">{{ appInfo.user.userName || appInfo.user.userAccount }}</span>
            </div>
          </a-form-item>

          <a-form-item>
            <a-space>
              <a-button
                type="primary"
                :loading="saving"
                @click="handleSave"
              >
                <template #icon><SaveOutlined /></template>
                保存
              </a-button>
              <a-button @click="goBack">取消</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </div>
</template>

<style scoped>
.edit-page {
  min-height: calc(100vh - 136px);
  background: #f5f5f5;
  padding: 24px;
}

.edit-container {
  max-width: 640px;
  margin: 0 auto;
}

.edit-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.edit-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.edit-card {
  border-radius: 12px;
}

.edit-form {
  max-width: 480px;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 16px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.field-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.field-disabled {
  background-color: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed;
}

.field-disabled :deep(input),
.field-disabled :deep(.ant-input-disabled) {
  background-color: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed;
}

.creator-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.creator-name {
  color: #333;
  font-size: 14px;
}
</style>
