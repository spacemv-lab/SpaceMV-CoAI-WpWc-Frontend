<template>
  <el-dialog
    :model-value="modelValue"
    title="插入问道图表"
    width="720px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="chart-picker">
      <div class="chart-picker__search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索指标名称或 slug"
          clearable
          size="small"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="chart-picker__filters">
        <el-select v-model="regionFilter" placeholder="地区" clearable size="small">
          <el-option label="全部" value="" />
          <el-option v-for="r in regionOptions" :key="r.value" :label="r.label" :value="r.value" />
        </el-select>
        <el-select v-model="categoryFilter" placeholder="分类" clearable size="small">
          <el-option label="全部" value="" />
          <el-option v-for="c in categoryOptions" :key="c.value" :label="c.label" :value="c.value" />
        </el-select>
      </div>

      <div class="chart-picker__layout">
        <div class="chart-picker__list">
          <el-table
            :data="indicators"
            v-loading="loading"
            stripe
            highlight-current-row
            max-height="360"
            @current-change="onRowSelect"
          >
            <el-table-column prop="name" label="名称" min-width="140" />
            <el-table-column prop="slug" label="Slug" width="160">
              <template #default="{ row }">
                <code>{{ row.slug }}</code>
              </template>
            </el-table-column>
            <el-table-column label="地区" width="70">
              <template #default="{ row }">
                {{ regionLabelMap[row.region] || row.region }}
              </template>
            </el-table-column>
            <el-table-column label="分类" width="70">
              <template #default="{ row }">
                {{ categoryLabelMap[row.category] || row.category }}
              </template>
            </el-table-column>
            <el-table-column prop="latestValue" label="最新值" width="90" align="right" />
            <el-table-column label="操作" width="70" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click.stop="insertChart(row.slug)">插入</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="chart-picker__preview" v-if="selectedSlug">
          <h4 class="preview__title">预览：{{ selectedName }}</h4>
          <div ref="previewRef" class="preview__chart" />
          <div v-if="previewLoading" class="preview__loading">加载中...</div>
        </div>
        <div class="chart-picker__preview chart-picker__preview--empty" v-else>
          <el-empty description="选择指标后预览图表" :image-size="80" />
        </div>
      </div>
    </div>
    <!-- 离屏容器：专门用于图表导出为图片，固定宽高确保 ECharts 渲染完整 -->
    <div ref="exportChartRef" class="chart-picker__export-container" />
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getIndicatorList, getIndicatorSeries, getIndicatorFilterOptions } from '@/api/content/charts'
import request from '@/utils/request'
import * as echarts from 'echarts'

