<template>
  <div class="traffic-data ignore-vw">
    <div class="traffic-container">
      <section v-if="showTitle || isWeChatPlatform" class="mobile-panel header-panel">
        <div v-if="showTitle" class="card-header">
          <span class="card-title">流量数据</span>
        </div>
        <div v-if="isWeChatPlatform" class="note-box">
          <van-icon name="info-o" class="title-icon" />
          <div class="note-copy">
            <div>2025-11-01 之前的历史数据需手动导入。</div>
            <div>2025-11-01 之后的部分分享来源微信接口不再提供完整统计。</div>
            <div>同步范围支持 2025-11-01 之后至当前日期前一天。</div>
          </div>
        </div>
      </section>

      <section class="mobile-panel tab-panel">
        <div class="top-tab-scroll">
          <div class="top-tab-row">
            <button
              type="button"
              :class="['top-tab-chip', { active: activeTab === 'summary' }]"
              @click="activeTab = 'summary'"
            >
              流量汇总分析
            </button>
            <button
              type="button"
              :class="['top-tab-chip', { active: activeTab === 'source' }]"
              @click="activeTab = 'source'"
            >
              流量来源分析
            </button>
          </div>
        </div>

        <div class="tab-content">
          <Summary v-if="activeTab === 'summary'" />
          <Source v-else />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Summary from './Summary.vue'
import Source from './Source.vue'
import useMediaProductStore from '@/store/modules/mediaProduct'

const props = defineProps({
  showTitle: {
    type: Boolean,
    default: true
  }
})

const mediaProductStore = useMediaProductStore()
const isWeChatPlatform = computed(() => mediaProductStore.channelId === 1)
const activeTab = ref('summary')
</script>

<style scoped>
.ignore-vw.traffic-data {
  min-height: 100%;
  background: #f4f7fb;
}

.ignore-vw .traffic-container {
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

.ignore-vw .card-title {
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

.ignore-vw .note-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ignore-vw .top-tab-scroll {
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.ignore-vw .top-tab-scroll::-webkit-scrollbar {
  display: none;
}

.ignore-vw .top-tab-row {
  display: inline-flex;
  gap: 10px;
  min-width: 100%;
}

.ignore-vw .top-tab-chip {
  flex-shrink: 0;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid #dbe4f0;
  border-radius: 999px;
  background: #f7f9fd;
  color: #6c7890;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.ignore-vw .top-tab-chip.active {
  border-color: #b6cbff;
  background: #eef4ff;
  color: #386ff6;
}

.ignore-vw .tab-content {
  margin-top: 14px;
}
</style>
