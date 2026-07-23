<template>
  <div class="traffic-summary">
    <!-- 筛选区域 -->
    <div class="filter-card">
      <div class="filter-container">
        <div class="filter-content">
          <div class="filter-item">
            <span class="filter-label">时间：</span>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY年MM月DD日"
              value-format="YYYY-MM-DD"
              class="date-picker"
            />
          </div>
        </div>
        <div class="filter-actions">
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-buttons">
      <div class="button-wrapper">
        <el-button type="primary" @click="downloadTemplate">模板下载</el-button>
      </div>
      <div class="button-wrapper">
        <el-button type="primary" @click="importData">数据导入</el-button>
      </div>
      <!-- 隐藏的文件输入 -->
      <input
        ref="fileInput"
        type="file"
        accept=".xlsx, .xls"
        style="display: none"
        @change="handleFileChange"
      />
      <div class="button-wrapper">
        <el-button type="primary" @click="exportData">数据导出</el-button>
      </div>
      <div class="button-wrapper">
        <el-button type="primary" @click="viewChart">查看图表</el-button>
      </div>
      <div class="button-wrapper" v-if="isIntranet">
        <el-button type="primary" @click="createChart">图表制作</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <el-table :data="trafficList" style="width: 100%" stripe :border="false">
      <el-table-column prop="date" label="日期" width="120"></el-table-column>
      <el-table-column prop="readCount" label="阅读人数" width="100"></el-table-column>
      <el-table-column prop="shareCount" label="分享人数" width="100"></el-table-column>
      <el-table-column prop="collectCount" label="收藏人数" width="100"></el-table-column>
      <el-table-column label="阅读渠道统计(人数)" align="center">
        <el-table-column prop="readUserSourceMsg" label="公众号消息" min-width="100"></el-table-column>
        <el-table-column prop="readUserSourceRecommend" label="推荐" min-width="80"></el-table-column>
        <el-table-column prop="readUserSourceHomepage" label="公众号主页" min-width="100"></el-table-column>
        <el-table-column prop="readUserSourceChat" label="聊天会话" min-width="100"></el-table-column>
        <el-table-column prop="readUserSourceMoments" label="朋友圈" min-width="100"></el-table-column>
        <el-table-column prop="readUserSourceOther" label="其他" min-width="80"></el-table-column>
        <el-table-column prop="readUserSourceSearch" label="搜一搜" min-width="100"></el-table-column>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 15, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import settings from '@/settings'
import { getTrafficDataList, downloadTemplate as downloadTemplateApi, importExcel, exportFlowDataExcel } from '@/api/wechatData/trafficData'
import { saveAs } from 'file-saver'
import { blobValidate } from '@/utils/tianxun'
import useMediaProductStore from '@/store/modules/mediaProduct'

const router = useRouter()

// 使用媒体产品store
const mediaProductStore = useMediaProductStore()

// 接收 props
const props = defineProps({
  showTitle: {
    type: Boolean,
    default: true
  }
})

// 文件输入引用
const fileInput = ref(null)

const isIntranet = computed(() => {
  return settings.env === 'intranet'
})

// 流量数据列表
const trafficList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const dateRange = ref([])

// 获取流量数据列表
const fetchTrafficDataList = async () => {
  try {
    // 构建请求体
    const data = {}
    
    // 添加产品ID和账号ID参数
    // if (mediaProductStore.productId) {
    //   data.productId = mediaProductStore.productId
    // }
    if (mediaProductStore.accountId) {
      data.accountId = mediaProductStore.accountId
    }
    
    // 添加时间范围参数
    if (dateRange.value && dateRange.value.length === 2) {
      data.startTime = dateRange.value[0]
      data.endTime = dateRange.value[1]
    }
    
    // 构建查询参数（分页）
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    
    const response = await getTrafficDataList(data, params)
    
    if (response.code === 200) {
      const data = response.rows
      trafficList.value = data.map(item => ({
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
      total.value = response.total
    } else {
      ElMessage.error('获取数据失败')
    }
  } catch (error) {
    console.error('获取流量数据失败:', error)
  }
}

// 生命周期
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

// 下载数据模板
const downloadTemplate = () => {
  downloadTemplateApi().then(response => {
    const isBlob = blobValidate(response)
    if (isBlob) {
      const blob = new Blob([response])
      saveAs(blob, '流量数据模板.xlsx')
    } else {
      console.error('返回的数据不是Blob格式:', response)
    }
  }).catch(error => {
    console.error('下载模板失败:', error)
  })
}

// 数据导入
const importData = () => {
  // 触发文件选择
  fileInput.value.click()
}

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const formData = new FormData()
    formData.append('file', file)
    
    if (mediaProductStore.accountId) {
      formData.append('accountId', mediaProductStore.accountId)
    }
    
    importExcel(formData).then(response => {
      ElMessage.success('数据导入成功！')
      // 刷新数据
      fetchTrafficDataList()
    }).catch(error => {
      
      console.error('导入数据失败:', error)
    })
    // 重置文件输入，以便可以选择同一个文件
    event.target.value = ''
  }
}

const uploadData = () => {
}

const exportData = () => {
  // 构建请求体
  const data = {}
  
  // 添加账号ID参数
  if (mediaProductStore.accountId) {
    data.accountId = mediaProductStore.accountId
  }
  
  // 添加时间范围参数
  if (dateRange.value && dateRange.value.length === 2) {
    data.startTime = dateRange.value[0]
    data.endTime = dateRange.value[1]
  }
  
  // 调用导出接口
  exportFlowDataExcel(data).then(response => {
    const isBlob = blobValidate(response)
    if (isBlob) {
      const blob = new Blob([response])
      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `流量数据_${timestamp}.xlsx`
      saveAs(blob, fileName)
      ElMessage.success('数据导出成功！')
    } else {
      console.error('返回的数据不是Blob格式:', response)
      
    }
  }).catch(error => {
    console.error('导出数据失败:', error)
    
  })
}

const viewChart = () => {
  router.push('/dashboard/wechatBoard')
}

const createChart = () => {
  if (!settings.chartStudioUrl) {
    ElMessage.warning('未配置图表制作地址')
    return
  }
  window.open(settings.chartStudioUrl, '_blank')
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchTrafficDataList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchTrafficDataList()
}
</script>

<style scoped>
.data-source-note {
  margin-bottom: 20px;
}

.note-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background-color: #f0f9ff;
  border: 1px solid #e1f5fe;
  border-radius: 4px;
}

.note-icon {
  color: #409eff;
  font-size: 18px;
  margin-top: 2px;
}

.note-content {
  flex: 1;
  line-height: 1.4;
  font-size: 14px;
}

.note-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.note-title {
  font-weight: 500;
  color: #303133;
  margin-left: 8px;
}

.note-items {
  margin-left: 0;
}

.note-item {
  margin-bottom: 6px;
  color: #606266;
}

.note-item:last-child {
  margin-bottom: 0;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;
}

.filter-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  margin-top: 4px;
  width: 80px;
}

.date-picker {
  width: 250px;
}

.filter-actions {
  width: 20%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 10px;
  align-items: flex-end;
}

.action-buttons {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.button-wrapper {
  position: relative;
  display: inline-block;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
}
</style>
