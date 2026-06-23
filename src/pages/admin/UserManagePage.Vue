<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import {
  listUserVoByPage,
  addUser,
  updateUser,
  deleteUser,
} from '@/api/userController'

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
    key: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    key: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
    key: 'userAvatar',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
    key: 'userProfile',
    ellipsis: true,
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
    key: 'userRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right' as const,
  },
]

// 搜索条件
const searchForm = reactive({
  userName: '',
  id: '' as string,
})

// 表格数据
const dataSource = ref<API.UserVO[]>([])
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条数据`,
})

// 新增/编辑弹窗
const modalVisible = ref(false)
const modalTitle = ref('创建用户')
const modalLoading = ref(false)
const isEdit = ref(false)
const editId = ref<number | undefined>()
const formRef = ref()

// 表单数据
const form = reactive({
  userName: '',
  userAvatar: '',
  userProfile: '',
  userAccount: '',
  userPassword: '',
})

// 表单校验规则
const formRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  userAccount: [
    { required: true, message: '请输入用户账号', trigger: 'blur' },
    { min: 4, message: '账号长度不能小于 4 位', trigger: 'blur' },
  ],
}

/**
 * 加载表格数据
 */
const loadData = async () => {
  loading.value = true
  try {
    const params: API.UserQueryRequest = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    }

    // 添加搜索条件
    if (searchForm.userName.trim()) {
      params.userName = searchForm.userName.trim()
    }
    if (searchForm.id.trim()) {
      // 雪花 ID 作为字符串传递，避免精度丢失
      ;(params as any).id = searchForm.id.trim()
    }

    const res = await listUserVoByPage(params)

    if (res.data.code === 0 && res.data.data) {
      dataSource.value = res.data.data.records || []
      pagination.total = Number(res.data.data.totalRow) || 0
    } else {
      message.error('查询失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    message.error('查询失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 搜索
 */
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

/**
 * 重置搜索条件
 */
const handleReset = () => {
  searchForm.userName = ''
  searchForm.id = ''
  pagination.current = 1
  loadData()
}

/**
 * 表格分页变化
 */
const handleTableChange = (pag: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

/**
 * 打开创建用户弹窗
 */
const handleAdd = () => {
  isEdit.value = false
  modalTitle.value = '创建用户'
  editId.value = undefined
  resetForm()
  modalVisible.value = true
}

/**
 * 打开编辑用户弹窗
 */
const handleEdit = (record: API.UserVO) => {
  isEdit.value = true
  modalTitle.value = '编辑用户'
  editId.value = record.id
  form.userName = record.userName || ''
  form.userAvatar = record.userAvatar || ''
  form.userProfile = record.userProfile || ''
  form.userAccount = ''
  form.userPassword = ''
  modalVisible.value = true
}

/**
 * 删除用户
 */
const handleDelete = (record: API.UserVO) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户 "${record.userName}" 吗？此操作不可恢复。`,
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        const res = await deleteUser({ id: record.id })
        if (res.data.code === 0) {
          message.success('删除成功')
          loadData()
        } else {
          message.error('删除失败：' + (res.data.message || '未知错误'))
        }
      } catch (error) {
        message.error('删除失败，请稍后重试')
      }
    },
  })
}

/**
 * 提交表单（创建/编辑）
 */
