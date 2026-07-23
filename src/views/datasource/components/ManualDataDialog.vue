<template>
  <div>
    <el-alert title="手动录入数据点：日期格式 YYYY-MM-DD，数值支持小数" type="info" :closable="false" style="margin-bottom: 16px" />

    <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: center;">
      <el-button type="primary" size="small" @click="addRow">添加行</el-button>
      <el-button size="small" @click="pasteFromClipboard">批量粘贴</el-button>
      <el-button size="small" @click="clearAll" :disabled="rows.length === 0">清空</el-button>
      <span style="margin-left: auto; font-size: 12px; color: #909399;">已添加 {{ rows.length }} 行</span>
    </div>

    <el-table :data="rows" stripe size="small" max-height="400" style="margin-bottom: 16px">
      <el-table-column label="日期" width="140">
        <template #default="{ row, $index }">
          <el-date-picker
            v-model="row.date"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            size="small"
            style="width: 130px"
          />
        </template>
      </el-table-column>
      <el-table-column label="数值" min-width="140">
        <template #default="{ row, $index }">
          <el-input-number
            v-model="row.value"
            :precision="4"
            :step="0.01"
            size="small"
            style="width: 130px"
            controls-position="right"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="60" align="center">
        <template #default="{ $index }">
          <el-button link type="danger" icon="Delete" @click="removeRow($index)" />
        </template>
      </el-table-column>
    </el-table>

    <el-input
      v-model="pasteText"
      type="textarea"
      :rows="3"
      placeholder="粘贴数据：每行一条，日期和数值用逗号或Tab分隔&#10;如：2024-01-01, 100.5&#10;或从 Excel 直接粘贴"
      style="margin-bottom: 16px"
    />

    <div style="text-align: center; margin-top: 20px">
      <el-button @click="emit('cancel')">取消</el-button>
      <el-button type="primary" @click="submitData" :loading="submitting" :disabled="rows.length === 0">
        保存数据 ({{ rows.length }} 条)
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({ slug: { type: String, default: '' }, name: { type: String, default: '' } })
const emit = defineEmits(['success', 'cancel'])

const rows = ref([])
const pasteText = ref('')
const submitting = ref(false)

function addRow() {
  rows.value.push({ date: '', value: null })
}

function removeRow(index) {
  rows.value.splice(index, 1)
}

function clearAll() {
  rows.value = []
  pasteText.value = ''
}

function pasteFromClipboard() {
  if (!pasteText.value.trim()) {
    ElMessage.warning('请先在文本框中粘贴数据')
    return
  }
  const lines = pasteText.value.trim().split('\n').filter(l => l.trim())
  const parsed = []
  for (const line of lines) {
    const parts = line.split(/[\t,]+/).map(s => s.trim()).filter(Boolean)
    if (parts.length >= 2) {
      const date = parts[0]
      const value = parseFloat(parts[1])
      if (date && !isNaN(value)) {
        parsed.push({ date, value })
      }
    }
  }
  if (parsed.length === 0) {
    ElMessage.warning('未能解析出有效数据，请检查格式')
    return
  }
  rows.value = [...rows.value, ...parsed]
  pasteText.value = ''
  ElMessage.success(`已添加 ${parsed.length} 行`)
}

async function submitData() {
  const validRows = rows.value.filter(r => r.date && r.value !== null && r.value !== undefined && r.value !== '')
  if (validRows.length === 0) {
    ElMessage.warning('没有有效数据可保存')
    return
  }

  submitting.value = true
  try {
      const base = import.meta.env.VITE_NUXT_API_BASE || '/nuxt-api'
      const res = await fetch(`${base}/indicators/${encodeURIComponent(props.slug)}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: validRows.map(r => ({ date: r.date, value: r.value })) })
    })
    const data = await res.json()
    if (res.ok && data.ok) {
      ElMessage.success(`保存成功，共 ${data.inserted} 条数据`)
      emit('success')
    } else {
      ElMessage.error(data.error || '保存失败')
    }
  } catch (e) {
    ElMessage.error('网络错误：' + e.message)
  } finally {
    submitting.value = false
  }
}
</script>
