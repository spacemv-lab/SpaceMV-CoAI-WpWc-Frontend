/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
  <div class="permanent-materials-container ignore-vw" v-loading="loading">
    <div class="mobile-page-header">
      <h1 class="mobile-page-title">永久素材管理</h1>
    </div>
    
    <template v-if="hasAvailableProductPlatform">
      <!-- 产品和平台选择器 -->
      <section class="mobile-panel selector-panel">
        <div class="panel-title">选择产品与平台</div>
        
        <div class="selector-row">
          <div class="selector-label">
            <span class="label-text">自媒体产品</span>
          </div>
          <div class="product-options">
            <div 
              v-for="(product, index) in productList" 
              :key="index"
              class="product-option"
              :class="{ active: selectedProductIndex === index }"
              @click="selectProduct(index)"
            >
              <span class="option-text">{{ product.name }}</span>
            </div>
          </div>
        </div>
        
        <div class="selector-row" v-if="selectedProduct">
          <div class="selector-label">
            <span class="label-text">绑定平台</span>
          </div>
          <div class="platform-options">
            <div 
              v-for="(platform, index) in currentPlatformList"
              :key="index"
              class="platform-option"
              :class="{ active: selectedPlatformIndex === index }"
              @click="selectPlatform(index)"
            >
              <span class="option-text">{{ platform.name }}</span>
              <span class="option-check" v-if="selectedPlatformIndex === index">✓</span>
            </div>
          </div>
        </div>
      </section>
      
      <section class="mobile-panel action-panel">
        <el-button type="primary" class="mobile-upload-btn" @click="uploadDialogVisible = true">
          + 上传永久图片素材
        </el-button>
      </section>

      <section class="mobile-panel list-panel">
        <div class="panel-title">素材列表</div>
        <div v-if="tableData.length" class="mobile-list">
          <article v-for="(item, index) in tableData" :key="`${item.mediaId}-${index}`" class="list-card">
            <div class="list-card-head">
              <div class="image-container" @click="handleView(item.url)">
                <el-image
                  :src="item.url"
                  fit="cover"
                  referrerpolicy="no-referrer"
                ></el-image>
              </div>
              <div class="list-card-info">
                <div class="list-card-title">{{ item.name || '未命名' }}</div>
                <div class="media-id-row">
                  <el-tooltip content="复制" placement="top">
                    <el-button type="text" size="small" @click="handleCopy(item.mediaId)" class="copy-button">
                      <el-icon>
                        <DocumentCopy />
                      </el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip :content="item.mediaId" placement="top">
                    <span class="truncated-text">{{ item.mediaId ? item.mediaId.slice(0, 6) + '...' + item.mediaId.slice(-6) : '' }}</span>
                  </el-tooltip>
                </div>
              </div>
            </div>
            
            <div class="meta-grid">
              <div class="meta-block">
                <span class="meta-name">更新日期</span>
                <span class="meta-value">{{ formatTimestamp(item.update_time) || '-' }}</span>
              </div>
              <div class="meta-block">
                <span class="meta-name">图片链接</span>
                <div class="meta-value url-value">
                  <el-tooltip content="复制" placement="top">
                    <el-button type="text" size="small" @click="handleCopy(item.url)" class="copy-button">
                      <el-icon>
                        <DocumentCopy />
                      </el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip :content="item.url" placement="top">
                    <span class="url-text">{{ item.url }}</span>
                  </el-tooltip>
                </div>
              </div>
            </div>
            
            <div class="list-card-action">
              <el-button type="danger" size="small" @click="handleDelete(item)">删除</el-button>
            </div>
          </article>
        </div>
        <div v-else class="empty-text">暂无数据</div>

        <div v-if="pageData.total > 0" class="pager-wrap">
          <el-pagination 
            v-model:current-page="pageParams.pageNum" 
            v-model:page-size="pageParams.pageSize"
            :page-sizes="[5, 10, 20, 50, 100]" 
            layout="total, prev, pager, next, jumper" 
            :total="pageData.total"
            @size-change="handleSizeChange" 
            @current-change="handleCurrentChange" 
          />
        </div>
      </section>

      <!-- 上传弹窗 -->
      <el-dialog v-model="uploadDialogVisible" title="上传永久图片素材" width="90%" :max-width="500">
        <div class="upload-container">
          <el-upload class="upload-btn" :before-upload="handleBeforeUpload" :file-list="uploadForm.imageFileList"
            :limit="1" :on-exceed="handleExceed" :on-remove="handleRemove" :on-change="handleFileChange"
            :auto-upload="false" list-type="text">
            <el-button type="primary">
              <span>选择图片 <el-icon>
                  <PictureFilled />
                </el-icon></span>
            </el-button>
          </el-upload>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="uploadDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="uploadLoading" @click="handleUploadSubmit">确定</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 图片预览弹窗 -->
      <preview-dialog
        :visible="viewDialogVisible"
        :url="viewDialogUrl"
        @close="handlePreviewClose"
      ></preview-dialog>
    </template>
    
    <div v-else class="empty-state-wrapper">
      <el-empty description="暂无数据，请绑定自媒体产品及平台" />
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElIcon, ElMessageBox } from 'element-plus'
import { DocumentCopy, PictureFilled } from '@element-plus/icons-vue'
import { getPermanentMaterialsList, deletePermanentMaterial, confirmUploadPermanentMaterial } from '@/api/material/permanentMaterials'
import { formatTimestamp } from '@/utils'
import PreviewDialog from '../components/previewDialog.vue'
import { getMediaProductList } from '@/api/media/mediaProduct/index'

