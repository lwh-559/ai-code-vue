<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <p class="error-message">页面不存在</p>
      <p class="error-desc">抱歉，您访问的页面不存在或已被移除</p>
      <a-button type="primary" size="large" @click="goHome">返回首页</a-button>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  min-height: calc(100vh - 136px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 24px;
}

.not-found-content {
  text-align: center;
}

.error-code {
  font-size: 96px;
  font-weight: 700;
  color: #1890ff;
  margin: 0 0 16px 0;
  line-height: 1;
}

.error-message {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.error-desc {
  font-size: 14px;
  color: #999;
  margin: 0 0 32px 0;
}
</style>
