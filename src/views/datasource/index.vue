<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="FRED" name="fred" />
      <el-tab-pane label="Yahoo" name="yahoo" />
      <el-tab-pane label="自定义导入" name="custom" />
    </el-tabs>

    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="关键词" prop="name">
        <el-input v-model="queryParams.name" placeholder="名称/Slug" clearable style="width: 180px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="地区" prop="region">
        <el-select v-model="queryParams.region" placeholder="地区" clearable style="width: 120px">
          <el-option label="中国" value="cn" />
          <el-option label="美国" value="us" />
          <el-option label="全球" value="global" />
        </el-select>
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select v-model="queryParams.category" placeholder="分类" clearable style="width: 140px">
          <el-option v-for="opt in categoryOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="同步状态" prop="status" v-if="activeTab !== 'custom'">
        <el-select v-model="queryParams.status" placeholder="同步状态" clearable style="width: 140px">
          <el-option label="成功" value="success" />
          <el-option label="失败" value="error" />
          <el-option label="未同步" value="never" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5" v-if="activeTab === 'fred'">
        <el-button type="success" plain icon="Refresh" @click="handleSyncAll" v-hasPermi="['datasource:sync']" :loading="syncingAll">
          按分类同步
        </el-button>
      </el-col>
      <el-col :span="1.5" v-if="activeTab === 'yahoo'">
        <el-select v-model="yahooCategory" placeholder="选择分类" style="width: 160px; margin-right: 8px;" @change="handleYahooSync">
          <el-option label="同步所有分类" value="__all__" />
          <el-option label="World Indices" value="world-indices" />
          <el-option label="Stocks" value="stocks" />
          <el-option label="ETFs" value="etfs" />
          <el-option label="Bonds" value="bonds" />
          <el-option label="Currencies" value="currencies" />
          <el-option label="Crypto" value="crypto" />
          <el-option label="Options" value="options" />
          <el-option label="Private Companies" value="private-companies" />
          <el-option label="Futures" value="futures" />
          <el-option label="Sectors" value="sectors" />
          <el-option label="Mutual Funds" value="mutual-funds" />
        </el-select>
        <el-button type="success" plain icon="Refresh" @click="handleYahooSync(yahooCategory)" v-hasPermi="['datasource:sync']" :loading="syncingAll">
          按分类同步
        </el-button>
      </el-col>
      <el-col :span="1.5" v-if="activeTab === 'custom'">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['datasource:add']">
          新建
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="dataList" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="名称" prop="name" min-width="160" />
      <el-table-column label="Slug" prop="slug" width="140">
        <template #default="{ row }"><code>{{ row.slug }}</code></template>
      </el-table-column>
      <el-table-column label="类型" prop="type" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="typeTag(row.type)" size="small">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="地区" prop="region" width="70" align="center" />
      <el-table-column label="分类" prop="category" width="140" align="center" />
      <el-table-column label="单位" prop="unit" width="80" align="center" />
      <el-table-column label="同步状态" width="100" align="center" v-if="activeTab !== 'custom'">
        <template #default="{ row }">
          <el-tag v-if="row.lastSyncStatus === 'success'" type="success" size="small">成功</el-tag>
          <el-tag v-else-if="row.lastSyncStatus === 'error'" type="danger" size="small">失败</el-tag>
          <el-tag v-else type="info" size="small">未同步</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center" v-if="activeTab === 'custom'">
        <template #default="{ row }">
          <el-tag :type="row.enabled !== false ? 'success' : 'danger'" size="small">
            {{ row.enabled !== false ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="原文链接" min-width="200" v-if="activeTab !== 'custom'">
        <template #default="{ row }">
          <el-link v-if="sourceUrl(row)" :href="sourceUrl(row)" target="_blank" type="primary" :underline="false">
            {{ sourceLabel(row) }}
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="最近同步" width="160" align="center" v-if="activeTab !== 'custom'">
        <template #default="{ row }">
          <span>{{ row.lastSyncAt ? parseTime(row.lastSyncAt) : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="前台可见" width="80" align="center">
        <template #default="{ row }">
          <el-switch :model-value="row.isPublic !== false" disabled />
        </template>
      </el-table-column>
      <el-table-column label="操作" :width="activeTab === 'custom' ? 350 : 290" align="center" fixed="right">
        <template #default="{ row }">
          <el-button v-if="activeTab !== 'custom'" link type="primary" icon="Refresh" @click="handleSync(row)" v-hasPermi="['datasource:sync']">同步</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(row)" v-hasPermi="['datasource:edit']">编辑</el-button>
          <template v-if="activeTab === 'custom'">
            <el-button link type="primary" icon="EditPen" @click="handleManualData(row)" v-hasPermi="['datasource:import']">数据</el-button>
            <el-button link type="primary" icon="Upload" @click="handleImport(row)" v-hasPermi="['datasource:import']">导入</el-button>
            <el-button v-if="row.enabled !== false" link type="danger" icon="Delete" @click="handleDelete(row)" v-hasPermi="['datasource:remove']">停用</el-button>
            <el-button v-else link type="success" icon="Check" @click="handleEnable(row)" v-hasPermi="['datasource:edit']">启用</el-button>
          </template>
          <el-button v-else link type="primary" icon="Upload" @click="handleImport(row)" v-hasPermi="['datasource:import']">导入</el-button>
          <el-button v-if="activeTab !== 'custom'" link type="primary" icon="Tickets" @click="handleLogs(row)" v-hasPermi="['datasource:list']">日志</el-button>
          <el-button v-if="activeTab !== 'custom'" link type="danger" icon="Delete" @click="handleDelete(row)" v-hasPermi="['datasource:remove']">停用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="formTitle" v-model="formVisible" width="640px" append-to-body>
      <data-source-form :key="formKey" :id="formId" :default-type="formDefaultType" @success="onFormSuccess" @cancel="formVisible = false" />
    </el-dialog>

    <el-dialog title="同步日志" v-model="logVisible" width="800px" append-to-body>
      <sync-log-dialog :source-id="logSourceId" />
    </el-dialog>

    <el-dialog title="CSV导入" v-model="importVisible" width="500px" append-to-body>
      <import-dialog :key="importKey" :source-id="importSourceId" :source-name="importSourceName" :slug="importSlug" @success="onImportSuccess" @cancel="importVisible = false" />
    </el-dialog>

    <el-dialog title="手动录入数据" v-model="manualDataVisible" width="640px" append-to-body>
      <manual-data-dialog :slug="manualDataSlug" :name="manualDataName" @success="onManualDataSuccess" @cancel="manualDataVisible = false" />
    </el-dialog>
  </div>
</template>

<script setup name="DataSource">
import { ref, reactive, toRefs, computed, getCurrentInstance, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listDataSource, delDataSource, syncDataSource, syncAllCategories, syncYahooCategory, syncAllYahooCategories, updateDataSource } from '@/api/datasource'
import DataSourceForm from './form.vue'
import SyncLogDialog from './components/SyncLogDialog.vue'
import ImportDialog from './components/ImportDialog.vue'
import ManualDataDialog from './components/ManualDataDialog.vue'

const { proxy } = getCurrentInstance()

const activeTab = ref('fred')
const dataList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const ids = ref([])

const formVisible = ref(false)
const formKey = ref(0)
const formTitle = ref('')
const formId = ref('')
const formDefaultType = ref('fred')
const syncingAll = ref(false)
const yahooCategory = ref('__all__')

const categoryOptions = computed(() => {
  if (activeTab.value === 'fred') {
    return [
      { label: '物价', value: 'price' },
      { label: '就业', value: 'employment' },
      { label: '制造业', value: 'manufacturing' },
      { label: '贸易', value: 'trade' },
      { label: '货币', value: 'monetary' },
      { label: '市场', value: 'market' },
    ]
  }
  return [
    { label: 'World Indices', value: 'World Indices' },
    { label: 'Bonds', value: 'Bonds' },
    { label: 'Currencies', value: 'Currencies' },
    { label: 'Options', value: 'Options' },
    { label: 'Sectors', value: 'Sectors' },
    { label: 'Stocks', value: 'Stocks' },
    { label: 'Crypto', value: 'Crypto' },
    { label: 'Private Companies', value: 'Private Companies' },
    { label: 'ETFs', value: 'ETFs' },
    { label: 'Futures', value: 'Futures' },
    { label: 'Mutual Funds', value: 'Mutual Funds' },
  ]
})

const logVisible = ref(false)
const logSourceId = ref('')

const importVisible = ref(false)
const importKey = ref(0)
const importSourceId = ref('')
const importSourceName = ref('')
const importSlug = ref('')

const manualDataVisible = ref(false)
const manualDataSlug = ref('')
const manualDataName = ref('')

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    type: 'fred',
    name: '',
    region: '',
    category: '',
    status: ''
  }
})

const { queryParams } = toRefs(data)

// Ensure queryParams.type stays in sync with the active tab
watch(activeTab, (tab) => {
  queryParams.value.type = tab === 'custom' ? 'custom' : tab
})

function parseConfig(row) {
  if (!row.config) return {}
  if (typeof row.config === 'string') {
    try { return JSON.parse(row.config) } catch { return {} }
  }
  return row.config
}

function sourceUrl(row) {
  const cfg = parseConfig(row)
  if (row.type === 'fred' && cfg.seriesId) {
    return 'https://fred.stlouisfed.org/series/' + cfg.seriesId
  }
  if (row.type === 'yahoo' && cfg.ticker) {
    return 'https://finance.yahoo.com/chart/' + encodeURIComponent(cfg.ticker)
  }
  return ''
}

function sourceLabel(row) {
  const cfg = parseConfig(row)
  if (row.type === 'fred') return cfg.seriesId || '-'
  if (row.type === 'yahoo') return cfg.ticker || '-'
  if (row.type === 'csv') return cfg.fileName || 'CSV文件'
  if (row.type === 'manual') return cfg.source || '手动录入'
  return '-'
}

function typeTag(type) {
  const map = { fred: '', yahoo: 'warning', csv: 'success', manual: 'info' }
  return map[type] || ''
}

function getList() {
  loading.value = true
  listDataSource(queryParams.value).then(res => {
    dataList.value = res.rows || []
    total.value = res.total || 0
    loading.value = false
  }).catch(() => { loading.value = false })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function activeTabType() {
  return activeTab.value === 'custom' ? 'custom' : activeTab.value
}

function resetQuery() {
  proxy.resetForm('queryRef')
  queryParams.value.type = activeTabType()
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(r => r.id)
}

function handleYahooSync(categorySlug) {
  if (!categorySlug) return
  const label = categorySlug === '__all__' ? '所有Yahoo分类' : categorySlug
  ElMessageBox.confirm('将从 Yahoo 按分类拉取最新数据源并采集数据，确认？', '提示', {
    confirmButtonText: '开始同步',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    syncingAll.value = true
    const req = categorySlug === '__all__'
      ? syncAllYahooCategories()
      : syncYahooCategory(categorySlug)
    req.then(res => {
      if (res.code === 200) {
        ElMessage.success('同步已启动，请稍后手动刷新查看结果')
      } else {
        ElMessage.error(res.msg || '同步失败')
      }
    }).catch(err => {
      ElMessage.error(err.msg || '同步失败')
    }).finally(() => {
      syncingAll.value = false
    })
  }).catch(() => {})
}

function handleTabClick(tab) {
  queryParams.value.type = tab.paneName === 'custom' ? 'custom' : tab.paneName
  queryParams.value.pageNum = 1
  getList()
}

function handleManualData(row) {
  manualDataSlug.value = row.slug
  manualDataName.value = row.name
  manualDataVisible.value = true
}

function onManualDataSuccess() {
  manualDataVisible.value = false
  getList()
}

function handleSyncAll() {
  ElMessageBox.confirm('将从 FRED 按分类拉取最新数据源并采集数据，确认？', '提示', {
    confirmButtonText: '开始同步',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    syncingAll.value = true
    syncAllCategories().then(res => {
      if (res.code === 200) {
        ElMessage.success('同步已启动，请稍后手动刷新查看结果')
      } else {
        ElMessage.error(res.msg || '同步失败')
      }
    }).catch(err => {
      ElMessage.error(err.msg || '同步失败')
    }).finally(() => {
      syncingAll.value = false
    })
  }).catch(() => {})
}

function handleAdd() {
  formTitle.value = '新建数据源'
  formId.value = ''
  formDefaultType.value = 'csv'
  formKey.value++
  formVisible.value = true
}

function handleUpdate(row) {
  formTitle.value = '编辑数据源'
  formId.value = row.id
  formVisible.value = true
}

function onFormSuccess() {
  formVisible.value = false
  getList()
}

function handleSync(row) {
  ElMessageBox.confirm('确认同步 "' + row.name + '" 的数据？', '提示', {
    confirmButtonText: '立即同步',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    syncDataSource(row.id).then(res => {
      if (res.code === 200) {
        ElMessage.success(res.data?.dataPoints ? '同步成功，采集 ' + res.data.dataPoints + ' 条' : '同步成功')
        getList()
      } else {
        ElMessage.error(res.msg || '同步失败')
      }
    }).catch(err => {
      ElMessage.error(err.msg || '同步失败')
    })
  }).catch(() => {})
}

function handleImport(row) {
  importSourceId.value = row.id
  importSourceName.value = row.name
  importSlug.value = row.slug
  importKey.value++
  importVisible.value = true
}

function onImportSuccess() {
  importVisible.value = false
  getList()
}

function handleLogs(row) {
  logSourceId.value = row.id
  logVisible.value = true
}

function handleDelete(row) {
  ElMessageBox.confirm('确认停用数据源 "' + row.name + '"？', '警告', {
    confirmButtonText: '停用',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    delDataSource(row.id).then(() => {
      ElMessage.success('已停用')
      getList()
    })
  }).catch(() => {})
}

function handleEnable(row) {
  ElMessageBox.confirm('确认启用数据源 "' + row.name + '"？', '提示', {
    confirmButtonText: '启用',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    updateDataSource(row.id, { enabled: true }).then(res => {
      if (res.code === 200) {
        ElMessage.success('已启用')
        getList()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    })
  }).catch(() => {})
}

onMounted(() => { getList() })
</script>