// 自媒体产品列表
const productList = ref([])
const hasAvailableProductPlatform = ref(false)

// 获取自媒体产品列表
const fetchProductList = () => {
  getMediaProductList({
		pageNum: 1,
		pageSize: 1000000,
		queryConfig: {
			queryProduct: true,
			queryChannels: true,
			queryAccount: true,
		}
	}).then(response => {
    if (response.code === 200) {
      const rawProducts = response.rows || response.data?.rows || response.data || []
      productList.value = rawProducts.map(item => ({
        id: item.baseInfo?.id,
        name: item.baseInfo?.productName,
        platforms: (item.channelDTOList || [])
          .filter(channel => Array.isArray(channel.accountDTOList) && channel.accountDTOList.length > 0)
          .map(channel => ({
            id: channel.id,
            name: channel.channelName,
            type: channel.channelType,
            accountDTOList: channel.accountDTOList
          }))
      })).filter(item => item.platforms.length > 0)
      
      hasAvailableProductPlatform.value = productList.value.length > 0
      selectedProductIndex.value = 0
      selectedPlatformIndex.value = 0

      if (productList.value.length > 0 && productList.value[0].platforms.length > 0) {
        fetchPermanentMaterialsList()
      } else {
        tableData.value = []
        pageData.value.total = 0
      }
    } else {
      ElMessage.error('获取产品列表失败')
      hasAvailableProductPlatform.value = false
    }
  }).catch(() => {
    ElMessage.error('获取产品列表失败')
    hasAvailableProductPlatform.value = false
  })
}

// 选中的产品索引
const selectedProductIndex = ref(0)

// 选中的平台索引
const selectedPlatformIndex = ref(0)

// 当前选中的产品
const selectedProduct = computed(() => {
  return productList.value[selectedProductIndex.value]
})

// 当前产品的平台列表
const currentPlatformList = computed(() => {
  return selectedProduct.value ? selectedProduct.value.platforms : []
})

// 选择产品
const selectProduct = (index) => {
  selectedProductIndex.value = index
  selectedPlatformIndex.value = 0
  if (productList.value[index] && productList.value[index].platforms.length > 0) {
    fetchPermanentMaterialsList()
  }
}

// 选择平台
const selectPlatform = (index) => {
  selectedPlatformIndex.value = index
  fetchPermanentMaterialsList()
}

// 表格数据
const tableData = ref([])

// 弹窗相关变量
const viewDialogVisible = ref(false)
const viewDialogUrl = ref('')

// 关闭图片预览弹窗
const handlePreviewClose = (visible) => {
  viewDialogVisible.value = visible
}

