<template>
  <div class="chart-preview" ref="containerRef">
    <div class="chart-preview__header">
      <span class="chart-preview__slug">📊 {{ slug }}</span>
    </div>
    <div v-if="loading" class="chart-preview__loading">加载中...</div>
    <div v-else-if="error" class="chart-preview__error">{{ error }}</div>
    <div v-else ref="chartRef" class="chart-preview__chart" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { getIndicatorSeries } from '@/api/content/charts'
import * as echarts from 'echarts'

const props = defineProps({
  slug: { type: String, required: true }
})

const containerRef = ref(null)
const chartRef = ref(null)
const loading = ref(true)
const error = ref('')
let chartInstance = null
let resizeObserver = null

const renderChart = (series) => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  const dates = series.map(d => d.date)
  const values = series.map(d => d.value)

  chartInstance.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 10, top: 10, bottom: 20 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { fontSize: 10, color: '#9ca3af' },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e5e7eb' } }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      axisLabel: { fontSize: 10, color: '#9ca3af' }
    },
    series: [{
      type: 'line',
      data: values,
      smooth: true,
      lineStyle: { color: '#0A1F3F', width: 2 },
      itemStyle: { color: '#0A1F3F' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(10,31,63,0.15)' },
          { offset: 1, color: 'rgba(10,31,63,0.01)' }
        ])
      },
      symbol: 'circle',
      symbolSize: 3
    }]
  }, true)
}

const initResizeObserver = () => {
  const el = chartRef.value || containerRef.value
  if (!el) return
  resizeObserver = new ResizeObserver(() => {
    if (chartInstance) chartInstance.resize()
  })
  resizeObserver.observe(el)
}

const loadSeries = async () => {
  loading.value = true
  try {
    const res = await getIndicatorSeries(props.slug, 200)
    const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
    const series = body.series || []
    if (series.length === 0) {
      error.value = '该指标暂无时序数据'
      loading.value = false
      return
    }
    loading.value = false
    await nextTick()
    renderChart(series)
    initResizeObserver()
    setTimeout(() => { if (chartInstance) chartInstance.resize() }, 300)
  } catch {
    error.value = '加载失败'
    loading.value = false
  }
}

onMounted(loadSeries)

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
  if (chartInstance) chartInstance.dispose()
})
</script>

<style scoped lang="scss">
.chart-preview {
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

  &__chart {
    height: 240px;
  }

  &__loading {
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #909399;
  }

  &__error {
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #f56c6c;
  }
}
</style>
