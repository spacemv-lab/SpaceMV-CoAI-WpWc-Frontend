/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
<template>
   <div class="notice-container ignore-vw" v-loading="loading">
      <div class="mobile-page-header">
        <h1 class="mobile-page-title">公告管理</h1>
      </div>

      <!-- 搜索区域 -->
      <section class="mobile-panel search-panel">
        <el-form :model="queryParams" ref="queryRef">
           <el-form-item>
              <el-input
                 v-model="queryParams.noticeTitle"
                 placeholder="请输入公告标题"
                 clearable
                 @keyup.enter="handleQuery"
              />
           </el-form-item>
           <el-form-item>
              <el-input
                 v-model="queryParams.createBy"
                 placeholder="请输入操作人员"
                 clearable
                 @keyup.enter="handleQuery"
              />
           </el-form-item>
           <el-form-item>
              <el-select v-model="queryParams.noticeType" placeholder="公告类型" clearable>
                 <el-option
                    v-for="dict in sys_notice_type"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                 />
              </el-select>
           </el-form-item>
           <div class="search-actions">
              <el-button type="primary" class="search-btn" @click="handleQuery">搜索</el-button>
              <el-button class="reset-btn" @click="resetQuery">重置</el-button>
           </div>
        </el-form>
      </section>

      <!-- 操作按钮区域 -->
      <section class="mobile-panel action-panel" v-if="auth.hasPermiOr(['system:notice:add', 'system:notice:edit', 'system:notice:remove'])">
        <div class="action-grid">
           <el-button
              type="primary"
              class="action-btn add-btn"
              @click="handleAdd"
              v-hasPermi="['system:notice:add']"
           >
             <span class="btn-icon">+</span>
             <span>新增</span>
           </el-button>
           <el-button
              type="success"
              class="action-btn edit-btn"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['system:notice:edit']"
           >
             <span>修改</span>
           </el-button>
           <el-button
              type="danger"
              class="action-btn delete-btn"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['system:notice:remove']"
           >
             <span>删除</span>
           </el-button>
        </div>
      </section>

      <!-- 公告列表 -->
      <section class="mobile-panel list-panel">
        <div class="panel-title">公告列表</div>
        <div v-if="noticeList.length" class="mobile-list">
          <article 
            v-for="(item, index) in noticeList" 
            :key="`${item.noticeId}-${index}`" 
            class="list-card"
            @click="toggleSelect(item)"
          >
            <div class="card-header">
              <div class="checkbox-wrap">
                <el-checkbox 
                  v-model="selectedIds" 
                  :label="item.noticeId"
                  @change.stop="handleSelectionChange([...selectedIds])"
                />
              </div>
              <div class="card-info">
                <div class="card-title">{{ item.noticeTitle || '未命名' }}</div>
                <div class="card-meta">
                  <span class="meta-item">
                    <dict-tag :options="sys_notice_type" :value="item.noticeType" />
                  </span>
                  <span class="meta-item">
                    <el-tag 
                       v-if="item.status === '0'" 
                       type="success"
                       size="small"
                    >正常</el-tag>
                    <el-tag 
                       v-else-if="item.status === '1'" 
                       type="danger"
                       size="small"
                    >关闭</el-tag>
                    <el-tag 
                       v-else-if="item.status === '2'" 
                       type="warning"
                       size="small"
                    >数据同步中</el-tag>
                    <dict-tag 
                       v-else 
                       :options="sys_notice_status" 
                       :value="item.status" 
                       size="small"
                    />
                  </span>
                </div>
              </div>
            </div>
            
            <div class="card-content">
              <div class="content-preview">{{ item.noticeContent || '-' }}</div>
            </div>
            
            <div class="card-footer">
              <div class="footer-info">
                <span class="creator">{{ item.createBy || '-' }}</span>
                <span class="create-time">{{ parseTime(item.createTime, '{y}-{m}-{d}') }}</span>
              </div>
              <div class="card-actions">
                <el-button 
                  type="text" 
                  size="small" 
                  class="action-link"
                  @click.stop="showDetail(item)"
                >详情</el-button>
                <el-button 
                  type="text" 
                  size="small" 
                  class="action-link"
                  @click.stop="handleUpdate(item)"
                  v-hasPermi="['system:notice:edit']"
                >修改</el-button>
                <el-button 
                  type="text" 
                  size="small" 
                  class="action-link delete"
                  @click.stop="handleDelete(item)"
                  v-hasPermi="['system:notice:remove']"
                >删除</el-button>
              </div>
            </div>
          </article>
        </div>
        <div v-else class="empty-text">暂无数据</div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pager-wrap">
          <pagination
             :total="total"
             v-model:page="queryParams.pageNum"
             v-model:limit="queryParams.pageSize"
             :page-sizes="[5, 10, 20, 50, 100]"
             layout="total, prev, pager, next, jumper"
             @pagination="getList"
          />
        </div>
      </section>

      <!-- 详情弹窗 -->
      <el-dialog v-model="detailVisible" title="公告详情" width="90%" :max-width="500">
        <div class="detail-content">
          <div class="detail-title">{{ detailData.noticeTitle }}</div>
          <div class="detail-meta">
            <span class="meta-item">类型：<dict-tag :options="sys_notice_type" :value="detailData.noticeType" /></span>
            <span class="meta-item">状态：
              <el-tag 
                 v-if="detailData.status === '0'" 
                 type="success"
                 size="small"
              >正常</el-tag>
              <el-tag 
                 v-else-if="detailData.status === '1'" 
                 type="danger"
                 size="small"
              >关闭</el-tag>
              <el-tag 
                 v-else-if="detailData.status === '2'" 
                 type="warning"
                 size="small"
              >数据同步中</el-tag>
              <dict-tag 
                 v-else 
                 :options="sys_notice_status" 
                 :value="detailData.status" 
                 size="small"
              />
            </span>
            <span class="meta-item">创建人：{{ detailData.createBy }}</span>
            <span class="meta-item">创建时间：{{ parseTime(detailData.createTime) }}</span>
          </div>
          <div class="detail-body">{{ detailData.noticeContent }}</div>
        </div>
        <template #footer>
           <div class="dialog-footer">
              <el-button @click="detailVisible = false">关闭</el-button>
           </div>
        </template>
      </el-dialog>

      <!-- 添加或修改公告对话框 -->
      <el-dialog :title="title" v-model="open" width="90%" :max-width="500">
         <el-form ref="noticeRef" :model="form" :rules="rules" label-width="70px">
            <el-form-item label="公告标题" prop="noticeTitle">
               <el-input v-model="form.noticeTitle" placeholder="请输入公告标题" />
            </el-form-item>
            <el-form-item label="公告类型" prop="noticeType">
               <el-select v-model="form.noticeType" placeholder="请选择">
                  <el-option
                     v-for="dict in sys_notice_type"
                     :key="dict.value"
                     :label="dict.label"
                     :value="dict.value"
                  ></el-option>
               </el-select>
            </el-form-item>
            <el-form-item label="状态">
               <el-radio-group v-model="form.status">
                  <el-radio
                     v-for="dict in sys_notice_status"
                     :key="dict.value"
                     :value="dict.value"
                  >{{ dict.label }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="内容">
              <editor v-model="form.noticeContent" :min-height="192"/>
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup>
defineOptions({
  name: 'MobileNotice'
})

import { ref, reactive, toRefs, watch, getCurrentInstance } from "vue"
import { listNotice, getNotice, delNotice, addNotice, updateNotice } from "@/api/system/notice"
import { parseTime } from "@/utils/tianxun"
import auth from '@/plugins/auth'

const { proxy } = getCurrentInstance()
const { sys_notice_status, sys_notice_type } = proxy.useDict("sys_notice_status", "sys_notice_type")

const noticeList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const detailVisible = ref(false)
const detailData = ref({})
const selectedIds = ref([])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    noticeTitle: undefined,
    createBy: undefined,
    status: undefined
  },
  rules: {
    noticeTitle: [{ required: true, message: "公告标题不能为空", trigger: "blur" }],
    noticeType: [{ required: true, message: "公告类型不能为空", trigger: "change" }]
  },
})

