/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
  <div class="mobile-article-container ignore-vw" v-loading="loading">
    <div class="mobile-page-header">
      <h1 class="mobile-page-title">问道文章</h1>
    </div>

    <!-- 筛选区 -->
    <section class="mobile-panel filter-panel">
      <div class="selector-row">
        <div class="selector-label">
          <span class="label-text">关键词</span>
        </div>
        <div class="filter-fields">
          <van-field
            v-model="queryParams.title"
            placeholder="标题关键词"
            clearable
            size="small"
            class="filter-field"
            @keyup.enter="handleQuery"
          />
          <van-field
            v-model="queryParams.slug"
            placeholder="Slug"
            clearable
            size="small"
            class="filter-field"
            @keyup.enter="handleQuery"
          />
        </div>
      </div>
      <div class="selector-row">
        <div class="selector-label">
          <span class="label-text">筛选</span>
        </div>
        <div class="filter-options">
          <van-dropdown-menu active-color="#5f7cf0" direction="down">
            <van-dropdown-item v-model="queryParams.status" :options="statusOptions" @change="handleQuery" />
            <van-dropdown-item v-model="queryParams.visibility" :options="visibilityOptions" @change="handleQuery" />
          </van-dropdown-menu>
          <van-button size="small" plain type="primary" @click="handleReset" class="reset-btn">重置</van-button>
        </div>
      </div>
      <div class="selector-row">
        <div class="selector-label">
          <span class="label-text">发布时间</span>
        </div>
        <div class="filter-fields">
          <van-field
            v-model="publishDateRange[0]"
            type="date"
            placeholder="开始时间"
            clearable
            size="small"
            class="filter-field"
            @change="onDateRangeChange"
          />
          <van-field
            v-model="publishDateRange[1]"
            type="date"
            placeholder="结束时间"
            clearable
            size="small"
            class="filter-field"
            @change="onDateRangeChange"
          />
        </div>
      </div>
    </section>

    <!-- 操作区 -->
    <section class="mobile-panel action-panel">
      <div class="action-btn-row">
        <van-button
          v-if="auth.hasPermi('content:article:add')"
          round
          block
          type="primary"
          class="create-button"
          @click="handleCreate"
        >
          新建文章
        </van-button>
        <van-button
          v-if="auth.hasPermi('content:article:add')"
          round
          block
          plain
          type="primary"
          class="create-button"
          @click="handleCreateFromTemplate"
        >
          从模板创建
        </van-button>
      </div>
    </section>

    <!-- 列表区 -->
    <section class="mobile-panel list-panel">
      <div class="panel-title">文章列表</div>
      <div v-if="articleList.length" class="mobile-list">
        <article v-for="row in articleList" :key="row.id" class="list-card">
          <div class="list-card-head">
            <div class="list-card-head-left">
              <span class="list-card-id">#{{ row.id || '-' }}</span>
              <el-tag round effect="light" :type="(ARTICLE_STATUS[row.status] || {}).type || 'info'" size="small">
                {{ (ARTICLE_STATUS[row.status] || {}).label || row.status }}
              </el-tag>
              <el-tag v-if="row.visibility" round effect="plain" :type="(VISIBILITY[row.visibility] || {}).type || 'info'" size="small">
                {{ (VISIBILITY[row.visibility] || {}).label || row.visibility }}
              </el-tag>
            </div>
          </div>

          <div class="list-card-title van-multi-ellipsis--l2">{{ row.title || '-' }}</div>
          <p v-if="row.summary" class="list-card-desc van-multi-ellipsis--l2">{{ row.summary }}</p>

          <div class="meta-grid">
            <div class="meta-block">
              <span class="meta-name">Slug</span>
              <span class="meta-value slug">{{ row.slug || '-' }}</span>
            </div>
            <div class="meta-block">
              <span class="meta-name">更新时间</span>
              <span class="meta-value">{{ row.updateTime || '-' }}</span>
            </div>
            <div class="meta-block">
              <span class="meta-name">发布时间</span>
              <span class="meta-value">{{ row.publishedAt || '-' }}</span>
            </div>
            <div class="meta-block" v-if="row.isPaid === '1'">
              <span class="meta-name">付费</span>
              <span class="meta-value">是</span>
            </div>
          </div>

          <div v-if="row.publishStatus" class="list-card-status">
            <van-tag
              v-if="row.publishStatus?.WECHAT_OFFICIAL_ACCOUNT === 'SUCCESS'" type="success" size="small"
            >微信</van-tag>
            <van-tag
              v-else-if="row.publishStatus?.WECHAT_OFFICIAL_ACCOUNT === 'FAILED'" type="danger" size="small"
            >微信</van-tag>
            <van-tag
              v-else-if="row.publishStatus?.WECHAT_OFFICIAL_ACCOUNT" type="warning" size="small"
            >微信</van-tag>

            <van-tag
              v-if="row.publishStatus?.SITE_WENDAO === 'SUCCESS'" type="success" size="small"
            >问道</van-tag>
            <van-tag
              v-else-if="row.publishStatus?.SITE_WENDAO === 'FAILED'" type="danger" size="small"
            >问道</van-tag>
            <van-tag
              v-else-if="row.publishStatus?.SITE_WENDAO" type="warning" size="small"
            >问道</van-tag>
          </div>

          <div class="list-card-action">
            <van-button v-if="canEditArticle(row)" size="small" round type="primary" @click="handleEdit(row)">编辑</van-button>
            <van-button size="small" round plain type="primary" @click="handlePreview(row)">预览</van-button>
            <van-button v-if="row.status !== 'PUBLISHED'" size="small" round type="success" @click="handlePublish(row)">发布</van-button>
            <van-button v-if="row.status === 'PUBLISHED'" size="small" round type="success" @click="handleView(row)">查看</van-button>
            <van-button v-if="auth.hasPermi('content:article:delete')" size="small" round type="danger" plain @click="handleDelete(row)">删除</van-button>
          </div>
        </article>
      </div>

      <div v-else class="empty-text">暂无数据</div>

      <div v-if="total > 0" class="pager-wrap">
        <van-pagination
          :model-value="queryParams.pageNum"
          :total-items="total"
          :items-per-page="queryParams.pageSize"
          mode="simple"
          @change="handleCurrentChange"
        />
      </div>
    </section>

    <ArticlePreviewDrawer v-model="previewVisible" :article="previewArticle" />

    <TemplatePickerDialog v-model="templatePickerVisible" @select="onTemplateSelect" />

    <van-dialog v-model:show="publishDialogVisible" title="发布确认" show-cancel-button @confirm="confirmPublish" :before-close="onPublishBeforeClose" @open="onPublishDialogOpen">
      <div class="publish-confirm">
        <div class="publish-confirm__item">
          <span class="publish-confirm__label">发布目标：</span>
          <div class="publish-confirm__targets">
            <van-checkbox v-model="targetSiteWendao" shape="square" :disabled="isTargetDisabled('SITE_WENDAO')">SpaceMV问道</van-checkbox>
            <van-checkbox v-model="targetWechat" shape="square" :disabled="isTargetDisabled('WECHAT_OFFICIAL_ACCOUNT')">微信公众号</van-checkbox>
          </div>
        </div>
        <div v-if="targetWechat" class="publish-confirm__item">
          <span class="publish-confirm__label">公众号账号：</span>
          <van-field
            v-model="selectedAccountId"
            is-link
            readonly
            :placeholder="wechatAccounts.length ? '请选择微信公众号账号' : '暂无可用账号'"
            @click="showWechatAccountPicker = true"
          />
        </div>
        <div class="publish-confirm__item">
          <span class="publish-confirm__label">文章标题：</span>
          <span>{{ publishTarget?.title }}</span>
        </div>
        <div v-if="targetSiteWendao" class="publish-confirm__item">
          <span class="publish-confirm__label">Slug：</span>
          <code>{{ publishTarget?.slug }}</code>
        </div>
        <div v-if="targetSiteWendao" class="publish-confirm__item">
          <span class="publish-confirm__label">预计 URL：</span>
          <code>/blog/{{ publishTarget?.slug }}</code>
        </div>
        <div class="publish-confirm__item">
          <span class="publish-confirm__label">SEO 标题：</span>
          <span>{{ publishTarget?.seoTitle || publishTarget?.title }}</span>
        </div>
        <div class="publish-confirm__item">
          <span class="publish-confirm__label">SEO 描述：</span>
          <span>{{ publishTarget?.seoDescription || publishTarget?.summary }}</span>
        </div>
        <div class="publish-confirm__item">
          <span class="publish-confirm__label">引用图表数量：</span>
          <span>{{ publishTarget?.chartCount ?? 0 }}</span>
        </div>
        <div class="publish-confirm__item">
          <span class="publish-confirm__label">引用地图数量：</span>
          <span>{{ publishTarget?.mapCount ?? 0 }}</span>
        </div>
        <div v-if="!hasAnyTarget" class="publish-confirm__tip">请至少选择一个发布目标</div>
      </div>
    </van-dialog>

    <van-action-sheet v-model:show="showWechatAccountPicker" title="选择微信公众号账号">
      <van-radio-group v-model="selectedAccountId" class="account-radio-group">
        <van-cell-group>
          <van-cell v-for="acc in wechatAccounts" :key="acc.id" :title="acc.accountName" @click="selectedAccountId = acc.id; showWechatAccountPicker = false">
            <template #right-icon>
              <van-radio :name="acc.id" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-radio-group>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { listArticles, deleteArticle, publishToMultiPlatform, getArticle, listPublishRecords } from '@/api/content/article'
