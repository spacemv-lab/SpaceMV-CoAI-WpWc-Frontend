<template>
  <div class="platform-preview">
    <el-tabs v-model="activeTab" type="card" @tab-change="loadPreview">
      <el-tab-pane
        v-for="platform in platforms"
        :key="platform.code"
        :label="platform.label"
        :name="platform.code"
      />
    </el-tabs>

    <div class="preview-content" v-loading="loading">
      <iframe
        v-if="previewHtml"
        :srcdoc="previewHtml"
        class="preview-iframe"
        sandbox="allow-same-origin"
      />
      <div v-else class="preview-empty">
        <span>选择平台查看预览效果</span>
      </div>
    </div>
  </div>
</template>

<script>
import { previewArticle } from '@/api/content/article'

export default {
  name: 'PlatformPreview',
  props: {
    articleId: { type: [Number, String], default: null },
    stylePreset: { type: String, default: '' }
  },
  data() {
    return {
      activeTab: 'SITE_WENDAO',
      platforms: [
        { code: 'SITE_WENDAO', label: '问道' },
        { code: 'WECHAT_OFFICIAL_ACCOUNT', label: '微信' }
      ],
      previewHtml: '',
      loading: false
    }
  },
  watch: {
    articleId() {
      if (this.articleId) this.loadPreview()
    }
  },
  methods: {
    async loadPreview() {
      if (!this.articleId || !this.activeTab) return
      this.loading = true
      try {
        const target = { targetCode: this.activeTab }
        if (this.stylePreset) target.stylePreset = this.stylePreset
        const res = await previewArticle(this.articleId, target)
        if (res.code === 200 && res.data) {
          this.previewHtml = res.data.previewHtml || ''
        }
      } catch {
        this.previewHtml = '<p style="color:red">预览加载失败</p>'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.platform-preview {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
}

.preview-content {
  min-height: 300px;
  max-height: 500px;
  overflow: auto;
  padding: 12px;
}

.preview-iframe {
  width: 100%;
  min-height: 400px;
  border: none;
}

.preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #909399;
  font-size: 14px;
}
</style>