// 页面加载时获取永久素材列表
onMounted(() => {
  fetchProductList()
})

// 分页参数
const pageParams = ref({
  pageNum: 1,
  pageSize: 5
})

// 分页数据
const pageData = ref({
  total: 0
})

// 获取永久素材列表
const fetchPermanentMaterialsList = () => {
  if (!hasAvailableProductPlatform.value) {
    tableData.value = []
    return
  }

  if (!selectedProduct.value) {
    ElMessage.warning('请先选择自媒体产品')
    return
  }
  
  if (!currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择绑定平台')
    return
  }
  
  const selectedPlatform = currentPlatformList.value[selectedPlatformIndex.value]
  const accountIds = (selectedPlatform?.accountDTOList || [])
    .map(account => account.id)
    .filter(id => id !== undefined && id !== null)
  if (accountIds.length === 0) {
    ElMessage.warning('当前平台未绑定账号，请先绑定后再操作')
    return
  }
  
  const apiParams = {
    ...pageParams.value,
    accountIds: accountIds
  }
  
  getPermanentMaterialsList(apiParams)
    .then(res => {
      if (res.code === 200) {
        tableData.value = res.data.list || []
        pageData.value.total = res.data.total || 0
      } else {
        ElMessage.error(res.message || '获取永久素材列表失败')
      }
    })
    .catch(error => {
      ElMessage.error('获取永久素材列表失败')
      console.error('获取永久素材列表失败:', error)
    })
}

// 上传弹窗状态
const uploadDialogVisible = ref(false)

// 分页大小变化处理
const handleSizeChange = (size) => {
  pageParams.value.pageSize = size
  pageParams.value.pageNum = 1
  fetchPermanentMaterialsList()
}

// 当前页码变化处理
const handleCurrentChange = (current) => {
  pageParams.value.pageNum = current
  fetchPermanentMaterialsList()
}

// 上传表单数据
const uploadForm = ref({
  imageFileList: []
})

// 选中的文件
const selectedFile = ref(null)

// 上传loading状态
const uploadLoading = ref(false)

// 图片上传前处理
const handleBeforeUpload = (file) => {
  const allowedTypes = ['bmp', 'png', 'jpeg', 'jpg', 'gif']
  
  const fileName = file.name.toLowerCase()
  const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1)
  if (!allowedTypes.includes(fileExt)) {
    ElMessage.error('只能上传 bmp、png、jpeg、jpg、gif 格式的图片!')
    return false
  }

  const allowedMimeTypes = ['image/bmp', 'image/png', 'image/jpeg', 'image/gif']
  if (!allowedMimeTypes.includes(file.type)) {
    ElMessage.error('只能上传 bmp、png、jpeg、jpg、gif 格式的图片!')
    return false
  }

  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过10MB!')
    return false
  }

  return true
}

// 图片上传超过限制时的处理
const handleExceed = (files, fileList) => {
  ElMessage.warning('只能上传一个图片，请删除旧图片再上传新图片')
}

// 处理文件移除事件
const handleRemove = (file, fileList) => {
  selectedFile.value = null
  uploadForm.value.imageFileList = fileList
}

// 处理文件选择事件
const handleFileChange = (file, fileList) => {
  selectedFile.value = file.raw
  uploadForm.value.imageFileList = fileList
}

