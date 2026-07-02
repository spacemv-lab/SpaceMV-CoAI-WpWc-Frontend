<template>
  <el-drawer
    :model-value="modelValue"
    title="文章预览"
    size="640px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="preview-mode-tabs">
      <el-radio-group v-model="previewMode" size="small">
        <el-radio-button value="wendao">问道预览</el-radio-button>
        <el-radio-button value="wechat">微信公众号预览</el-radio-button>
      </el-radio-group>
    </div>

    <div v-if="article" class="preview">
      <template v-if="previewMode === 'wechat' && article.id">
        <div class="preview__wechat" v-loading="wechatLoading">
          <iframe
            v-if="wechatPreviewHtml"
            :srcdoc="wechatPreviewHtml"
            class="preview__wechat-frame"
            sandbox="allow-same-origin"
          />
          <div v-else class="preview__wechat-empty">
            微信预览内容加载中
          </div>
        </div>
      </template>

      <template v-else>
        <h1 class="preview__title">{{ article.title }}</h1>

        <div v-if="article.summary" class="preview__summary">
          {{ article.summary }}
        </div>

        <div class="preview__meta">
          <span v-if="article.authorName" class="preview__author">作者：{{ article.authorName }}</span>
          <span v-if="article.publishedAt" class="preview__date">{{ article.publishedAt }}</span>
        </div>

        <div class="preview__body">
          <template v-for="(block, i) in contentBlocks" :key="i">
            <div v-if="block.type === 'html'" v-html="block.content" />
            <div v-else-if="block.type === 'chart'" class="preview__chart-block">
              <ChartPreview :slug="block.slug" />
            </div>
            <div v-else-if="block.type === 'map'">
              <MapEmbed :token="block.token" />
            </div>
          </template>
        </div>

        <el-divider />

        <div class="preview__seo">
          <h3>SEO 信息</h3>
          <div class="preview__seo-item">
            <strong>SEO 标题：</strong>
            <span>{{ article.seoTitle || article.title }}</span>
          </div>
          <div class="preview__seo-item">
            <strong>SEO 描述：</strong>
            <span>{{ article.seoDescription || article.summary }}</span>
          </div>
        </div>
      </template>
    </div>

    <div v-else class="preview__empty">
      <el-empty description="暂无预览内容" />
    </div>
  </el-drawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { previewArticle } from '@/api/content/article'
import ChartPreview from './ChartPreview.vue'
import MapEmbed from './MapEmbed.vue'

const props = defineProps({
  modelValue: Boolean,
  article: {
    type: Object,
    default: () => null
  }
})

defineEmits(['update:modelValue'])

const previewMode = ref('wendao')
const wechatPreviewHtml = ref('')
const wechatLoading = ref(false)

const shortcodeRegex = /\{\{(chart|map):([a-zA-Z0-9-_]+)\}\}/g
const spanChartRegex = /<span[^>]+data-chart-slug\s*=\s*["']([a-zA-Z0-9-_]+)["'][^>]*>.*?<\/span>/g
const imgChartRegex = /<img[^>]+data-chart-slug\s*=\s*["']([a-zA-Z0-9-_]+)["'][^>]*>/g

const contentBlocks = computed(() => {
  const html = props.article?.contentHtml || ''
  if (!html) return []

  const positions = []
  let match

  while ((match = spanChartRegex.exec(html)) !== null) {
    positions.push({
      index: match.index,
      end: match.index + match[0].length,
      type: 'chart',
      key: match[1],
    })
  }

  while ((match = imgChartRegex.exec(html)) !== null) {
    positions.push({
      index: match.index,
      end: match.index + match[0].length,
      type: 'chart',
      key: match[1],
    })
  }

  while ((match = shortcodeRegex.exec(html)) !== null) {
    const insideExistingChart = positions.some(pos => match.index >= pos.index && match.index < pos.end)
    if (insideExistingChart) continue
    positions.push({
      index: match.index,
      end: match.index + match[0].length,
      type: match[1],
      key: match[2],
    })
  }

  positions.sort((a, b) => a.index - b.index)

  const blocks = []
  let lastIndex = 0

  for (const pos of positions) {
    if (pos.index > lastIndex) {
      blocks.push({ type: 'html', content: html.slice(lastIndex, pos.index) })
    }
    if (pos.type === 'map') {
      blocks.push({ type: 'map', token: pos.key })
    } else {
      blocks.push({ type: 'chart', slug: pos.key })
    }
    lastIndex = pos.end > lastIndex ? pos.end : lastIndex
  }

  if (lastIndex < html.length) {
    blocks.push({ type: 'html', content: html.slice(lastIndex) })
  }

  return blocks.length > 0 ? blocks : [{ type: 'html', content: html }]
})

const loadWechatPreview = async () => {
  if (previewMode.value !== 'wechat' || !props.article?.id) return
  wechatLoading.value = true
  try {
    const res = await previewArticle(props.article.id, { targetCode: 'WECHAT_OFFICIAL_ACCOUNT' })
    if (res.code === 200 && res.data) {
      wechatPreviewHtml.value = res.data.previewHtml || ''
    } else {
      wechatPreviewHtml.value = '<p style="color:#f56c6c;padding:16px">微信预览加载失败</p>'
    }
  } catch {
    wechatPreviewHtml.value = '<p style="color:#f56c6c;padding:16px">微信预览加载失败</p>'
  } finally {
    wechatLoading.value = false
  }
}

watch(
  () => [previewMode.value, props.article?.id, props.modelValue],
  () => {
    if (props.modelValue && previewMode.value === 'wechat') {
      loadWechatPreview()
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.preview-mode-tabs {
  margin-bottom: 16px;
  text-align: center;
}

.preview {
  padding: 0 4px;

  &__title {
    font-size: 22px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    line-height: 1.4;
  }

  &__summary {
    font-size: 14px;
    color: #606266;
    background: #f5f7fa;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 16px;
    line-height: 1.6;
  }

  &__meta {
    font-size: 13px;
    color: #909399;
    margin-bottom: 20px;
    display: flex;
    gap: 16px;
  }

  &__body {
    font-size: 15px;
    line-height: 1.8;
    color: #303133;
  }

  &__chart-block {
    margin: 16px 0;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    overflow: hidden;
  }

  &__wechat {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
  }

  &__wechat-frame {
    width: 100%;
    min-height: 520px;
    border: none;
  }

  &__wechat-empty {
    min-height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 14px;
  }

  &__seo {
    margin-top: 16px;

    h3 {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }

    &-item {
      font-size: 13px;
      color: #606266;
      margin-bottom: 6px;
      line-height: 1.5;

      strong {
        color: #303133;
      }
    }
  }

  &__empty {
    padding: 60px 0;
  }
}
</style>
