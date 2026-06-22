<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 菜单配置项
const menuItems = [
  { key: '/', label: '首页' },
  { key: '/about', label: '关于' },
]

const selectedKeys = ref<string[]>([router.currentRoute.value.path])

router.afterEach((to) => {
  selectedKeys.value = [to.path]
})

const onMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}
</script>

<template>
  <div class="global-header">
    <div class="header-left">
      <img src="@/assets/logo.png" alt="logo" class="logo" />
      <span class="site-title">AI 零代码</span>
    </div>
    <a-menu
      mode="horizontal"
      :selected-keys="selectedKeys"
      :items="menuItems"
      class="header-menu"
      @click="onMenuClick"
    />
    <div class="header-right">
      <a-button type="primary">登录</a-button>
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
</style>
