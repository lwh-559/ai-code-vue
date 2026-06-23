<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { userRegister } from '@/api/userController'

const router = useRouter()

const form = reactive({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
})

const loading = ref(false)

// 校验两次密码是否一致
const validateCheckPassword = async (_rule: any, value: string) => {
  if (value && value !== form.userPassword) {
    throw new Error('两次输入的密码不一致')
  }
}

// 表单校验规则
const rules = {
  userAccount: [
    { required: true, message: '请输入用户账号', trigger: 'blur' },
    { min: 4, max: 20, message: '账号长度需要在 4-20 位之间', trigger: 'blur' },
  ],
  userPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 20, message: '密码长度需要在 8-20 位之间', trigger: 'blur' },
  ],
  checkPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateCheckPassword, trigger: 'blur' },
  ],
}

/**
 * 提交注册表单
 */
const handleSubmit = async () => {
  loading.value = true
  try {
    const res = await userRegister({
      userAccount: form.userAccount,
      userPassword: form.userPassword,
      checkPassword: form.checkPassword,
    })

    if (res.data.code === 0) {
      message.success('注册成功，请登录')
      // 注册成功后跳转到登录页
      router.push('/user/login')
    } else {
      message.error('注册失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    message.error('注册失败，请稍后重试')
  } finally {
    loading.value = false
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
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <img src="@/assets/logo.png" alt="logo" class="register-logo" />
        <h1 class="register-title">一句话 做应用</h1>
      </div>

      <a-form
        :model="form"
        :rules="rules"
        layout="vertical"
        class="register-form"
        @finish="handleSubmit"
      >
        <a-form-item name="userAccount">
          <a-input
            v-model:value="form.userAccount"
            size="large"
            placeholder="请输入用户账号（4-20位）"
            :prefix="h(UserOutlined)"
            allow-clear
          />
        </a-form-item>

        <a-form-item name="userPassword">
          <a-input-password
            v-model:value="form.userPassword"
            size="large"
            placeholder="请输入密码（8-20位）"
            :prefix="h(LockOutlined)"
          />
        </a-form-item>

        <a-form-item name="checkPassword">
          <a-input-password
            v-model:value="form.checkPassword"
            size="large"
            placeholder="请再次输入密码"
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
            注册
          </a-button>
        </a-form-item>

        <div class="register-footer">
          <span>已有账号？</span>
          <a @click="goLogin" class="login-link">返回登录</a>
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
.register-container {
  min-height: calc(100vh - 136px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 24px;
}

.register-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 12px;
  padding: 48px 40px 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.register-logo {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.register-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: 2px;
}

.register-form {
  width: 100%;
}

.register-form :deep(.ant-form-item) {
  margin-bottom: 24px;
}

.register-form :deep(.ant-input-affix-wrapper) {
  border-radius: 8px;
  height: 44px;
}

.register-form :deep(.ant-btn) {
  border-radius: 8px;
  height: 44px;
  font-size: 16px;
  margin-top: 8px;
}

.register-footer {
  text-align: center;
  margin-top: 24px;
  color: #999;
  font-size: 14px;
}

.login-link {
  color: #1890ff;
  cursor: pointer;
  margin-left: 4px;
}

.login-link:hover {
  color: #40a9ff;
}
</style>
