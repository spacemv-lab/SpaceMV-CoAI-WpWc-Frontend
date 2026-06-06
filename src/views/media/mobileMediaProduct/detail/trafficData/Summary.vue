<template>
  <div class="traffic-summary ignore-vw">
    <input ref="fileInput" type="file" accept=".xlsx, .xls" style="display: none" @change="handleFileChange" />

    <section class="mobile-panel filter-panel">
      <div class="panel-title">筛选条件</div>
      <div class="filter-grid">
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
        <van-button round type="primary" @click="downloadTemplate">模板下载</van-button>
        <van-button round plain type="primary" @click="importData">数据导入</van-button>
        <van-button round plain type="primary" @click="exportData">数据导出</van-button>
        <van-button round plain type="primary" @click="viewChart">查看图表</van-button>
        <van-button v-if="isIntranet" round plain type="primary" @click="createChart">图表制作</van-button>
      </div>
    </section>

    <section class="mobile-panel list-panel">
      <div class="panel-title">汇总列表</div>
      <div v-if="trafficList.length" class="mobile-list">
        <article v-for="(item, index) in trafficList" :key="`${item.date}-${index}`" class="list-card">
          <div class="list-card-title">{{ item.date }}</div>
          <div class="metric-grid">
            <div class="metric-block">
              <span class="metric-name">阅读人数</span>
              <span class="metric-value">{{ item.readCount ?? 0 }}</span>
            </div>
            <div class="metric-block">
              <span class="metric-name">分享人数</span>
              <span class="metric-value">{{ item.shareCount ?? 0 }}</span>
            </div>
            <div class="metric-block">
              <span class="metric-name">收藏人数</span>
              <span class="metric-value">{{ item.collectCount ?? 0 }}</span>
            </div>
            <div class="metric-block">
              <span class="metric-name">公众号消息</span>
              <span class="metric-value">{{ item.readUserSourceMsg ?? 0 }}</span>
            </div>
            <div class="metric-block">
              <span class="metric-name">推荐</span>
              <span class="metric-value">{{ item.readUserSourceRecommend ?? 0 }}</span>
            </div>
            <div class="metric-block">
              <span class="metric-name">公众号主页</span>
              <span class="metric-value">{{ item.readUserSourceHomepage ?? 0 }}</span>
            </div>
            <div class="metric-block">
              <span class="metric-name">聊天会话</span>
              <span class="metric-value">{{ item.readUserSourceChat ?? 0 }}</span>
            </div>
            <div class="metric-block">
              <span class="metric-name">朋友圈</span>
              <span class="metric-value">{{ item.readUserSourceMoments ?? 0 }}</span>
            </div>
            <div class="metric-block">
              <span class="metric-name">搜一搜</span>
              <span class="metric-value">{{ item.readUserSourceSearch ?? 0 }}</span>
            </div>
            <div class="metric-block">
              <span class="metric-name">其他</span>
              <span class="metric-value">{{ item.readUserSourceOther ?? 0 }}</span>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import settings from '@/settings'
import { getTrafficDataList, downloadTemplate as downloadTemplateApi, importExcel, exportFlowDataExcel } from '@/api/wechatData/trafficData'
import { saveAs } from 'file-saver'
import { blobValidate } from '@/utils/tianxun'
import useMediaProductStore from '@/store/modules/mediaProduct'

const router = useRouter()
const mediaProductStore = useMediaProductStore()
const fileInput = ref(null)

const isIntranet = computed(() => settings.env === 'intranet')
const trafficList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
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

const fetchTrafficDataList = async () => {
  try {
    const data = {}
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

    const response = await getTrafficDataList(data, params)
    if (response.code !== 200) {
      showToast('获取数据失败')
      return
    }

    trafficList.value = (response.rows || []).map((item) => ({
      date: item.ref_date,
      readCount: item.read_user_total,
      shareCount: item.share_user,
      collectCount: item.collection_user,
      readUserSourceMsg: item.read_user_source_msg,
      readUserSourceChat: item.read_user_source_chat,
      readUserSourceMoments: item.read_user_source_moments,
      readUserSourceHomepage: item.read_user_source_homepage,
      readUserSourceOther: item.read_user_source_other,
      readUserSourceRecommend: item.read_user_source_recommend,
      readUserSourceSearch: item.read_user_source_search
    }))
    total.value = response.total || 0
  } catch (error) {
    console.error('获取流量数据失败:', error)
    showToast('获取数据失败')
  }
}