import { getMediaProductList } from '@/api/media/mediaProduct/index'
import auth from '@/plugins/auth'
import { getArticleSiteUrl } from '@/utils/wendaoSite'
import { ARTICLE_STATUS, VISIBILITY } from '../article/constants'
import ArticlePreviewDrawer from '../article/components/ArticlePreviewDrawer.vue'
import TemplatePickerDialog from '../article/components/TemplatePickerDialog.vue'

defineOptions({
  name: 'MobileContentArticle'
})

const router = useRouter()
const loading = ref(false)
const articleList = ref([])
const total = ref(0)

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  title: '',
  slug: '',
  status: '',
  visibility: '',
  beginPublishedAt: '',
  endPublishedAt: ''
})

const publishDateRange = ref(['', ''])

const onDateRangeChange = () => {
  const [start, end] = publishDateRange.value
  queryParams.value.beginPublishedAt = start || ''
  queryParams.value.endPublishedAt = end || ''
  handleQuery()
}

const statusOptions = [
  { text: '全部状态', value: '' },
  ...Object.entries(ARTICLE_STATUS).map(([k, v]) => ({ text: v.label, value: k }))
]

const visibilityOptions = [
  { text: '全部可见性', value: '' },
  ...Object.entries(VISIBILITY).map(([k, v]) => ({ text: v.label, value: k }))
]

