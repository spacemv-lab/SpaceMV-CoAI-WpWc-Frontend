/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
  <div class="image-text-container ignore-vw" v-loading="loading">
    <div class="mobile-page-header">
      <h1 class="mobile-page-title">图文消息图片管理</h1>
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
          + 上传图文消息图片
        </el-button>
      </section>

      <section class="mobile-panel list-panel">
        <div class="panel-title">图片列表</div>
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
                    <span class="truncated-text">{{ item.mediaId || '' }}</span>
                  </el-tooltip>
                </div>
              </div>
            </div>
            
            <div class="meta-grid">
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
          <div class="pager-info">
            <span>共 {{ pageData.total }} 条</span>
          </div>
          <el-pagination 
            v-model:current-page="pageParams.pageNum" 
            v-model:page-size="pageParams.pageSize"
            :page-sizes="[10, 20, 50, 100]" 
            layout="total, prev, pager, next, jumper" 
            :total="pageData.total"
            @size-change="handleSizeChange" 
            @current-change="handleCurrentChange" 
          />
        </div>
      </section>

      <!-- 上传弹窗 -->
      <el-dialog v-model="uploadDialogVisible" title="上传图文消息图片" width="90%" :max-width="500">
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
            <el-button type="primary" :loading="uploadLoading" @click="handleUploadSubmit">确认上传</el-button>
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
    
    <!-- 空状态提示 -->
    <div v-else class="empty-state-wrapper">
      <el-empty description="暂无数据，需先于自媒体产品管理菜单中绑定自媒体产品及平台" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElIcon, ElMessageBox } from 'element-plus'
import { DocumentCopy, PictureFilled } from '@element-plus/icons-vue'
import { getImageTextList, deleteImageText, confirmUploadImageText } from '@/api/material/imageText'
import { uploadImage } from '@/api'
import { formatTimestamp } from '@/utils'
import PreviewDialog from '../components/previewDialog.vue'
import { getMediaProductList } from '@/api/media/mediaProduct/index'

// 自媒体产品列表
const productList = ref([])

// 是否有可用的产品平台
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
        name: item.baseInfo?.productName || item.baseInfo?.name,
        platforms: item.channelDTOList ? item.channelDTOList.map(channel => ({
          id: channel.id,
          name: channel.channelName,
          accountDTOList: channel.accountDTOList || []
        })) : []
      }))
      
      // 检查是否有可用的产品平台
      hasAvailableProductPlatform.value = productList.value.some(product => 
        product.platforms && product.platforms.some(platform => 
          platform.accountDTOList && platform.accountDTOList.length > 0
        )
      )
      
      // 如果有产品且有平台，自动获取图文消息图片列表
      if (hasAvailableProductPlatform.value) {
        fetchImageTextList()
      }
    } else {
      ElMessage.error('获取产品列表失败')
      hasAvailableProductPlatform.value = false
    }
  }).catch(() => {
    hasAvailableProductPlatform.value = false
  })
}

// 选中的产品索引（默认选中第一个）
const selectedProductIndex = ref(0)

// 选中的平台索引（默认选中第一个产品的第一个平台）
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
  // 如果选中的产品有平台，则获取图文消息图片列表
  if (productList.value[index] && productList.value[index].platforms.length > 0) {
    fetchImageTextList()
  }
}

// 选择平台
const selectPlatform = (index) => {
  selectedPlatformIndex.value = index
  fetchImageTextList()
}

// 表格数据
const tableData = ref([])

// 分页参数
const pageParams = ref({
  pageNum: 1,
  pageSize: 5
})

// 分页数据
const pageData = ref({
  total: 0
})

// 弹窗相关变量
const viewDialogVisible = ref(false)
const viewDialogUrl = ref('')

// 关闭图片预览弹窗
const handlePreviewClose = (visible) => {
  viewDialogVisible.value = visible
}

