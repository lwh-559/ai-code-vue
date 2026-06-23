import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getLoginUser } from '@/api/userController'

export const useLoginUserStore = defineStore('loginUser', () => {
  // 默认值
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录',
  })

  // 标记是否已经尝试获取过登录用户信息
  const fetched = ref(false)

  /**
   * 是否已登录
   */
  const isLoggedIn = computed(() => {
    return !!loginUser.value?.id
  })

  /**
   * 获取登录用户信息
   */
  async function fetchLoginUser() {
    try {
      const res = await getLoginUser()
      if (res.data.code === 0 && res.data.data) {
        loginUser.value = res.data.data
      } else {
        // 未登录状态
        loginUser.value = { userName: '未登录' }
      }
    } catch (error) {
      // 请求失败，设置为未登录状态
      loginUser.value = { userName: '未登录' }
    } finally {
      fetched.value = true
    }
  }

  /**
   * 设置登录用户信息
   */
  function setLoginUser(newLoginUser: API.LoginUserVO) {
    loginUser.value = newLoginUser
    fetched.value = true
  }

  /**
   * 清除登录用户信息（注销时调用）
   */
  function clearLoginUser() {
    loginUser.value = { userName: '未登录' }
  }

  return {
    loginUser,
    isLoggedIn,
    fetched,
    fetchLoginUser,
    setLoginUser,
    clearLoginUser,
  }
})
