<template>
  <el-dialog v-model="visible" title="从模板创建" width="620px" @open="onOpen">
    <div v-loading="loading" class="template-grid">
      <div
        v-for="tpl in templateList"
        :key="tpl.id"
        class="template-card"
        :class="{ 'is-selected': selectedId === tpl.id }"
        @click="selectedId = tpl.id"
      >
        <div class="template-card__thumb">
          <el-image v-if="tpl.thumbnailUrl" :src="tpl.thumbnailUrl" fit="cover" />
          <div v-else class="template-card__placeholder">
            <svg-icon icon-class="article" />
          </div>
        </div>
        <div class="template-card__body">
          <div class="template-card__name">{{ tpl.name }}</div>
          <div v-if="tpl.description" class="template-card__desc">{{ tpl.description }}</div>
          <div class="template-card__meta">
            <el-tag size="small">{{ platformLabel(tpl.platform) }}</el-tag>
            <el-tag v-if="tpl.isDefault === '1'" size="small" type="warning">默认</el-tag>
          </div>
        </div>
      </div>
      <div v-if="!loading && templateList.length === 0" class="template-empty">
        暂无可用模板
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :disabled="!selectedId" @click="confirm">使用此模板</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getTemplateList } from '@/api/content/template'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'select'])

const visible = ref(false)
const loading = ref(false)
const templateList = ref([])
const selectedId = ref(null)

watch(() => props.modelValue, (val) => { visible.value = val })
watch(visible, (val) => { emit('update:modelValue', val) })

const platformLabel = (platform) => {
  const map = { WECHAT_OFFICIAL_ACCOUNT: '微信公众号', SITE_WENDAO: 'SpaceMV问道', XIAOHONGSHU: '小红书' }
  return map[platform] || platform
}

const onOpen = async () => {
  selectedId.value = null
  loading.value = true
  try {
    const res = await getTemplateList({ pageNum: 1, pageSize: 100 })
    if (res.code === 200) {
      templateList.value = (res.rows || []).map(t => ({ ...t, isDefault: t.isDefault || t.is_default }))
    } else {
      templateList.value = []
    }
  } catch {
    templateList.value = []
  } finally {
    loading.value = false
  }
}

const confirm = () => {
  const tpl = templateList.value.find(t => t.id === selectedId.value)
  if (tpl) {
    emit('select', tpl)
    visible.value = false
  }
}
</script>

<style scoped lang="scss">
.template-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-height: 120px;
}

.template-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #409eff;
    background: #f0f7ff;
  }

  &.is-selected {
    border-color: #409eff;
    background: #ecf5ff;
    box-shadow: 0 0 0 1px #409eff;
  }

  &__thumb {
    width: 80px;
    height: 60px;
    flex-shrink: 0;
    border-radius: 4px;
    overflow: hidden;
    background: #f5f7fa;

    .el-image {
      width: 100%;
      height: 100%;
    }
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #c0c4cc;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__desc {
    font-size: 12px;
    color: #909399;
    margin-bottom: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    display: flex;
    gap: 4px;
  }
}

.template-empty {
  grid-column: 1 / -1;
  text-align: center;
  color: #c0c4cc;
  padding: 40px 0;
  font-size: 14px;
}
</style>
