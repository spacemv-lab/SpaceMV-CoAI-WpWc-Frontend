<template>
  <div class="content-page">
    <div class="content-topbar">
      <h3>模板管理</h3>
      <el-button type="primary" @click="handleAdd">新建模板</el-button>
    </div>

    <el-table :data="templateList" v-loading="loading" stripe>
      <el-table-column prop="name" label="模板名称" min-width="160" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column label="目标平台" width="120">
        <template #default="{ row }">
          <el-tag size="small">{{ row.platform === 'WECHAT_OFFICIAL_ACCOUNT' ? '微信' : row.platform }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="stylePreset" label="样式预设" width="140" />
      <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
      <el-table-column label="默认" width="80" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.isDefault === '1'" type="success" size="small">默认</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="70" align="center" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="primary" link size="small" @click="handleUse(row)">使用</el-button>
          <el-popconfirm title="确认删除此模板？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button type="danger" link size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑模板' : '新建模板'" width="560px">
      <el-form :model="form" label-width="100px" size="small">
        <el-form-item label="模板名称" required>
          <el-input v-model="form.name" placeholder="如：格物科技深度-微信蓝" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="form.category" placeholder="如：WECHAT" />
        </el-form-item>
        <el-form-item label="目标平台" required>
          <el-select v-model="form.platform">
            <el-option label="微信公众号" value="WECHAT_OFFICIAL_ACCOUNT" />
            <el-option label="SpaceMV问道" value="SITE_WENDAO" />
          </el-select>
        </el-form-item>
        <el-form-item label="样式预设">
          <el-input v-model="form.stylePreset" placeholder="如：gewu-wechat-blue" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="排序号">
          <el-input-number v-model="form.sortOrder" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefaultBool" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getTemplateList, createTemplate, updateTemplate, deleteTemplate, getTemplate } from '@/api/content/template'
import { ElMessage } from 'element-plus'

export default {
  name: 'TemplateManagement',
  data() {
    return {
      loading: false,
      templateList: [],
      dialogVisible: false,
      isEdit: false,
      form: {
        id: null,
        name: '',
        category: '',
        platform: 'WECHAT_OFFICIAL_ACCOUNT',
        stylePreset: '',
        description: '',
        sortOrder: 0,
        isDefaultBool: false
      }
    }
  },
  mounted() {
    this.loadList()
  },
  methods: {
    async loadList() {
      this.loading = true
      try {
        const res = await getTemplateList({ pageNum: 1, pageSize: 100 })
        this.templateList = res.rows || res.data || []
      } catch {
        this.templateList = []
      } finally {
        this.loading = false
      }
    },
    handleAdd() {
      this.isEdit = false
      this.form = { id: null, name: '', category: '', platform: 'WECHAT_OFFICIAL_ACCOUNT', stylePreset: '', description: '', sortOrder: 0, isDefaultBool: false }
      this.dialogVisible = true
    },
    async handleEdit(row) {
      this.isEdit = true
      const res = await getTemplate(row.id)
      if (res.code === 200 && res.data) {
        const d = res.data
        this.form = {
          id: d.id,
          name: d.name || '',
          category: d.category || '',
          platform: d.platform || 'WECHAT_OFFICIAL_ACCOUNT',
          stylePreset: d.stylePreset || '',
          description: d.description || '',
          sortOrder: d.sortOrder || 0,
          isDefaultBool: d.isDefault === '1'
        }
      }
      this.dialogVisible = true
    },
    handleUse(row) {
      this.$router.push(`/contentCenter/article/edit?templateId=${row.id}`)
    },
    async handleSave() {
      const data = {
        name: this.form.name,
        category: this.form.category,
        platform: this.form.platform,
        stylePreset: this.form.stylePreset,
        snapshotJson: '{"type":"doc","content":[]}',
        description: this.form.description,
        sortOrder: this.form.sortOrder,
        isDefault: this.form.isDefaultBool ? '1' : '0'
      }
      try {
        if (this.isEdit) {
          await updateTemplate(this.form.id, data)
          ElMessage.success('修改成功')
        } else {
          await createTemplate(data)
          ElMessage.success('创建成功')
        }
        this.dialogVisible = false
        this.loadList()
      } catch (e) {
        ElMessage.error(e.message || '操作失败')
      }
    },
    async handleDelete(id) {
      try {
        await deleteTemplate(id)
        ElMessage.success('删除成功')
        this.loadList()
      } catch (e) {
        ElMessage.error(e.message || '删除失败')
      }
    }
  }
}
</script>