const previewVisible = ref(false)
const previewArticle = ref(null)
const templatePickerVisible = ref(false)

const publishDialogVisible = ref(false)
const publishTarget = ref(null)
const showWechatAccountPicker = ref(false)

const targetSiteWendao = ref(true)
const targetWechat = ref(false)
const wechatAccounts = ref([])
const selectedAccountId = ref(null)

const hasAnyTarget = computed(() => targetSiteWendao.value || targetWechat.value)

const isTargetDisabled = (targetCode) => {
  if (targetCode === 'WECHAT_OFFICIAL_ACCOUNT') {
    return wechatAccounts.value.length === 0
  }
  return false
}

const onPublishDialogOpen = async () => {
  targetSiteWendao.value = true
  targetWechat.value = false
  selectedAccountId.value = null
  try {
    const res = await getMediaProductList({
      pageNum: 1,
      pageSize: 1000000,
      queryConfig: { queryProduct: true, queryChannels: true, queryAccount: true }
    })
    if (res.code === 200) {
      const rawProducts = res.rows || res.data?.rows || res.data || []
      const accounts = []
      rawProducts.forEach(item => {
        const channels = item.channelDTOList || []
        channels.forEach(channel => {
          if (channel.channelType === 'wechat' && Array.isArray(channel.accountDTOList)) {
            channel.accountDTOList.forEach(acc => {
              if (acc.id) accounts.push({ id: acc.id, accountName: acc.accountName || channel.channelName })
            })
          }
        })
      })
      wechatAccounts.value = accounts
    }
  } catch {
    wechatAccounts.value = []
  }
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await listArticles(queryParams.value)
    if (res.code === 200) {
      const list = res.rows || []
      // 为每条文章加载发布状态
      await Promise.all(list.map(async (item) => {
        try {
          const pr = await listPublishRecords(item.id)
          if (pr.code === 200 && pr.data) {
            const statusMap = {}
            pr.data.forEach(r => { statusMap[r.platform] = r.status })
            item.publishStatus = statusMap
          }
        } catch {
          item.publishStatus = {}
        }
      }))
      articleList.value = list
      total.value = res.total || 0
    } else {
      showToast(res.msg || '获取文章列表失败')
    }
  } catch {
    showToast('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.value.pageNum = 1
  fetchList()
}

const handleReset = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    title: '',
    slug: '',
    status: '',
    visibility: '',
    beginPublishedAt: '',
    endPublishedAt: ''
  }
  publishDateRange.value = ['', '']
  fetchList()
}