const props = defineProps({
  modelValue: Boolean,
  wechatAccountIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const loading = ref(false)
const indicators = ref([])
const searchKeyword = ref('')
const regionFilter = ref('')
const categoryFilter = ref('')

const regionOptions = ref([])
const categoryOptions = ref([])
const regionLabelMap = ref({})
const categoryLabelMap = ref({})

const selectedSlug = ref('')
const selectedName = ref('')
const previewRef = ref(null)
const exportChartRef = ref(null)
const previewLoading = ref(false)
let chartInstance = null

const clearPreview = () => {
  selectedSlug.value = ''
  selectedName.value = ''
  if (chartInstance) { chartInstance.dispose(); chartInstance = null }
}

const loadFilterOptions = async () => {
  try {
    const res = await getIndicatorFilterOptions()
    const body = typeof res.data === 'string' ? JSON.parse(res.data) : (res.data || {})
    const regions = body.regions || []
    const categories = body.categories || []
    regionOptions.value = regions
    categoryOptions.value = categories
    const rMap = {}
    for (const r of regions) rMap[r.value] = r.label
    regionLabelMap.value = rMap
    const cMap = {}
    for (const c of categories) cMap[c.value] = c.label
    categoryLabelMap.value = cMap
  } catch { /* ignore */ }
}

const fetchIndicators = async () => {
  loading.value = true
  try {
    const params = { page: 1, pageSize: 500, sort: 'name' }
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (regionFilter.value) params.region = regionFilter.value
    if (categoryFilter.value) params.category = categoryFilter.value
    const res = await getIndicatorList(params)
    const body = typeof res.data === 'string' ? JSON.parse(res.data) : (res.data || {})
    indicators.value = body.items || []
  } catch {
    indicators.value = []
  }
  loading.value = false
}

const handleSearch = () => {
  clearPreview()
  fetchIndicators()
}

watch([regionFilter, categoryFilter], () => {
  clearPreview()
  fetchIndicators()
})

watch(() => props.modelValue, (val) => {
  if (val) {
    searchKeyword.value = ''
    regionFilter.value = ''
    categoryFilter.value = ''
    clearPreview()
    fetchIndicators()
  }
})

onMounted(loadFilterOptions)

const onRowSelect = (row) => {
  if (!row) return
  selectedSlug.value = row.slug
  selectedName.value = row.name
  loadPreview(row.slug)
}

const loadPreview = async (slug) => {
  previewLoading.value = true
  try {
    const res = await getIndicatorSeries(slug, 200)
    if (res.code === 200) {
      const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
      const series = body.series || []
      await nextTick()
      renderPreviewChart(series)
    }
  } catch { /* ignore */ }
  finally { previewLoading.value = false }
}

const buildChartOption = (series) => {
  const dates = series.map(d => d.date)
  const values = series.map(d => d.value)
  return {
    animation: false,
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
  }
}

const renderPreviewChart = (series) => {
  if (chartInstance) chartInstance.dispose()
  if (!previewRef.value || series.length === 0) return
  chartInstance = echarts.init(previewRef.value)
  chartInstance.setOption(buildChartOption(series), true)
}

const exportChartToBlob = async (series) => {
  const container = exportChartRef.value
  if (!container || series.length === 0) return null
  // 显式设置宽高避免容器因 visibility:hidden 等导致 ECharts 测量为 0 而回退为默认 380px
  const chart = echarts.init(container, null, { width: 800, height: 400 })
  chart.setOption(buildChartOption(series), true)
  const dataUrl = chart.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff',
  })
  chart.dispose()
  const blob = await (await fetch(dataUrl)).blob()
  return blob
}

const inserting = ref(false)

const insertChart = async (slug) => {
  if (inserting.value) return
  inserting.value = true
  let imageUrl = ''
  let wechatImageUrl = ''

  let series = []
  try {
    const res = await getIndicatorSeries(slug, 200)
    if (res.code === 200) {
      const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
      series = body.series || []
      selectedSlug.value = slug
      await nextTick()
      renderPreviewChart(series)
    }
  } catch {
    // 数据加载失败
  }

  try {
    const blob = await exportChartToBlob(series)
    if (!blob) throw new Error('export failed')
    const file = new File([blob], `chart-${slug}.png`, { type: 'image/png' })

    // 上传到 /file/upload — 后端可下载的 URL，用于存储 HTML 的 src
    try {
      const uploadForm = new FormData()
      uploadForm.append('file', file)
      const uploadRes = await request({ url: '/file/upload', method: 'post', data: uploadForm })
      if (uploadRes.data?.url) {
        imageUrl = uploadRes.data.url
      }
    } catch {
      // /file/upload 失败
    }

    // 上传到微信永久素材 — 浏览器可展示的 URL（微信 CDN）
    if (props.wechatAccountIds.length > 0) {
      try {
        const permanentForm = new FormData()
        permanentForm.append('file', file)
        const permanentRes = await request({
          url: '/txwx-social-crm/material/permanentAdd',
          method: 'post',
          data: permanentForm,
          params: { accountId: props.wechatAccountIds[0] },
          timeout: 120000,
        })
        if (permanentRes.data?.url) {
          wechatImageUrl = permanentRes.data.url
        }
      } catch {
        // 永久素材上传失败不影响插入
      }
    }
  } catch {
    // 导出或上传失败，仍允许插入，只是不带 imageUrl
  }
  inserting.value = false
  emit('select', { slug, imageUrl, wechatImageUrl })
}

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.dispose()
})
</script>

<style scoped lang="scss">
.chart-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__search {
    width: 100%;
  }

  &__filters {
    display: flex;
    gap: 8px;
  }

  &__layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    min-height: 360px;
  }

  &__list {
    overflow: hidden;
  }

  &__preview {
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 12px;
    display: flex;
    flex-direction: column;

    &--empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.preview {
  &__title {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
  }

  &__chart {
    flex: 1;
    min-height: 200px;
  }

  &__loading {
    text-align: center;
    font-size: 12px;
    color: #909399;
    padding: 8px;
  }
}

code {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.chart-picker__export-container {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 800px;
  height: 400px;
  pointer-events: none;
  visibility: hidden;
}
</style>