// 提交上传
const handleUploadSubmit = () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择图片')
    return
  }
  
  if (!hasAvailableProductPlatform.value) {
    ElMessage.warning('暂无可用的自媒体产品平台')
    return
  }
  
  if (!selectedProduct.value) {
    ElMessage.warning('请先选择自媒体产品')
    return
  }
  
  if (!currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择绑定平台')
    return
  }
  
  const allowedTypes = ['bmp', 'png', 'jpeg', 'jpg', 'gif']
  
  const fileName = selectedFile.value.name.toLowerCase()
  const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1)
  if (!allowedTypes.includes(fileExt)) {
    ElMessage.error('只能上传 bmp、png、jpeg、jpg、gif 格式的图片!')
    return false
  }

  const allowedMimeTypes = ['image/bmp', 'image/png', 'image/jpeg', 'image/gif']
  if (!allowedMimeTypes.includes(selectedFile.value.type)) {
    ElMessage.error('只能上传 bmp、png、jpeg、jpg、gif 格式的图片!')
    return false
  }

  const isLt10M = selectedFile.value.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过10MB!')
    return false
  }

  const selectedPlatform = currentPlatformList.value[selectedPlatformIndex.value]
  const accountIds = (selectedPlatform?.accountDTOList || [])
    .map(account => account.id)
    .filter(id => id !== undefined && id !== null)
  if (accountIds.length === 0) {
    ElMessage.warning('当前平台未绑定账号，请先绑定后再操作')
    uploadLoading.value = false
    return
  }

  uploadLoading.value = true

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  let params = {
    accountId: accountIds[0],
  }

  confirmUploadPermanentMaterial(formData, params)
    .then(res => {
      if (res.code === 200) {
        ElMessage.success(res.message || '图片已添加到永久素材库')
        fetchPermanentMaterialsList()
        resetUploadForm()
        selectedFile.value = null
        uploadDialogVisible.value = false
      } else {
        ElMessage.error(res.message || '图片添加失败')
      }
    })
    .catch(error => {
      ElMessage.error('图片添加失败')
      console.error('上传永久素材失败:', error)
    })
    .finally(() => {
      uploadLoading.value = false
    })
}

// 重置上传表单
const resetUploadForm = () => {
  uploadForm.value = {
    imageFileList: []
  }
}

