<template>
  <div class="publish-records">
    <div
      v-for="record in records"
      :key="record.platform"
      class="publish-record-card"
    >
      <div class="record-header">
        <span class="platform-label">{{ platformLabel(record.platform) }}</span>
        <el-tag :type="statusType(record.status)" size="small">
          {{ statusText(record.status) }}
        </el-tag>
      </div>

      <div class="record-body">
        <!-- 成功信息 -->
        <template v-if="record.status === 'SUCCESS'">
          <div class="record-meta">
            <span v-if="record.publishedAt" class="meta-time">
              发布于 {{ formatTime(record.publishedAt) }}
            </span>
            <a
              v-if="record.platformUrl"
              :href="record.platformUrl"
              target="_blank"
              class="meta-link"
            >
              查看原文
            </a>
          </div>
        </template>

        <!-- 草稿状态（微信） -->
        <template v-else-if="record.status === 'DRAFT_CREATED'">
          <div class="record-meta">
            <span class="meta-hint">草稿已推送，请前往平台后台发布</span>
            <el-button
              type="primary"
              link
              size="small"
              @click="$emit('confirmPublished', record)"
            >
              已发布，确认
            </el-button>
          </div>
        </template>

        <!-- 失败状态 -->
        <template v-else-if="record.status === 'FAILED'">
          <div class="record-error">
            <span class="error-msg">{{ record.errorMessage || '发布失败' }}</span>
          </div>
          <div class="record-actions">
            <el-button
              type="warning"
              size="small"
              :loading="retrying === record.platform"
              @click="handleRetry(record)"
            >
              重试
            </el-button>
            <el-button
              size="small"
              @click="$emit('ignore', record)"
            >
              忽略
            </el-button>
          </div>
        </template>

        <!-- 发布中 -->
        <template v-else-if="record.status === 'PUBLISHING' || record.status === 'PENDING'">
          <div class="record-meta">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>发布中...</span>
          </div>
        </template>
      </div>
    </div>

    <div v-if="!records || records.length === 0" class="no-records">
      暂无发布记录
    </div>
  </div>
</template>

<script>
import { retryArticlePlatform } from '@/api/content/article'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

export default {
  name: 'PublishRecordCard',
  components: { Loading },
  props: {
    articleId: { type: Number, required: true },
    records: { type: Array, default: () => [] }
  },
  emits: ['retry-success', 'confirm-published', 'ignore'],
  data() {
    return {
      retrying: null
    }
  },
  methods: {
    platformLabel(code) {
      const map = {
        'SITE_WENDAO': 'SpaceMV 问道',
        'WECHAT_OFFICIAL_ACCOUNT': '微信公众号',
        'ZHISHU_XINGQIU': '知识星球',
        'XIAOHONGSHU': '小红书'
      }
      return map[code] || code
    },
    statusType(status) {
      const map = {
        'SUCCESS': 'success',
        'FAILED': 'danger',
        'PENDING': 'info',
        'PUBLISHING': 'warning',
        'DRAFT_CREATED': 'warning',
        'DELETED': 'info'
      }
      return map[status] || 'info'
    },
    statusText(status) {
      const map = {
        'SUCCESS': '已发布',
        'FAILED': '失败',
        'PENDING': '待发布',
        'PUBLISHING': '发布中',
        'DRAFT_CREATED': '草稿已推送',
        'DELETED': '已删除'
      }
      return map[status] || status
    },
    async handleRetry(record) {
      this.retrying = record.platform
      try {
        await retryArticlePlatform(this.articleId, {
          targetCode: record.platform
        })
        ElMessage.success(`已重新发布到 ${this.platformLabel(record.platform)}`)
        this.$emit('retry-success', record.platform)
      } catch (e) {
        ElMessage.error(e.message || '重试失败')
      } finally {
        this.retrying = null
      }
    },
    formatTime(time) {
      if (!time) return ''
      const d = new Date(time)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    }
  }
}
</script>

<style scoped>
.publish-records {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.publish-record-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px 16px;
  background: #fafafa;
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.platform-label {
  font-weight: 600;
  font-size: 14px;
}

.record-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #606266;
}

.meta-link {
  color: #409eff;
  text-decoration: none;
}

.meta-link:hover {
  text-decoration: underline;
}

.record-error {
  margin-bottom: 8px;
}

.error-msg {
  color: #f56c6c;
  font-size: 13px;
}

.record-actions {
  display: flex;
  gap: 8px;
}

.no-records {
  text-align: center;
  color: #909399;
  padding: 20px;
  font-size: 13px;
}
</style>
