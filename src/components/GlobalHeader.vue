<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { HomeOutlined } from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser'
import { userLogout } from '@/api/userController'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 菜单配置项
const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
  },
]

// 过滤菜单项
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    const menuKey = menu?.key as string
    if (menuKey?.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

// 展示在菜单的路由数组
const menuItems = computed<MenuProps['items']>(() => filterMenus(originItems))

// 当前是否在登录/注册页面
const isAuthPage = computed(() => {
  const path = router.currentRoute.value.path
  return path === '/user/login' || path === '/user/register'
})

const selectedKeys = ref<string[]>([router.currentRoute.value.path])

router.afterEach((to) => {
  selectedKeys.value = [to.path]
})

const onMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}

/**
 * 注销登录
 */
const handleLogout = async () => {
  try {
    const res = await userLogout()
    if (res.data.code === 0) {
      loginUserStore.clearLoginUser()
      message.success('注销成功')
      router.push('/user/login')
    } else {
      message.error('注销失败：' + res.data.message)
    }
  } catch (error) {
    message.error('注销失败，请稍后重试')
  }
}

/**
 * 跳转登录页
 */
const goLogin = () => {
  router.push('/user/login')
}
</script>

<template>
  <div class="global-header">
    <div class="header-left">
      <img src="@/assets/logo.png" alt="logo" class="logo" />
      <span class="site-title">AI 零代码应用生成</span>
    </div>
    <a-menu
      mode="horizontal"
      :selected-keys="selectedKeys"
      :items="menuItems"
      class="header-menu"
      @click="onMenuClick"
    />
    <div class="header-right">
      <!-- 已登录：显示用户头像和下拉菜单 -->
      <a-dropdown v-if="loginUserStore.isLoggedIn" placement="bottomRight">
        <div class="user-info">
          <a-avatar :src="loginUserStore.loginUser.userAvatar" :size="32">
            {{ loginUserStore.loginUser.userName?.charAt(0)?.toUpperCase() || 'U' }}
          </a-avatar>
          <span class="username">{{ loginUserStore.loginUser.userName }}</span>
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item key="logout" @click="handleLogout">
              <span>注销登录</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>

      <!-- 未登录且不在登录/注册页面：显示登录按钮 -->
      <a-button v-else-if="!isAuthPage" type="primary" @click="goLogin">登录</a-button>
    </div>
  </div>
</template>

<style scoped>
.global-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  margin-right: 24px;
  flex-shrink: 0;
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.site-title {
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.header-menu {
  flex: 1;
  min-width: 0;
  border: none;
  line-height: 64px;
}

.header-right {
  flex-shrink: 0;
  margin-left: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  margin-left: 8px;
  color: inherit;
  font-size: 14px;
}
</style>
