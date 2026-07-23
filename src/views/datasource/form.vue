<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="如：美国CPI同比" maxlength="128" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="Slug" prop="slug">
          <el-input v-model="form.slug" placeholder="如：us-cpi" maxlength="64" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="数据源类型" style="width: 100%">
            <el-option label="FRED API" value="fred" />
            <el-option label="Yahoo Finance" value="yahoo" />
            <el-option label="CSV导入" value="csv" />
            <el-option label="手动录入" value="manual" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="来源代码" prop="sourceCode">
          <el-input v-model="sourceCode" :placeholder="typePlaceholder" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20" v-if="form.type === 'csv' || form.type === 'manual'">
      <el-col :span="12">
        <el-form-item label="资料来源">
          <el-input v-model="form.config.sourceName" placeholder="如：国家统计局" maxlength="128" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="资料链接">
          <el-input v-model="form.config.sourceUrl" placeholder="如：https://www.stats.gov.cn" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="地区" prop="region">
          <el-select v-model="form.region" placeholder="地区" style="width: 100%">
            <el-option label="中国" value="cn" />
            <el-option label="美国" value="us" />
            <el-option label="全球" value="global" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="分类" style="width: 100%">
            <el-option v-for="opt in formCategoryOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="如：%" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="展示单位">
          <el-input v-model="form.displayUnit" placeholder="如：年增率(%)" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="数据变换" prop="transform">
          <el-select v-model="form.transform" style="width: 100%">
            <el-option label="原始值" value="none" />
            <el-option label="同比" value="yoy" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="更新频率">
          <el-input v-model="form.schedule" placeholder="Cron表达式，如 0 6 * * 1" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="前台可见" prop="isPublic">
          <el-switch v-model="form.isPublic" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="仅PRO可见" prop="proOnly">
          <el-switch v-model="form.proOnly" />
        </el-form-item>
      </el-col>
    </el-row>
    <el-form-item label="描述" prop="description">
      <el-input v-model="form.description" type="textarea" :rows="2" maxlength="500" />
    </el-form-item>
  </el-form>
  <div style="text-align: center; margin-top: 20px">
    <el-button @click="emit('cancel')">取消</el-button>
    <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
  </div>
</template>

<script setup>
import { ref, reactive, computed, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
import { getDataSource, addDataSource, updateDataSource } from '@/api/datasource'

const props = defineProps({ id: { type: String, default: '' }, defaultType: { type: String, default: 'fred' } })
const emit = defineEmits(['success', 'cancel'])

const formRef = ref(null)
const submitting = ref(false)

const ALL_CATEGORIES = [
  { label: 'World Indices', value: 'World Indices' },
  { label: 'Stocks', value: 'Stocks' },
  { label: 'ETFs', value: 'ETFs' },
  { label: 'Bonds', value: 'Bonds' },
  { label: 'Currencies', value: 'Currencies' },
  { label: 'Crypto', value: 'Crypto' },
  { label: 'Options', value: 'Options' },
  { label: 'Sectors', value: 'Sectors' },
  { label: 'Futures', value: 'Futures' },
  { label: 'Mutual Funds', value: 'Mutual Funds' },
  { label: 'Private Companies', value: 'Private Companies' },
  { label: '通胀', value: 'price' },
  { label: '就业', value: 'employment' },
  { label: '制造业', value: 'manufacturing' },
  { label: '贸易', value: 'trade' },
  { label: '货币', value: 'monetary' },
  { label: '市场', value: 'market' },
]

const formCategoryOptions = computed(() => {
  if (form.type === 'yahoo') {
    return ALL_CATEGORIES.filter(c => ['World Indices','Bonds','Currencies','Options','Sectors','Stocks','Crypto','Private Companies','ETFs','Futures','Mutual Funds'].includes(c.value))
  }
  if (form.type === 'fred') {
    return ALL_CATEGORIES.filter(c => ['price','employment','manufacturing','trade','monetary','market'].includes(c.value))
  }
  return ALL_CATEGORIES
})

const data = reactive({
  form: {
    id: '',
    name: '',
    slug: '',
    type: 'fred',
    unit: '',
    displayUnit: '',
    region: 'us',
    category: 'price',
    transform: 'none',
    schedule: '',
    description: '',
    isPublic: true,
    proOnly: false,
    config: {
      sourceName: '',
      sourceUrl: ''
    }
  },
  rules: {
    name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
    slug: [{ required: true, message: 'Slug不能为空', trigger: 'blur' }],
    type: [{ required: true, message: '类型不能为空', trigger: 'change' }],
    region: [{ required: true, message: '地区不能为空', trigger: 'change' }],
    category: [{ required: true, message: '分类不能为空', trigger: 'change' }]
  }
})

const { form, rules } = toRefs(data)

const sourceCode = computed({
  get() {
    const cfg = form.value.config || {}
    if (form.value.type === 'fred') return cfg.seriesId || ''
    if (form.value.type === 'yahoo') return cfg.ticker || ''
    if (form.value.type === 'csv') return cfg.fileName || ''
    if (form.value.type === 'manual') return cfg.source || ''
    return ''
  },
  set(val) {
    if (form.value.type === 'fred') form.value.config = { ...form.value.config, seriesId: val }
    else if (form.value.type === 'yahoo') form.value.config = { ...form.value.config, ticker: val }
    else if (form.value.type === 'csv') form.value.config = { ...form.value.config, fileName: val }
    else if (form.value.type === 'manual') form.value.config = { ...form.value.config, source: val }
  }
})

const typePlaceholder = computed(() => {
  if (form.value.type === 'fred') return 'FRED Series ID，如 CPIAUCSL'
  if (form.value.type === 'yahoo') return 'Yahoo Ticker，如 ^GSPC'
  if (form.value.type === 'csv') return '数据文件名称或备注，如 季度GDP'
  if (form.value.type === 'manual') return '数据来源备注'
  return ''
})

// 新建时使用默认类型
if (!props.id && props.defaultType !== 'fred') {
  form.value.type = props.defaultType
}

// 编辑时加载数据
if (props.id) {
  getDataSource(props.id).then(res => {
    if (res.data) {
      form.value = { ...form.value, ...res.data }
    }
  })
}

function submitForm() {
  formRef.value.validate(valid => {
    if (!valid) return
    submitting.value = true
    const data = { ...form.value }

    const action = props.id
      ? updateDataSource(props.id, data)
      : addDataSource(data)

    action.then(res => {
      if (res.code === 200) {
        ElMessage.success(props.id ? '编辑成功' : '新增成功')
        emit('success')
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    }).catch(err => {
      ElMessage.error(err.msg || '操作失败')
    }).finally(() => {
      submitting.value = false
    })
  })
}
</script>
