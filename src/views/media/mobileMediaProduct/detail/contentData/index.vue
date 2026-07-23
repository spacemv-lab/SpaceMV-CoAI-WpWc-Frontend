<template>
  <div class="content-data ignore-vw">
    <div class="content-data-container">
      <section class="mobile-panel header-panel">
        <div class="card-header">
          <span v-if="showTitle" class="card-title">内容数据管理</span>
        </div>
        <div v-if="isWeChatPlatform" class="note-box">
          <van-icon name="info-o" class="title-icon" />
          <span>根据微信官方接口能力，仅统计文章发表后 30 天内的数据，统计时间上限为 2025-11-01。</span>
        </div>
      </section>

      <section class="mobile-panel filter-panel">
        <div class="panel-title">筛选条件</div>
        <div class="filter-grid">
          <div class="filter-item">
            <span class="filter-label">内容标题</span>
            <van-field v-model="titleFilter" placeholder="请输入内容标题" clearable />
          </div>
          <div class="filter-item">
            <span class="filter-label">时间范围</span>
            <van-field
              :model-value="dateRangeText"
              placeholder="请选择时间范围"
              readonly
              is-link
              @click="showDatePicker = true"
            />
          </div>
        </div>
        <div class="filter-actions">
          <van-button round block type="primary" @click="search">查询</van-button>
          <van-button round block plain type="primary" @click="reset">重置</van-button>
        </div>
      </section>

      <section class="mobile-panel action-panel">
        <div class="action-grid">
          <van-button round type="primary" @click="exportData">数据导出</van-button>
          <van-button round plain type="primary" @click="viewChart">查看图表</van-button>
          <van-button v-if="isIntranet" round plain type="primary" @click="createChart">图表制作</van-button>
        </div>
      </section>

      <section class="mobile-panel list-panel">
        <div class="panel-title">数据列表</div>
        <div v-if="contentDataList.length" class="mobile-list">
          <article v-for="(item, index) in contentDataList" :key="`${item.title}-${index}`" class="list-card">
            <div class="list-card-head">
              <div class="list-card-title">{{ item.title }}</div>
              <van-button size="small" plain type="primary" @click="viewArticle(item)">查看</van-button>
            </div>
            <div class="meta-grid">
              <div class="meta-block">
                <span class="meta-name">发布时间</span>
                <span class="meta-value">{{ item.createTime || '-' }}</span>
              </div>
              <div class="meta-block">
                <span class="meta-name">统计区间</span>
                <span class="meta-value">{{ item.createTime || '-' }} 至 {{ item.latestStatDate || '-' }}</span>
              </div>
              <div class="meta-block">
                <span class="meta-name">阅读人数</span>
                <span class="meta-value">{{ item.readUserTotal ?? 0 }}</span>
              </div>
              <div class="meta-block">
                <span class="meta-name">分享人数</span>
                <span class="meta-value">{{ item.shareUser ?? 0 }}</span>
              </div>
            </div>
          </article>
        </div>
        <div v-else class="empty-text">暂无数据</div>

        <div v-if="total > 0" class="pager-wrap">
          <div class="pager-info">
            <span>共 {{ total }} 条</span>
            <button type="button" class="page-size-trigger" @click="showPageSizeSheet = true">每页 {{ pageSize }} 条</button>
          </div>
          <van-pagination
            v-model="currentPage"
            :total-items="total"
            :items-per-page="pageSize"
            mode="simple"
            @change="onPageChange"
          />
        </div>
      </section>
    </div>

    <van-calendar
      v-model:show="showDatePicker"
      type="range"
      :min-date="calendarMinDate"
      :max-date="calendarMaxDate"
      teleport="body"
      :style="{ height: 'min(78vh, 560px)' }"
      @confirm="onDateConfirm"
    />
    <van-action-sheet v-model:show="showPageSizeSheet" :actions="pageSizeActions" cancel-text="取消" @select="onPageSizeSelect" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import settings from '@/settings'
import { getContentDataList, exportContentDataExcel } from '@/api/wechatData/contentData'
import { saveAs } from 'file-saver'
import { blobValidate } from '@/utils/tianxun'
import useMediaProductStore from '@/store/modules/mediaProduct'

