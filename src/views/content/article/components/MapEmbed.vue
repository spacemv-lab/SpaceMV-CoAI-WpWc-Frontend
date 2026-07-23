<template>
  <div class="map-embed" :class="{ 'map-embed--fs': isFullscreen }">
    <iframe
      v-if="!hasError"
      ref="iframeRef"
      class="map-embed__iframe"
      :src="src"
      title="嵌入式地图"
      loading="lazy"
      allowfullscreen
      @load="onLoad"
      @error="onError"
    />

    <div v-else class="map-embed__fallback">
      <span class="map-embed__fallback-icon" aria-hidden="true">🗺️</span>
      <p class="map-embed__fallback-text">地图暂时无法加载</p>
      <p class="map-embed__fallback-sub">分享链接可能已失效或过期</p>
      <a
        v-if="src"
        :href="src"
        class="map-embed__fallback-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        在新窗口打开 ↗
      </a>
    </div>

    <button
      v-if="!hasError"
      type="button"
      class="map-embed__fs-btn"
      :title="isFullscreen ? '退出全屏 (Esc)' : '全屏查看'"
      @click="toggleFullscreen"
    >
      <span v-if="isFullscreen" aria-hidden="true">✕</span>
      <span v-else aria-hidden="true">⛶</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  token: { type: String, required: true }
})

// TXWX 地图分享页基址：${base}/share/<token>（与 wendao 的 <MapEmbed> 同源）
const baseUrl = computed(() =>
  String(import.meta.env.VITE_MAP_SHARE_BASE_URL || '').replace(/\/+$/, '')
)
const src = computed(() => `${baseUrl.value}/share/${props.token}`)

const hasError = ref(false)
const isFullscreen = ref(false)
const iframeRef = ref(null)

function onLoad() {
  hasError.value = false
}

function onError() {
  hasError.value = true
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

function onKey(e) {
  if (e.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
}

// token 变化时重置错误态（v-for 复用场景）
watch(
  () => props.token,
  () => {
    hasError.value = false
  }
)

onMounted(() => {
  window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.map-embed {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 320px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  margin: 1.5rem 0;
}

.map-embed__iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.map-embed__fs-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 15px;
  line-height: 1;
  color: #334155;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  transition: background 0.15s ease, color 0.15s ease;
}

.map-embed__fs-btn:hover {
  background: #fff;
  color: #0a1f3f;
}

.map-embed__fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 1rem;
  text-align: center;
  background: #f8fafc;
}

.map-embed__fallback-icon {
  font-size: 32px;
  line-height: 1;
}

.map-embed__fallback-text {
  margin: 0.5rem 0 0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.map-embed__fallback-sub {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
}

.map-embed__fallback-link {
  margin-top: 0.75rem;
  font-size: 13px;
  color: #2563eb;
  text-decoration: none;
}

.map-embed__fallback-link:hover {
  text-decoration: underline;
}

.map-embed--fs {
  position: fixed;
  inset: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  aspect-ratio: auto;
  min-height: 0;
  margin: 0;
  border-radius: 0;
  border: none;
}
</style>
