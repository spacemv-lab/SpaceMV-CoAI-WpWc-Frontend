<template>
  <div class="map-preview">
    <div class="map-preview__header">
      <span class="map-preview__slug">🗺️ {{ token }}</span>
    </div>
    <div class="map-preview__body">
      <template v-if="isMock">
        <span class="map-preview__emoji">🗺️</span>
        <span class="map-preview__text">地图占位（mock，待接入真实分享）</span>
      </template>
      <template v-else-if="loading">
        <span class="map-preview__text map-preview__text--muted">加载中...</span>
      </template>
      <template v-else-if="error">
        <span class="map-preview__text map-preview__text--error">{{ error }}</span>
      </template>
      <template v-else>
        <span class="map-preview__emoji">🗺️</span>
        <span class="map-preview__text">地图：{{ projectName }}</span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPublicShare } from '@/api/content/maps'

const props = defineProps({
  token: { type: String, required: true }
})

const loading = ref(false)
const error = ref('')
const projectName = ref('')

// mock- 前缀的 token 不调接口，直接占位（阶段一：连通性测试）
const isMock = computed(() => (props.token || '').startsWith('mock-'))

const load = async () => {
  if (isMock.value) return
  loading.value = true
  try {
    const res = await getPublicShare(props.token)
    const body = typeof res.data === 'string' ? JSON.parse(res.data) : (res.data || {})
    projectName.value = body.project?.name || '未命名工程'
  } catch {
    error.value = '地图分享已失效或不存在'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
.map-preview {
  &__header {
    padding: 8px 12px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    font-size: 12px;
    color: #606266;
  }

  &__slug {
    font-family: 'Courier New', monospace;
  }

  &__body {
    min-height: 64px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #606266;
  }

  &__emoji {
    font-size: 18px;
  }

  &__text {
    &--muted {
      color: #909399;
    }

    &--error {
      color: #f56c6c;
    }
  }
}
</style>
