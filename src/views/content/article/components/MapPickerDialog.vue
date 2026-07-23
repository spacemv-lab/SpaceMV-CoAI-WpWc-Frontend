<template>
  <el-dialog
    :model-value="modelValue"
    title="插入地图（选择工程）"
    width="720px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="map-picker">
      <div class="map-picker__search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索工程名称"
          clearable
          size="small"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="map-picker__list" v-loading="loading">
        <div v-if="filteredProjects.length === 0 && !loading" class="map-picker__empty">
          <el-empty :description="searchKeyword ? '没有匹配的工程' : '暂无工程'" :image-size="80" />
        </div>
        <div v-else class="map-picker__cards">
          <div v-for="p in filteredProjects" :key="p.id" class="map-card" :class="{ 'map-card--no-preview': previewFailed[p.id] }">
            <div class="map-card__thumb">
              <img v-if="!previewFailed[p.id]" :src="getMapPreviewImageUrl(p.id)" referrerpolicy="no-referrer" loading="lazy" alt="预览图" @error="onThumbError(p)" @load="onThumbLoad(p)" />
              <div v-else class="map-card__no-preview">未发布预览图</div>
            </div>
            <div class="map-card__main">
              <div class="map-card__name">{{ p.name }}</div>
              <div v-if="p.description" class="map-card__desc">{{ p.description }}</div>
              <div class="map-card__meta">
                <span>数据集：{{ p.datasetCount ?? 0 }}</span>
                <span v-if="p.updatedAt">更新：{{ formatDate(p.updatedAt) }}</span>
                <code class="map-card__id" :title="p.id">…{{ (p.id || '').slice(-8) }}</code>
              </div>
            </div>
            <el-button type="primary" size="small" :loading="inserting" :disabled="!!previewFailed[p.id]" :title="previewFailed[p.id] ? '该工程未在地图平台发布预览图' : ''" @click="insertMap(p)">插入</el-button>
          </div>
        </div>
      </div>

      <div class="map-picker__tip">
        点击「插入」会向 TXWX 取该工程的分享 token 与预览图，并上传到公众号图库。token 存为地图短码（问道端渲染交互地图），图片用于公众号。若工程未在地图平台「发布预览」，将无法插入。
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getProjectList, getOrCreateEmbedToken, fetchMapPreviewImage, getMapPreviewImageUrl } from '@/api/content/maps'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  wechatAccountIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const loading = ref(false)
const projects = ref([])
const searchKeyword = ref('')
const inserting = ref(false)

// 每个工程的预览图加载状态：id → true 表示加载失败（未发布预览）
const previewFailed = reactive({})
const onThumbError = (p) => { previewFailed[p.id] = true }
const onThumbLoad = (p) => { delete previewFailed[p.id] }

// TXWX listProjects 不支持关键词，本地过滤
const filteredProjects = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return projects.value
  return projects.value.filter(p => (p.name || '').toLowerCase().includes(kw))
})

const formatDate = (d) => {
  try {
    const dt = new Date(d)
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
  } catch {
    return ''
  }
}

const fetchProjects = async () => {
  loading.value = true
  try {
    const res = await getProjectList({ page: 1, pageSize: 100 })
    const body = typeof res.data === 'string' ? JSON.parse(res.data) : (res.data || {})
    projects.value = body.items || []
  } catch {
    projects.value = []
  } finally {
    loading.value = false
  }
}

const insertMap = async (project) => {
  if (inserting.value) return
  inserting.value = true
  try {
    // 1. 取嵌入分享 token（问道端凭它渲染交互地图；幂等，同工程反复插入得同 token）
    const tokenRes = await getOrCreateEmbedToken(project.id)
    const token = tokenRes?.data?.token
    if (!token) throw new Error('未返回 token')

    // 2. 取 TXWX 预览图；取不到仍有 token，可插入交互地图（仅缺预览图）
    let blob, file
    try {
      blob = await fetchMapPreviewImage(project.id)
      file = new File([blob], `map-${project.id}.jpg`, { type: blob.type || 'image/jpeg' })
    } catch (e) {
      ElMessage.warning(`「${project.name}」暂无预览图，将以交互地图形式插入（仅问道可见）`)
    }

    // 3. 上传到 coai 文件服务 → 问道端取图用
    let imageUrl = ''
    if (file) {
      try {
        const form = new FormData()
        form.append('file', file)
        const r1 = await request({ url: '/file/upload', method: 'post', data: form, timeout: 60000 })
        if (r1.data?.url) imageUrl = r1.data.url
      } catch { /* /file/upload 失败不阻断 */ }
    }

    // 4. 上传到微信永久素材 → 公众号 CDN（mmbiz.qpic.cn）
    let wechatImageUrl = ''
    if (file && props.wechatAccountIds.length > 0) {
      try {
        const form = new FormData()
        form.append('file', file)
        const r2 = await request({
          url: '/txwx-social-crm/material/permanentAdd',
          method: 'post',
          data: form,
          params: { accountId: props.wechatAccountIds[0] },
          timeout: 60000
        })
        if (r2.data?.url) wechatImageUrl = r2.data.url
      } catch { /* 永久素材上传失败不阻断 */ }
    }

    if (!imageUrl && !wechatImageUrl) {
      ElMessage.info('地图将以交互形式预览（问道），公众号预览暂无可展示图片')
    }

    emit('select', { token, imageUrl, wechatImageUrl })
  } catch (e) {
    ElMessage.error('获取地图分享 token 失败，请确认对该工程有所有权')
  } finally {
    inserting.value = false
  }
}

watch(() => props.modelValue, (val) => {
  if (val) {
    searchKeyword.value = ''
    Object.keys(previewFailed).forEach((k) => { delete previewFailed[k] })
    fetchProjects()
  }
})
</script>

<style scoped lang="scss">
.map-picker {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__list {
    max-height: 420px;
    overflow-y: auto;
  }

  &__cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  &__empty {
    padding: 40px 0;
  }

  &__tip {
    font-size: 12px;
    color: #909399;
    background: #fdf6ec;
    border: 1px solid #faecd8;
    border-radius: 4px;
    padding: 8px 12px;
    line-height: 1.5;
  }
}

.map-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.2s;

  &:hover {
    border-color: #409eff;
  }

  &__main {
    flex: 1;
  }

  &__thumb {
    width: 100%;
    height: 96px;
    border-radius: 4px;
    overflow: hidden;
    background: #f5f7fa
      repeating-linear-gradient(45deg, #f0f2f5 0, #f0f2f5 6px, #f5f7fa 6px, #f5f7fa 12px);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  &__no-preview {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #c0c4cc;
  }

  &__id {
    margin-left: auto;
    font-family: 'Courier New', monospace;
    font-size: 11px;
    color: #c0c4cc;
    background: transparent;
    padding: 0;
  }

  &--no-preview {
    background: #fafafa;
    opacity: 0.85;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  &__desc {
    font-size: 12px;
    color: #909399;
    line-height: 1.4;
    margin-bottom: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #909399;
  }
}

code {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}
</style>