// 页面加载时获取图文消息图片列表
onMounted(() => {
  fetchProductList()
})

// 获取图文消息图片列表
const fetchImageTextList = () => {
  if (!hasAvailableProductPlatform.value) {
    tableData.value = []
    return
  }

  // 检查是否已选择产品和平台
  if (!selectedProduct.value) {
    ElMessage.warning('请先选择自媒体产品')
    return
  }
  
  if (!currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择绑定平台')
    return
  }
  
  // 获取当前选中的平台和账号ID
  const selectedPlatform = currentPlatformList.value[selectedPlatformIndex.value]
  const accountIds = (selectedPlatform?.accountDTOList || [])
    .map(account => account.id)
    .filter(id => id !== undefined && id !== null)
  if (accountIds.length === 0) {
    ElMessage.warning('当前平台未绑定账号，请先绑定后再操作')
    return
  }
  
  // 准备API参数，包含分页信息和账号ID
  const apiParams = {
    ...pageParams.value,
    accountIds: accountIds
  }
  
  getImageTextList(apiParams)
    .then(res => {
      if (res.code === 200) {
        tableData.value = res.data.list || []
        pageData.value.total = res.data.total || 0
      } else {
        ElMessage.error(res.message || '获取图文消息图片列表失败')
      }
    })
    .catch(error => {
      ElMessage.error('获取图文消息图片列表失败')
      console.error('获取图文消息图片列表失败:', error)
    })
}

// 上传弹窗状态
const uploadDialogVisible = ref(false)

// 分页大小变化处理
const handleSizeChange = (size) => {
  pageParams.value.pageSize = size
  pageParams.value.pageNum = 1 // 重置为第一页
  fetchImageTextList()
}

// 当前页码变化处理
const handleCurrentChange = (current) => {
  pageParams.value.pageNum = current
  fetchImageTextList()
}

// 上传表单数据
const uploadForm = ref({
  imageFileList: []
})

// 上传loading状态
const uploadLoading = ref(false)

// 存储选择的文件
const selectedFile = ref(null)

// 图片上传前处理
const handleBeforeUpload = (file) => {
  // 验证文件类型
  const isImage = file.type.indexOf('image/') === 0
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }

  // 验证文件大小（30MB以内）
  const isLt30M = file.size / 1024 / 1024 < 30
  if (!isLt30M) {
    ElMessage.error('图片大小不能超过30MB!')
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
  selectedFile.value = null // 清空选择的文件
  uploadForm.value.imageFileList = fileList // 更新文件列表
}

// 文件选择变化时处理
const handleFileChange = (file, fileList) => {
  // 存储选择的文件
  selectedFile.value = file.raw

  // 保存文件列表到表单数据
  uploadForm.value.imageFileList = fileList
}

