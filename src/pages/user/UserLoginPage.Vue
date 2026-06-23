<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { userLogin } from '@/api/userController'
import { useLoginUserStore } from '@/stores/loginUser'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const form = reactive({
  userAccount: '',
  userPassword: '',
})

const loading = ref(false)

// 表单校验规则
const rules = {
  userAccount: [
    { required: true, message: '请输入用户账号', trigger: 'blur' },
    { min: 4, message: '账号长度不能小于 4 位', trigger: 'blur' },
  ],
  userPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能小于 8 位', trigger: 'blur' },
  ],
}

/**
 * 提交登录表单
 */
const handleSubmit = async () => {
  loading.value = true
  try {
    const res = await userLogin({
      userAccount: form.userAccount,
      userPassword: form.userPassword,
    })

    if (res.data.code === 0 && res.data.data) {
      // 登录成功，存储用户信息
      loginUserStore.setLoginUser(res.data.data)
      message.success('登录成功')
      // 跳转到首页
      router.push('/')
    } else {
      message.error('登录失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    message.error('登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 跳转注册页
 */
const goRegister = () => {
  router.push('/user/register')
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="@/assets/logo.png" alt="logo" class="login-logo" />
        <h1 class="login-title">一句话 做应用</h1>
      </div>

      <a-form
        :model="form"
        :rules="rules"
        layout="vertical"
        class="login-form"
        @finish="handleSubmit"
      >
        <a-form-item name="userAccount">
          <a-input
            v-model:value="form.userAccount"
            size="large"
            placeholder="请输入用户账号"
            :prefix="h(UserOutlined)"
            allow-clear
          />
        </a-form-item>

        <a-form-item name="userPassword">
          <a-input-password
            v-model:value="form.userPassword"
            size="large"
            placeholder="请输入密码"
            :prefix="h(LockOutlined)"
          />
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            登录
          </a-button>
        </a-form-item>

        <div class="login-footer">
          <span>还没有账号？</span>
          <a @click="goRegister" class="register-link">立即注册</a>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts">
import { h } from 'vue'

export default {
  setup() {
    return { h }
  },
}
</script>

<style scoped>
.login-container {
  min-height: calc(100vh - 136px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 36px 32px 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.login-logo {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: 2px;
}

.login-form {
  width: 100%;
}

.login-form :deep(.ant-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.ant-input-affix-wrapper) {
  border-radius: 8px;
  height: 40px;
}

.login-form :deep(.ant-btn) {
  border-radius: 8px;
  height: 40px;
  font-size: 15px;
  margin-top: 4px;
}

.login-footer {
  text-align: center;
  margin-top: 16px;
  color: #999;
  font-size: 14px;
}

.register-link {
  color: #1890ff;
  cursor: pointer;
  margin-left: 4px;
}

.register-link:hover {
  color: #40a9ff;
}
</style>
