<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, StarOutlined, StarFilled, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import {
  adminListAppByPage,
  adminDeleteApp,
  adminUpdateApp,
} from '@/api/appController'
import { CODE_GEN_TYPE, getCodeGenTypeLabel, getCodeGenTypeColor } from '@/constants/codegen'
import AppDetailDrawer from '@/components/app/AppDetailDrawer.vue'

const router = useRouter()

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 180,
  },
  {
    title: '应用名称',
    dataIndex: 'appName',
    key: 'appName',
    width: 150,
    ellipsis: true,
  },
  {
    title: '封面',
    dataIndex: 'cover',
    key: 'cover',
    width: 100,
  },
  {
    title: '生成类型',
    dataIndex: 'codeGenType',
    key: 'codeGenType',
    width: 100,
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 100,
    sorter: true,
  },
  {
    title: '用户',
    key: 'user',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160,
    sorter: true,
    defaultSortOrder: 'descend' as const,
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right' as const,
    width: 200,
  },
]

// 搜索条件
const searchForm = reactive({
  appName: '',
  id: '' as string,
  userId: '' as string,
  codeGenType: '' as string,
})

// 排序状态
const sortState = reactive({
  field: 'create_time',
  order: 'descend' as 'ascend' | 'descend' | null,
})

// 表格数据
const dataSource = ref<API.AppVO[]>([])
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条数据`,
})

/**
 * 加载表格数据
 */
const loadData = async () => {
  loading.value = true
  try {
    const params: API.AppQueryRequest = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      sortField: sortState.field || 'create_time',
      sortOrder: sortState.order || 'descend',
    }
    if (searchForm.appName.trim()) {
      params.appName = searchForm.appName.trim()
    }
    if (searchForm.id.trim()) {
      ;(params as any).id = searchForm.id.trim()
    }
    if (searchForm.userId.trim()) {
      ;(params as any).userId = searchForm.userId.trim()
    }
    if (searchForm.codeGenType) {
      ;(params as any).codeGenType = searchForm.codeGenType
    }

    const res = await adminListAppByPage(params)
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
 * 重置
 */
const handleReset = () => {
  searchForm.appName = ''
  searchForm.id = ''
  searchForm.userId = ''
  searchForm.codeGenType = ''
  pagination.current = 1
  loadData()
}

/**
 * 表格分页和排序变化
 */
const handleTableChange = (pag: any, _filters: any, sorter: any) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize

  // 处理排序
  if (sorter && sorter.field) {
    // 字段名映射：前端 camelCase -> 后端 snake_case
    const fieldMap: Record<string, string> = {
      createTime: 'create_time',
      priority: 'priority',
    }
    sortState.field = fieldMap[sorter.field] || sorter.field
    sortState.order = sorter.order || 'descend'
  } else {
    // 没有排序时恢复默认
    sortState.field = 'create_time'
    sortState.order = 'descend'
  }

  loadData()
}

/**
 * 编辑应用 - 新页面跳转
 */
const handleEdit = (record: API.AppVO) => {
  router.push(`/app/edit/${record.id}`)
}

/**
 * 删除应用
 */
const handleDelete = (record: API.AppVO) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除应用 "${record.appName}" 吗？此操作不可恢复。`,
    okText: '确认',
    cancelText: '取消',
    okType: 'danger',
    onOk: async () => {
      try {
        const res = await adminDeleteApp({ id: record.id } as any)
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
 * 切换精选状态
 */
const handleToggleFeatured = (record: API.AppVO) => {
  const isFeatured = (record.priority ?? 0) >= 99
  Modal.confirm({
    title: isFeatured ? '取消精选' : '设为精选',
    content: isFeatured
      ? `确定要将 "${record.appName}" 取消精选吗？`
      : `确定要将 "${record.appName}" 设为精选应用吗？`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        const res = await adminUpdateApp({
          id: record.id!,
          priority: isFeatured ? 0 : 99,
        } as any)
        if (res.data.code === 0) {
          message.success(isFeatured ? '已取消精选' : '已设为精选')
          loadData()
        } else {
          message.error('操作失败：' + (res.data.message || '未知错误'))
        }
      } catch (error) {
        message.error('操作失败，请稍后重试')
      }
    },
  })
}

// ========== 查看详情相关 ==========
const detailVisible = ref(false)
const detailApp = ref<API.AppVO>({})

