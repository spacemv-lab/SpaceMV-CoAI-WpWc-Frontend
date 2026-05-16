<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->
<template>
  <div class="register-user-list">
    <div class="card-header">
      <el-tabs v-model="activeTab" class="user-tabs">
        <el-tab-pane label="注册用户列表" name="register"
        </el-tab-pane>
        <el-tab-pane label="注销用户列表" name="cancelled">
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 注册用户列表 -->
    <div v-if="activeTab === 'register'" class="tab-content">
      <!-- <h3 class="page-title">注册用户列表</h3> -->
      <div class="search-container">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.userName" placeholder="请输入用户名" clearable />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="searchForm.phonenumber" placeholder="请输入手机号" clearable />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <el-option label="正常" value="0" />
              <el-option label="停用" value="1" />
              <el-option label="注销中" value="2" />
              <el-option label="已注销" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="userList" style="width: 100%" stripe>
        <el-table-column prop="registerId" label="注册ID" width="100" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="userName" label="用户名" min-width="120" />
        <el-table-column prop="bindPhone" label="手机" min-width="120">
          <template #default="scope">
            <span>{{ scope.row.bindPhone || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="bindEmail" label="邮箱" min-width="180">
          <template #default="scope">
            <span>{{ scope.row.bindEmail || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="注册时间" width="180">
          <template #default="scope">
            <span>{{ formatDate(scope.row.registerTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button v-if="scope.row.status === '0'" type="warning" size="small"
              @click="handleStatusChange(scope.row, '1')">
              停用
            </el-button>
            <el-button v-else-if="scope.row.status === '1'" type="primary" size="small"
              @click="handleStatusChange(scope.row, '0')">
              启用
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 注销用户列表 -->
    <div v-else-if="activeTab === 'cancelled'" class="tab-content">
      <div class="search-container">
        <el-form :inline="true" :model="cancelledSearchForm" class="search-form">
          <el-form-item label="用户名">
            <el-input v-model="cancelledSearchForm.userName" placeholder="请输入用户名" clearable />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="cancelledSearchForm.phonenumber" placeholder="请输入手机号" clearable />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="cancelledSearchForm.email" placeholder="请输入邮箱" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleCancelledSearch">查询</el-button>
            <el-button @click="resetCancelledSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="cancelledUserList" style="width: 100%" stripe>
        <el-table-column prop="logoutId" label="注销ID" width="100" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="userName" label="用户名" min-width="120" />
        <el-table-column prop="bindPhone" label="手机" min-width="120">
          <template #default="scope">
            <span>{{ scope.row.bindPhone || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="bindEmail" label="邮箱" min-width="180">
          <template #default="scope">
            <span>{{ scope.row.bindEmail || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="180">
          <template #default="scope">
            <span>{{ formatDate(scope.row.applyTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="coolEndTime" label="冷却结束时间" width="180">
          <template #default="scope">
            <span>{{ formatDate(scope.row.coolEndTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="cancelledPagination.pageNum"
          v-model:page-size="cancelledPagination.pageSize" :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" :total="cancelledTotal"
          @size-change="handleCancelledSizeChange" @current-change="handleCancelledCurrentChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRegisterUserList, updateRegisterUserStatus, getCancelledUserList } from '@/api/system/registerUser'
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()

// 激活的标签页
const activeTab = ref('register')

// 注册用户搜索表单
const searchForm = ref({
  userName: '',
  phonenumber: '',
  email: '',
  status: ''
})

// 注册用户分页参数
const pagination = ref({
  pageNum: 1,
  pageSize: 10
})

// 注册用户列表
const userList = ref([])
const total = ref(0)

// 注销用户搜索表单
const cancelledSearchForm = ref({
  userName: '',
  phonenumber: '',
  email: ''
})

// 注销用户分页参数
const cancelledPagination = ref({
  pageNum: 1,
  pageSize: 10
})

// 注销用户列表
const cancelledUserList = ref([])
const cancelledTotal = ref(0)

// 加载状态
const loading = ref(false)

// 获取注册用户列表
const fetchUserList = () => {
  loading.value = true
  getRegisterUserList(
    searchForm.value,
    pagination.value
  ).then(response => {
    if (response.code === 200) {
      userList.value = response.rows
      total.value = response.total
    } else {
      ElMessage.error(response.msg || '获取用户列表失败')
    }
  }).finally(() => {
    loading.value = false
  })
}

// 处理搜索
const handleSearch = () => {
  pagination.value.pageNum = 1
  fetchUserList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    userName: '',
    phonenumber: '',
    email: '',
    status: ''
  }
  pagination.value.pageNum = 1
  fetchUserList()
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  fetchUserList()
}

// 处理页码变化
const handleCurrentChange = (current) => {
  pagination.value.pageNum = current
  fetchUserList()
}

// 获取注销用户列表
const fetchCancelledUserList = () => {
  loading.value = true
  getCancelledUserList(
    cancelledSearchForm.value,
    cancelledPagination.value
  ).then(response => {
    if (response.code === 200) {
      cancelledUserList.value = response.rows
      cancelledTotal.value = response.total
    } else {
      ElMessage.error(response.msg || '获取注销用户列表失败')
    }
  }).finally(() => {
    loading.value = false
  })
}

// 处理注销用户搜索
const handleCancelledSearch = () => {
  cancelledPagination.value.pageNum = 1
  fetchCancelledUserList()
}

// 重置注销用户搜索
const resetCancelledSearch = () => {
  cancelledSearchForm.value = {
    userName: '',
    phonenumber: '',
    email: ''
  }
  cancelledPagination.value.pageNum = 1
  fetchCancelledUserList()
}

// 处理注销用户分页大小变化
const handleCancelledSizeChange = (size) => {
  cancelledPagination.value.pageSize = size
  fetchCancelledUserList()
}

// 处理注销用户页码变化
const handleCancelledCurrentChange = (current) => {
  cancelledPagination.value.pageNum = current
  fetchCancelledUserList()
}

// 获取状态标签类型
const getStatusType = (status) => {
  switch (status) {
    case '0':
      return 'info'
    case '1':
      return 'danger'
    case '2':
      return 'warning'
    default:
      return ''
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case '0':
      return '冷却中'
    case '1':
      return '已注销'
    case '2':
      return '已撤销'
    default:
      return ''
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 处理状态变更
const handleStatusChange = (row, newStatus) => {
  const statusText = newStatus === '0' ? '启用' : '停用'
  ElMessageBox.confirm(
    `确定要${statusText}用户 "${row.userName}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {

    updateRegisterUserStatus({
      registerId: row.registerId,
      status: newStatus,
      updateBy: userStore.name
    }).then(response => {
      if (response.code === 200) {
        ElMessage.success(`${statusText}成功`)
        fetchUserList()
      } else {
        ElMessage.error(response.msg || `${statusText}失败`)
      }
    })
  }).catch(() => {
    // 取消操作
  })
}

// 监听标签页变化
watch(activeTab, (newTab) => {
  if (newTab === 'register') {
    fetchUserList()
  } else if (newTab === 'cancelled') {
    fetchCancelledUserList()
  }
})

// 初始化
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped lang="scss">
.page-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: var(--el-text-color-primary);
}

.register-user-list {
  padding: 20px;

  .card-header {
    margin-bottom: 20px;

    .user-tabs {
      :deep(.el-tabs__header) {
        margin-bottom: 0;
      }
    }
  }

  .tab-content {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .search-container {
    margin-bottom: 20px;

    .search-form {
      .el-form-item {
        margin-bottom: 10px;
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
