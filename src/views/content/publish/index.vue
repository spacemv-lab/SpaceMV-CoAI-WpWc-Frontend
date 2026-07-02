<template>
  <div class="content-page" v-loading="loading">
    <div class="page-header">
      <h3 class="page-title">发布记录</h3>
    </div>

    <div class="filter-panel">
      <el-form :model="queryParams" inline size="small">
        <el-form-item label="文章标题">
          <el-input v-model="queryParams.articleTitle" placeholder="文章标题" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="发布目标">
          <el-select v-model="queryParams.targetCode" placeholder="发布目标" clearable popper-class="wide-popper">
            <el-option label="全部" value="" />
            <el-option v-for="(v, k) in TARGET_CODE_MAP" :key="k" :label="v.label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="发布状态" clearable popper-class="wide-popper">
            <el-option label="全部" value="" />
            <el-option v-for="(v, k) in PUBLISH_STATUS" :key="k" :label="v.label" :value="k" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="queryParams.operatorName" placeholder="操作人" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="timeRange"
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

    <el-table :data="jobList" stripe v-loading="loading">
      <el-table-column prop="id" label="任务ID" width="80" />
      <el-table-column prop="articleTitle" label="文章标题" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <el-link 
            type="primary" 
            :underline="false" 
            :class="{ 'article-deleted': row.articleDelFlag === '1' }"
            @click="viewArticle(row)"
          >
            {{ row.articleTitle }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="文章状态" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.articleDelFlag === '1'" type="warning" size="small">文章已删除</el-tag>
          <el-tag v-else-if="row.articleStatus === 'DRAFT'" type="info" size="small">草稿</el-tag>
          <el-tag v-else-if="row.articleStatus === 'PUBLISHED'" type="success" size="small">已发布</el-tag>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="targetCode" label="发布目标" width="160">
        <template #default="{ row }">
          <el-tag :type="(TARGET_CODE_MAP[row.targetCode] || {}).type || 'info'" size="small">
            {{ (TARGET_CODE_MAP[row.targetCode] || {}).label || row.targetCode }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="(PUBLISH_STATUS[row.status] || {}).type || 'info'" size="small">
            {{ (PUBLISH_STATUS[row.status] || {}).label || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="外部 URL" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="row.targetCode === 'WECHAT_OFFICIAL_ACCOUNT' && row.status === 'PROCESSING'" class="text-muted">发布中...</span>
          <span v-else-if="row.targetCode === 'WECHAT_OFFICIAL_ACCOUNT' && row.externalUrl" class="link-text" @click="openUrl(row.externalUrl)">{{ row.externalUrl }}</span>
          <span v-else-if="row.siteUrl || row.canonicalUrl || row.articleSlug" class="link-text" @click="openUrl(getArticleLink(row))">{{ getArticleLink(row) }}</span>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="operatorName" label="操作人" width="100" />
      <el-table-column label="发布时间" width="170">
        <template #default="{ row }">{{ (row.finishedAt || row.startedAt) ? parseTime(row.finishedAt || row.startedAt) : '-' }}</template>
      </el-table-column>
      <el-table-column prop="errorMessage" label="失败原因" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">{{ row.errorMessage || '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 'FAILED'" size="small" type="warning" @click="editArticle(row)">
            编辑
          </el-button>
          <el-button v-else size="small" :disabled="row.articleDelFlag === '1'" @click="viewArticle(row)">
            {{ row.articleDelFlag === '1' ? '文章已删除' : '查看文章' }}
          </el-button>
          <el-button size="small" @click="handlePreview(row)">预览</el-button>
          <el-button size="small" @click="viewDetail(row)">详情</el-button>
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

    <el-dialog v-model="detailDialogVisible" title="发布任务详情" width="640px">
      <div v-if="detailData" class="detail-info">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="任务ID">{{ detailData.id }}</el-descriptions-item>
          <el-descriptions-item label="文章ID">{{ detailData.articleId }}</el-descriptions-item>
          <el-descriptions-item label="文章标题">{{ detailData.articleTitle }}</el-descriptions-item>
          <el-descriptions-item label="发布目标">
            <el-tag :type="(TARGET_CODE_MAP[detailData.targetCode] || {}).type || 'info'" size="small">
              {{ (TARGET_CODE_MAP[detailData.targetCode] || {}).label || detailData.targetCode }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="(PUBLISH_STATUS[detailData.status] || {}).type || 'info'" size="small">
              {{ (PUBLISH_STATUS[detailData.status] || {}).label || detailData.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="站内 URL">{{ detailData.siteUrl || '-' }}</el-descriptions-item>
          <el-descriptions-item label="外部 URL">{{ detailData.externalUrl || '-' }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ detailData.operatorName }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ detailData.startedAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ detailData.finishedAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="失败原因">{{ detailData.errorMessage || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(detailData.createTime) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div v-else>
        <el-empty description="暂无数据" />
      </div>
    </el-dialog>

    <ArticlePreviewDrawer v-model="previewVisible" :article="previewArticle" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { listPublishJobs, getPublishJob } from '@/api/content/publish'
import { getArticle } from '@/api/content/article'
import { buildWendaoSiteUrl, getPublishArticleSiteUrl } from '@/utils/wendaoSite'
import { PUBLISH_STATUS, TARGET_CODE_MAP } from '../article/constants'
import ArticlePreviewDrawer from '../article/components/ArticlePreviewDrawer.vue'
import { parseTime } from '@/utils/tianxun'

const loading = ref(false)
const jobList = ref([])
const total = ref(0)

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  articleTitle: '',
  targetCode: '',
  status: '',
  operatorName: '',
  beginTime: '',
  endTime: ''
})

const timeRange = ref([])

watch(timeRange, (val) => {
  if (val && val.length === 2) {
    queryParams.value.beginTime = val[0]
    queryParams.value.endTime = val[1]
  } else {
    queryParams.value.beginTime = ''
    queryParams.value.endTime = ''
  }
})

const detailDialogVisible = ref(false)
const detailData = ref(null)

const fetchList = async () => {
  loading.value = true
  try {
    const res = await listPublishJobs(queryParams.value)
    if (res.code === 200) {
      jobList.value = res.rows || []
      total.value = res.total || 0
    } else {
      ElMessage.error(res.msg || '获取发布记录失败')
    }
  } catch {
    ElMessage.error('获取发布记录失败')
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
    articleTitle: '',
    targetCode: '',
    status: '',
    operatorName: '',
    beginTime: '',
    endTime: ''
  }
  timeRange.value = []
  fetchList()
}

const router = useRouter()
const previewVisible = ref(false)
const previewArticle = ref(null)

const getArticleLink = (row) => {
  return getPublishArticleSiteUrl(row)
}

const viewArticle = (row) => {
  const url = getPublishArticleSiteUrl(row)
  if (url) window.open(url, '_blank')
}

const editArticle = (row) => {
  router.push('/contentCenter/article/edit?id=' + row.articleId)
}

const handlePreview = async (row) => {
  try {
    const res = await getArticle(row.articleId)
    if (res.code === 200 && res.data) {
      previewArticle.value = res.data
    } else {
      previewArticle.value = { id: row.articleId, title: row.articleTitle, slug: row.articleSlug }
    }
  } catch {
    previewArticle.value = { id: row.articleId, title: row.articleTitle, slug: row.articleSlug }
  }
  previewVisible.value = true
}

const viewDetail = async (row) => {
  try {
    const res = await getPublishJob(row.id)
    if (res.code === 200 && res.data) {
      detailData.value = res.data
    } else {
      ElMessage.error(res.msg || '获取任务详情失败')
    }
  } catch {
    ElMessage.error('获取任务详情失败')
  }
  detailDialogVisible.value = true
}

const openUrl = (url) => {
  const siteUrl = buildWendaoSiteUrl(url)
  if (siteUrl) window.open(siteUrl, '_blank')
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

.link-text {
  color: #409EFF;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.text-muted {
  font-size: 13px;
  color: #c0c4cc;
}

.detail-info {
  &__title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
  }

  &__json {
    background: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 12px;
    font-size: 12px;
    line-height: 1.5;
    overflow-x: auto;
    max-height: 300px;
  }
}

.article-deleted {
  text-decoration: line-through;
  color: #999 !important;
}
</style>
