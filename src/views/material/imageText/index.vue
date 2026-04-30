/** * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司 *This project is licensed under the MIT
License - see the LICENSE file in the project root for details. **/
<template>
  <div class="image-text-container">
    <h3 class="page-title">图文消息图片管理</h3>
    
    <template v-if="hasAvailableProductPlatform">
      <!-- 产品和平台选择器 -->
      <div class="product-platform-selector">
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
      </div>
      
      <el-button type="primary" size="large" style="margin-bottom: 20px;" @click="uploadDialogVisible = true">上传图文消息图片</el-button>
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="mediaId" label="媒体ID" width="180">
          <template #default="scope">
            <div class="media-id-container">
              <el-tooltip content="复制" placement="top">
                <el-button 
                    type="text" 
                    size="small" 
                    @click="handleCopy(scope.row.mediaId)"
                    class="copy-button"
                >
                    <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </el-tooltip>
              <span class="media-id-full">{{ scope.row.mediaId || '' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="100">
          <template #default="scope">
              <div class="image-container" @click="handleView(scope.row.url)">   
                <el-image
                  :src="scope.row.url"
                  fit="cover"
                  referrerpolicy="no-referrer"
                ></el-image>
              </div>
          
          </template>
        </el-table-column>
        <el-table-column prop="name" label="图片名称" width="180"></el-table-column>
        <!-- <el-table-column prop="updateDate" label="上传日期" width="180">
          <template #default="scope">
              {{ formatTimestamp(scope.row.updateDate) }}
          </template>
        </el-table-column> -->
        <el-table-column prop="url" label="图片url">
          <template #default="scope">
              <div class="media-id-container">
                  <el-tooltip content="复制" placement="top">
                    <el-button 
                        type="text" 
                        size="small" 
                        @click="handleCopy(scope.row.url)"
                        class="copy-button"
                    >
                        <el-icon><DocumentCopy /></el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip :content="scope.row.url" placement="top">
                      <span class="normal-truncated-text">{{ scope.row.url }}</span>
                  </el-tooltip>
              </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页控件 -->
      <div class="pagination-container" style="margin-top: 20px; text-align: right;">
        <el-pagination
            v-model:current-page="pageParams.pageNum"
            v-model:page-size="pageParams.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pageData.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>

      <!-- 上传弹窗 -->
      <el-dialog v-model="uploadDialogVisible" title="上传图文消息图片" width="500px">
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
            <el-button type="primary" @click="handleUploadSubmit" :loading="uploadLoading">确认上传</el-button>
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
      <el-empty description="暂无数据，请绑定自媒体产品及平台" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElIcon, ElMessageBox } from 'element-plus';
import { DocumentCopy } from '@element-plus/icons-vue';
import {
  getImageTextList,
  deleteImageText,
  confirmUploadImageText,
} from '@/api/material/imageText';
import { uploadImage } from '@/api';
import { formatTimestamp } from '@/utils';
import PreviewDialog from '../components/previewDialog.vue';
import { getMediaProductList } from '@/api/media/mediaProduct/index';

// 自媒体产品列表
const productList = ref([]);

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
const selectedProductIndex = ref(0);

// 选中的平台索引（默认选中第一个产品的第一个平台）
const selectedPlatformIndex = ref(0);

// 当前选中的产品
const selectedProduct = computed(() => {
  return productList.value[selectedProductIndex.value];
});

// 当前产品的平台列表
const currentPlatformList = computed(() => {
  return selectedProduct.value ? selectedProduct.value.platforms : [];
});

// 选择产品
const selectProduct = (index) => {
  selectedProductIndex.value = index;
  selectedPlatformIndex.value = 0;
  // 如果选中的产品有平台，则获取图文消息图片列表
  if (productList.value[index] && productList.value[index].platforms.length > 0) {
    fetchImageTextList();
  }
};

// 选择平台
const selectPlatform = (index) => {
  selectedPlatformIndex.value = index;
  fetchImageTextList();
};

// 表格数据
const tableData = ref([]);

// 分页参数
const pageParams = ref({
  pageNum: 1,
  pageSize: 5,
});

// 分页数据
const pageData = ref({
  total: 0,
});

// 弹窗相关变量
const viewDialogVisible = ref(false);
const viewDialogUrl = ref('');

// 关闭图片预览弹窗
const handlePreviewClose = (visible) => {
  viewDialogVisible.value = visible;
};

// 页面加载时获取图文消息图片列表
onMounted(() => {
  fetchProductList();
});

// 获取图文消息图片列表
const fetchImageTextList = () => {
  if (!hasAvailableProductPlatform.value) {
    tableData.value = []
    return
  }

  // 检查是否已选择产品和平台
  if (!selectedProduct.value) {
    ElMessage.warning('请先选择自媒体产品');
    return;
  }

  if (!currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择绑定平台');
    return;
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
    .then((res) => {
      if (res.code === 200) {
        tableData.value = res.data.list || [];
        pageData.value.total = res.data.total || 0;
      } else {
        ElMessage.error(res.message || '获取图文消息图片列表失败');
      }
    })
    .catch((error) => {
      ElMessage.error('获取图文消息图片列表失败');
      console.error('获取图文消息图片列表失败:', error);
    });
};

// 上传弹窗状态
const uploadDialogVisible = ref(false);

// 分页大小变化处理
const handleSizeChange = (size) => {
  pageParams.value.pageSize = size;
  pageParams.value.pageNum = 1; // 重置为第一页
  fetchImageTextList();
};

// 当前页码变化处理
const handleCurrentChange = (current) => {
  pageParams.value.pageNum = current;
  fetchImageTextList();
};

// 上传表单数据
const uploadForm = ref({
  imageFileList: [],
});

// 上传loading状态
const uploadLoading = ref(false);

// 存储选择的文件
const selectedFile = ref(null);

// 图片上传前处理
const handleBeforeUpload = (file) => {
  // 验证文件类型
  const isImage = file.type.indexOf('image/') === 0;
  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }

  // 验证文件大小（30MB以内）
  const isLt30M = file.size / 1024 / 1024 < 30;
  if (!isLt30M) {
    ElMessage.error('图片大小不能超过30MB!');
    return false;
  }

  return true;
};

// 图片上传超过限制时的处理
const handleExceed = (files, fileList) => {
  ElMessage.warning('只能上传一个图片，请删除旧图片再上传新图片');
};

// 处理文件移除事件
const handleRemove = (file, fileList) => {
  selectedFile.value = null; // 清空选择的文件
  uploadForm.value.imageFileList = fileList; // 更新文件列表
};

// 文件选择变化时处理
const handleFileChange = (file, fileList) => {
  // 存储选择的文件
  selectedFile.value = file.raw;

  // 保存文件列表到表单数据
  uploadForm.value.imageFileList = fileList;
};

// 提交上传
const handleUploadSubmit = () => {
  // 验证是否选择了图片
  if (!selectedFile.value) {
    ElMessage.warning('请先选择图片');
    return;
  }

  // 检查是否已选择产品和平台
  if (!selectedProduct.value || !currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择自媒体产品和绑定平台');
    return;
  }

  // 允许的图片类型
  const allowedTypes = ['bmp', 'png', 'jpeg', 'jpg', 'gif'];

  // 验证文件扩展名
  const fileName = selectedFile.value.name.toLowerCase();
  const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1);
  if (!allowedTypes.includes(fileExt)) {
    ElMessage.error('只能上传 bmp、png、jpeg、jpg、gif 格式的图片!');
    return false;
  }

  // 验证文件 MIME 类型
  const allowedMimeTypes = ['image/bmp', 'image/png', 'image/jpeg', 'image/gif'];
  if (!allowedMimeTypes.includes(selectedFile.value.type)) {
    ElMessage.error('只能上传 bmp、png、jpeg、jpg、gif 格式的图片!');
    return false;
  }

  // 验证文件大小（10MB以内）
  const isLt10M = selectedFile.value.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过10MB!');
    return false;
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
  const formData = new FormData();
  formData.append('file', selectedFile.value);

  let params = {
    accountId: accountIds[0],
  }
  
  // 设置loading状态
  uploadLoading.value = true;

  // 调用上传接口
  confirmUploadImageText(formData, params)
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success(res.message || '图片已添加到图文消息图片库');

        // 刷新图文消息图片列表
        fetchImageTextList();

        // 重置表单并关闭弹窗
        resetUploadForm();
        uploadDialogVisible.value = false;
      } else {
        ElMessage.error(res.message || '图片添加失败');
      }
    })
    .catch((error) => {
      ElMessage.error('图片添加失败');
      console.error('确认上传图文消息图片失败:', error);
    })
    .finally(() => {
      // 无论成功还是失败，都关闭loading状态
      uploadLoading.value = false;
    });
};

