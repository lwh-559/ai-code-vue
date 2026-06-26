<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { RocketOutlined } from '@ant-design/icons-vue'
import { addApp, listMyAppByPage, listFeaturedAppByPage } from '@/api/appController'
import { useLoginUserStore } from '@/stores/loginUser'
import { getDeployUrl } from '@/utils/url'
import AppCard from '@/components/app/AppCard.vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// ========== 英雄区 ==========
const promptText = ref('')
const creating = ref(false)

// 快捷标签
const quickTags = [
  {
    title: '个人博客网站',
    prompt:
      '帮我创建一个个人博客网站，包含首页文章列表、文章详情页、分类和标签筛选功能。页面设计简洁现代，采用响应式布局，支持暗色模式。首页展示最新文章卡片，显示标题、摘要、发布日期和阅读量，支持按分类和标签进行筛选。',
  },
  {
    title: '电商平台',
    prompt:
      '帮我创建一个电商平台网站，包含商品分类浏览、商品详情页、购物车和订单管理功能。支持商品搜索和筛选排序，用户可注册登录、收藏商品、查看订单状态。页面设计现代大气，商品展示采用瀑布流卡片布局。',
  },
  {
    title: '企业官网',
    prompt:
      '帮我创建一个企业官网，包含首页轮播Banner、关于我们、服务项目、团队介绍、新闻动态和联系方式等模块。页面采用蓝白配色，设计专业稳重，支持响应式布局，包含SEO优化的语义化标签结构。',
  },
  {
    title: '在线教育平台',
    prompt:
      '帮我创建一个在线教育平台，包含课程分类浏览、课程详情、视频播放和学习进度追踪功能。支持课程搜索、难度筛选、用户注册登录和课程收藏。页面设计清晰易用，课程卡片展示封面、标题、讲师和评分信息。',
  },
]

const handleQuickTag = (prompt: string) => {
  promptText.value = prompt
}

/**
 * 提交提示词创建应用
 */
