<template>
  <div class="gender-distribution">
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
    <el-table :data="genderData" style="width: 100%" stripe>
      <el-table-column type="index" label="序号" width="60"></el-table-column>
      <el-table-column prop="gender" label="性别"></el-table-column>
      <el-table-column prop="userCount" label="用户数"></el-table-column>
      <el-table-column prop="percentage" label="占比"></el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import settings from '@/settings'
import { downloadTemplate as downloadTemplateApi, importExcel, getGenderDataList, exportGenderDataExcel } from '@/api/wechatData/userProfile'
import { saveAs } from 'file-saver'
import { blobValidate } from '@/utils/tianxun'
import useMediaProductStore from '@/store/modules/mediaProduct'

const router = useRouter()

// 使用媒体产品store
const mediaProductStore = useMediaProductStore()

// 文件输入引用
const fileInput = ref(null)

const isIntranet = computed(() => {
  return settings.env === 'intranet'
})

// 性别分布数据
const genderData = ref([])

// 获取性别分布数据
const fetchGenderData = async () => {
  try {
    // 构建请求参数
    const params = {}
    
    // 添加账号ID参数
    if (mediaProductStore.accountId) {
      params.accountId = mediaProductStore.accountId
    }
    
    const response = await getGenderDataList(params)
    
    if (response.code === 200) {
      genderData.value = response.data.map(item => ({
        gender: item.sex,
        userCount: item.userNumber,
        percentage: item.proportion
      }))
    } else {
      ElMessage.error('获取数据失败')
    }
  } catch (error) {
    console.error('获取性别分布数据失败:', error)
    
  }
}

// 生命周期
onMounted(() => {
  fetchGenderData()
})

const downloadTemplate = () => {
  downloadTemplateApi().then(response => {
    const isBlob = blobValidate(response)
    if (isBlob) {
      const blob = new Blob([response])
      saveAs(blob, '性别分布模板.xlsx')
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
    
    // 添加账号ID参数
    if (mediaProductStore.accountId) {
      formData.append('accountId', mediaProductStore.accountId)
    }
    
    importExcel(formData).then(response => {
      ElMessage.success('数据导入成功！')
      // 刷新数据
      fetchGenderData()
    }).catch(error => {
      
      console.error('导入数据失败:', error)
    })
    // 重置文件输入，以便可以选择同一个文件
    event.target.value = ''
  }
}

// 数据导出
const exportData = () => {
  // 构建请求参数
  const params = {}
  
  // 添加账号ID参数
  if (mediaProductStore.accountId) {
    params.accountId = mediaProductStore.accountId
  }
  
  // 调用导出接口
  exportGenderDataExcel(params).then(response => {
    const isBlob = blobValidate(response)
    if (isBlob) {
      const blob = new Blob([response])
      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `性别分布数据_${timestamp}.xlsx`
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
</script>

<style scoped>
.action-buttons {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.button-wrapper {
  position: relative;
  display: inline-block;
}
</style>
