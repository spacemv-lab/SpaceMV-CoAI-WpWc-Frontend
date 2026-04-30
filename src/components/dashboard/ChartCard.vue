/** * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司 *This project is licensed under the MIT
License - see the LICENSE file in the project root for details. **/
<template>
  <div class="chart-card">
    <div class="chart-title">{{ title }}</div>
    <div :ref="chartRef" class="chart-container" :style="{ height: height }"></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  chartRef: {
    type: Function,
    default: null,
  },
  height: {
    type: String,
    default: '300px',
  },
});
</script>

<style scoped lang="scss">
.chart-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  flex: 1;
  min-width: 0;

  .chart-title {
    font-size: 16px;
    color: #fff;
    margin-bottom: 15px;
  }

  .chart-container {
    width: 100%;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .chart-card {
    flex: 0 0 calc(50% - 10px);
  }
}

@media (max-width: 768px) {
  .chart-card {
    flex: 0 0 100%;

    .chart-container {
      height: 250px;
    }
  }
}

@media (max-width: 480px) {
  .chart-card {
    .chart-container {
      height: 200px;
    }
  }
}
</style>