const handleCurrentChange = (page) => {
  queryParams.value.pageNum = page
  fetchList()
}

const handleCreate = () => {
  router.push('/contentCenter/article/edit')
}

const handleCreateFromTemplate = () => {
  templatePickerVisible.value = true
}

const onTemplateSelect = (tpl) => {
  router.push(`/contentCenter/article/edit?templateId=${tpl.id}`)
}

const getArticleId = (row) => row?.id || row?.articleId || row?.draftId

const canEditArticle = (row) => {
  return auth.hasPermi('content:article:edit') || row?.status === 'DRAFT'
}

const handleEdit = (row) => {
  const id = getArticleId(row)
  if (!id) {
    showToast('未获取到文章ID')
    return
  }
  router.push(`/contentCenter/article/edit?id=${id}`)
}

const handlePreview = async (row) => {
  try {
    const res = await getArticle(row.id)
    if (res.code === 200) {
      previewArticle.value = res.data
    } else {
      previewArticle.value = row
    }
  } catch {
    previewArticle.value = row
  }
  previewVisible.value = true
}

const handlePublish = async (row) => {
  let detail = row
  try {
    const res = await getArticle(row.id)
    if (res.code === 200) {
      detail = res.data
    }
  } catch {}

  const chartRegex = /\{\{chart:([a-zA-Z0-9-_]+)\}\}/g
  const chartSpanRegex = /data-chart-slug\s*=\s*["']([a-zA-Z0-9-_]+)["']/g
  const chartClassRegex = /alt\s*=\s*["']chart:([a-zA-Z0-9-_]+)["'][^>]*>\s*<\/(?:span|div)>/g
  const chartCount = new Set()
  let m
  while ((m = chartRegex.exec(detail.contentHtml)) !== null) chartCount.add(m[1])
  while ((m = chartSpanRegex.exec(detail.contentHtml)) !== null) chartCount.add(m[1])
  while ((m = chartClassRegex.exec(detail.contentHtml)) !== null) chartCount.add(m[1])
  detail.chartCount = chartCount.size

  const mapRegex = /\{\{map:([a-zA-Z0-9-_]+)\}\}/g
  const mapSpanRegex = /data-map-token\s*=\s*["']([a-zA-Z0-9-_]+)["']/g
  const mapClassRegex = /alt\s*=\s*["']map:([a-zA-Z0-9-_]+)["'][^>]*>\s*<\/(?:span|div)>/g
  const mapCount = new Set()
  while ((m = mapRegex.exec(detail.contentHtml)) !== null) mapCount.add(m[1])
  while ((m = mapSpanRegex.exec(detail.contentHtml)) !== null) mapCount.add(m[1])
  while ((m = mapClassRegex.exec(detail.contentHtml)) !== null) mapCount.add(m[1])
  detail.mapCount = mapCount.size

  publishTarget.value = detail
  publishDialogVisible.value = true
}

const onPublishBeforeClose = (action) => {
  return new Promise((resolve) => {
    if (action === 'confirm') {
      confirmPublish().then(resolve).catch(() => resolve(false))
    } else {
      resolve(true)
    }
  })
}

const confirmPublish = async () => {
  if (!publishTarget.value?.id) return
  const targets = []
  if (targetSiteWendao.value) {
    targets.push({ targetCode: 'SITE_WENDAO' })
  }
  if (targetWechat.value) {
    if (!selectedAccountId.value) {
      showToast('请选择微信公众号账号')
      return
    }
    targets.push({ targetCode: 'WECHAT_OFFICIAL_ACCOUNT', accountId: selectedAccountId.value })
  }
  if (targets.length === 0) return

  try {
    const res = await publishToMultiPlatform(publishTarget.value.id, targets)
    if (res.code === 200) {
      showToast('发布成功')
      publishDialogVisible.value = false
      fetchList()
    } else {
      showToast(res.msg || '发布失败')
    }
  } catch {
    showToast('发布失败')
  }
}

const handleView = (row) => {
  const url = getArticleSiteUrl(row)
  if (url) window.open(url, '_blank')
}

const handleDelete = (row) => {
  showConfirmDialog({
    title: '删除确认',
    message: `确定要删除文章《${row.title}》吗？`,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      const res = await deleteArticle(row.id)
      if (res.code === 200) {
        showToast('删除成功')
        fetchList()
      } else {
        showToast(res.msg || '删除失败')
      }
    } catch {
      showToast('删除失败')
    }
  }).catch(() => {})
}

let referrerMeta = null

onMounted(() => {
  // 页面级 referrer 策略：防止微信防盗链拦截图片
  referrerMeta = document.createElement('meta')
  referrerMeta.name = 'referrer'
  referrerMeta.content = 'no-referrer'
  document.head.appendChild(referrerMeta)

  fetchList()
})

onBeforeUnmount(() => {
  if (referrerMeta) referrerMeta.remove()
})
</script>

<style scoped lang="scss">
$text-main: #25324a;
$text-sub: #7b879c;
$text-light: #7b879c;
$brand: #5f7cf0;

.ignore-vw.mobile-article-container {
  min-height: 100vh;
  min-height: 100dvh;
  padding: calc(env(safe-area-inset-top, 0px) + 16px) 16px calc(env(safe-area-inset-bottom, 0px) + 28px);
  background:
    radial-gradient(circle at 14% 10%, rgba(107, 126, 239, 0.15), rgba(107, 126, 239, 0) 26%),
    radial-gradient(circle at 86% 6%, rgba(111, 161, 224, 0.14), rgba(111, 161, 224, 0) 24%),
    linear-gradient(180deg, #f7f9ff 0%, #edf2fb 100%);
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

.mobile-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.mobile-page-title {
  margin: 0;
  font-size: 22px;
  line-height: 1.25;
  font-weight: 700;
  color: $text-main;
}

.ignore-vw .mobile-panel {
  margin-bottom: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(225, 231, 244, 0.95);
  border-radius: 24px;
  box-shadow: 0 16px 34px rgba(106, 124, 163, 0.12);
  backdrop-filter: blur(16px);
  box-sizing: border-box;
}

.ignore-vw .panel-title {
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: $text-main;
  margin-bottom: 12px;
}

/* 筛选区 */
.ignore-vw .selector-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.ignore-vw .selector-label {
  .label-text {
    font-size: 13px;
    font-weight: 600;
    color: $text-sub;
  }
}

.ignore-vw .filter-fields {
  display: flex;
  gap: 8px;

  :deep(.filter-field) {
    flex: 1;
    min-width: 0;
    padding: 0 8px;
    background: #f5f7fa;
    border-radius: 8px;

    .van-field__body input {
      font-size: 13px;
    }
  }
}

.ignore-vw .filter-options {
  display: flex;
  align-items: center;
  gap: 8px;

  :deep(.van-dropdown-menu) {
    flex: 1;
    min-width: 0;
    height: 36px;

    .van-dropdown-menu__bar {
      height: 36px;
      background: #f5f7fa;
      border-radius: 8px;
      box-shadow: none;
    }

    .van-dropdown-menu__title {
      font-size: 13px;
    }
  }

  .reset-btn {
    flex-shrink: 0;
    font-size: 12px;
    height: 36px;
  }
}

/* 操作区 */
.ignore-vw .action-btn-row {
  display: flex;
  gap: 8px;
}

.ignore-vw .create-button {
  margin: 0;
  flex: 1;
}

.ignore-vw :deep(.van-button) {
  min-height: 42px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 16px;
}

.ignore-vw :deep(.van-button--primary) {
  border: none;
  background: linear-gradient(135deg, #5f7cf0 0%, #7a8fe7 100%);
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

/* 列表区 */
.ignore-vw .mobile-list {
  margin-top: 12px;
}

.ignore-vw .list-card {
  padding: 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(248, 250, 255, 0.96), rgba(243, 246, 252, 0.96));
  box-shadow: inset 0 0 0 1px rgba(228, 233, 244, 0.94);

  &-head {
    margin-bottom: 10px;

    &-left {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  &-id {
    font-size: 12px;
    color: $text-sub;
    font-family: monospace;
  }

  &-title {
    margin-bottom: 6px;
    font-size: 16px;
    line-height: 1.5;
    font-weight: 700;
    color: $text-main;
    word-break: break-word;
  }

  &-desc {
    font-size: 13px;
    line-height: 1.65;
    color: $text-sub;
    margin-bottom: 10px;
    word-break: break-word;
  }
}

.ignore-vw .list-card + .list-card {
  margin-top: 10px;
}

.ignore-vw .meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.ignore-vw .meta-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 14px;
  box-shadow: inset 0 0 0 1px rgba(228, 233, 244, 0.86);
}

.ignore-vw .meta-name {
  font-size: 12px;
  line-height: 1.45;
  color: $text-sub;
}

.ignore-vw .meta-value {
  font-size: 13px;
  line-height: 1.55;
  font-weight: 600;
  color: $text-main;
  word-break: break-word;

  &.slug {
    font-family: monospace;
    font-size: 12px;
    color: $brand;
  }
}

.ignore-vw .list-card-status {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.ignore-vw .list-card-action {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid #e6ebf3;

  :deep(.van-button) {
    font-size: 12px;
    height: 30px;
    padding: 0 12px;
  }
}

.ignore-vw .empty-text {
  padding: 28px 0 12px;
  text-align: center;
  font-size: 14px;
  line-height: 20px;
  color: $text-light;
}

.ignore-vw .pager-wrap {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(224, 229, 240, 0.9);
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

.ignore-vw .publish-confirm {
  padding: 8px 16px;

  &__item {
    font-size: 14px;
    line-height: 1.8;
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }

  &__label {
    color: $text-sub;
    white-space: nowrap;
  }

  &__targets {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__tip {
    font-size: 12px;
    color: #e74c3c;
    margin-top: 8px;
    text-align: center;
  }

  code {
    font-family: monospace;
    font-size: 12px;
    background: #f5f7fa;
    padding: 1px 4px;
    border-radius: 3px;
    word-break: break-all;
  }
}

.ignore-vw .account-radio-group {
  :deep(.van-cell) {
    align-items: center;
  }
}

@media (max-width: 420px) {
  .ignore-vw .mobile-page-title {
    font-size: 20px;
  }

  .ignore-vw .meta-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (min-width: 769px) {
  .ignore-vw.mobile-article-container {
    padding: 24px;
  }

  .ignore-vw .mobile-panel {
    max-width: 960px;
    margin-left: auto;
    margin-right: auto;
  }

  .ignore-vw .meta-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>

<style lang="scss">
.ignore-vw {
  /* ArticlePreviewDrawer */
  .preview__title { font-size: 22px; }
  .preview__loading { font-size: 13px; }
  .preview__summary { font-size: 14px; }
  .preview__meta { font-size: 13px; }
  .preview__body { font-size: 15px; }
  .preview__wechat-empty { font-size: 14px; }
  .preview__seo h3 { font-size: 14px; }
  .preview__seo-item { font-size: 13px; }

  /* MapEmbed */
  .map-embed__fs-btn { font-size: 15px; }
  .map-embed__fallback-icon { font-size: 32px; }
  .map-embed__fallback-text { font-size: 15px; }
  .map-embed__fallback-sub { font-size: 13px; }
  .map-embed__fallback-link { font-size: 13px; }

  /* ChartPreview */
  .chart-preview__header { font-size: 12px; }
  .chart-preview__chart { height: 240px !important; }
  .chart-preview__loading { height: 240px !important; font-size: 13px; }
  .chart-preview__error { height: 240px !important; font-size: 13px; }

  /* ============================================ */
  /* Element Plus Dialog / Drawer sizing (mobile) */
  /* ============================================ */
  .el-dialog {
    width: 95vw !important;
    max-width: 95vw !important;
    margin-top: 4vh !important;
    border-radius: 8px;
  }

  .el-dialog__header {
    padding: 14px 16px 8px;
  }

  .el-dialog__body {
    padding: 12px 16px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .el-dialog__footer {
    padding: 8px 16px 14px;
  }

  .el-drawer {
    width: 100vw !important;
    max-width: 100vw !important;
  }

  .el-drawer__header {
    padding: 14px 16px 0;
    margin-bottom: 8px;
  }

  .el-drawer__body {
    padding: 12px 16px;
  }

  /* ============================================ */
  /* TemplatePickerDialog                         */
  /* ============================================ */
  .template-grid {
    grid-template-columns: 1fr !important;
  }

  .template-card {
    padding: 10px !important;
    gap: 10px !important;
  }

  .template-card__thumb {
    width: 60px !important;
    height: 46px !important;
  }

  /* ============================================ */
  /* ArticlePreviewDrawer                         */
  /* ============================================ */
  .preview__wechat-frame {
    min-height: 360px !important;
  }

  .preview-mode-tabs {
    margin-bottom: 12px !important;
  }

  .preview__body img {
    max-width: 100% !important;
    height: auto !important;
  }
}
</style>
