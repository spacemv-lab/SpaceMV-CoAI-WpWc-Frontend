/** * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司 *This project is licensed under the MIT
License - see the LICENSE file in the project root for details. **/
<template>
  <div class="stats-card">
    <div class="stat-value">{{ value }}</div>
    <div class="stat-name">{{ name }}</div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
});
</script>

<style scoped lang="scss">
.stats-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .stat-value {
    font-size: 50px;
    font-weight: bold;
    color: #36a2eb;
    margin-bottom: 10px;
  }

  .stat-name {
    font-size: 16px;
    color: #999;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .stats-card {
    flex: 0 0 calc(50% - 10px);
  }
}

@media (max-width: 768px) {
  .stats-card {
    flex: 0 0 100%;

    .stat-value {
      font-size: 36px;
    }

    .stat-name {
      font-size: 14px;
    }
  }
}
</style>