onMounted(() => {
  fetchTrafficDataList()
})

const search = () => {
  currentPage.value = 1
  fetchTrafficDataList()
}

const reset = () => {
  dateRange.value = []
  currentPage.value = 1
  fetchTrafficDataList()
}

const onDateConfirm = (values) => {
  const selected = Array.isArray(values) ? values : [values]
  dateRange.value = selected.map((item) => formatDate(item))
  showDatePicker.value = false
}

const onPageChange = (page) => {
  currentPage.value = page
  fetchTrafficDataList()
}

const onPageSizeSelect = (action) => {
  pageSize.value = action.value
  currentPage.value = 1
  showPageSizeSheet.value = false
  fetchTrafficDataList()
}

const downloadTemplate = () => {
  downloadTemplateApi()
    .then((response) => {
      const isBlob = blobValidate(response)
      if (!isBlob) {
        console.error('返回的数据不是 Blob 格式:', response)
        return
      }
      saveAs(new Blob([response]), '流量数据模板.xlsx')
    })
    .catch((error) => {
      console.error('下载模板失败:', error)
      showToast('下载模板失败')
    })
}

const importData = () => {
  fileInput.value?.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)
  if (mediaProductStore.accountId) {
    formData.append('accountId', mediaProductStore.accountId)
  }

  importExcel(formData)
    .then(() => {
      showToast('数据导入成功')
      fetchTrafficDataList()
    })
    .catch((error) => {
      console.error('导入数据失败:', error)
      showToast('导入失败')
    })

  event.target.value = ''
}

const exportData = () => {
  const data = {}
  if (mediaProductStore.accountId) {
    data.accountId = mediaProductStore.accountId
  }
  if (dateRange.value?.length === 2) {
    data.startTime = dateRange.value[0]
    data.endTime = dateRange.value[1]
  }

  exportFlowDataExcel(data)
    .then((response) => {
      const isBlob = blobValidate(response)
      if (!isBlob) {
        console.error('返回的数据不是 Blob 格式:', response)
        return
      }
      const blob = new Blob([response])
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      saveAs(blob, `流量数据_${timestamp}.xlsx`)
      showToast('数据导出成功')
    })
    .catch((error) => {
      console.error('导出数据失败:', error)
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
.ignore-vw.traffic-summary {
  background: transparent;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 20px);
}

.ignore-vw .mobile-panel {
  margin-bottom: 12px;
  padding: 14px;
  background: #ffffff;
  border: 1px solid #e7ecf5;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(66, 88, 122, 0.06);
}

.ignore-vw .panel-title {
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: #25324a;
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

.ignore-vw .list-card-title {
  margin-bottom: 12px;
  font-size: 15px;
  line-height: 22px;
  font-weight: 700;
  color: #25324a;
}

.ignore-vw .metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ignore-vw .metric-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: #f7f9fd;
  border-radius: 12px;
}

.ignore-vw .metric-name {
  font-size: 12px;
  line-height: 16px;
  color: #7b879c;
}

.ignore-vw .metric-value {
  font-size: 15px;
  line-height: 21px;
  font-weight: 700;
  color: #25324a;
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
  height: min(78vh, 560px) !important;
  max-height: min(78vh, 560px) !important;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  overflow: hidden;
}

.ignore-vw :deep(.van-calendar__body) {
  height: calc(min(78vh, 560px) - 96px) !important;
  max-height: calc(min(78vh, 560px) - 96px) !important;
  overflow-y: auto;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px);
  box-sizing: border-box;
}

.ignore-vw :deep(.van-calendar__content) {
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px);
}

.ignore-vw :deep(.van-calendar__header) {
  flex-shrink: 0;
}

.ignore-vw :deep(.van-calendar__popup.van-popup--bottom) {
  max-height: min(78vh, 560px);
}

@media (max-width: 360px) {
  .ignore-vw .filter-actions,
  .ignore-vw .action-grid,
  .ignore-vw .metric-grid {
    grid-template-columns: 1fr;
  }

  .ignore-vw :deep(.van-calendar) {
    height: min(82vh, 520px) !important;
    max-height: min(82vh, 520px) !important;
  }

  .ignore-vw :deep(.van-calendar__body) {
    height: calc(min(82vh, 520px) - 96px) !important;
    max-height: calc(min(82vh, 520px) - 96px) !important;
  }
}
</style>
