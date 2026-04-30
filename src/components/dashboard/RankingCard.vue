/** * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司 *This project is licensed under the MIT
License - see the LICENSE file in the project root for details. **/
<template>
  <div class="ranking-card">
    <div class="chart-title">{{ title }}</div>
    <div class="ranking-container" :style="{ height: height }">
      <div v-for="(item, index) in data" :key="index" class="ranking-item">
        <div class="ranking-number">{{ index + 1 }}</div>
        <div class="ranking-title">{{ item.title }}</div>
        <div class="ranking-count">{{ item.count }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  data: {
    type: Array,
    default: () => [],
  },
  height: {
    type: String,
    default: '300px',
  },
});
</script>

<style scoped lang="scss">
.ranking-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  flex: 2;
  min-width: 0;

  .chart-title {
    font-size: 16px;
    color: #fff;
    margin-bottom: 15px;
  }

  .ranking-container {
    width: 100%;
    overflow-y: auto;
    /* 隐藏滚动条但仍然可以滚动 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */

    /* 隐藏滚动条 - Chrome, Safari and Opera */
    &::-webkit-scrollbar {
      display: none;
    }

    .ranking-item {
      display: flex;
      align-items: center;
      padding: 12px 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);

      .ranking-number {
        font-size: 12px;
        font-weight: bold;
        color: #000;
        margin-right: 12px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background-color: #ffd700;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ranking-title {
        flex: 1;
        font-size: 14px;
        color: #999;
        margin-right: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .ranking-count {
        font-size: 14px;
        color: #36a2eb;
        font-weight: 500;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .ranking-card {
    flex: 0 0 100%;
  }
}

@media (max-width: 768px) {
  .ranking-card {
    .chart-title {
      font-size: 14px;
    }

    .ranking-container {
      height: 250px;

      .ranking-item {
        padding: 8px 10px;

        .ranking-number {
          font-size: 10px;
          width: 16px;
          height: 16px;
        }

        .ranking-title {
          font-size: 12px;
        }

        .ranking-count {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