// 删除方法
const handleDelete = (row) => {
  if (!hasAvailableProductPlatform.value) {
    ElMessage.warning('暂无可用的自媒体产品平台')
    return
  }
  
  if (!selectedProduct.value) {
    ElMessage.warning('请先选择自媒体产品')
    return
  }
  
  if (!currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择绑定平台')
    return
  }
  
  ElMessageBox.confirm(`确定要删除图片名称为"${row.name}"的永久素材吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const selectedPlatform = currentPlatformList.value[selectedPlatformIndex.value]
      const accountIds = (selectedPlatform?.accountDTOList || [])
        .map(account => account.id)
        .filter(id => id !== undefined && id !== null)
      if (accountIds.length === 0) {
        ElMessage.warning('当前平台未绑定账号，请先绑定后再操作')
        return
      }
      
      deletePermanentMaterial(accountIds[0], row.mediaId)
        .then(res => {
          if (res.code === 200) {
            ElMessage.success(res.message || '素材已删除')
            fetchPermanentMaterialsList()
          } else {
            ElMessage.error(res.message || '删除素材失败')
          }
        })
        .catch(error => {
          ElMessage.error('删除素材失败')
        })
    })
}

// 复制mediaId
const handleCopy = (mediaId) => {
  if (!mediaId) return

  if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(mediaId)
      .then(() => {
        ElMessage.success('复制成功')
      })
      .catch(err => {
        fallbackCopyTextToClipboard(mediaId)
      })
  } else {
    fallbackCopyTextToClipboard(mediaId)
  }
}

// 传统的复制方法作为 fallback
const fallbackCopyTextToClipboard = (text) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  
  textArea.style.position = 'fixed'
  textArea.style.left = '-999999px'
  textArea.style.top = '-999999px'
  textArea.style.width = '2em'
  textArea.style.height = '2em'
  textArea.style.padding = '0'
  textArea.style.border = 'none'
  textArea.style.outline = 'none'
  textArea.style.boxShadow = 'none'
  textArea.style.background = 'transparent'
  
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  
  const copied = document.execCommand('copy')
  
  if (copied) {
    ElMessage.success('复制成功')
  } else {
    ElMessage.info('此网站协议不支持此复制方法，请手动复制。')
  }
  
  document.body.removeChild(textArea)
}

// 查看图片 - 弹窗展示
const handleView = (url) => {
  if (!url) return
  
  const urlWithNoCache = new URL(url)
  urlWithNoCache.searchParams.append('t', Date.now().toString())
  
  viewDialogUrl.value = urlWithNoCache.toString()
  viewDialogVisible.value = true
}

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

.ignore-vw.permanent-materials-container {
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

.ignore-vw .selector-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.ignore-vw .selector-label {
  .label-text {
    font-size: 13px;
    font-weight: 600;
    color: $text-sub;
  }
}

.ignore-vw .product-options,
.ignore-vw .platform-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ignore-vw .product-option,
.ignore-vw .platform-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(247, 249, 253, 0.96);
  border: 1px solid rgba(226, 231, 242, 0.94);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.22s ease;
  font-size: 14px;
  font-weight: 600;
  color: $text-sub;
  
  &.active {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 248, 255, 1));
    box-shadow:
      0 10px 22px rgba(103, 121, 190, 0.14),
      inset 0 0 0 1px rgba(101, 114, 220, 0.16);
    border-color: rgba(101, 114, 220, 0.34);
    color: #5d6bd8;
  }
  
  .option-text {
    flex: 1;
  }
  
  .option-check {
    color: #5d6bd8;
    font-weight: bold;
    font-size: 14px;
  }
}

.ignore-vw .mobile-upload-btn {
  width: 100%;
  height: 44px;
  border-radius: 14px !important;
  background: linear-gradient(135deg, $brand-start 0%, $brand-end 100%) !important;
  box-shadow: 0 10px 20px rgba(95, 124, 240, 0.18);
  font-size: 15px !important;
  font-weight: 600 !important;
  border: none !important;
}

.ignore-vw .mobile-list {
  margin-top: 12px;
}

.ignore-vw .list-card {
  padding: 14px;
  border: 1px solid #e6ebf3;
  border-radius: 14px;
  background: #fbfcff;
  
  & + .list-card {
    margin-top: 10px;
  }
}

.ignore-vw .list-card-head {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.ignore-vw .image-container {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  
  :deep(.el-image) {
    width: 100%;
    height: 100%;
  }
}

.ignore-vw .list-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ignore-vw .list-card-title {
  font-size: 15px;
  line-height: 22px;
  font-weight: 700;
  color: $text-main;
  word-break: break-word;
}

.ignore-vw .media-id-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ignore-vw .copy-button {
  padding: 0;
  margin: 0;
  height: auto;
  font-size: 14px;
  color: $text-sub;
  
  &:hover {
    color: $brand-start;
    background-color: transparent;
  }
}

.ignore-vw .truncated-text {
  font-size: 13px;
  color: $text-sub;
}

.ignore-vw .meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 12px 0;
  border-top: 1px solid #edf1f6;
  border-bottom: 1px solid #edf1f6;
  margin-bottom: 12px;
}

.ignore-vw .meta-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.ignore-vw .meta-name {
  font-size: 12px;
  line-height: 16px;
  color: $text-light;
}

.ignore-vw .meta-value {
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: $text-main;
  word-break: break-word;
}

.ignore-vw .url-value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: normal;
  
  .url-text {
    flex: 1;
    font-size: 13px;
    color: $text-sub;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.ignore-vw .list-card-action {
  display: flex;
  justify-content: flex-end;
}

.ignore-vw .list-card-action :deep(.el-button) {
  height: 32px;
  font-size: 13px;
  border-radius: 8px;
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

.ignore-vw .pager-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 13px;
  color: $text-sub;
}

.ignore-vw .pager-wrap :deep(.el-pagination) {
  flex-wrap: wrap;
  gap: 8px;
}

.ignore-vw .pager-wrap :deep(.el-pagination__item) {
  min-width: 40px;
  height: 34px;
  font-size: 14px;
  border-radius: 8px;
}

.ignore-vw .upload-container {
  padding: 12px 0;
}

.ignore-vw .upload-btn {
  width: 100%;
  
  :deep(.el-button) {
    width: 100%;
    border-radius: 14px;
    height: 44px;
    font-size: 15px;
  }
}

.ignore-vw .empty-state-wrapper {
  padding: 48px 0;
  background: $card-bg;
  border-radius: 16px;
}

@media (max-width: 360px) {
  .ignore-vw .meta-grid {
    grid-template-columns: 1fr;
  }
  
  .ignore-vw.permanent-materials-container {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>