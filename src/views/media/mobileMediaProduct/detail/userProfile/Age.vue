<template>
  <div class="profile-list-page ignore-vw">
    <input ref="fileInput" type="file" accept=".xlsx, .xls" style="display: none" @change="handleFileChange" />

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
      <div class="panel-title">年龄分布</div>
      <div v-if="ageData.length" class="mobile-list">
        <article v-for="(item, index) in ageData" :key="`${item.age}-${index}`" class="list-card">
          <div class="list-card-head">
            <div class="list-card-title">
              <span class="badge-index">{{ index + 1 }}</span>
              <span>{{ item.age || '-' }}</span>
            </div>
          </div>
          <div class="meta-grid">
            <div class="meta-block">
              <span class="meta-name">用户数</span>
              <span class="meta-value">{{ item.userCount ?? 0 }}</span>
            </div>
            <div class="meta-block">
              <span class="meta-name">占比</span>
              <span class="meta-value">{{ item.percentage || '-' }}</span>
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
import { downloadAgeTemplate, importAgeData, getAgeDataList, exportAgeDataExcel } from '@/api/wechatData/userProfile'
import { saveAs } from 'file-saver'
import { blobValidate } from '@/utils/tianxun'
import useMediaProductStore from '@/store/modules/mediaProduct'

const router = useRouter()
const mediaProductStore = useMediaProductStore()
const fileInput = ref(null)

const isIntranet = computed(() => settings.env === 'intranet')
const ageData = ref([])

const fetchAgeData = async () => {
  try {
    const params = {}
    if (mediaProductStore.accountId) {
      params.accountId = mediaProductStore.accountId
    }

    const response = await getAgeDataList(params)
    if (response.code !== 200) {
      showToast('获取数据失败')
      return
    }

    ageData.value = (response.data || []).map((item) => ({
      age: item.age,
      userCount: item.userNumber,
      percentage: item.proportion
    }))
  } catch (error) {
    console.error('获取年龄分布数据失败:', error)
    showToast('获取数据失败')
  }
}

// 数据加载由父组件控制

const downloadTemplate = () => {
  downloadAgeTemplate()
    .then((response) => {
      const isBlob = blobValidate(response)
      if (!isBlob) {
        console.error('返回的数据不是 Blob 格式:', response)
        return
      }
      saveAs(new Blob([response]), '年龄分布模板.xlsx')
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

  importAgeData(formData)
    .then(() => {
      showToast('数据导入成功')
      fetchAgeData()
    })
    .catch((error) => {
      console.error('导入数据失败:', error)
      showToast('导入失败')
    })

  event.target.value = ''
}

const exportData = () => {
  const params = {}
  if (mediaProductStore.accountId) {
    params.accountId = mediaProductStore.accountId
  }

  exportAgeDataExcel(params)
    .then((response) => {
      const isBlob = blobValidate(response)
      if (!isBlob) {
        console.error('返回的数据不是 Blob 格式:', response)
        return
      }
      const blob = new Blob([response])
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      saveAs(blob, `年龄分布数据_${timestamp}.xlsx`)
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

const refresh = () => {
  fetchAgeData()
}

defineExpose({ refresh })
</script>

<style scoped>
.ignore-vw.profile-list-page {
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

.ignore-vw .list-card-head {
  margin-bottom: 12px;
}

.ignore-vw .list-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  line-height: 22px;
  font-weight: 700;
  color: #25324a;
}

.ignore-vw .badge-index {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #eef3fb;
  color: #6d7b94;
  font-size: 12px;
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

@media (max-width: 360px) {
  .ignore-vw .action-grid,
  .ignore-vw .meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
