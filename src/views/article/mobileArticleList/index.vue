/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
  <div class="article-container ignore-vw" v-loading="loading">
    <div class="article-shell">
      <!-- <section v-if="showTitle" class="hero-card"> -->
        <h3 v-if="showTitle" class="page-title">文章管理</h3>
      <!-- </section> -->

      <template v-if="hasAvailableProductPlatform">
        <section class="mobile-panel selector-panel">
          <div class="panel-title">选择产品</div>
          <div class="chip-group">
            <button
              v-for="(product, index) in productList"
              :key="index"
              type="button"
              :class="['selector-chip', { active: selectedProductIndex === index }]"
              @click="selectProduct(index)"
            >
              {{ product.name }}
            </button>
          </div>

          <template v-if="selectedProduct">
            <div class="panel-subtitle">绑定平台</div>
            <div class="chip-group">
              <button
                v-for="(platform, index) in currentPlatformList"
                :key="index"
                type="button"
                :class="['selector-chip', 'platform-chip', { active: selectedPlatformIndex === index }]"
                @click="selectPlatform(index)"
              >
                <span>{{ platform.name }}</span>
                <span v-if="selectedPlatformIndex === index" class="chip-check">已选</span>
              </button>
            </div>
          </template>
        </section>

        <section class="mobile-panel tool-panel">
          <div class="tab-chip-row">
            <button
              type="button"
              :class="['tab-chip', { active: activeTab === 'unPublish' }]"
              @click="activeTab !== 'unPublish' && handleTabChange('unPublish')"
            >
              未发布
            </button>
            <button
              type="button"
              :class="['tab-chip', { active: activeTab === 'published' }]"
              @click="activeTab !== 'published' && handleTabChange('published')"
            >
              已发布
            </button>
          </div>

          <van-button
            v-if="auth.hasPermi('article:createEdit')"
            round
            block
            type="primary"
            class="create-button"
            @click="handleCreateArticle"
          >
            新建文章
          </van-button>
        </section>

        <section class="mobile-panel list-panel">
          <div class="panel-head">
            <div class="panel-title">文章列表</div>
            <div class="panel-meta">共 {{ pageData.total }} 条</div>
          </div>

          <div v-if="articleList.length" class="article-list">
            <article v-for="row in articleList" :key="row.id" class="article-card">
              <div class="article-card-head">
                <span class="article-id">ID {{ row.id || '-' }}</span>
                <el-tag round effect="light" :type="statusTags[row.status]?.type || 'info'">
                  {{ statusTags[row.status]?.label || '未知状态' }}
                </el-tag>
              </div>

              <h4 class="article-title">{{ row.title || '-' }}</h4>
              <p v-if="row.digest" class="article-digest">{{ row.digest }}</p>

              <div class="article-meta-grid">
                <div class="meta-item">
                  <span class="meta-label">作者</span>
                  <span class="meta-value">{{ row.author || '-' }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">创建时间</span>
                  <span class="meta-value">{{ row.createTime || '-' }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">更新时间</span>
                  <span class="meta-value">{{ row.updateTime || '-' }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">创作者</span>
                  <span class="meta-value">{{ row.submitter || '-' }}</span>
                </div>
              </div>

              <p v-if="row.status === STATUS_ENUM.PUBLISHING" class="status-note">
                文章正在发布中，请稍后刷新查看结果。
              </p>

              <div class="article-actions">
                <van-button v-if="showViewButton(row)" size="small" round type="primary" plain @click="handleViewArticle(row)">查看</van-button>
                <van-button v-if="showEditButton(row)" size="small" round type="primary" @click="handleEditArticle(row)">编辑</van-button>
                <van-button v-if="showSubmitAuditButton(row)" size="small" round type="warning" @click="handleSubmitAudit(row)">提交审核</van-button>
                <van-button v-if="row.status === STATUS_ENUM.PENDING_REVIEW && showReviewButton(row)" size="small" round type="success" @click="handleReview(row, 'pass')">审核通过</van-button>
                <van-button v-if="row.status === STATUS_ENUM.PENDING_REVIEW && showReviewButton(row)" size="small" round type="danger" plain @click="handleReview(row, 'unpass')">退回</van-button>
                <van-button v-if="showPublishButton(row)" size="small" round type="success" @click="handlePublishArticle(row)">提交发布</van-button>
                <van-button v-if="showDeleteButton(row)" size="small" round type="danger" plain @click="handleDeleteArticle(row)">删除</van-button>
              </div>
            </article>
          </div>

          <div v-else class="empty-text">暂无数据</div>

          <div v-if="pageData.total > 0" class="pager-wrap">
            <div class="pager-info">
              <span>第 {{ pageParams.pageNum }} / {{ totalPages }} 页</span>
              <button type="button" class="page-size-trigger" @click="showPageSizeSheet = true">
                每页 {{ pageParams.pageSize }} 条
              </button>
            </div>
            <van-pagination
              :model-value="pageParams.pageNum"
              :total-items="pageData.total"
              :items-per-page="pageParams.pageSize"
              mode="simple"
              @change="handleCurrentChange"
            />
          </div>
        </section>
      </template>

      <section v-else class="mobile-panel empty-panel">
        <div class="empty-text">暂无可用产品与平台</div>
      </section>
    </div>

    <van-action-sheet
      v-model:show="showPageSizeSheet"
      :actions="pageSizeActions"
      cancel-text="取消"
      @select="handlePageSizeSelect"
    />
  </div>
</template>

<script setup>
defineOptions({
  name: 'MobileArticleList'
})

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import {
  getPublishedList,
  getDraftList,
  publishArticle,
  deletePublishedArticle,
  deleteDraftArticle,
  submitAudit,
  reviewDraft,
  getDraftDetail,
  getPublishStatus
} from '@/api/article'
import { getMediaProductList } from '@/api/media/mediaProduct/index'
import useUserStore from '@/store/modules/user'
import auth from '@/plugins/auth'

const props = defineProps({
  showTitle: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const activeTab = ref('unPublish')

const STATUS_ENUM = {
  INITIAL: '0',
  PENDING_REVIEW: '1',
  REJECTED: '2',
  PENDING_PUBLISH: '3',
  PUBLISHED: '4',
  PUBLISHING: '5',
  ORIGINAL_FAILURE: '6',
  REGULAR_FAILURE: '7',
  PLATFORM_REJECTED: '8',
  USER_DELETED: '9',
  SYSTEM_BANNED: '10'
}

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

const articleList = ref([])
const pageParams = ref({
  pageNum: 1,
  pageSize: 10
})
const pageData = ref({
  total: 0,
  pageNum: 1,
  pageSize: 10
})
const showPageSizeSheet = ref(false)
const pageSizeActions = [5, 10, 20, 50, 100].map((size) => ({
  name: `每页 ${size} 条`,
  value: size
}))
const totalPages = computed(() => {
  const size = pageParams.value.pageSize || 1
  const total = pageData.value.total || 0
  return Math.max(1, Math.ceil(total / size))
})

const loading = ref(false)
const userStore = useUserStore()
const productList = ref([])
const hasAvailableProductPlatform = ref(true)

const fetchProductList = () => {
  getMediaProductList({
    pageNum: 1,
    pageSize: 1000000,
    queryConfig: {
      queryProduct: true,
      queryChannels: true,
      queryAccount: true
    }
  }).then(response => {
    if (response.code === 200) {
      const rawProducts = response.rows || response.data?.rows || response.data || []
      productList.value = rawProducts.map(item => ({
        id: item.baseInfo?.id,
        name: item.baseInfo?.productName,
        platforms: (item.channelDTOList || [])
          .filter(channel => Array.isArray(channel.accountDTOList) && channel.accountDTOList.length > 0)
          .map(channel => ({
            id: channel.id,
            name: channel.channelName,
            type: channel.channelType,
            accountDTOList: channel.accountDTOList
          }))
      })).filter(item => item.platforms.length > 0)

      hasAvailableProductPlatform.value = productList.value.length > 0
      selectedProductIndex.value = 0
      selectedPlatformIndex.value = 0

      if (productList.value.length > 0 && productList.value[0].platforms.length > 0) {
        fetchArticleList()
      } else {
        articleList.value = []
        pageData.value.total = 0
      }
    }
  }).catch(() => {
    ElMessage.error('获取产品列表失败')
  })
}

const selectedProductIndex = ref(0)
const selectedPlatformIndex = ref(0)

const selectedProduct = computed(() => {
  return productList.value[selectedProductIndex.value]
})

const currentPlatformList = computed(() => {
  return selectedProduct.value ? selectedProduct.value.platforms : []
})

const selectProduct = (index) => {
  selectedProductIndex.value = index
  selectedPlatformIndex.value = 0
  if (productList.value[index] && productList.value[index].platforms.length > 0) {
    fetchArticleList()
  }
}

const selectPlatform = (index) => {
  selectedPlatformIndex.value = index
  fetchArticleList()
}

const showViewButton = (row) => {
  return row.status !== STATUS_ENUM.PUBLISHING
}

const showEditButton = (row) => {
  const editableStatuses = [
    STATUS_ENUM.INITIAL,
    STATUS_ENUM.REJECTED,
    STATUS_ENUM.ORIGINAL_FAILURE,
    STATUS_ENUM.REGULAR_FAILURE,
    STATUS_ENUM.PLATFORM_REJECTED
  ]
  return (
    editableStatuses.includes(row.status)
    && auth.hasPermi('article:createEdit')
    && row.submitterId === userStore.id
  )
}

const showSubmitAuditButton = (row) => {
  const submitableStatuses = [STATUS_ENUM.INITIAL, STATUS_ENUM.REJECTED]
  return (
    submitableStatuses.includes(row.status)
    && auth.hasPermi('article:send:review')
    && row.submitterId === userStore.id
  )
}

const showReviewButton = (row) => {
  return (
    row.status === STATUS_ENUM.PENDING_REVIEW
    && auth.hasPermi('article:review')
  )
}

const showPublishButton = (row) => {
  return (
    row.status === STATUS_ENUM.PENDING_PUBLISH
    && auth.hasPermi('article:publish')
  )
}

const showDeleteButton = (row) => {
  if (!auth.hasPermi('article:delete')) {
    return false
  }

  if (auth.hasRole('sub-admin') || auth.hasRole('txwx_common')) {
    return ![
      STATUS_ENUM.USER_DELETED,
      STATUS_ENUM.SYSTEM_BANNED,
      STATUS_ENUM.PUBLISHING,
      STATUS_ENUM.REGULAR_FAILURE,
      STATUS_ENUM.PLATFORM_REJECTED
    ].includes(row.status)
  }

  if (auth.hasRoleOr(['creative-mgr', 'creative-spec'])) {
    return [STATUS_ENUM.INITIAL, STATUS_ENUM.REJECTED, STATUS_ENUM.ORIGINAL_FAILURE].includes(row.status)
      && row.submitterId === userStore.id
  }

  return false
}

onMounted(() => {
  fetchProductList()
})

const fetchArticleList = () => {
  if (!hasAvailableProductPlatform.value) {
    articleList.value = []
    loading.value = false
    return
  }

  if (!selectedProduct.value) {
    ElMessage.warning('请先选择自媒体产品')
    loading.value = false
    return
  }

  if (!currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择绑定平台')
    loading.value = false
    return
  }

  loading.value = true
  articleList.value = []

  const productId = selectedProduct.value.id
  const selectedPlatform = currentPlatformList.value[selectedPlatformIndex.value]
  const accountIds = (selectedPlatform?.accountDTOList || [])
    .map(account => account.id)
    .filter(id => id !== undefined && id !== null)

  if (accountIds.length === 0) {
    ElMessage.warning('当前平台未绑定账号，请先绑定后再操作')
    loading.value = false
    return
  }

  const apiCall = activeTab.value === 'published' ? getPublishedList : getDraftList

  const apiParams = activeTab.value === 'published' ? {
    pageNum: pageParams.value.pageNum,
    pageSize: pageParams.value.pageSize,
    accountIds: accountIds
  } : {
    pageNum: pageParams.value.pageNum,
    pageSize: pageParams.value.pageSize,
    accountIds: accountIds
  }

  apiCall(apiParams)
    .then(res => {
      if (res.code === 200) {
        if (res.data && res.data.list) {
          articleList.value = res.data.items || []
          pageData.value.total = res.data.totalCount || 0
          pageData.value.pageNum = res.data.pageNum || pageParams.value.pageNum
          pageData.value.pageSize = res.data.pageSize || pageParams.value.pageSize
        } else {
          articleList.value = res.data || []
          pageData.value.total = res.data ? res.data.length : 0
          pageData.value.pageNum = pageParams.value.pageNum
          pageData.value.pageSize = pageParams.value.pageSize
        }
      } else {
        ElMessage.error(res.message || '获取文章列表失败')
      }
    })
    .catch(() => {
      ElMessage.error('获取文章列表失败')
    })
    .finally(() => {
      loading.value = false
    })
}

const handleTabChange = (tabName = activeTab.value) => {
  activeTab.value = tabName
  pageParams.value.pageNum = 1
  fetchArticleList()
}

const handleSizeChange = (size) => {
  pageParams.value.pageSize = size
  pageParams.value.pageNum = 1
  fetchArticleList()
}

const handleCurrentChange = (current) => {
  pageParams.value.pageNum = current
  fetchArticleList()
}

const handlePageSizeSelect = (action) => {
  showPageSizeSheet.value = false
  handleSizeChange(action.value)
}

const handleCreateArticle = () => {
  if (!selectedProduct.value) {
    ElMessage.warning('请先选择自媒体产品')
    return
  }

  if (!currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择绑定平台')
    return
  }

  const selectedPlatform = currentPlatformList.value[selectedPlatformIndex.value]
  const accountId = selectedPlatform?.accountDTOList?.[0]?.id
  if (!accountId) {
    ElMessage.warning('当前平台未绑定账号，请先绑定后再操作')
    return
  }

  router.push({
    path: '/article/articleList/newArticle',
    query: {
      productId: selectedProduct.value.id,
      accountId: String(accountId)
    }
  })
}

const handleEditArticle = (row) => {
  if (!selectedProduct.value || !currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择自媒体产品和绑定平台')
    return
  }

  const selectedPlatform = currentPlatformList.value[selectedPlatformIndex.value]
  const accountId = selectedPlatform?.accountDTOList?.[0]?.id
  if (!accountId) {
    ElMessage.warning('当前平台未绑定账号，请先绑定后再操作')
    return
  }

  router.push(`/article/articleList/newArticle?id=${row.id}&accountId=${accountId}`)
}

const handleDeleteArticle = (row) => {
  if (!selectedProduct.value || !currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择自媒体产品和绑定平台')
    return
  }

  ElMessageBox.confirm(`确定要删除标题为“${row.title}”的文章吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const productId = selectedProduct.value.id
      const platformId = currentPlatformList.value[selectedPlatformIndex.value].id
      const deleteApi = row.status === '4' ? deletePublishedArticle : deleteDraftArticle

      deleteApi({
        id: row.id,
        productId: productId,
        platformId: platformId
      })
        .then(res => {
          if (res.code === 200) {
            ElMessage.success(res.message || '文章删除成功')
            fetchArticleList()
          } else {
            ElMessage.error(res.message || '文章删除失败')
          }
        })
        .catch(() => {
          ElMessage.error('文章删除失败')
        })
    })
}

const handleViewArticle = (row) => {
  if (['4', '7', '8', '9', '10'].includes(row.status)) {
    const loadingMask = ElLoading.service({
      lock: true,
      text: '正在获取文章链接...',
      background: 'rgba(0, 0, 0, 0.5)'
    })

    getPublishStatus(Number(row.id))
      .then(res => {
        if (res.code === 200 && res.data) {
          let articleUrl = ''
          if (res.data.articleItems && Array.isArray(res.data.articleItems) && res.data.articleItems.length > 0) {
            articleUrl = res.data.articleItems[0].articleUrl || ''
          }

          if (articleUrl && articleUrl.trim()) {
            window.open(articleUrl, '_blank')
          } else {
            ElMessage.warning('文章链接不存在，无法查看')
          }
        } else {
          ElMessage.error(res.message || '获取文章链接失败')
        }
      })
      .catch(() => {
        ElMessage.error('获取文章链接失败')
      })
      .finally(() => {
        loadingMask.close()
      })
  } else {
    const loadingMask = ElLoading.service({
      lock: true,
      text: '正在获取文章链接...',
      background: 'rgba(0, 0, 0, 0.5)'
    })

    getDraftDetail(Number(row.id))
      .then(res => {
        if (res.code === 200 && res.data) {
          const url = res.data.url
          if (url && url.trim()) {
            window.open(url, '_blank')
          } else {
            ElMessage.warning('文章链接不存在，无法查看')
          }
        } else {
          ElMessage.error(res.message || '获取文章链接失败')
        }
      })
      .catch(() => {
        ElMessage.error('获取文章链接失败')
      })
      .finally(() => {
        loadingMask.close()
      })
  }
}

const handleSubmitAudit = (row) => {
  if (!selectedProduct.value || !currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择自媒体产品和绑定平台')
    return
  }

  submitAudit(row.id)
    .then(res => {
      if (res.code === 200) {
        ElMessage.success(res.message || '文章提交审核成功')
        fetchArticleList()
      } else {
        ElMessage.error(res.message || '文章提交审核失败')
      }
    })
    .catch(() => {
      ElMessage.error('文章提交审核失败')
    })
}

const handleReview = (row, result) => {
  if (!selectedProduct.value || !currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择自媒体产品和绑定平台')
    return
  }

  const action = result === 'pass' ? '通过' : '退回'
  ElMessageBox.confirm(`确定要${action}标题为“${row.title}”的文章吗？`, '审核确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const productId = selectedProduct.value.id
      const platformId = currentPlatformList.value[selectedPlatformIndex.value].id

      reviewDraft({
        id: row.id,
        reviewResult: result,
        productId: productId,
        platformId: platformId
      })
        .then(res => {
          if (res.code === 200) {
            ElMessage.success(res.message || `文章审核${action}成功`)
            fetchArticleList()
          } else {
            ElMessage.error(res.message || `文章审核${action}失败`)
          }
        })
        .catch(() => {
          ElMessage.error(`文章审核${action}失败`)
        })
    })
}

const handlePublishArticle = (row) => {
  if (!selectedProduct.value || !currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择自媒体产品和绑定平台')
    return
  }

  const loadingMask = ElLoading.service({
    lock: true,
    text: '正在发布文章...',
    background: 'rgba(0, 0, 0, 0.5)'
  })

  const productId = selectedProduct.value.id
  const platformId = currentPlatformList.value[selectedPlatformIndex.value].id

  publishArticle({
    id: Number(row.id),
    productId: productId,
    platformId: platformId
  })
    .then(res => {
      if (res.code === 200) {
        ElMessage.success(res.message || '提交文章发布任务成功')
        fetchArticleList()
      } else {
        ElMessage.error(res.message || '提交文章发布任务失败')
      }
    })
    .catch(() => {
      ElMessage.error('提交文章发布任务失败')
    })
    .finally(() => {
      loadingMask.close()
    })
}
</script>

<style scoped lang="scss">
$page-top: #f7f9ff;
$page-bottom: #edf2fb;
$card-bg: rgba(255, 255, 255, 0.96);
$card-border: rgba(225, 231, 244, 0.95);
$card-shadow: 0 16px 34px rgba(106, 124, 163, 0.12);
$text-main: #3f4963;
$text-sub: #8f97ad;
$text-light: #a8b0c4;
$brand-start: #5f7cf0;
$brand-end: #7a8fe7;

.ignore-vw.article-container {
  min-height: 100vh;
  min-height: 100dvh;
  padding: calc(env(safe-area-inset-top, 0px) + 16px) 16px calc(env(safe-area-inset-bottom, 0px) + 28px);
  background:
    radial-gradient(circle at 14% 10%, rgba(107, 126, 239, 0.15), rgba(107, 126, 239, 0) 26%),
    radial-gradient(circle at 86% 6%, rgba(111, 161, 224, 0.14), rgba(111, 161, 224, 0) 24%),
    linear-gradient(180deg, $page-top 0%, $page-bottom 100%);
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

.ignore-vw .article-shell {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ignore-vw .hero-card,
.ignore-vw .mobile-panel {
  width: 100%;
  background: $card-bg;
  border: 1px solid $card-border;
  border-radius: 24px;
  box-shadow: $card-shadow;
  backdrop-filter: blur(16px);
  box-sizing: border-box;
}

.ignore-vw .hero-card {
  position: relative;
  padding: 18px 16px 16px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: linear-gradient(180deg, rgba(105, 124, 232, 0.12), rgba(105, 124, 232, 0));
    pointer-events: none;
  }
}

.ignore-vw .hero-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(99, 118, 232, 0.1);
  color: #6a79d0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.ignore-vw .page-title {
  position: relative;
  margin: 12px 0 8px;
  font-size: 22px;
  line-height: 1.25;
  font-weight: 700;
  color: $text-main;
}

.ignore-vw .hero-desc {
  position: relative;
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: $text-sub;
}

.ignore-vw .mobile-panel {
  padding: 16px 14px;
}

.ignore-vw .panel-title {
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 700;
  color: $text-main;
}

.ignore-vw .panel-subtitle {
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 1.5;
  font-weight: 700;
  color: $text-light;
}

.ignore-vw .panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.ignore-vw .panel-meta {
  font-size: 12px;
  line-height: 1.5;
  color: $text-sub;
}

.ignore-vw .chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.ignore-vw .selector-chip,
.ignore-vw .tab-chip {
  appearance: none;
  border: 1px solid rgba(226, 231, 242, 0.94);
  background: rgba(247, 249, 253, 0.96);
  color: $text-sub;
  transition: all 0.22s ease;
  cursor: pointer;
}

.ignore-vw .selector-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.ignore-vw .selector-chip.active,
.ignore-vw .tab-chip.active {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 248, 255, 1));
  box-shadow:
    0 10px 22px rgba(103, 121, 190, 0.14),
    inset 0 0 0 1px rgba(101, 114, 220, 0.16);
  border-color: rgba(101, 114, 220, 0.34);
  color: #5d6bd8;
  transform: translateY(-1px);
}

.ignore-vw .platform-chip {
  gap: 8px;
}

.ignore-vw .chip-check {
  font-size: 12px;
  font-weight: 700;
  color: #6a79d0;
}

.ignore-vw .tab-chip-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ignore-vw .tab-chip {
  min-height: 40px;
  padding: 0 14px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
}

.ignore-vw .tool-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ignore-vw .list-panel {
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 18px);
}

.ignore-vw .article-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ignore-vw .article-card {
  padding: 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(248, 250, 255, 0.96), rgba(243, 246, 252, 0.96));
  box-shadow: inset 0 0 0 1px rgba(228, 233, 244, 0.94);
}

.ignore-vw .article-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ignore-vw .article-id {
  font-size: 12px;
  line-height: 1.5;
  color: $text-light;
}

.ignore-vw .article-title {
  margin: 10px 0 8px;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 700;
  color: $text-main;
  word-break: break-word;
}

.ignore-vw .article-digest {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.65;
  color: $text-sub;
  word-break: break-word;
}

.ignore-vw .article-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ignore-vw .meta-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 0 0 1px rgba(228, 233, 244, 0.86);
}

.ignore-vw .meta-label {
  font-size: 12px;
  line-height: 1.45;
  color: $text-light;
}

.ignore-vw .meta-value {
  font-size: 13px;
  line-height: 1.55;
  font-weight: 600;
  color: $text-main;
  word-break: break-word;
}

.ignore-vw .status-note {
  margin: 12px 0 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(232, 166, 74, 0.14);
  color: #b77728;
  font-size: 12px;
  line-height: 1.6;
}

.ignore-vw .article-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.ignore-vw .pager-wrap {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(224, 229, 240, 0.9);
}

.ignore-vw .pager-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 13px;
  line-height: 1.5;
  color: $text-sub;
}

.ignore-vw .page-size-trigger {
  appearance: none;
  border: none;
  background: rgba(99, 118, 232, 0.1);
  color: #6a79d0;
  border-radius: 999px;
  min-height: 32px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
}

.ignore-vw .empty-panel {
  padding: 36px 20px;
}

.ignore-vw .empty-text {
  text-align: center;
  font-size: 14px;
  line-height: 1.6;
  color: $text-sub;
}

.ignore-vw :deep(.van-button) {
  min-height: 42px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 16px;
}

.ignore-vw :deep(.van-button--primary) {
  border: none;
  background: linear-gradient(135deg, $brand-start 0%, $brand-end 100%);
  box-shadow: 0 12px 24px rgba(103, 121, 190, 0.18);
}

.ignore-vw :deep(.van-button--plain.van-button--primary) {
  background: rgba(247, 249, 253, 0.96);
  color: #5d6bd8;
  border: 1px solid rgba(101, 114, 220, 0.24);
  box-shadow: none;
}

.ignore-vw :deep(.van-button--small) {
  min-width: 76px;
  min-height: 34px;
  padding: 0 12px;
  font-size: 13px;
  border-radius: 12px;
}

.ignore-vw :deep(.van-pagination) {
  justify-content: center;
}

.ignore-vw :deep(.van-pagination__item) {
  min-width: 88px;
  height: 36px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  color: $text-main;
  font-size: 13px;
}

.ignore-vw :deep(.el-tag) {
  max-width: 48vw;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 420px) {
  .ignore-vw .page-title {
    font-size: 20px;
  }

  .ignore-vw .article-meta-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (min-width: 769px) {
  .ignore-vw.article-container {
    padding: 24px;
  }

  .ignore-vw .article-shell {
    max-width: 960px;
    margin: 0 auto;
  }

  .ignore-vw .article-meta-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
