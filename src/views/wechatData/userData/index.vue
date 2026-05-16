/** * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司 *This project is licensed under the MIT
License - see the LICENSE file in the project root for details. **/
<template>
  <div class="user-data">
    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept=".xlsx,.xls"
      style="display: none"
      @change="handleFileChange"
    />
    <div class="user-data-container">
      <div class="card-header">
        <span v-if="showTitle" class="card-title">用户数据管理</span>
      </div>

      <!-- 微信平台数据来源说明 -->
      <div v-if="isWeChatPlatform" class="note-card">
        <div class="note-content">
          <div class="note-header">
            <el-icon class="title-icon"><WarningFilled /></el-icon>
            <span class="note-title">数据来源说明：</span>
          </div>
          <div class="note-items">
            <div class="note-item">• 数据来源为2025.11.01日之前的历史数据，微信官方不再维护，若需统计2025.11.01日之前的数据，请手动导入。</div>
            <div class="note-item">• 根据微信官方接口能力，2025.11.01之后的每个渠道的分享人数不再做统计</div>
            <div class="note-item">• 数据同步总体范围支持同步2025.11.01日之后到当前日期前一天的数据</div>
          </div>
        </div>
      </div>

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
        <!-- <div class="button-wrapper">
          <el-button type="primary" @click="importData">数据导入</el-button>
        </div> -->
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
      <el-table :data="userDataList" style="width: 100%" stripe>
        <el-table-column prop="time" label="时间"></el-table-column>
        <el-table-column prop="newFollowers" label="新关注人数"></el-table-column>
        <el-table-column prop="unfollowers" label="取消关注人数"></el-table-column>
        <el-table-column prop="netFollowers" label="净增关注人数"></el-table-column>
        <el-table-column prop="totalFollowers" label="累计关注人数"></el-table-column>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import settings from '@/settings'
import { downloadTemplate as downloadTemplateApi, importExcel, getUserDataList, exportUserDataExcel } from '@/api/wechatData/userData'
import { saveAs } from 'file-saver'
import { blobValidate } from '@/utils/tianxun'
import useMediaProductStore from '@/store/modules/mediaProduct'

const props = defineProps({
  showTitle: {
    type: Boolean,
    default: true,
  },
});

const router = useRouter();

// 使用媒体产品store
const mediaProductStore = useMediaProductStore();

// 是否为微信平台（channelId 为 1）
const isWeChatPlatform = computed(() => {
  return mediaProductStore.channelId === 1
})

// 计算昨天的日期
const yesterday = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

// 文件输入引用
const fileInput = ref(null);

const isIntranet = computed(() => {
  return settings.env === 'intranet';
});

// 用户数据列表
const userDataList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 筛选相关
const dateRange = ref([]);

// 获取用户数据列表
const fetchUserDataList = async () => {
  try {
    // 构建查询参数（分页）
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    };

    // 构建请求体（时间范围）
    const data = {};
    if (dateRange.value && dateRange.value.length === 2) {
      data.startTime = dateRange.value[0];
      data.endTime = dateRange.value[1];
    }
    
    // 添加账号ID参数
    if (mediaProductStore.accountId) {
      data.accountId = mediaProductStore.accountId
    }

    const response = await getUserDataList(data, params);

    if (response.code === 200) {
      const data = response.rows
      userDataList.value = data.map(item => ({
        time: item.refDate,
        newFollowers: item.newUser,
        unfollowers: item.cancelUser,
        netFollowers: item.netNewUser,
        totalFollowers: item.accumulatedUser
      }))
      total.value = response.total
    } else {
      ElMessage.error('获取数据失败');
    }
  } catch (error) {
    console.error('获取用户数据失败:', error)
    
  }
};

// 生命周期
onMounted(() => {
  fetchUserDataList();
});

const search = () => {
  currentPage.value = 1;
  fetchUserDataList();
};

const reset = () => {
  dateRange.value = [];
  currentPage.value = 1;
  fetchUserDataList();
};

// 下载数据模板
const downloadTemplate = () => {
  downloadTemplateApi()
    .then((response) => {
      const isBlob = blobValidate(response);
      if (isBlob) {
        const blob = new Blob([response]);
        saveAs(blob, '用户数据模板.xlsx');
      } else {
        console.error('返回的数据不是Blob格式:', response);
      }
    })
    .catch((error) => {
      console.error('下载模板失败:', error);
    });
};

// 数据导入
const importData = () => {
  // 触发文件选择
  fileInput.value.click();
};

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const formData = new FormData()
    formData.append('file', file)
    
    // 添加账号ID参数
    if (mediaProductStore.accountId) {
      formData.append('accountId', mediaProductStore.accountId)
    }
    
    importExcel(formData).then(response => {
      ElMessage.success('数据导入成功！')
      // 可以在这里添加刷新数据的逻辑
    }).catch(error => {
      
      console.error('导入数据失败:', error)
    })
    // 重置文件输入，以便可以选择同一个文件
    event.target.value = '';
  }
};

// 数据导出
const exportData = () => {
  // 构建请求体
  const data = {};

  // 添加时间范围参数
  if (dateRange.value && dateRange.value.length === 2) {
    data.startTime = dateRange.value[0];
    data.endTime = dateRange.value[1];
  }
  
  // 添加账号ID参数
  if (mediaProductStore.accountId) {
    data.accountId = mediaProductStore.accountId
  }

  // 调用导出接口
  exportUserDataExcel(data).then(response => {
    const isBlob = blobValidate(response)
    if (isBlob) {
      const blob = new Blob([response])
      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileName = `用户数据_${timestamp}.xlsx`
      saveAs(blob, fileName)
      ElMessage.success('数据导出成功！')
    } else {
      console.error('返回的数据不是Blob格式:', response)
      
    }
  }).catch(error => {
    console.error('导出数据失败:', error)
    
  })
}

// 查看图表
const viewChart = () => {
  router.push('/dashboard/wechatBoard');
};

// 图表制作
const createChart = () => {
  window.open('http://localhost:7777', '_blank');
};

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchUserDataList();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchUserDataList();
};
</script>

<style scoped>
.user-data {
  min-height: 100%;
}

.user-data-container {
  padding: 20px;
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

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  /* margin-bottom: 20px; */
}

.card-title {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.title-icon {
  font-size: 14px;
  color: #909399;
}

.note-card {
  margin-bottom: 20px;
}

.note-content {
  gap: 12px;
  padding: 12px 16px;
  background-color: #f0f9ff;
  border: 1px solid #e1f5fe;
  border-radius: 4px;
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
  font-size: 14px;
}

.note-item:last-child {
  margin-bottom: 0;
}

.note-text {
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
}
</style>