const { queryParams, form, rules } = toRefs(data)

watch(selectedIds, (newVal) => {
  ids.value = [...newVal]
  single.value = newVal.length !== 1
  multiple.value = !newVal.length
})

/** 查询公告列表 */
function getList() {
  loading.value = true
  listNotice(queryParams.value).then(response => {
    noticeList.value = response.rows
    total.value = response.total
    loading.value = false
    selectedIds.value = []
  })
}

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 表单重置 */
function reset() {
  form.value = {
    noticeId: undefined,
    noticeTitle: undefined,
    noticeType: undefined,
    noticeContent: undefined,
    status: "0"
  }
  proxy.resetForm("noticeRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => typeof item === 'number' ? item : item.noticeId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 切换选中状态 */
function toggleSelect(item) {
  const index = selectedIds.value.indexOf(item.noticeId)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(item.noticeId)
  }
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加公告"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const noticeId = row.noticeId || ids.value
  getNotice(noticeId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改公告"
  })
}

/** 显示详情 */
function showDetail(row) {
  detailData.value = row
  detailVisible.value = true
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["noticeRef"].validate(valid => {
    if (valid) {
      if (form.value.noticeId != undefined) {
        updateNotice(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addNotice(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const noticeIds = row.noticeId || ids.value
  proxy.$modal.confirm('是否确认删除公告编号为"' + noticeIds + '"的数据项？').then(function() {
    return delNotice(noticeIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

getList()
</script>

<style scoped lang="scss">
$page-top: #f7f9ff;
$page-bottom: #edf2fb;
$card-bg: rgba(255, 255, 255, 0.96);
$card-border: rgba(225, 231, 244, 0.95);
$card-shadow: 0 16px 34px rgba(106, 124, 163, 0.12);
$text-main: #3f4963;
$text-sub: #8f97ad;
$text-light: #a8b0c4;
$brand-start: #5f7cf0;
$brand-end: #7a8fe7;

.ignore-vw.notice-container {
  min-height: 100vh;
  min-height: 100dvh;
  padding: calc(env(safe-area-inset-top, 0px) + 16px) 16px calc(env(safe-area-inset-bottom, 0px) + 28px);
  background:
    radial-gradient(circle at 14% 10%, rgba(107, 126, 239, 0.15), rgba(107, 126, 239, 0) 26%),
    radial-gradient(circle at 86% 6%, rgba(111, 161, 224, 0.14), rgba(111, 161, 224, 0) 24%),
    linear-gradient(180deg, $page-top 0%, $page-bottom 100%);
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

.ignore-vw .mobile-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.ignore-vw .mobile-page-title {
  margin: 0;
  font-size: 22px;
  line-height: 1.25;
  font-weight: 700;
  color: $text-main;
}

.ignore-vw .mobile-panel {
  margin-bottom: 12px;
  padding: 14px;
  background: $card-bg;
  border: 1px solid $card-border;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(66, 88, 122, 0.06);
}

.ignore-vw .panel-title {
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: $text-main;
  margin-bottom: 12px;
}

.ignore-vw .search-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.ignore-vw .search-btn,
.ignore-vw .reset-btn {
  flex: 1;
  height: 42px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

.ignore-vw .search-btn {
  background: linear-gradient(135deg, $brand-start 0%, $brand-end 100%);
  border: none;
}

.ignore-vw .action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.ignore-vw .action-btn {
  height: 42px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  &.add-btn {
    background: linear-gradient(135deg, $brand-start 0%, $brand-end 100%);
    border: none;
    .btn-icon {
      font-size: 18px;
      font-weight: 700;
    }
  }
  
  &.edit-btn {
    background: #f0f9ff;
    color: #10b981;
    border-color: #86efac;
  }
  
  &.delete-btn {
    background: #fef2f2;
    color: #ef4444;
    border-color: #fca5a5;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.ignore-vw .mobile-list {
  margin-top: 12px;
}

.ignore-vw .list-card {
  padding: 14px;
  border: 1px solid #e6ebf3;
  border-radius: 14px;
  background: #fbfcff;
  margin-bottom: 10px;
  
  &:active {
    background: #f5f7fa;
  }
}

.ignore-vw .card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.ignore-vw .checkbox-wrap {
  flex-shrink: 0;
  padding-top: 4px;
}

.ignore-vw .card-info {
  flex: 1;
  min-width: 0;
}

.ignore-vw .card-title {
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: $text-main;
  margin-bottom: 6px;
  word-break: break-word;
}

.ignore-vw .card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ignore-vw .meta-item {
  font-size: 12px;
}

.ignore-vw .card-content {
  padding: 12px;
  background: rgba(247, 249, 253, 0.8);
  border-radius: 10px;
  margin-bottom: 12px;
}

.ignore-vw .content-preview {
  font-size: 14px;
  line-height: 1.6;
  color: $text-sub;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.ignore-vw .card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #edf1f6;
}

.ignore-vw .footer-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: $text-light;
}

.ignore-vw .card-actions {
  display: flex;
  gap: 16px;
}

.ignore-vw .action-link {
  font-size: 13px;
  color: $brand-start;
  padding: 0;
  
  &.delete {
    color: #ef4444;
  }
  
  &:hover {
    color: darken($brand-start, 10%);
  }
}

.ignore-vw .empty-text {
  padding: 28px 0 12px;
  text-align: center;
  font-size: 14px;
  line-height: 20px;
  color: $text-sub;
}

.ignore-vw .pager-wrap {
  margin-top: 14px;
  padding: 14px 0 8px;
  border-top: 1px solid #edf1f6;
}

.ignore-vw .detail-content {
  padding: 8px 0;
}

.ignore-vw .detail-title {
  font-size: 18px;
  font-weight: 700;
  color: $text-main;
  margin-bottom: 12px;
  word-break: break-word;
}

.ignore-vw .detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 13px;
  color: $text-sub;
  padding-bottom: 12px;
  border-bottom: 1px solid #edf1f6;
}

.ignore-vw .detail-body {
  font-size: 14px;
  line-height: 1.8;
  color: $text-main;
  word-break: break-word;
}

@media (max-width: 360px) {
  .ignore-vw.notice-container {
    padding-left: 12px;
    padding-right: 12px;
  }
  
  .ignore-vw .action-grid {
    grid-template-columns: 1fr;
  }
  
  .ignore-vw .card-actions {
    gap: 12px;
  }
}
</style>
