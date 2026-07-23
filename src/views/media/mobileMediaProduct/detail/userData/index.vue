<template>
  <div class="user-data ignore-vw">
    <input ref="fileInput" type="file" accept=".xlsx,.xls" style="display: none" @change="handleFileChange" />

    <div class="user-data-container">
      <section class="mobile-panel header-panel">
        <div class="card-header">
          <span v-if="showTitle" class="card-title">用户数据管理</span>
        </div>
        <div v-if="isWeChatPlatform" class="note-box">
          <van-icon name="info-o" class="title-icon" />
          <span>数据来源说明：2025-11-01 之前历史数据需手动导入，接口同步仅支持 2025-11-01 之后到当前日期前一天的数据。</span>
        </div>
      </section>

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
          <!-- <van-button round type="primary" @click="downloadTemplate">模板下载</van-button> -->
          <van-button round plain type="primary" @click="exportData">数据导出</van-button>
          <van-button round plain type="primary" @click="viewChart">查看图表</van-button>
          <van-button v-if="isIntranet" round plain type="primary" @click="createChart">图表制作</van-button>
        </div>
      </section>

      <section class="mobile-panel list-panel">
        <div class="panel-title">数据列表</div>
        <div v-if="userDataList.length" class="mobile-list">
          <article v-for="(item, index) in userDataList" :key="`${item.time}-${index}`" class="list-card">
            <div class="list-card-title">{{ item.time }}</div>
            <div class="metric-grid">
              <div class="metric-block">
                <span class="metric-name">新增关注</span>
                <span class="metric-value">{{ item.newFollowers ?? 0 }}</span>
              </div>
              <div class="metric-block">
                <span class="metric-name">取消关注</span>
                <span class="metric-value">{{ item.unfollowers ?? 0 }}</span>
              </div>
              <div class="metric-block">
                <span class="metric-name">净增关注</span>
                <span :class="['metric-value', item.netFollowers >= 0 ? 'positive' : 'negative']">{{ item.netFollowers ?? 0 }}</span>
              </div>
              <div class="metric-block">
                <span class="metric-name">累计关注</span>
                <span class="metric-value">{{ item.totalFollowers ?? 0 }}</span>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import settings from '@/settings'
import { downloadTemplate as downloadTemplateApi, importExcel, getUserDataList, exportUserDataExcel } from '@/api/wechatData/userData'
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
const fileInput = ref(null)

const isWeChatPlatform = computed(() => mediaProductStore.channelId === 1)
const isIntranet = computed(() => settings.env === 'intranet')

const userDataList = ref([])
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

const fetchUserDataList = async () => {
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }

    const data = {}
    if (dateRange.value?.length === 2) {
      data.startTime = dateRange.value[0]
      data.endTime = dateRange.value[1]
    }

    if (mediaProductStore.accountId) {
      data.accountId = mediaProductStore.accountId
    }

    const response = await getUserDataList(data, params)
    if (response.code !== 200) {
      showToast('获取数据失败')
      return
    }

    userDataList.value = (response.rows || []).map((item) => ({
      time: item.refDate,
      newFollowers: item.newUser,
      unfollowers: item.cancelUser,
      netFollowers: item.netNewUser,
      totalFollowers: item.accumulatedUser
    }))
    total.value = response.total || 0
  } catch (error) {
    console.error('获取用户数据失败:', error)
    showToast('获取数据失败')
  }
}

onMounted(() => {
  fetchUserDataList()
})

const search = () => {
  currentPage.value = 1
  fetchUserDataList()
}

const reset = () => {
  dateRange.value = []
  currentPage.value = 1
  fetchUserDataList()
}

const onDateConfirm = (values) => {
  const selected = Array.isArray(values) ? values : [values]
  dateRange.value = selected.map((item) => formatDate(item))
  showDatePicker.value = false
}

const onPageChange = (page) => {
  currentPage.value = page
  fetchUserDataList()
}

const onPageSizeSelect = (action) => {
  pageSize.value = action.value
  currentPage.value = 1
  showPageSizeSheet.value = false
  fetchUserDataList()
}

const downloadTemplate = () => {
  downloadTemplateApi()
    .then((response) => {
      const isBlob = blobValidate(response)
      if (!isBlob) {
        console.error('返回的数据不是 Blob 格式:', response)
        return
      }
      saveAs(new Blob([response]), '用户数据模板.xlsx')
    })
    .catch((error) => {
      console.error('下载模板失败:', error)
      showToast('下载模板失败')
    })
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
      fetchUserDataList()
    })
    .catch((error) => {
      console.error('导入数据失败:', error)
      showToast('导入失败')
    })

  event.target.value = ''
}

const exportData = () => {
  const data = {}

  if (dateRange.value?.length === 2) {
    data.startTime = dateRange.value[0]
    data.endTime = dateRange.value[1]
  }

  if (mediaProductStore.accountId) {
    data.accountId = mediaProductStore.accountId
  }

  exportUserDataExcel(data)
    .then((response) => {
      const isBlob = blobValidate(response)
      if (!isBlob) {
        console.error('返回的数据不是 Blob 格式:', response)
        return
      }
      const blob = new Blob([response])
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      saveAs(blob, `用户数据_${timestamp}.xlsx`)
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
.ignore-vw.user-data {
  min-height: 100%;
  background: #f4f7fb;
}

.ignore-vw .user-data-container {
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
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: #25324a;
}

.ignore-vw .positive {
  color: #18a058;
}

.ignore-vw .negative {
  color: #d14343;
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
  .ignore-vw .metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
