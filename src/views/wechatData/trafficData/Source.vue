/** * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司 *This project is licensed under the MIT
License - see the LICENSE file in the project root for details. **/
<template>
  <div class="traffic-source">
    <!-- 操作按钮区域 -->
    <div class="action-buttons">
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
    <el-table :data="sourceData" style="width: 100%" stripe>
      <el-table-column prop="channel" label="渠道"></el-table-column>
      <el-table-column prop="readUser" label="阅读人数"></el-table-column>
      <el-table-column prop="proportion" label="占比">
        <template #default="scope">
          {{ scope.row.proportion }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import settings from '@/settings';
import { getFlowSourceList, exportFlowSourceExcel } from '@/api/wechatdata/trafficData';
import { saveAs } from 'file-saver';
import { blobValidate } from '@/utils/tianxun';
import useMediaProductStore from '@/store/modules/mediaProduct';

const router = useRouter();

// 使用媒体产品store
const mediaProductStore = useMediaProductStore();

const isIntranet = computed(() => {
  return settings.env === 'intranet';
});

const sourceData = ref([]);

// 获取流量来源数据
const fetchFlowSourceData = async () => {
  // 构建请求参数
  const params = {}
  
  // 添加账号ID参数
  if (mediaProductStore.accountId) {
    params.accountId = mediaProductStore.accountId
  }
  
  const response = await getFlowSourceList(params)
  if (response.code === 200) {
    sourceData.value = response.data
  } else {
    ElMessage.error('获取数据失败')
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchFlowSourceData();
});

const exportData = () => {
  // 构建请求参数
  const params = {}
  
  // 添加账号ID参数
  if (mediaProductStore.accountId) {
    params.accountId = mediaProductStore.accountId
  }

  // 调用导出接口
  exportFlowSourceExcel(params).then(response => {
    const isBlob = blobValidate(response)
    if (isBlob) {
      const blob = new Blob([response])
      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `流量来源分析_${timestamp}.xlsx`
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
  router.push('/dashboard/wechatBoard');
};

const createChart = () => {
  window.open('http://localhost:7777', '_blank');
};
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

.note {
  position: absolute;
  top: 26px;
  left: 30px;
  margin-top: 10px;
  margin-left: 10px;
  width: 250px;
  min-height: 100px;
  padding: 12px;
  background-color: #fff9c4;
  border: 1px solid #ffeb3b;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.4;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  word-break: break-all;
  overflow-wrap: break-word;
}

.button-wrapper:hover .note {
  opacity: 1;
  visibility: visible;
}

.note::before {
  content: '';
  position: absolute;
  top: 10px;
  left: -8px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-right: 8px solid #fff9c4;
  border-bottom: 8px solid transparent;
}
</style>