/**
 * 查看应用详情
 */
const handleViewDetail = (record: API.AppVO) => {
  detailApp.value = record
  detailVisible.value = true
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="app-manage-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <a-card :bordered="false">
        <a-form layout="inline" :model="searchForm">
          <a-form-item label="应用名称">
            <a-input
              v-model:value="searchForm.appName"
              placeholder="请输入应用名称"
              allow-clear
              style="width: 180px"
              @pressEnter="handleSearch"
            />
          </a-form-item>
          <a-form-item label="应用 ID">
            <a-input
              v-model:value="searchForm.id"
              placeholder="请输入应用 ID"
              allow-clear
              style="width: 160px"
              @pressEnter="handleSearch"
            />
          </a-form-item>
          <a-form-item label="用户 ID">
            <a-input
              v-model:value="searchForm.userId"
              placeholder="请输入用户 ID"
              allow-clear
              style="width: 160px"
              @pressEnter="handleSearch"
            />
          </a-form-item>
          <a-form-item label="生成类型">
            <a-select
              v-model:value="searchForm.codeGenType"
              placeholder="请选择类型"
              allow-clear
              style="width: 140px"
              @change="handleSearch"
            >
              <a-select-option v-for="(config, key) in CODE_GEN_TYPE" :key="key" :value="config.value">
                {{ config.shortLabel }}
              </a-select-option>
            </a-select>
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
          <h3>应用列表</h3>
        </div>

        <a-table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
          :scroll="{ x: 1200 }"
        >
          <template #bodyCell="{ column, record }">
            <!-- 封面列 -->
            <template v-if="column.key === 'cover'">
              <a-avatar
                v-if="record.cover"
                :src="record.cover"
                :size="40"
                shape="square"
              />
              <span v-else class="no-cover">-</span>
            </template>

            <!-- 生成类型列 -->
            <template v-if="column.key === 'codeGenType'">
              <a-tag :color="getCodeGenTypeColor(record.codeGenType)">
                {{ getCodeGenTypeLabel(record.codeGenType) }}
              </a-tag>
            </template>

            <!-- 优先级列 -->
            <template v-if="column.key === 'priority'">
              <a-tag :color="record.priority && record.priority >= 99 ? 'gold' : 'default'" style="font-size: 14px; padding: 4px 10px;">
                {{ record.priority ?? 0 }}
              </a-tag>
            </template>

            <!-- 用户列 -->
            <template v-if="column.key === 'user'">
              <div v-if="record.user" class="user-cell">
                <a-avatar :src="record.user.userAvatar" :size="32" />
                <span>{{ record.user.userName }}</span>
              </div>
              <span v-else>-</span>
            </template>

            <!-- 创建时间列 -->
            <template v-if="column.key === 'createTime'">
              {{ record.createTime ? new Date(record.createTime).toLocaleString() : '-' }}
            </template>

            <!-- 操作列 -->
            <template v-if="column.key === 'action'">
              <a-space>
                <a-tooltip title="查看">
                  <a-button type="text" size="small" @click="handleViewDetail(record)">
                    <template #icon><EyeOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip title="编辑">
                  <a-button type="text" size="small" @click="handleEdit(record)">
                    <template #icon><EditOutlined /></template>
                  </a-button>
                </a-tooltip>
                <a-tooltip :title="(record.priority ?? 0) >= 99 ? '取消精选' : '设为精选'">
                  <a-button
                    type="text"
                    size="small"
                    :style="{ color: (record.priority ?? 0) >= 99 ? '#faad14' : undefined }"
                    @click="handleToggleFeatured(record)"
                  >
                    <template #icon>
                      <StarFilled v-if="(record.priority ?? 0) >= 99" />
                      <StarOutlined v-else />
                    </template>
                  </a-button>
                </a-tooltip>
                <a-tooltip title="删除">
                  <a-button type="text" size="small" danger @click="handleDelete(record)">
                    <template #icon><DeleteOutlined /></template>
                  </a-button>
                </a-tooltip>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 应用详情抽屉 -->
    <AppDetailDrawer
      v-model:open="detailVisible"
      :app="detailApp"
    />
  </div>
</template>

<style scoped>
.app-manage-container {
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.no-cover {
  color: #ccc;
}

:deep(.ant-table) {
  border-radius: 8px;
}

:deep(.ant-btn-link) {
  padding: 0 4px;
}
</style>
