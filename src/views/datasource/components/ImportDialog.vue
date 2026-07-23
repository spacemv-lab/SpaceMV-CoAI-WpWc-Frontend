<template>
  <el-alert title="支持 CSV 和 Excel（.xlsx / .xls），第一行为表头（date,value），第二行起为数据" type="info" :closable="false" style="margin-bottom: 16px" />
  <el-upload
    ref="uploadRef"
    :auto-upload="false"
    accept=".csv,.xlsx,.xls"
    :limit="1"
    :on-change="onFileChange"
    drag
  >
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">将文件拖到此处，或<em>点击选择</em></div>
    <template #tip>
      <div class="el-upload__tip">仅支持 .csv / .xlsx / .xls 文件</div>
    </template>
  </el-upload>

  <div v-if="preview.length > 0" style="margin-top: 16px">
    <h4>数据预览（前5行）：</h4>
    <el-table :data="preview" stripe size="small" max-height="200">
      <el-table-column prop="date" label="日期" width="120" />
      <el-table-column prop="value" label="数值" width="120" />
    </el-table>
    <p style="margin-top: 8px; color: #909399">共 {{ previewCount }} 行数据</p>
  </div>

  <div style="text-align: center; margin-top: 20px">
    <el-button @click="emit('cancel')">取消</el-button>
    <el-button type="primary" @click="submitImport" :loading="uploading" :disabled="!file">
      确认导入
    </el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { importDataSourceCsv } from '@/api/datasource'
import * as XLSX from 'xlsx'

const props = defineProps({ sourceId: { type: String, default: '' }, sourceName: { type: String, default: '' }, slug: { type: String, default: '' } })
const emit = defineEmits(['success', 'cancel'])

const file = ref(null)
const preview = ref([])
const previewCount = ref(0)
const uploading = ref(false)
let cachedRows = []

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim())
  const rows = []
  const startIdx = lines[0] && (lines[0].toLowerCase().includes('date') || lines[0].toLowerCase().includes('value')) ? 1 : 0
  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(',')
    if (cols.length >= 2) {
      const date = cols[0].trim()
      const value = parseFloat(cols[1].trim())
      if (date && !isNaN(value)) {
        rows.push({ date, value })
      }
    }
  }
  return rows
}

function parseExcel(data) {
  const workbook = XLSX.read(data, { type: 'array', cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  const rows = []
  const startIdx = json[0] && (String(json[0][0] || '').toLowerCase().includes('date') || String(json[0][0] || '').toLowerCase().includes('value')) ? 1 : 0
  for (let i = startIdx; i < json.length; i++) {
    let date = json[i][0]
    if (date instanceof Date && !isNaN(date)) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      date = `${y}-${m}-${d}`
    } else if (typeof date === 'number') {
      const d = new Date((date - 25569) * 86400000)
      if (!isNaN(d)) {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        date = `${y}-${m}-${dd}`
      } else {
        date = String(date || '').trim()
      }
    } else {
      date = String(date || '').trim()
    }
    const value = parseFloat(json[i][1])
    if (date && !isNaN(value)) {
      rows.push({ date, value })
    }
  }
  return rows
}

function onFileChange(uploadFile) {
  file.value = uploadFile.raw
  const name = uploadFile.name || ''
  const isExcel = /\.xlsx?$/i.test(name)

  if (isExcel) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result)
      cachedRows = parseExcel(data)
      preview.value = cachedRows.slice(0, 5)
      previewCount.value = cachedRows.length
    }
    reader.readAsArrayBuffer(uploadFile.raw)
  } else {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      cachedRows = parseCSV(text)
      preview.value = cachedRows.slice(0, 5)
      previewCount.value = cachedRows.length
    }
    reader.readAsText(uploadFile.raw)
  }
}

function submitImport() {
  if (cachedRows.length === 0) {
    ElMessage.warning('未解析到有效数据')
    return
  }
  uploading.value = true

  const csvContent = 'date,value\n' + cachedRows.map(r => `${r.date},${r.value}`).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const csvFile = new File([blob], 'import.csv', { type: 'text/csv' })

  importDataSourceCsv(props.sourceId, csvFile).then(res => {
    if (res.code === 200) {
      ElMessage.success('导入成功' + (res.data?.dataPoints ? '，共 ' + res.data.dataPoints + ' 条' : ''))
      emit('success')
    } else {
      ElMessage.error(res.msg || '导入失败')
    }
  }).catch(err => {
    ElMessage.error(err.msg || '导入失败')
  }).finally(() => {
    uploading.value = false
  })
}
</script>
