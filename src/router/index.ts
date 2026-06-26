import { createRouter, createWebHistory } from 'vue-router'
import { message } from 'ant-design-vue'
import HomePage from '../pages/HomePage.vue'
import UserLoginPage from '../pages/user/UserLoginPage.vue'
import UserRegisterPage from '../pages/user/UserRegisterPage.vue'
import UserManagePage from '../pages/admin/UserManagePage.vue'
import AppManagePage from '../pages/admin/AppManagePage.vue'
import AppChatPage from '../pages/app/AppChatPage.vue'
import AppEditPage from '../pages/app/AppEditPage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'
import { useLoginUserStore } from '@/stores/loginUser'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '主页',
      component: HomePage,
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: UserLoginPage,
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: UserRegisterPage,
    },
    {
      path: '/app/chat/:id',
      name: '应用对话',
      component: AppChatPage,
      meta: { requiresAuth: true, hideLayout: true },
    },
    {
      path: '/app/edit/:id',
      name: '应用编辑',
      component: AppEditPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: UserManagePage,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/appManage',
      name: '应用管理',
      component: AppManagePage,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: NotFoundPage,
    },
  ],
})

// 是否已初始化获取过用户信息
let initialized = false

// 路由守卫（Vue Router 5 语法）
router.beforeEach(async (to) => {
  const loginUserStore = useLoginUserStore()

  // 首次加载时，等待获取登录用户信息
  if (!initialized) {
    await loginUserStore.fetchLoginUser()
    initialized = true
  }

  const isLoggedIn = !!loginUserStore.loginUser?.id

  // 已登录用户访问登录/注册页面，跳转到首页
  if (isLoggedIn && (to.path === '/user/login' || to.path === '/user/register')) {
    return '/'
  }

  // 检查路由是否需要登录
  if (to.meta.requiresAuth && !isLoggedIn) {
    // 未登录，跳转到登录页，并记录目标路径
    return {
      path: '/user/login',
      query: { redirect: to.fullPath },
    }
  }

  // 检查路由是否需要管理员权限
  if (to.meta.requiresAdmin && loginUserStore.loginUser.userRole !== 'admin') {
    message.error('权限不足，无法访问该页面')
    return false
  }

  return true
})

export default router
