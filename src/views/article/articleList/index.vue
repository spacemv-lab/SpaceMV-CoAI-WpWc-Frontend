/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
    <div class="article-container" v-loading="loading">
        <h3 class="page-title">文章列表</h3>

        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="未发布" name="unPublish"></el-tab-pane>
            <el-tab-pane label="已发布" name="published"></el-tab-pane>
        </el-tabs>

        <div class="article-header">
            <el-button type="primary" v-if="auth.hasPermi('article:createEdit')" @click="handleCreateArticle">新建文章</el-button>
        </div>
        
        <el-table :data="articleList" stripe style="width: 100%" row-height="80">
            <el-table-column prop="id" label="文章id"></el-table-column>
            <!-- <el-table-column prop="coverImage" label="封面图片" width="100">
                <template #default="scope">
                    <el-image 
                        :src="scope.row.coverImage" 
                        fit="cover" 
                        style="width: 60px; height: 60px;"
                        :preview-src-list="[scope.row.coverImage]"
                    >
                        <template #error>
                            <div style="width: 60px; height: 60px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                                文章封面
                            </div>
                        </template>
                    </el-image>
                </template>
            </el-table-column> -->
            <el-table-column prop="title" label="标题" show-overflow-tooltip></el-table-column>
            <el-table-column prop="author" label="作者"></el-table-column>
            <el-table-column prop="digest" label="摘要" show-overflow-tooltip></el-table-column>
            <el-table-column prop="createTime" label="创建时间"></el-table-column>
            <el-table-column prop="updateTime" label="更新时间">
              <template #default="scope">
                {{ scope.row.updateTime || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
                <template #default="scope">
                    <div class="status-container">
                      <el-tag :type="statusTags[scope.row.status]?.type || 'default'">
                          {{ statusTags[scope.row.status]?.label || '未知状态' }}
                      </el-tag>
                      <template v-if="scope.row.status === STATUS_ENUM.PUBLISHING">
                          <el-tooltip content="文章正在发布中,请稍后查看..." placement="top">
                            <el-icon class="info-icon"><question-filled /></el-icon>
                          </el-tooltip>
                      </template>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="submitter" label="创作者"></el-table-column>
            <el-table-column label="操作" width="276">
                <template #default="scope">
                    <el-button v-if="showViewButton(scope.row)" type="primary" size="small" @click="handleViewArticle(scope.row)">查看</el-button>
                    <el-button type="primary" size="small" v-if="showEditButton(scope.row)" @click="handleEditArticle(scope.row)">编辑</el-button>
                    <!-- 提交审核按钮 - 只有初始化或已退回状态的文章可以提交审核 -->
                    <el-button v-if="showSubmitAuditButton(scope.row)" 
                               type="warning" size="small" @click="handleSubmitAudit(scope.row)">提交审核</el-button>
                    <!-- 审核按钮 - 只有待审核状态的文章可以审核 -->
                    <template v-if="scope.row.status === STATUS_ENUM.PENDING_REVIEW">
                        <el-button type="success" size="small" v-if="showReviewButton(scope.row)" @click="handleReview(scope.row, 'pass')">审核通过</el-button>
                        <el-button type="danger" size="small" v-if="showReviewButton(scope.row)" @click="handleReview(scope.row, 'unpass')">退回</el-button>
                    </template>
                    <!-- 发布按钮 - 只有待发布状态的文章可以发布 -->
                    <el-button v-if="showPublishButton(scope.row)" 
                               type="success" size="small" @click="handlePublishArticle(scope.row)">提交发布任务</el-button>
                    <el-button v-if="showDeleteButton(scope.row)" type="danger" size="small" @click="handleDeleteArticle(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页控件 -->
        <div class="pagination-container" style="margin-top: 20px; text-align: right;">
            <el-pagination v-model:current-page="pageParams.pageNum" v-model:page-size="pageParams.pageSize"
                :page-sizes="[5, 10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="pageData.total"
                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import { getPublishedList, getDraftList, publishArticle, deletePublishedArticle, deleteDraftArticle, submitAudit, reviewDraft, getDraftDetail, getPublishStatus } from '@/api/article'
import useUserStore from '@/store/modules/user'

import auth from '@/plugins/auth'

// 获取路由实例
const router = useRouter()

// 当前选中的tab
const activeTab = ref('unPublish')

// 定义文章状态枚举
const STATUS_ENUM = {
  INITIAL: '0',      // 初始化
  PENDING_REVIEW: '1',  // 待审核
  REJECTED: '2',     // 已退回
  PENDING_PUBLISH: '3', // 待发布
  PUBLISHED: '4',    // 已发布
  PUBLISHING: '5',   // 发布中
  ORIGINAL_FAILURE: '6', // 原创失败
  REGULAR_FAILURE: '7',  // 常规失败
  PLATFORM_REJECTED: '8', // 平台审核不通过
  USER_DELETED: '9',     // 成功后用户删除所有文章
  SYSTEM_BANNED: '10'    // 成功后系统封禁所有文章
}

// 状态标签配置
const statusTags = {
  [STATUS_ENUM.INITIAL]: { label: '初始化', type: 'warning' },
  [STATUS_ENUM.PENDING_REVIEW]: { label: '待审核', type: 'info' },
  [STATUS_ENUM.REJECTED]: { label: '已退回', type: 'danger' },
  [STATUS_ENUM.PENDING_PUBLISH]: { label: '待发布', type: 'primary' },
  [STATUS_ENUM.PUBLISHED]: { label: '已发布', type: 'success' },
  [STATUS_ENUM.PUBLISHING]: { label: '发布中', type: 'info' },
  [STATUS_ENUM.ORIGINAL_FAILURE]: { label: '原创失败', type: 'danger' },
  [STATUS_ENUM.REGULAR_FAILURE]: { label: '常规失败', type: 'danger' },
  [STATUS_ENUM.PLATFORM_REJECTED]: { label: '平台审核不通过', type: 'danger' },
  [STATUS_ENUM.USER_DELETED]: { label: '用户已删除', type: 'danger' },
  [STATUS_ENUM.SYSTEM_BANNED]: { label: '系统已封禁', type: 'danger' }
}

// 文章列表
const articleList = ref([])

// 分页参数
const pageParams = ref({
  pageNum: 1,   // 当前页码
  pageSize: 10  // 每页条数
})

// 分页数据
const pageData = ref({
  total: 0,      // 总记录数
  pageNum: 1,    // 当前页码
  pageSize: 10   // 每页条数
})

// loading状态
const loading = ref(false)

// 获取用户store
const userStore = useUserStore()

// 显示查看列，只有发布中不可查看。
const showViewButton = (row) => {
  // 如果状态是发布中，则不展示操作列
  return row.status !== STATUS_ENUM.PUBLISHING
}

// 显示编辑按钮的条件判断函数
const showEditButton = (row) => {
  // 同时满足以下三个条件才显示编辑按钮：
  // 1. 文章状态为初始化或已退回
  // 2. 当前用户具有article:createEdit权限
  // 3. 文章的submitterId与当前登录用户的id相同
  const editableStatuses = [STATUS_ENUM.INITIAL, STATUS_ENUM.REJECTED, STATUS_ENUM.ORIGINAL_FAILURE, STATUS_ENUM.REGULAR_FAILURE, STATUS_ENUM.PLATFORM_REJECTED]
  return (
    editableStatuses.includes(row.status)
    && auth.hasPermi('article:createEdit') 
    && row.submitterId === userStore.id
  )
}

// 显示提交审核按钮的条件判断函数
const showSubmitAuditButton = (row) => {
  // 同时满足以下三个条件才显示提交审核按钮：
  // 1. 文章状态为已退回、初始化状态
  // 2. 具有article:send:review权限
  // 3. 文章的submitterId与当前登录用户的id相同
  const submitableStatuses = [STATUS_ENUM.INITIAL, STATUS_ENUM.REJECTED]
  return (
    submitableStatuses.includes(row.status) 
    && auth.hasPermi('article:send:review') 
    && row.submitterId === userStore.id
  )
}

// 显示审核按钮的条件判断函数
const showReviewButton = (row) => {
  // 同时满足以下两个条件才显示审核按钮：
  // 1. 文章状态为待审核
  // 2. 具有article:review权限
  return (
    row.status === STATUS_ENUM.PENDING_REVIEW && 
    auth.hasPermi('article:review')
  )
}

// 显示发布按钮的条件判断函数
const showPublishButton = (row) => {
  // 同时满足以下两个条件才显示发布按钮：
  // 1. 文章状态为待发布
  // 2. 具有article:publish权限
  return (
    row.status === STATUS_ENUM.PENDING_PUBLISH && 
    auth.hasPermi('article:publish')
  )
}

// 显示删除按钮的条件判断函数
const showDeleteButton = (row) => {
  // 首先检查用户是否具有article:delete权限
  if (!auth.hasPermi('article:delete')) {
    return false
  }
  
  // 如果是sub-admin角色，除了以下状态外都可删除：用户已删除、系统已封禁、发布中、常规失败、平台审核不通过
  if (auth.hasRole('sub-admin')) {
    return ![STATUS_ENUM.USER_DELETED, STATUS_ENUM.SYSTEM_BANNED, STATUS_ENUM.PUBLISHING, STATUS_ENUM.REGULAR_FAILURE, STATUS_ENUM.PLATFORM_REJECTED].includes(row.status)
  }
  
  // 如果是creative-mgr或creative-spec角色
  if (auth.hasRoleOr(['creative-mgr', 'creative-spec'])) {
    // 需要满足：1. 状态为初始化、已退回、原创失败；2. 文章的submitterId与当前登录用户的id相同
    return [STATUS_ENUM.INITIAL, STATUS_ENUM.REJECTED, STATUS_ENUM.ORIGINAL_FAILURE].includes(row.status) 
      && row.submitterId === userStore.id
  }
  
  // 其他角色默认不可删除
  return false
}

// 页面加载时获取已发布文章列表
onMounted(() => {
  fetchArticleList()
})

// 获取文章列表
const fetchArticleList = () => {
  // 显示局部loading遮罩
  loading.value = true
  
  // 先清空表格数据，避免数据突变导致的行高变化
  articleList.value = []
  
  // 根据当前选中的tab调用对应的API接口
  const apiCall = activeTab.value === 'published' ? getPublishedList : getDraftList
  
  // 准备API参数，包含分页信息
  const apiParams = {
    pageNum: pageParams.value.pageNum,
    pageSize: pageParams.value.pageSize
  }
  
  apiCall(apiParams)
    .then(res => {
      if (res.code === 200) {
        // 处理分页数据
        if (res.data && res.data.list) {
          articleList.value = res.data.items || []
          pageData.value.total = res.data.totalCount || 0
          pageData.value.pageNum = res.data.pageNum || pageParams.value.pageNum
          pageData.value.pageSize = res.data.pageSize || pageParams.value.pageSize
        } else {
          // 兼容旧版本接口返回格式
          articleList.value = res.data || []
          pageData.value.total = res.data ? res.data.length : 0
        }
      } else {
        ElMessage.error(res.message || '获取文章列表失败')
      }
    })
    .catch(error => {
      ElMessage.error('获取文章列表失败')
    })
    .finally(() => {
      // 隐藏局部loading遮罩
      loading.value = false
    })
}

// tab切换事件
const handleTabChange = () => {
  // 切换tab时重置页码为1
  pageParams.value.pageNum = 1
  fetchArticleList()
}

// 分页大小变化事件
const handleSizeChange = (size) => {
  pageParams.value.pageSize = size
  pageParams.value.pageNum = 1 // 切换页大小时重置页码为1
  fetchArticleList()
}

// 页码变化事件
const handleCurrentChange = (current) => {
  pageParams.value.pageNum = current
  fetchArticleList()
}

// 新建文章点击事件
const handleCreateArticle = () => {
  // 跳转到新建文章页面
  router.push('/article/articleList/newArticle')
}

// 编辑文章点击事件
const handleEditArticle = (row) => {
  // 跳转到新建文章页面，带上文章ID作为参数
  router.push(`/article/articleList/newArticle?id=${row.id}`)
}

// 删除文章点击事件
const handleDeleteArticle = (row) => {
  // 显示确认对话框
  ElMessageBox.confirm(`确定要删除标题为《${row.title}》的文章吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 根据文章状态调用对应的删除接口
      const deleteApi = row.status === '4' ? deletePublishedArticle : deleteDraftArticle
      
      deleteApi({ id: row.id })
        .then(res => {
          if (res.code === 200) {
            ElMessage.success(res.message || '文章删除成功')
            // 删除成功后刷新文章列表
            fetchArticleList()
          } else {
            ElMessage.error(res.message || '文章删除失败')
          }
        })
        .catch(error => {
          ElMessage.error('文章删除失败')
        })
    })
}

// 查看文章点击事件
const handleViewArticle = (row) => {
  // 判断文章状态并选择对应的链接
   
  if (['4', '7', '8', '9', '10'].includes(row.status)) {
    // 创建全屏loading遮罩
    const loadingMask = ElLoading.service({
      lock: true,
      text: '正在获取文章链接...',
      background: 'rgba(0, 0, 0, 0.5)'
    })
    
    getPublishStatus(Number(row.id))
      .then(res => {
        if (res.code === 200 && res.data) {
          let articleUrl = ''
          if ( res.data.articleItems && Array.isArray(res.data.articleItems) && res.data.articleItems.length > 0) {
            articleUrl = res.data.articleItems[0].articleUrl || ''
          }
          
          if (articleUrl && articleUrl.trim()) {  
              // 在新页面打开链接
              window.open(articleUrl, '_blank')   
          } else {
            // 链接不存在时提示用户
            ElMessage.warning('文章链接不存在，无法查看')
          }
        } else {
          ElMessage.error(res.message || '获取文章链接失败')
        }
      })
      .catch(error => {
        ElMessage.error('获取文章链接失败')
      })
      .finally(() => {
        // 关闭loading遮罩
        loadingMask.close()
      })
  } else {
    // 未发布状态，调用获取草稿详情接口获取url
    // 创建全屏loading遮罩
    const loadingMask = ElLoading.service({
      lock: true,
      text: '正在获取文章链接...',
      background: 'rgba(0, 0, 0, 0.5)'
    })
    
    getDraftDetail(Number(row.id))
      .then(res => {
        if (res.code === 200 && res.data) {
          // 从接口返回数据中获取url字段
          const url = res.data.url
          
          if (url && url.trim()) {
            // 在新页面打开链接
            window.open(url, '_blank')
          } else {
            // 链接不存在时提示用户
            ElMessage.warning('文章链接不存在，无法查看')
          }
        } else {
          ElMessage.error(res.message || '获取文章链接失败')
        }
      })
      .catch(error => {
        ElMessage.error('获取文章链接失败')
      })
      .finally(() => {
        // 关闭loading遮罩
        loadingMask.close()
      })
  }
}

// 提交审核点击事件
const handleSubmitAudit = (row) => {
  // 调用提交审核接口
  submitAudit(row.id || '')
    .then(res => {
      if (res.code === 200) {
        ElMessage.success(res.message || '文章提交审核成功')
        // 提交审核成功后刷新文章列表
        fetchArticleList()
      } else {
        ElMessage.error(res.message || '文章提交审核失败')
      }
    })
    .catch(error => {
      ElMessage.error('文章提交审核失败')
    })
}

// 审核文章点击事件
const handleReview = (row, result) => {
  // 确认审核操作
  const action = result === 'pass' ? '通过' : '退回'
  ElMessageBox.confirm(`确定要${action}标题为《${row.title}》的文章吗？`, '审核确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 调用审核接口
      reviewDraft({
        id: row.id,
        reviewResult: result
      })
        .then(res => {
          if (res.code === 200) {
            ElMessage.success(res.message || `文章审核${action}成功`)
            // 审核成功后刷新文章列表
            fetchArticleList()
          } else {
            ElMessage.error(res.message || `文章审核${action}失败`)
          }
        })
        .catch(error => {
          ElMessage.error(`文章审核${action}失败`)
        })
    })
}

// 发布文章点击事件
const handlePublishArticle = (row) => {
  // 调用发布接口前创建全屏loading遮罩
  const loadingMask = ElLoading.service({
    lock: true,
    text: '正在发布文章...',
    background: 'rgba(0, 0, 0, 0.5)'
  })
  
  publishArticle({ id: Number(row.id) })
    .then(res => {
      if (res.code === 200) {
        ElMessage.success(res.message || '提交文章发布任务成功')
        // 发布成功后刷新文章列表
        fetchArticleList()
      } else {
        ElMessage.error(res.message || '提交文章发布任务失败')
      }
    })
    .catch(error => {
      ElMessage.error('提交文章发布任务失败')
    })
    .finally(() => {
      // 关闭loading遮罩
      loadingMask.close()
    })
}
</script>

<style scoped lang="scss">
.article-container {
    padding: 20px;
    .page-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
        color: var(--el-text-color-primary);
    }
}

.article-header {
  margin-bottom: 20px;
}
.status-container {
  display: flex;
  align-items: center;
}

.status-container .info-icon {
  margin-left: 8px;
  cursor: pointer;
  color: #909399;
}

.status-container .el-icon-question {
  margin-left: 8px;
  cursor: pointer;
  color: #909399;
}
</style>