const handleModalOk = async () => {
  // 表单验证
  try {
    await formRef.value?.validate()
  } catch (error) {
    return
  }

  modalLoading.value = true
  try {
    let res
    if (isEdit.value) {
      // 编辑用户
      res = await updateUser({
        id: editId.value,
        userName: form.userName,
        userAvatar: form.userAvatar,
        userProfile: form.userProfile,
      })
    } else {
      // 创建用户
      res = await addUser({
        userAccount: form.userAccount,
        userName: form.userName,
        userAvatar: form.userAvatar,
        userProfile: form.userProfile,
      })
    }

    if (res.data.code === 0) {
      message.success(isEdit.value ? '编辑成功' : '创建成功')
      modalVisible.value = false
      loadData()
    } else {
      message.error((isEdit.value ? '编辑' : '创建') + '失败：' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    message.error((isEdit.value ? '编辑' : '创建') + '失败，请稍后重试')
  } finally {
    modalLoading.value = false
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  form.userName = ''
  form.userAvatar = ''
  form.userProfile = ''
  form.userAccount = ''
  form.userPassword = ''
}

/**
 * 关闭弹窗
 */
const handleModalCancel = () => {
  modalVisible.value = false
  resetForm()
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="user-manage-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <a-card :bordered="false">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="用户名">
            <a-input
              v-model:value="searchForm.userName"
              placeholder="请输入用户名"
              allow-clear
              style="width: 200px"
              @pressEnter="handleSearch"
            />
          </a-form-item>
          <a-form-item label="用户 ID">
            <a-input
              v-model:value="searchForm.id"
              placeholder="请输入用户 ID"
              allow-clear
              style="width: 200px"
              @pressEnter="handleSearch"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleSearch">
                <template #icon><SearchOutlined /></template>
                搜索
              </a-button>
              <a-button @click="handleReset">
                <template #icon><ReloadOutlined /></template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <a-card :bordered="false">
        <div class="table-header">
          <h3>用户列表</h3>
          <a-button type="primary" @click="handleAdd">
            <template #icon><PlusOutlined /></template>
            创建用户
          </a-button>
        </div>

        <a-table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
          :scroll="{ x: 1000 }"
        >
          <template #bodyCell="{ column, record }">
            <!-- 头像列 -->
            <template v-if="column.key === 'userAvatar'">
              <a-avatar :src="record.userAvatar" :size="40">
                {{ record.userName?.charAt(0)?.toUpperCase() || 'U' }}
              </a-avatar>
            </template>

            <!-- 角色列 -->
            <template v-if="column.key === 'userRole'">
              <a-tag :color="record.userRole === 'admin' ? 'green' : 'blue'">
                {{ record.userRole === 'admin' ? '管理员' : '普通用户' }}
              </a-tag>
            </template>

            <!-- 创建时间列 -->
            <template v-if="column.key === 'createTime'">
              {{ record.createTime ? new Date(record.createTime).toLocaleString() : '-' }}
            </template>

            <!-- 操作列 -->
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleEdit(record)">
                  编辑
                </a-button>
                <a-button type="link" size="small" danger @click="handleDelete(record)">
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      :confirm-loading="modalLoading"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      ok-text="确认"
      cancel-text="取消"
    >
      <a-form layout="vertical" :model="form" :rules="formRules" ref="formRef">
        <a-form-item label="用户名" name="userName">
          <a-input
            v-model:value="form.userName"
            placeholder="请输入用户名"
            allow-clear
          />
        </a-form-item>

        <!-- 创建用户时显示账号 -->
        <template v-if="!isEdit">
          <a-form-item label="用户账号" name="userAccount">
            <a-input
              v-model:value="form.userAccount"
              placeholder="请输入用户账号（至少 4 位）"
              allow-clear
            />
          </a-form-item>
        </template>

        <a-form-item label="头像 URL">
          <a-input
            v-model:value="form.userAvatar"
            placeholder="请输入头像链接"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="个人简介">
          <a-textarea
            v-model:value="form.userProfile"
            placeholder="请输入个人简介"
            :rows="4"
            allow-clear
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.user-manage-container {
  padding: 24px;
}

.search-section {
  margin-bottom: 16px;
}

.search-section :deep(.ant-card) {
  border-radius: 8px;
}

.table-section :deep(.ant-card) {
  border-radius: 8px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

:deep(.ant-table) {
  border-radius: 8px;
}

:deep(.ant-btn-link) {
  padding: 0 4px;
}
</style>