const handleSubmitPrompt = async () => {
  const text = promptText.value.trim()
  if (!text) {
    message.warning('请输入提示词')
    return
  }
  if (!loginUserStore.isLoggedIn) {
    message.warning('请先登录')
    router.push('/user/login')
    return
  }
  creating.value = true
  try {
    const res = await addApp({ initPrompt: text })
    if (res.data.code === 0 && res.data.data) {
      message.success('应用创建成功')
      router.push(`/app/chat/${res.data.data}`)
    } else {
      message.error('创建失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    message.error('创建失败，请稍后重试')
  } finally {
    creating.value = false
  }
}

// ========== 我的作品 ==========
const myApps = ref<API.AppVO[]>([])
const myAppsLoading = ref(false)
const myAppsPagination = reactive({
  current: 1,
  pageSize: 6,
  total: 0,
})

const loadMyApps = async () => {
  myAppsLoading.value = true
  try {
    const params: API.AppQueryRequest = {
      pageNum: myAppsPagination.current,
      pageSize: myAppsPagination.pageSize,
      sortField: 'create_time',
      sortOrder: 'descend',
    }
    const res = await listMyAppByPage(params)
    if (res.data.code === 0 && res.data.data) {
      myApps.value = res.data.data.records || []
      myAppsPagination.total = Number(res.data.data.totalRow) || 0
    }
  } catch (error) {
    // 未登录时不报错
  } finally {
    myAppsLoading.value = false
  }
}

const handleMyAppsPageChange = (page: number, pageSize: number) => {
  myAppsPagination.current = page
  myAppsPagination.pageSize = pageSize
  loadMyApps()
}

// ========== 精选案例 ==========
const featuredApps = ref<API.AppVO[]>([])
const featuredLoading = ref(false)
const featuredPagination = reactive({
  current: 1,
  pageSize: 6,
  total: 0,
})

const loadFeaturedApps = async () => {
  featuredLoading.value = true
  try {
    const params: API.AppQueryRequest = {
      pageNum: featuredPagination.current,
      pageSize: featuredPagination.pageSize,
      sortField: 'create_time',
      sortOrder: 'descend',
    }
    const res = await listFeaturedAppByPage(params)
    if (res.data.code === 0 && res.data.data) {
      featuredApps.value = res.data.data.records || []
      featuredPagination.total = Number(res.data.data.totalRow) || 0
    }
  } catch (error) {
    // ignore
  } finally {
    featuredLoading.value = false
  }
}

const handleFeaturedPageChange = (page: number, pageSize: number) => {
  featuredPagination.current = page
  featuredPagination.pageSize = pageSize
  loadFeaturedApps()
}

/**
 * 处理查看对话
 */
const handleViewChat = (appId: string) => {
  router.push({ path: `/app/chat/${appId}`, query: { view: '1' } })
}

/**
 * 处理查看部署地址
 */
const handleViewDeploy = (deployKey: string) => {
  window.open(getDeployUrl(deployKey), '_blank')
}

onMounted(() => {
  if (loginUserStore.isLoggedIn) {
    loadMyApps()
  }
  loadFeaturedApps()
})
</script>

<template>
  <div class="home-page">
    <!-- 英雄区 -->
    <div class="hero-section">
      <h1 class="hero-title">AI 应用生成平台</h1>
      <p class="hero-subtitle">一句话轻松创建网站应用</p>

      <div class="prompt-box">
        <a-textarea
          v-model:value="promptText"
          placeholder="帮我创建个人博客网站"
          :auto-size="{ minRows: 2, maxRows: 6 }"
          class="prompt-input"
          @pressEnter.ctrl="handleSubmitPrompt"
        />
        <div class="prompt-actions">
          <div class="prompt-tags">
            <a-button
              v-for="tag in quickTags"
              :key="tag.title"
              size="small"
              class="quick-tag"
              @click="handleQuickTag(tag.prompt)"
            >
              {{ tag.title }}
            </a-button>
          </div>
          <a-button
            type="primary"
            shape="circle"
            :loading="creating"
            class="submit-btn"
            @click="handleSubmitPrompt"
          >
            <template #icon><RocketOutlined /></template>
          </a-button>
        </div>
      </div>
    </div>

    <!-- 我的作品 -->
    <div v-if="loginUserStore.isLoggedIn" class="section">
      <div class="section-header">
        <h2 class="section-title">我的作品</h2>
      </div>

      <a-spin :spinning="myAppsLoading">
        <div v-if="myApps.length === 0 && !myAppsLoading" class="empty-state">
          还没有创建过应用，试试在上方输入框描述你想创建的应用吧
        </div>
        <div class="app-grid">
          <AppCard
            v-for="app in myApps.slice(0, 6)"
            :key="app.id"
            :app="app"
            placeholder-icon="🚀"
            @view-chat="handleViewChat"
            @view-deploy="handleViewDeploy"
          />
        </div>
      </a-spin>

      <div v-if="myAppsPagination.total > 0" class="pagination-wrapper">
        <a-pagination
          v-model:current="myAppsPagination.current"
          v-model:pageSize="myAppsPagination.pageSize"
          :total="myAppsPagination.total"
          :show-size-changer="false"
          size="small"
          @change="handleMyAppsPageChange"
        />
      </div>
    </div>

    <!-- 精选案例 -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">精选案例</h2>
      </div>

      <a-spin :spinning="featuredLoading">
        <div v-if="featuredApps.length === 0 && !featuredLoading" class="empty-state">
          暂无精选应用
        </div>
        <div class="app-grid">
          <AppCard
            v-for="app in featuredApps.slice(0, 6)"
            :key="app.id"
            :app="app"
            placeholder-icon="✨"
            @view-chat="handleViewChat"
            @view-deploy="handleViewDeploy"
          />
        </div>
      </a-spin>

      <div v-if="featuredPagination.total > 0" class="pagination-wrapper">
        <a-pagination
          v-model:current="featuredPagination.current"
          v-model:pageSize="featuredPagination.pageSize"
          :total="featuredPagination.total"
          :show-size-changer="false"
          size="small"
          @change="handleFeaturedPageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  width: calc(100% + 48px);
  margin: -24px -24px 0;
  padding: 0 48px 48px;
  background: linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%);
  background-attachment: fixed;
}

/* 英雄区 */
.hero-section {
  text-align: center;
  padding: 80px 0 48px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 16px;
}

.hero-subtitle {
  font-size: 20px;
  color: #7f8c9b;
  margin: 0 0 40px;
}

.prompt-box {
  max-width: 720px;
  margin: 0 auto;
  background: #fff;
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.prompt-input {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 20px 24px 8px;
  font-size: 15px;
  resize: none;
  color: #2c3e50;
}

.prompt-input :deep(textarea) {
  color: #2c3e50;
  background: transparent;
}

.prompt-input :deep(textarea)::placeholder {
  color: #b0bec5;
}

.prompt-input:focus {
  box-shadow: none !important;
}

.prompt-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 12px;
}

.prompt-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-tag {
  border-radius: 20px;
  font-size: 13px;
  color: #7f8c9b;
  border-color: #dce3e8;
  background: #fff;
}

.quick-tag:hover {
  color: #4a90d9;
  border-color: #4a90d9;
  background: #fff;
}

.submit-btn {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

/* 通用区块 */
.section {
  margin-bottom: 48px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

/* 应用网格 */
.app-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 48px 0;
  color: #a0aab4;
  font-size: 14px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