const props = defineProps({
  showTitle: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const mediaProductStore = useMediaProductStore()

const isWeChatPlatform = computed(() => mediaProductStore.channelId === 1)
const isIntranet = computed(() => settings.env === 'intranet')

const contentDataList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const titleFilter = ref('')
const dateRange = ref([])
const showDatePicker = ref(false)
const showPageSizeSheet = ref(false)
const calendarMinDate = new Date(2020, 0, 1)
const calendarMaxDate = new Date()

const pageSizeActions = [5, 10, 15, 20, 50, 100].map((size) => ({
  name: `每页 ${size} 条`,
  value: size
}))

const dateRangeText = computed(() => {
  if (!dateRange.value?.length) return ''
  if (dateRange.value.length === 1) return dateRange.value[0]
  return `${dateRange.value[0]} 至 ${dateRange.value[1]}`
})

const formatDate = (value) => {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const fetchContentDataList = async () => {
  try {
    const data = {
      title: titleFilter.value
    }

    if (mediaProductStore.accountId) {
      data.accountId = mediaProductStore.accountId
    }

    if (dateRange.value?.length === 2) {
      data.startTime = dateRange.value[0]
      data.endTime = dateRange.value[1]
    }

    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }

    const response = await getContentDataList(data, params)
    if (response.code !== 200) {
      showToast('获取数据失败')
      return
    }

    contentDataList.value = (response.rows || []).map((item) => ({
      title: item.title,
      author: item.author,
      createTime: item.createTime,
      readUserTotal: item.readUserTotal,
      shareUser: item.shareUser,
      url: item.url,
      latestStatDate: item.latestStatDate
    }))
    total.value = response.total || 0
  } catch (error) {
    console.error('获取内容数据失败:', error)
    showToast('获取数据失败')
  }
}

onMounted(() => {
  fetchContentDataList()
})

const search = () => {
  currentPage.value = 1
  fetchContentDataList()
}

const reset = () => {
  titleFilter.value = ''
  dateRange.value = []
  currentPage.value = 1
  fetchContentDataList()
}

const onDateConfirm = (values) => {
  const selected = Array.isArray(values) ? values : [values]
  dateRange.value = selected.map((item) => formatDate(item))
  showDatePicker.value = false
}

const onPageChange = (page) => {
  currentPage.value = page
  fetchContentDataList()
}

const onPageSizeSelect = (action) => {
  pageSize.value = action.value
  currentPage.value = 1
  showPageSizeSheet.value = false
  fetchContentDataList()
}

const viewArticle = (row) => {
  if (row.url) {
    window.open(row.url, '_blank')
  }
}

const exportData = () => {
  const data = {
    title: titleFilter.value
  }

  if (dateRange.value?.length === 2) {
    data.startTime = dateRange.value[0]
    data.endTime = dateRange.value[1]
  }

  if (mediaProductStore.accountId) {
    data.accountId = mediaProductStore.accountId
  }

  exportContentDataExcel(data)
    .then((response) => {
      const isBlob = blobValidate(response)
      if (!isBlob) {
        console.error('返回的数据不是 Blob 格式:', response)
        return
      }
      const blob = new Blob([response])
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      saveAs(blob, `内容数据_${timestamp}.xlsx`)
      showToast('数据导出成功')
    })
    .catch((error) => {
      console.error('导出内容数据失败:', error)
      showToast('导出失败')
    })
}

const viewChart = () => {
  router.push('/dashboard/wechatBoard')
}

const createChart = () => {
  window.open('http://exzample:7777', '_blank')
}
</script>

<style scoped>
.ignore-vw.content-data {
  min-height: 100%;
  background: #f4f7fb;
}

.ignore-vw .content-data-container {
  padding: 12px 12px calc(env(safe-area-inset-bottom, 0px) + 28px);
}

.ignore-vw .mobile-panel {
  margin-bottom: 12px;
  padding: 14px;
  background: #ffffff;
  border: 1px solid #e7ecf5;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(66, 88, 122, 0.06);
}

.ignore-vw .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.ignore-vw .card-title,
.ignore-vw .panel-title {
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: #25324a;
}

.ignore-vw .note-box {
  margin-top: 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: #f7faff;
  border: 1px solid #d9e6ff;
  border-radius: 12px;
  font-size: 13px;
  line-height: 20px;
  color: #5e6b85;
}

.ignore-vw .title-icon {
  margin-top: 2px;
  font-size: 15px;
  color: #4c84ff;
}

.ignore-vw .filter-grid {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.ignore-vw .filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ignore-vw .filter-label {
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: #5e6b85;
}

.ignore-vw .filter-panel :deep(.van-field) {
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #dde5f0;
  border-radius: 12px;
}

.ignore-vw .filter-panel :deep(.van-field__control),
.ignore-vw .filter-panel :deep(.van-field__value) {
  font-size: 14px;
  color: #25324a;
}

.ignore-vw .filter-actions,
.ignore-vw .action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.ignore-vw .action-grid:has(button:nth-child(3)) {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.ignore-vw .filter-actions :deep(.van-button),
.ignore-vw .action-grid :deep(.van-button) {
  height: 40px;
  font-size: 14px;
  font-weight: 600;
}

.ignore-vw .mobile-list {
  margin-top: 12px;
}

.ignore-vw .list-card {
  padding: 14px;
  border: 1px solid #e6ebf3;
  border-radius: 14px;
  background: #fbfcff;
}

.ignore-vw .list-card + .list-card {
  margin-top: 10px;
}

.ignore-vw .list-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.ignore-vw .list-card-title {
  flex: 1;
  font-size: 15px;
  line-height: 22px;
  font-weight: 700;
  color: #25324a;
  word-break: break-word;
}

.ignore-vw .list-card-head :deep(.van-button) {
  flex-shrink: 0;
  min-width: 60px;
  height: 32px;
}

.ignore-vw .meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ignore-vw .meta-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.ignore-vw .meta-name {
  font-size: 12px;
  line-height: 16px;
  color: #7b879c;
}

.ignore-vw .meta-value {
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: #25324a;
  word-break: break-word;
}

.ignore-vw .empty-text {
  padding: 28px 0 12px;
  text-align: center;
  font-size: 14px;
  line-height: 20px;
  color: #7b879c;
}

.ignore-vw .pager-wrap {
  margin-top: 14px;
  padding: 14px 0 8px;
  border-top: 1px solid #edf1f6;
}

.ignore-vw .pager-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 13px;
  color: #6b778c;
}

.ignore-vw .page-size-trigger {
  padding: 0;
  border: none;
  background: transparent;
  color: #3f7cff;
  font-size: 13px;
}

.ignore-vw .pager-wrap :deep(.van-pagination__item) {
  min-width: 44px;
  height: 36px;
  font-size: 14px;
}

.ignore-vw :deep(.van-calendar) {
  width: min(100vw, 520px);
  max-width: 100vw;
  height: min(78vh, 560px);
  max-height: 78vh;
  border-radius: 18px 18px 0 0;
}

.ignore-vw :deep(.van-calendar__body) {
  height: calc(min(78vh, 560px) - 96px);
  max-height: calc(78vh - 96px);
  overflow-y: auto;
  padding-bottom: calc(env(safe-area-inset-bottom) + 12px);
  box-sizing: border-box;
}

.ignore-vw :deep(.van-calendar__content) {
  padding-bottom: calc(env(safe-area-inset-bottom) + 12px);
}

.ignore-vw :deep(.van-calendar__header) {
  flex-shrink: 0;
}

.ignore-vw :deep(.van-calendar__popup.van-popup--bottom) {
  max-height: 82vh;
}

@media (max-width: 360px) {
  .ignore-vw :deep(.van-calendar) {
    height: min(82vh, 600px);
    max-height: 82vh;
  }

  .ignore-vw :deep(.van-calendar__body) {
    height: calc(min(82vh, 600px) - 96px);
    max-height: calc(82vh - 96px);
  }

  .ignore-vw .filter-actions,
  .ignore-vw .action-grid,
  .ignore-vw .meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