// 重置上传表单
const resetUploadForm = () => {
  uploadForm.value = {
    imageFileList: [],
  };
  selectedFile.value = null; // 清空选择的文件
};

// 复制媒体ID或URL
const handleCopy = (content) => {
  if (!content) return;

  navigator.clipboard
    .writeText(content)
    .then(() => {
      ElMessage.success('复制成功');
    })
    .catch((err) => {
      console.error('复制失败:', err);
      ElMessage.error('复制失败');
    });
};

// 查看图片 - 弹窗展示
const handleView = (url) => {
  if (!url) return;

  // 在URL后添加时间戳参数以清除缓存
  const urlWithNoCache = new URL(url);
  urlWithNoCache.searchParams.append('t', Date.now().toString());

  // 设置弹窗URL并显示弹窗
  viewDialogUrl.value = urlWithNoCache.toString();
  viewDialogVisible.value = true;
};

// 删除方法
const handleDelete = (row) => {
  // 检查是否有可用的产品平台
  if (!hasAvailableProductPlatform.value) {
    ElMessage.warning('暂无可用的自媒体产品平台')
    return
  }
  
  // 检查是否已选择产品和平台
  if (!selectedProduct.value || !currentPlatformList.value[selectedPlatformIndex.value]) {
    ElMessage.warning('请先选择自媒体产品和绑定平台');
    return;
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
    type: 'warning',
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
.product-platform-selector {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e4e7eb;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.06);

  .selector-row {
    display: flex;
    gap: 20px;
    align-items: center;

    .selector-label {
      flex-shrink: 0;
      width: 90px;

      .label-text {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        letter-spacing: 0.3px;
      }
    }
  }

  .product-options {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    flex: 1;

    .product-option {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      background: #f8f9fa;
      border: 1px solid #e4e7eb;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 13px;
      color: #606266;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          135deg,
          rgba(64, 158, 255, 0.05) 0%,
          rgba(64, 158, 255, 0.1) 100%
        );
        opacity: 0;
        transition: opacity 0.25s ease;
      }

      &:hover {
        background: #ecf5ff;
        border-color: #409eff;
        color: #303133;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);

        &::before {
          opacity: 1;
        }
      }

      &.active {
        background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
        border-color: #409eff;
        color: #ffffff;
        box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
        transform: translateY(-1px);

        &::before {
          opacity: 0;
        }
      }

      .option-text {
        flex: 1;
        position: relative;
        z-index: 1;
      }
    }
  }

  .platform-options {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    flex: 1;

    .platform-option {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      background: #f8f9fa;
      border: 1px solid #e4e7eb;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 13px;
      color: #606266;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          135deg,
          rgba(64, 158, 255, 0.05) 0%,
          rgba(64, 158, 255, 0.1) 100%
        );
        opacity: 0;
        transition: opacity 0.25s ease;
      }

      &:hover {
        background: #ecf5ff;
        border-color: #409eff;
        color: #303133;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);

        &::before {
          opacity: 1;
        }
      }

      &.active {
        background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
        border-color: #409eff;
        color: #ffffff;
        box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
        transform: translateY(-1px);

        &::before {
          opacity: 0;
        }

        .option-check {
          color: #ffffff;
          font-weight: bold;
          font-size: 14px;
        }
      }

      .option-text {
        flex: 1;
        position: relative;
        z-index: 1;
      }

      .option-check {
        color: #409eff;
        font-weight: bold;
        font-size: 14px;
      }
    }
  }
}

.upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  .upload-btn {
    width: 100%;

    :deep(.el-button) {
      width: 50%;
      border-radius: 20px;
    }

    :deep(.el-upload-list__item-file-name) {
      white-space: normal;
      // text-overflow: ;
    }

    :deep(.el-upload-list__item-name) {
      justify-content: center;
    }

    :deep(.el-upload-list__item-file-name) {
      white-space: wrap !important;
    }
  }
}
.image-text-container {
  padding: 20px;
  .page-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    color: var(--el-text-color-primary);
  }

  .media-id-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .copy-button {
    padding: 0;
    margin: 0;
    height: auto;
    font-size: 12px;
    color: #606266;

    &:hover {
      color: #409eff;
      background-color: transparent;
    }
  }

  .media-id-full {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  .normal-truncated-text {
    font-size: 14px;
    color: var(--el-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .image-container {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer; /* 添加鼠标指针样式，提示可以点击 */
  }

  .preview-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 70vh;
    overflow: hidden;
    background-color: #f0f0f0;
    border-radius: 8px;
    padding: 10px;
    box-sizing: border-box;
  }

  .image-upload-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    width: 100%;

    .image-url-input {
      flex: 1;
    }

    .image-upload-btn {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .image-upload-btn :deep(.el-upload) {
      height: 100%;
      display: flex;
      align-items: center;
    }

    .image-upload-btn :deep(.el-upload-list) {
      width: 100%;
    }

    .image-upload-btn :deep(.el-upload-list__item-file-name) {
      white-space: normal;
      word-break: break-all;
      text-align: left;
      line-height: 1.2;
    }
  }
  
  .empty-state-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    padding: 40px 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin-top: 20px;
  }
}
</style>
