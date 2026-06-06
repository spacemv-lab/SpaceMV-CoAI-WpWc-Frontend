<template>
  <div class="traffic-source ignore-vw">
    <section class="mobile-panel action-panel">
      <div class="action-grid">
        <van-button round type="primary" @click="exportData">数据导出</van-button>
        <van-button round plain type="primary" @click="viewChart">查看图表</van-button>
        <van-button v-if="isIntranet" round plain type="primary" @click="createChart">图表制作</van-button>
      </div>
    </section>

    <section class="mobile-panel list-panel">
      <div class="panel-title">来源列表</div>
      <div v-if="sourceData.length" class="mobile-list">
        <article v-for="(item, index) in sourceData" :key="`${item.channel}-${index}`" class="list-card">
          <div class="list-card-title">{{ item.channel || '-' }}</div>
          <div class="metric-grid">
            <div class="metric-block">
              <span class="metric-name">阅读人数</span>
              <span class="metric-value">{{ item.readUser ?? 0 }}</span>
            </div>
            <div class="metric-block">
              <span class="metric-name">占比</span>
              <span class="metric-value">{{ item.proportion || '-' }}</span>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="empty-text">暂无数据</div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import settings from '@/settings'
import { getFlowSourceList, exportFlowSourceExcel } from '@/api/wechatdata/trafficData'
import { saveAs } from 'file-saver'
import { blobValidate } from '@/utils/tianxun'
import useMediaProductStore from '@/store/modules/mediaProduct'

const router = useRouter()
const mediaProductStore = useMediaProductStore()

const isIntranet = computed(() => settings.env === 'intranet')
const sourceData = ref([])

const fetchFlowSourceData = async () => {
  try {
    const params = {}
    if (mediaProductStore.accountId) {
      params.accountId = mediaProductStore.accountId
    }

    const response = await getFlowSourceList(params)
    if (response.code !== 200) {
      showToast('获取数据失败')
      return
    }

    sourceData.value = response.data || []
  } catch (error) {
    console.error('获取流量来源数据失败:', error)
    showToast('获取数据失败')
  }
}

onMounted(() => {
  fetchFlowSourceData()
})

const exportData = () => {
  const params = {}
  if (mediaProductStore.accountId) {
    params.accountId = mediaProductStore.accountId
  }

  exportFlowSourceExcel(params)
    .then((response) => {
      const isBlob = blobValidate(response)
      if (!isBlob) {
        console.error('返回的数据不是 Blob 格式:', response)
        return
      }
      const blob = new Blob([response])
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      saveAs(blob, `流量来源分析_${timestamp}.xlsx`)
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
.ignore-vw.traffic-source {
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

.ignore-vw .action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

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

@media (max-width: 360px) {
  .ignore-vw .action-grid,
  .ignore-vw .metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
