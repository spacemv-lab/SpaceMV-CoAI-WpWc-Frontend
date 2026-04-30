/** * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司 *This project is licensed under the MIT
License - see the LICENSE file in the project root for details. **/
<template>
  <div class="stat-card">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value">{{ value }}</div>
    <div class="stat-name">{{ name }}</div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
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
.stat-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  position: relative;
  flex: 0 0 calc(33.333% - 14px);
  display: flex;
  flex-direction: column;
  justify-content: center;

  .stat-label {
    font-size: 16px;
    color: #fff;
    margin-bottom: 10px;
  }

  .stat-value {
    font-size: 50px;
    font-weight: bold;
    color: #4facfe;
    margin-bottom: 10px;
    text-align: center;
  }

  .stat-name {
    font-size: 16px;
    color: #999;
    text-align: center;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .stat-card {
    flex: 0 0 100%;

    .stat-value {
      font-size: 36px;
    }

    .stat-label,
    .stat-name {
      font-size: 14px;
    }
  }
}
</style>