// 提交上传
const handleUploadSubmit = () => {
  // 验证是否选择了图片
  if (!selectedFile.value) {
    ElMessage.warning('请先选择图片')
    return
  }
  
  // 检查是否已选择产品和平台
  if (!selectedProduct.value || !currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择自媒体产品和绑定平台')
    return
  }
  
  // 允许的图片类型
  const allowedTypes = ['bmp', 'png', 'jpeg', 'jpg', 'gif']
  
  // 验证文件扩展名
  const fileName = selectedFile.value.name.toLowerCase()
  const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1)
  if (!allowedTypes.includes(fileExt)) {
    ElMessage.error('只能上传 bmp、png、jpeg、jpg、gif 格式的图片!')
    return false
  }

  // 验证文件 MIME 类型
  const allowedMimeTypes = ['image/bmp', 'image/png', 'image/jpeg', 'image/gif']
  if (!allowedMimeTypes.includes(selectedFile.value.type)) {
    ElMessage.error('只能上传 bmp、png、jpeg、jpg、gif 格式的图片!')
    return false
  }

  // 验证文件大小（10MB以内）
  const isLt10M = selectedFile.value.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过10MB!')
    return false
  }
  
  // 获取当前选中的平台和账号ID
  const selectedPlatform = currentPlatformList.value[selectedPlatformIndex.value]
  const accountIds = (selectedPlatform?.accountDTOList || [])
    .map(account => account.id)
    .filter(id => id !== undefined && id !== null)
  if (accountIds.length === 0) {
    ElMessage.warning('当前平台未绑定账号，请先绑定后再操作')
    uploadLoading.value = false
    return
  }
  
  // 准备FormData数据
  const formData = new FormData()
  formData.append('file', selectedFile.value)

  let params = {
    accountId: accountIds[0],
  }
  
  // 设置loading状态
  uploadLoading.value = true
  
  // 调用上传接口
  confirmUploadImageText(formData, params)
    .then(res => {
      if (res.code === 200) {
        ElMessage.success(res.message || '图片已添加到图文消息图片库')
        
        // 刷新图文消息图片列表
        fetchImageTextList()
        
        // 重置表单并关闭弹窗
        resetUploadForm()
        uploadDialogVisible.value = false
      } else {
        ElMessage.error(res.message || '图片添加失败')
      }
    })
    .catch(error => {
      ElMessage.error('图片添加失败')
      console.error('确认上传图文消息图片失败:', error)
    })
    .finally(() => {
      // 无论成功还是失败，都关闭loading状态
      uploadLoading.value = false
    })
}

// 重置上传表单
const resetUploadForm = () => {
  uploadForm.value = {
    imageFileList: []
  }
  selectedFile.value = null // 清空选择的文件
}

// 复制媒体ID或URL
const handleCopy = (content) => {
  if (!content) return
  
  navigator.clipboard.writeText(content)
    .then(() => {
      ElMessage.success('复制成功')
    })
    .catch(err => {
      console.error('复制失败:', err)
      ElMessage.error('复制失败')
    })
}

// 查看图片 - 弹窗展示
const handleView = (url) => {
  if (!url) return
  
  // 在URL后添加时间戳参数以清除缓存
  const urlWithNoCache = new URL(url)
  urlWithNoCache.searchParams.append('t', Date.now().toString())
  
  // 设置弹窗URL并显示弹窗
  viewDialogUrl.value = urlWithNoCache.toString()
  viewDialogVisible.value = true
}

// 删除方法
const handleDelete = (row) => {
  // 检查是否有可用的产品平台
  if (!hasAvailableProductPlatform.value) {
    ElMessage.warning('暂无可用的自媒体产品平台')
    return
  }
  
  // 检查是否已选择产品和平台
  if (!selectedProduct.value || !currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择自媒体产品和绑定平台')
    return
  }
  
  // 获取当前选中的平台和账号ID
  const selectedPlatform = currentPlatformList.value[selectedPlatformIndex.value]
  const accountIds = (selectedPlatform?.accountDTOList || [])
    .map(account => account.id)
    .filter(id => id !== undefined && id !== null)
  if (accountIds.length === 0) {
    ElMessage.warning('当前平台未绑定账号，请先绑定后再操作')
    return
  }
  
  ElMessageBox.confirm(`确定要删除图片名称为"${row.name}"的图文消息图片吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  .then(() => {
    // 直接调用删除接口，只传递 mediaId
    deleteImageText(row.mediaId)
      .then(res => {
        if (res.code === 200) {
          // 刷新图文消息图片列表
          fetchImageTextList()
          ElMessage.success(res.message || '图片已删除')
        } else {
          ElMessage.error(res.message || '删除失败')
        }
      })
      .catch(error => {
        ElMessage.error('删除失败')
      })
  })
  .catch(() => {
    // 用户取消删除操作
  })
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

.ignore-vw.image-text-container {
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
  grid-template-columns: 1fr;
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
  .ignore-vw.image-text-container {
    padding-left: 12px;
    padding-right: 12px;
  }
}
</style>