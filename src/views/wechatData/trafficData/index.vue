/** * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司 *This project is licensed under the MIT
License - see the LICENSE file in the project root for details. **/
<template>
  <div class="traffic-data">
    <div class="traffic-container">
      <div v-if="showTitle" class="card-header">
        <span class="card-title">流量数据列表</span>
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

      <!-- Tab切换 -->
      <el-tabs v-model="activeTab" class="traffic-tabs">
        <!-- 流量汇总分析 -->
        <el-tab-pane label="流量汇总分析" name="summary">
          <Summary v-if="activeTab === 'summary'" />
        </el-tab-pane>

        <!-- 流量来源分析 -->
        <el-tab-pane label="流量来源分析" name="source">
          <Source v-if="activeTab === 'source'" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import Summary from './Summary.vue'
import Source from './Source.vue'
import useMediaProductStore from '@/store/modules/mediaProduct'

const props = defineProps({
  showTitle: {
    type: Boolean,
    default: true,
  },
});

const mediaProductStore = useMediaProductStore()

// 是否为微信平台（channelId 为 1）
const isWeChatPlatform = computed(() => {
  return mediaProductStore.channelId === 1
})

const activeTab = ref('summary')
</script>

<style scoped>
.traffic-data {
  min-height: 100%;
  position: relative;
}

.traffic-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-title {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.traffic-tabs :deep(.el-tabs__content) {
  margin-top: 20px;
}

.note-card {
  margin-bottom: 20px;
}

.note-content {
  /* display: flex;
  align-items: flex-start; */
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

.title-icon {
  font-size: 14px;
  color: #909399;
}
</style>
