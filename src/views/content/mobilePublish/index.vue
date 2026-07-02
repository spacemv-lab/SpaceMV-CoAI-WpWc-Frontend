/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
  <div class="mobile-publish-container ignore-vw" v-loading="loading">
    <div class="mobile-page-header">
      <h1 class="mobile-page-title">发布记录</h1>
    </div>

    <!-- 筛选区 -->
    <section class="mobile-panel filter-panel">
      <div class="selector-row">
        <div class="selector-label">
          <span class="label-text">关键词</span>
        </div>
        <div class="filter-fields">
          <van-field
            v-model="queryParams.articleTitle"
            placeholder="文章标题"
            clearable
            size="small"
            class="filter-field"
            @keyup.enter="handleQuery"
          />
          <van-field
            v-model="queryParams.operatorName"
            placeholder="操作人"
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
            <van-dropdown-item v-model="queryParams.targetCode" :options="targetOptions" @change="handleQuery" />
            <van-dropdown-item v-model="queryParams.status" :options="publishStatusOptions" @change="handleQuery" />
          </van-dropdown-menu>
          <van-button size="small" plain type="primary" @click="handleReset" class="reset-btn">重置</van-button>
        </div>
      </div>
    </section>

    <!-- 列表区 -->
    <section class="mobile-panel list-panel">
      <div class="panel-title">发布记录</div>
      <div v-if="jobList.length" class="mobile-list">
        <article v-for="row in jobList" :key="row.id" class="list-card">
          <div class="list-card-head">
            <div class="list-card-head-left">
              <span class="list-card-id">#{{ row.id }}</span>
              <el-tag round effect="light" :type="(PUBLISH_STATUS[row.status] || {}).type || 'info'" size="small">
                {{ (PUBLISH_STATUS[row.status] || {}).label || row.status }}
              </el-tag>
              <el-tag round effect="plain" :type="(TARGET_CODE_MAP[row.targetCode] || {}).type || 'info'" size="small">
                {{ (TARGET_CODE_MAP[row.targetCode] || {}).label || row.targetCode }}
              </el-tag>
              <el-tag v-if="row.articleDelFlag === '1'" round effect="plain" type="warning" size="small">
                文章已删除
              </el-tag>
              <el-tag v-else-if="row.articleStatus === 'DRAFT'" round effect="plain" type="info" size="small">
                草稿
              </el-tag>
              <el-tag v-else-if="row.articleStatus === 'PUBLISHED'" round effect="plain" type="success" size="small">
                已发布
              </el-tag>
            </div>
          </div>

          <div class="list-card-title van-ellipsis" :class="{ 'article-deleted': row.articleDelFlag === '1' }" @click="viewArticle(row)">
            <el-link type="primary" :underline="false">{{ row.articleTitle || '-' }}</el-link>
          </div>

          <div class="meta-grid">
            <div class="meta-block">
              <span class="meta-name">操作人</span>
              <span class="meta-value">{{ row.operatorName || '-' }}</span>
            </div>
            <div class="meta-block">
              <span class="meta-name">站内 URL</span>
              <span v-if="row.siteUrl || row.canonicalUrl" class="meta-value link" @click="openUrl(row.siteUrl || row.canonicalUrl)">查看</span>
              <span v-else class="meta-value">-</span>
            </div>
            <div v-if="row.targetCode === 'WECHAT_OFFICIAL_ACCOUNT'" class="meta-block">
              <span class="meta-name">微信链接</span>
              <span v-if="row.status === 'PROCESSING'" class="meta-value">发布中...</span>
              <span v-else-if="row.externalUrl" class="meta-value link" @click="openUrl(row.externalUrl)">查看</span>
              <span v-else class="meta-value">-</span>
            </div>
            <div class="meta-block">
              <span class="meta-name">开始时间</span>
              <span class="meta-value">{{ row.startedAt || '-' }}</span>
            </div>
            <div class="meta-block">
              <span class="meta-name">结束时间</span>
              <span class="meta-value">{{ row.finishedAt || '-' }}</span>
            </div>
          </div>

          <p v-if="row.errorMessage" class="error-message">{{ row.errorMessage }}</p>

          <div class="list-card-action">
            <van-button 
              size="small" 
              round 
              plain 
              type="primary" 
              :disabled="row.articleDelFlag === '1'" 
              @click="viewArticle(row)"
            >
              {{ row.articleDelFlag === '1' ? '文章已删除' : '查看文章' }}
            </van-button>
            <van-button size="small" round plain type="default" @click="viewDetail(row)">查看详情</van-button>
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

    <!-- 详情弹窗 -->
    <van-dialog v-model:show="detailDialogVisible" title="发布任务详情" class="detail-dialog">
      <div v-if="detailData" class="detail-info">
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-item__label">任务ID</span>
            <span class="detail-item__value">{{ detailData.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label">文章ID</span>
            <span class="detail-item__value">{{ detailData.articleId }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label">文章标题</span>
            <span class="detail-item__value">{{ detailData.articleTitle }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label">发布目标</span>
            <el-tag :type="(TARGET_CODE_MAP[detailData.targetCode] || {}).type || 'info'" size="small">
              {{ (TARGET_CODE_MAP[detailData.targetCode] || {}).label || detailData.targetCode }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="detail-item__label">状态</span>
            <el-tag :type="(PUBLISH_STATUS[detailData.status] || {}).type || 'info'" size="small">
              {{ (PUBLISH_STATUS[detailData.status] || {}).label || detailData.status }}
            </el-tag>
          </div>
          <div class="detail-item">
            <span class="detail-item__label">操作人</span>
            <span class="detail-item__value">{{ detailData.operatorName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label">开始时间</span>
            <span class="detail-item__value">{{ detailData.startedAt || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label">结束时间</span>
            <span class="detail-item__value">{{ detailData.finishedAt || '-' }}</span>
          </div>
          <div class="detail-item" v-if="detailData.errorMessage">
            <span class="detail-item__label">失败原因</span>
            <span class="detail-item__value error">{{ detailData.errorMessage }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section__title">发布结果 JSON</div>
          <pre v-if="detailResultJson" class="detail-json">{{ detailResultJson }}</pre>
          <span v-else class="empty-text">暂无结果数据</span>
        </div>
      </div>
      <div v-else>
        <div class="empty-text">暂无数据</div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { listPublishJobs, getPublishJob, listPublishResults } from '@/api/content/publish'
import { buildWendaoSiteUrl, getPublishArticleSiteUrl } from '@/utils/wendaoSite'
import { PUBLISH_STATUS, TARGET_CODE_MAP } from '../article/constants'

defineOptions({
  name: 'MobileContentPublish'
})

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

const targetOptions = [
  { text: '全部目标', value: '' },
  ...Object.entries(TARGET_CODE_MAP).map(([k, v]) => ({ text: v.label, value: k }))
]

const publishStatusOptions = [
  { text: '全部状态', value: '' },
  ...Object.entries(PUBLISH_STATUS).map(([k, v]) => ({ text: v.label, value: k }))
]

const detailDialogVisible = ref(false)
const detailData = ref(null)
const detailResultJson = ref('')

const fetchList = async () => {
  loading.value = true
  try {
    const res = await listPublishJobs(queryParams.value)
    if (res.code === 200) {
      jobList.value = res.rows || []
      total.value = res.total || 0
    } else {
      showToast(res.msg || '获取发布记录失败')
    }
  } catch {
    showToast('获取发布记录失败')
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
  fetchList()
}

const handleCurrentChange = (page) => {
  queryParams.value.pageNum = page
  fetchList()
}

const viewArticle = (row) => {
  const url = getPublishArticleSiteUrl(row)
  if (url) window.open(url, '_blank')
}

const viewDetail = async (row) => {
  try {
    const res = await getPublishJob(row.id)
    if (res.code === 200 && res.data) {
      detailData.value = res.data

      let resultJsonStr = ''
      try {
        const resultsRes = await listPublishResults({ jobId: row.id })
        if (resultsRes.code === 200 && resultsRes.rows?.length > 0) {
          resultJsonStr = resultsRes.rows[0].resultJson || ''
        }
      } catch {}

      try {
        detailResultJson.value = resultJsonStr ? JSON.stringify(JSON.parse(resultJsonStr), null, 2) : ''
      } catch {
        detailResultJson.value = resultJsonStr
      }
    } else {
      showToast(res.msg || '获取任务详情失败')
    }
  } catch {
    showToast('获取任务详情失败')
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
$text-main: #25324a;
$text-sub: #7b879c;
$text-light: #7b879c;
$brand: #5f7cf0;

.ignore-vw.mobile-publish-container {
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
    font-size: 16px;
    line-height: 1.5;
    font-weight: 700;
    color: $text-main;
    margin-bottom: 10px;
    cursor: pointer;
    word-break: break-word;
  }
}

.ignore-vw .list-card-title.article-deleted {
  text-decoration: line-through;
  color: #999;

  :deep(.el-link) {
    color: #999;
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

  &.link {
    color: $brand;
    cursor: pointer;
    text-decoration: none;
  }
}

.ignore-vw .error-message {
  font-size: 12px;
  line-height: 16px;
  color: #e74c3c;
  background: #fef0ef;
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 10px;
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

/* 详情弹窗 */
.ignore-vw .detail-dialog {
  :deep(.van-dialog__content) {
    max-height: 60vh;
    overflow-y: auto;
  }
}

.ignore-vw .detail-info {
  padding: 16px;
}

.ignore-vw .detail-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ignore-vw .detail-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;

  &__label {
    color: $text-sub;
    white-space: nowrap;
    min-width: 60px;
  }

  &__value {
    color: $text-main;
    word-break: break-all;

    &.error {
      color: #e74c3c;
    }
  }
}

.ignore-vw .detail-section {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e7ecf5;

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: $text-main;
    margin-bottom: 8px;
  }
}

.ignore-vw .detail-json {
  background: #f5f7fa;
  border: 1px solid #e7ecf5;
  border-radius: 8px;
  padding: 12px;
  font-size: 11px;
  line-height: 1.5;
  overflow-x: auto;
  max-height: 200px;
  font-family: monospace;
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
  .ignore-vw.mobile-publish-container {
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
