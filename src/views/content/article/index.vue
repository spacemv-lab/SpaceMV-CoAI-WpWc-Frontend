<template>
  <div class="content-page" v-loading="loading">
    <div class="page-header">
      <h3 class="page-title">问道文章</h3>
      <div class="page-header__actions">
        <el-button v-if="auth.hasPermi('content:article:add')" @click="handleCreateFromTemplate">
          从模板创建
        </el-button>
        <el-button type="primary" v-if="auth.hasPermi('content:article:add')" @click="handleCreate">
          新建文章
        </el-button>
      </div>
    </div>

    <div class="filter-panel">
      <el-form :model="queryParams" inline size="small">
        <el-form-item label="标题">
          <el-input v-model="queryParams.title" placeholder="标题关键词" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="Slug">
          <el-input v-model="queryParams.slug" placeholder="slug" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="文章状态" clearable popper-class="wide-popper">
            <el-option label="全部" value="" />
            <el-option v-for="(v, k) in ARTICLE_STATUS" :key="k" :label="v.label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="可见性">
          <el-select v-model="queryParams.visibility" placeholder="可见性" clearable popper-class="wide-popper">
            <el-option label="全部" value="" />
            <el-option v-for="(v, k) in VISIBILITY" :key="k" :label="v.label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="publishDateRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="articleList" stripe v-loading="loading">
      <el-table-column prop="title" label="标题" min-width="260" show-overflow-tooltip />
      <el-table-column prop="slug" label="Slug" width="220">
        <template #default="{ row }">
          <code class="slug-text">{{ row.slug }}</code>
        </template>
      </el-table-column>
      <el-table-column prop="summary" label="摘要" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="(ARTICLE_STATUS[row.status] || {}).type || 'info'" size="small">
            {{ (ARTICLE_STATUS[row.status] || {}).label || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="visibility" label="可见性" width="90">
        <template #default="{ row }">
          <el-tag :type="(VISIBILITY[row.visibility] || {}).type || 'info'" size="small">
            {{ (VISIBILITY[row.visibility] || {}).label || row.visibility }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isPaid" label="付费" width="60">
        <template #default="{ row }">
          {{ row.isPaid === '1' ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="170" sortable prop="updateTime">
        <template #default="{ row }">
          {{ row.updateTime ? parseTime(row.updateTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="发布时间" width="170">
        <template #default="{ row }">
          {{ row.publishedAt ? parseTime(row.publishedAt) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="发布状态" width="180">
        <template #default="{ row }">
          <div class="publish-status-list">
            <el-tag v-if="row.publishStatus?.WECHAT_OFFICIAL_ACCOUNT === 'SUCCESS'" type="success" size="small">微信✅</el-tag>
            <el-tag v-else-if="row.publishStatus?.WECHAT_OFFICIAL_ACCOUNT === 'FAILED'" type="danger" size="small">微信❌</el-tag>
            <el-tag v-else-if="row.publishStatus?.WECHAT_OFFICIAL_ACCOUNT" type="warning" size="small">微信⏳</el-tag>

            <el-tag v-if="row.publishStatus?.SITE_WENDAO === 'SUCCESS'" type="success" size="small">问道✅</el-tag>
            <el-tag v-else-if="row.publishStatus?.SITE_WENDAO === 'FAILED'" type="danger" size="small">问道❌</el-tag>
            <el-tag v-else-if="row.publishStatus?.SITE_WENDAO" type="warning" size="small">问道⏳</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" v-if="canEditArticle(row)" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" @click="handlePreview(row)">预览</el-button>
          <el-button type="success" size="small" v-if="row.status !== 'PUBLISHED'" @click="handlePublish(row)">发布</el-button>
          <el-button type="success" size="small" v-if="row.status === 'PUBLISHED'" @click="handleView(row)">查看</el-button>
          <el-button type="danger" size="small" v-if="auth.hasPermi('content:article:delete')" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </div>

    <ArticlePreviewDrawer v-model="previewVisible" :article="previewArticle" />

    <TemplatePickerDialog v-model="templatePickerVisible" @select="onTemplateSelect" />

    <el-dialog v-model="publishDialogVisible" title="发布确认" width="520px" @open="onPublishDialogOpen">
      <div class="publish-confirm">
        <div class="publish-confirm__item">
          <span class="publish-confirm__label">发布目标：</span>
          <div class="publish-confirm__targets">
            <el-checkbox v-model="targetSiteWendao" :disabled="isTargetDisabled('SITE_WENDAO')">
              SpaceMV问道
            </el-checkbox>
            <el-checkbox v-model="targetWechat" :disabled="isTargetDisabled('WECHAT_OFFICIAL_ACCOUNT')">
              微信公众号
            </el-checkbox>
          </div>
        </div>
        <div v-if="targetWechat" class="publish-confirm__item">
          <span class="publish-confirm__label">公众号账号：</span>
          <el-select v-model="selectedAccountId" placeholder="请选择微信公众号账号" size="small" style="width: 260px">
            <el-option v-for="acc in wechatAccounts" :key="acc.id" :label="acc.accountName" :value="acc.id" />
          </el-select>
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
      </div>
      <template #footer>
        <el-button @click="publishDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="publishing" :disabled="!hasAnyTarget" @click="confirmPublish">确认发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listArticles, deleteArticle, publishToMultiPlatform, getArticle, listPublishRecords } from '@/api/content/article'
import { getMediaProductList } from '@/api/media/mediaProduct/index'
import auth from '@/plugins/auth'
import { getArticleSiteUrl } from '@/utils/wendaoSite'
import { ARTICLE_STATUS, VISIBILITY } from './constants'
import ArticlePreviewDrawer from './components/ArticlePreviewDrawer.vue'
import TemplatePickerDialog from './components/TemplatePickerDialog.vue'
import { parseTime } from '@/utils/tianxun'

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

const publishDateRange = ref([])

watch(publishDateRange, (val) => {
  if (val && val.length === 2) {
    queryParams.value.beginPublishedAt = val[0]
    queryParams.value.endPublishedAt = val[1]
  } else {
    queryParams.value.beginPublishedAt = ''
    queryParams.value.endPublishedAt = ''
  }
})

const previewVisible = ref(false)
const previewArticle = ref(null)
const templatePickerVisible = ref(false)

const publishDialogVisible = ref(false)
const publishTarget = ref(null)
const publishing = ref(false)

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
      ElMessage.error(res.msg || '获取文章列表失败')
    }
  } catch (e) {
    ElMessage.error('获取文章列表失败')
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
  publishDateRange.value = []
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
    ElMessage.warning('未获取到文章ID')
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
  const charts = detail.contentHtml ? detail.contentHtml.match(chartRegex) : []
  detail.chartCount = charts ? charts.length : 0

  const mapRegex = /\{\{map:([a-zA-Z0-9-_]+)\}\}/g
  const maps = detail.contentHtml ? detail.contentHtml.match(mapRegex) : []
  detail.mapCount = maps ? maps.length : 0

  publishTarget.value = detail
  publishDialogVisible.value = true
}

const confirmPublish = async () => {
  if (!publishTarget.value?.id) return
  const targets = []
  if (targetSiteWendao.value) {
    targets.push({ targetCode: 'SITE_WENDAO' })
  }
  if (targetWechat.value) {
    if (!selectedAccountId.value) {
      ElMessage.warning('请选择微信公众号账号')
      return
    }
    targets.push({ targetCode: 'WECHAT_OFFICIAL_ACCOUNT', accountId: selectedAccountId.value })
  }
  if (targets.length === 0) return

  publishing.value = true
  try {
    const res = await publishToMultiPlatform(publishTarget.value.id, targets)
    if (res.code === 200) {
      ElMessage.success('发布成功')
      publishDialogVisible.value = false
      fetchList()
    } else {
      ElMessage.error(res.msg || '发布失败')
    }
  } catch (e) {
    ElMessage.error('发布失败')
  } finally {
    publishing.value = false
  }
}

const handleView = (row) => {
  const url = getArticleSiteUrl(row)
  if (url) window.open(url, '_blank')
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除文章《${row.title}》吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteArticle(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchList()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch {
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="scss">
.content-page {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .page-title {
    font-size: 18px;
    font-weight: bold;
    color: var(--el-text-color-primary);
    margin: 0;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }
}

.filter-panel {
  padding: 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 16px;

  :deep(.el-select) {
    width: 130px;
  }
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.slug-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.publish-confirm {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:global(.wide-popper) {
  min-width: 140px !important;
}

.publish-confirm {
  &__targets {
    display: inline-flex;
    gap: 16px;
    align-items: center;
  }

  code {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    background: #f5f7fa;
    padding: 1px 4px;
    border-radius: 3px;
  }
}

.publish-status-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
