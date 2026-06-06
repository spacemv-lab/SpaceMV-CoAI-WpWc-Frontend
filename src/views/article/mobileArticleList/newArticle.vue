/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
  <div class="article-editor ignore-vw">
    <div class="editor-shell">
      <section class="hero-card">
        <div class="hero-top">
          <h3 class="page-title">文章编辑</h3>
          <div class="action-buttons">
            <van-button round type="primary" @click="handleSaveDraft">保存草稿</van-button>
            <van-button round plain type="primary" @click="handleBack">返回</van-button>
          </div>
        </div>
      </section>

      <section class="form-panel">
        <el-form
          ref="articleFormRef"
          :model="articleForm"
          :rules="rules"
          label-position="top"
          class="article-form"
        >
          <div class="form-grid single">
            <div class="form-card">
              <div class="card-title">文章类型</div>
              <el-form-item label="请选择文章类型">
                <el-radio-group v-model="articleForm.articleType" class="full-width-radio" @change="handleArticleTypeChange">
                  <el-radio label="news">文章</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>

            <div class="form-card">
              <div class="card-title">基础信息</div>
              <el-form-item label="文章标题" prop="title" required>
                <el-input v-model="articleForm.title" placeholder="请输入文章标题" />
              </el-form-item>
              <el-form-item v-if="articleForm.articleType === 'news'" label="摘要" prop="digest">
                <el-input
                  v-model="articleForm.digest"
                  type="textarea"
                  :rows="4"
                  resize="none"
                  placeholder="请输入文章摘要"
                />
              </el-form-item>
            </div>
          </div>

          <div v-if="articleForm.articleType === 'news'" class="form-grid">
            <div class="form-card">
              <div class="card-title">作者信息</div>
              <el-form-item label="作者" prop="author">
                <el-input
                  v-model="articleForm.author"
                  placeholder="请输入作者名称"
                  maxlength="16"
                  show-word-limit
                />
              </el-form-item>
            </div>

            <div class="form-card">
              <div class="card-title">封面素材</div>
              <el-form-item label="封面图片媒体 ID" prop="thumbMediaId" :required="articleForm.articleType === 'news'">
                <el-input v-model="articleForm.thumbMediaId" placeholder="请输入封面图片媒体 ID" />
              </el-form-item>
            </div>
          </div>

          <div v-if="articleForm.articleType === 'newspic'" class="form-grid single">
            <div class="form-card">
              <div class="card-title">所选图片</div>
              <el-form-item label="图片素材" prop="imageInfo" required>
                <div class="image-selection-container">
                  <div v-if="!articleForm.imageInfo || articleForm.imageInfo.length === 0" class="empty-image-picker">
                    <div class="empty-image-text">暂未选择图片素材</div>
                    <van-button round type="primary" @click="openImageSelector">选择图片</van-button>
                  </div>

                  <div v-else class="selected-images">
                    <div class="image-list">
                      <div
                        v-for="(img, index) in articleForm.imageInfo"
                        :key="img.mediaId"
                        :class="['image-item', { 'is-cover': index === 0 }]"
                      >
                        <el-image :src="img.url" fit="cover" referrerpolicy="no-referrer" />
                        <span v-if="index === 0" class="cover-tag">封面</span>
                        <el-icon class="remove-icon" @click="removeImage(index)"><Close /></el-icon>
                      </div>
                    </div>
                    <van-button round plain type="primary" @click="openImageSelector">修改所选图片</van-button>
                  </div>
                </div>
              </el-form-item>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-card">
              <div class="card-title">评论设置</div>
              <el-form-item label="是否打开评论">
                <el-radio-group v-model="articleForm.needOpenComment" class="full-width-radio">
                  <el-radio label="0">否</el-radio>
                  <el-radio label="1">是</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>

            <div class="form-card">
              <div class="card-title">粉丝评论</div>
              <el-form-item label="是否仅粉丝可评论">
                <el-radio-group v-model="articleForm.onlyFansCanComment" class="full-width-radio">
                  <el-radio label="0">否</el-radio>
                  <el-radio label="1">是</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
          </div>

          <div v-if="articleForm.articleType === 'news'" class="form-grid single">
            <div class="form-card">
              <div class="card-title">文章内容</div>
              <el-form-item label="正文编辑器" prop="content" required class="content-form-item">
                <div class="editor-container">
                  <iframe ref="ueIframe" src="/ueditor/index.html"></iframe>
                </div>
              </el-form-item>
            </div>
          </div>

          <div v-if="articleForm.articleType === 'newspic'" class="form-grid single">
            <div class="form-card">
              <div class="card-title">图片描述</div>
              <el-form-item label="描述内容" prop="content" required>
                <div class="simple-editor-container">
                  <el-input
                    v-model="articleForm.content"
                    type="textarea"
                    :rows="10"
                    placeholder="请输入图片描述（纯文本，最多 1000 字）"
                    maxlength="1000"
                    show-word-limit
                    resize="none"
                  />
                </div>
              </el-form-item>
            </div>
          </div>
        </el-form>
      </section>
    </div>

    <el-dialog v-model="imageSelectorVisible" title="选择图片" class="mobile-image-dialog" width="92%" destroy-on-close>
      <div class="image-selector-toolbar">
        <span>已选择 {{ selectedImages.length }} / 20 张图片</span>
      </div>

      <div v-if="imageTableData.length" class="material-grid">
        <button
          v-for="item in imageTableData"
          :key="item.mediaId"
          type="button"
          :class="['material-card', { active: isImageSelected(item.mediaId) }]"
          @click="toggleImageSelection(item)"
        >
          <div class="material-thumb">
            <el-image :src="item.url" fit="cover" referrerpolicy="no-referrer" />
          </div>
          <div class="material-body">
            <div class="material-name">{{ item.name || '未命名图片' }}</div>
            <div class="material-meta">{{ item.mediaId || '-' }}</div>
            <div class="material-meta">{{ formatTimestamp(item.update_time) || '-' }}</div>
          </div>
          <span v-if="isImageSelected(item.mediaId)" class="material-check">已选</span>
        </button>
      </div>

      <div v-else class="dialog-empty-text">暂无图片素材</div>

      <template #footer>
        <div class="dialog-footer">
          <van-button round plain type="primary" @click="imageSelectorVisible = false">取消</van-button>
          <van-button round type="primary" @click="confirmImageSelection">确定</van-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { addDraft, updateDraft, getDraftDetail } from '@/api/article'
import { getPermanentMaterialsList } from '@/api/material/permanentMaterials'
import { getMediaProductList } from '@/api/media/mediaProduct/index'
import { Base64 } from 'js-base64'

const router = useRouter()
const route = useRoute()

const parseAccountIdFromQuery = (rawAccountId) => {
  if (rawAccountId === undefined || rawAccountId === null || rawAccountId === '') return ''

  if (Array.isArray(rawAccountId)) {
    const firstId = Number(rawAccountId[0])
    return Number.isNaN(firstId) ? '' : firstId
  }

  const parsedId = Number(rawAccountId)
  return Number.isNaN(parsedId) ? '' : parsedId
}

const articleForm = ref({
  id: '',
  title: '',
  digest: '',
  author: '',
  thumbMediaId: '',
  needOpenComment: '0',
  onlyFansCanComment: '0',
  content: '',
  articleType: 'news',
  imageInfo: [],
  productId: route.query.productId || '',
  platformId: route.query.platformId || '',
  accountId: parseAccountIdFromQuery(route.query.accountId)
})

const imageSelectorVisible = ref(false)
const imageTableData = ref([])
const selectedImages = ref([])
const articleFormRef = ref()
const ueIframe = ref(null)

const rules = ref({
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' }
  ],
  digest: [
    { required: false }
  ],
  author: [
    { required: false }
  ],
  thumbMediaId: [
    {
      validator: (rule, value, callback) => {
        if (articleForm.value.articleType === 'news' && !value) {
          callback(new Error('请输入封面图片媒体 ID'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  imageInfo: [
    {
      validator: (rule, value, callback) => {
        if (articleForm.value.articleType === 'newspic' && (!value || value.length === 0)) {
          callback(new Error('请选择至少一张图片'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  content: [
    {
      required: true,
      message: '请输入内容',
      trigger: 'blur'
    }
  ]
})

const bindEditorOnload = () => {
  if (ueIframe.value) {
    ueIframe.value.onload = () => {
      applyEditorFrameLayout()
      initEditor()
    }
  }
}

const applyEditorFrameLayout = () => {
  if (!ueIframe.value || !ueIframe.value.contentWindow?.document) {
    return
  }

  ueIframe.value.setAttribute('scrolling', 'yes')

  const doc = ueIframe.value.contentWindow.document
  if (!doc.querySelector('meta[name="viewport"]')) {
    const meta = doc.createElement('meta')
    meta.name = 'viewport'
    meta.content = 'width=1024, initial-scale=1.0'
    doc.head.appendChild(meta)
  }

  if (!doc.getElementById('mobile-ueditor-style')) {
    const style = doc.createElement('style')
    style.id = 'mobile-ueditor-style'
    style.textContent = `
      html, body {
        margin: 0;
        padding: 0;
        width: auto;
        min-width: 1024px;
        overflow-x: auto !important;
        overflow-y: auto !important;
        background: #ffffff;
        box-sizing: border-box;
        -webkit-text-size-adjust: 100%;
      }
      body, div {
        box-sizing: border-box;
      }
      #editor {
        width: 1024px !important;
        min-height: 540px !important;
      }
      .edui-default .edui-editor {
        width: 1024px !important;
        min-width: 1024px !important;
        max-width: none !important;
      }
      .edui-editor-iframeholder {
        width: 100% !important;
      }
      .edui-default .edui-editor-toolbarbox,
      .edui-default .edui-editor-iframeholder,
      .edui-default .edui-editor-bottomContainer,
      .edui-default .edui-dialog,
      .edui-default .edui-popup {
        box-sizing: border-box;
      }
    `
    doc.head.appendChild(style)
  }
}

const loadArticleData = (articleId) => {
  const loadingMask = ElLoading.service({
    lock: true,
    text: '正在加载文章数据...',
    background: 'rgba(0, 0, 0, 0.5)'
  })

  getDraftDetail(articleId)
    .then(res => {
      if (res.code === 200) {
        const articleData = res.data
        articleData.needOpenComment = String(articleData.needOpenComment || '0')
        articleData.onlyFansCanComment = String(articleData.onlyFansCanComment || '0')

        articleForm.value = {
          ...articleForm.value,
          ...articleData
        }
        initEditor()
      } else {
        ElMessage.error(res.message || '获取文章数据失败')
      }
    })
    .catch(error => {
      ElMessage.error('获取文章数据失败')
      console.error('获取文章数据失败:', error)
    })
    .finally(() => {
      loadingMask.close()
    })
}

onMounted(() => {
  bindEditorOnload()
  const articleId = route.query.id
  if (articleId) {
    articleForm.value.id = articleId
    loadArticleData(articleId)
  }
})

const initEditor = () => {
  if (!ueIframe.value || !ueIframe.value.contentWindow) {
    return
  }

  const iframeWindow = ueIframe.value.contentWindow
  if (!iframeWindow.UE || !iframeWindow.UE.getEditor) {
    return
  }

  const ueInstance = iframeWindow.UE.getEditor('editor')
  if (!ueInstance) {
    return
  }

  ueInstance.ready(() => {
    applyEditorFrameLayout()
    ueInstance.setContent(articleForm.value.content)
    ueInstance.addListener('contentChange', () => {
      articleForm.value.content = ueInstance.getContent()
    })
  })
}

const getIframeUEditorContent = () => {
  if (!ueIframe.value || !ueIframe.value.contentWindow) {
    return
  }

  const iframeWindow = ueIframe.value.contentWindow
  if (!iframeWindow.UE || !iframeWindow.UE.getEditor) {
    return
  }

  const ueInstance = iframeWindow.UE.getEditor('editor')
  if (!ueInstance) {
    return
  }

  articleForm.value.content = ueInstance.getContent()
}

const handleSaveDraft = () => {
  if (articleForm.value.articleType === 'news') {
    getIframeUEditorContent()
  }

  articleFormRef.value.validate(valid => {
    if (valid) {
      const encodedContent = Base64.encode(articleForm.value.content)

      const draftParams = {
        ...articleForm.value,
        content: encodedContent,
        needOpenComment: parseInt(articleForm.value.needOpenComment),
        onlyFansCanComment: parseInt(articleForm.value.onlyFansCanComment),
        accountId: parseAccountIdFromQuery(route.query.accountId)
      }

      const apiCall = articleForm.value.id ? updateDraft : addDraft
      const successMessage = articleForm.value.id ? '草稿更新成功' : '草稿保存成功'

      const loadingMask = ElLoading.service({
        lock: true,
        text: '正在保存草稿...',
        background: 'rgba(0, 0, 0, 0.5)'
      })

      apiCall(draftParams)
        .then(response => {
          if (response.code === 200) {
            ElMessage.success(successMessage)
            router.push('/article/articleList')
          } else {
            ElMessage.error(response.message || '草稿保存失败')
          }
        })
        .catch(() => {
          ElMessage.error('草稿保存失败，请稍后重试')
        })
        .finally(() => {
          loadingMask.close()
        })
    } else {
      return false
    }
  })
}

const handleArticleTypeChange = () => {
  if (articleFormRef.value) {
    articleFormRef.value.clearValidate('thumbMediaId')
    articleFormRef.value.clearValidate('content')
  }
}

const openImageSelector = async () => {
  imageSelectorVisible.value = true
  selectedImages.value = []
  await loadImageList()
}

const loadImageList = async () => {
  const loadingMask = ElLoading.service({
    lock: true,
    text: '正在加载图片...',
    background: 'rgba(0, 0, 0, 0.5)'
  })

  try {
    const productRes = await getMediaProductList({
      pageNum: 1,
      pageSize: 1000000,
      queryConfig: {
        queryProduct: true,
        queryChannels: true,
        queryAccount: true
      }
    })

    if (productRes.code === 200) {
      const rawProducts = productRes.rows || productRes.data?.rows || productRes.data || []
      const productList = rawProducts.map(item => ({
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

      const platformId = articleForm.value.platformId
      let targetAccountIds = []

      for (const product of productList) {
        const platform = product.platforms.find(p => String(p.id) === String(platformId))
        if (platform && platform.accountDTOList.length > 0) {
          const accountIds = (platform.accountDTOList || [])
            .map(account => account.id)
            .filter(id => id !== undefined && id !== null)
          targetAccountIds = accountIds
          break
        }
      }

      if (targetAccountIds.length === 0) {
        const fallbackAccountId = parseAccountIdFromQuery(route.query.accountId)
        if (fallbackAccountId) {
          targetAccountIds = [fallbackAccountId]
        }
      }

      if (targetAccountIds.length === 0) {
        ElMessage.warning('当前平台未绑定账号，请先绑定后再操作')
        imageTableData.value = []
        return
      }

      const materialsRes = await getPermanentMaterialsList({
        pageNum: 1,
        pageSize: 1000000,
        accountIds: targetAccountIds
      })

      if (materialsRes.code === 200) {
        imageTableData.value = materialsRes.data?.list || materialsRes.data || []
      } else {
        ElMessage.error(materialsRes.message || '加载图片列表失败')
      }
    } else {
      ElMessage.error(productRes.message || '获取产品列表失败')
    }
  } catch (error) {
    ElMessage.error('加载图片列表失败')
    console.error('加载图片列表失败:', error)
  } finally {
    loadingMask.close()
  }
}

const isImageSelected = (mediaId) => {
  return selectedImages.value.some(img => img.mediaId === mediaId)
}

const toggleImageSelection = (row) => {
  const index = selectedImages.value.findIndex(img => img.mediaId === row.mediaId)
  if (index > -1) {
    selectedImages.value.splice(index, 1)
    return
  }

  if (selectedImages.value.length >= 20) {
    ElMessage.warning('最多只能选择 20 张图片')
    return
  }

  selectedImages.value.push(row)
}

const confirmImageSelection = () => {
  if (selectedImages.value.length === 0) {
    ElMessage.warning('请至少选择一张图片')
    return
  }
  articleForm.value.imageInfo = [...selectedImages.value]
  imageSelectorVisible.value = false
  ElMessage.success(`已选择 ${selectedImages.value.length} 张图片，第一张为封面图`)
}

const removeImage = (index) => {
  articleForm.value.imageInfo.splice(index, 1)
}

const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const handleBack = () => {
  router.push('/article/articleList')
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

.ignore-vw.article-editor {
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

.ignore-vw .editor-shell {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ignore-vw .hero-card,
.ignore-vw .form-panel {
  width: 100%;
  background: $card-bg;
  border: 1px solid $card-border;
  border-radius: 24px;
  box-shadow: $card-shadow;
  backdrop-filter: blur(16px);
  box-sizing: border-box;
}

.ignore-vw .hero-card {
  position: relative;
  padding: 18px 16px 16px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: linear-gradient(180deg, rgba(105, 124, 232, 0.12), rgba(105, 124, 232, 0));
    pointer-events: none;
  }
}

.ignore-vw .hero-top {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ignore-vw .hero-badge {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(99, 118, 232, 0.1);
  color: #6a79d0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.ignore-vw .page-title {
  margin: 12px 0 8px;
  font-size: 22px;
  line-height: 1.25;
  font-weight: 700;
  color: $text-main;
}

.ignore-vw .hero-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: $text-sub;
}

.ignore-vw .action-buttons {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ignore-vw .form-panel {
  padding: 16px 14px;
}

.ignore-vw .article-form {
  width: 100%;
}

.ignore-vw .form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.ignore-vw .form-grid.single {
  grid-template-columns: minmax(0, 1fr);
}

.ignore-vw .form-card {
  padding: 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(248, 250, 255, 0.96), rgba(243, 246, 252, 0.96));
  box-shadow: inset 0 0 0 1px rgba(228, 233, 244, 0.94);
}

.ignore-vw .card-title {
  margin-bottom: 10px;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 700;
  color: $text-main;
}

.ignore-vw .content-form-item {
  margin-bottom: 0;
}

.ignore-vw .full-width-radio {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

.ignore-vw .editor-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  border-radius: 16px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(219, 228, 239, 0.94);
}

.ignore-vw .editor-container iframe {
  width: 1024px !important;
  min-width: 1024px;
  min-height: 66vh;
  height: 66vh;
  border: none;
  display: block;
}

.ignore-vw .simple-editor-container,
.ignore-vw .image-selection-container {
  width: 100%;
}

.ignore-vw .empty-image-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 160px;
  padding: 16px;
  border: 1px dashed rgba(207, 217, 230, 0.96);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.86);
}

.ignore-vw .empty-image-text {
  font-size: 13px;
  line-height: 1.6;
  color: $text-sub;
}

.ignore-vw .selected-images {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ignore-vw .image-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.ignore-vw .image-item {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid transparent;
  background: #edf3fb;
}

.ignore-vw .image-item.is-cover {
  border-color: #6a79d0;
}

.ignore-vw .image-item :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.ignore-vw .cover-tag,
.ignore-vw .material-check {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(99, 118, 232, 0.92);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.ignore-vw .material-check {
  left: auto;
  right: 8px;
}

.ignore-vw .remove-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.56);
  color: #fff;
  cursor: pointer;
}

.ignore-vw .image-selector-toolbar {
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  background: #f5f8fd;
  font-size: 13px;
  line-height: 1.5;
  color: $text-sub;
}

.ignore-vw .material-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  max-height: 60vh;
  overflow-y: auto;
}

.ignore-vw .material-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 10px;
  border: 1px solid rgba(217, 226, 238, 0.94);
  border-radius: 16px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.ignore-vw .material-card.active {
  border-color: rgba(101, 114, 220, 0.34);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 248, 255, 1));
  box-shadow:
    0 10px 22px rgba(103, 121, 190, 0.14),
    inset 0 0 0 1px rgba(101, 114, 220, 0.12);
}

.ignore-vw .material-thumb {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 12px;
  background: #edf3fb;
}

.ignore-vw .material-thumb :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.ignore-vw .material-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
}

.ignore-vw .material-name {
  font-size: 13px;
  line-height: 1.55;
  font-weight: 600;
  color: $text-main;
  word-break: break-word;
}

.ignore-vw .material-meta {
  font-size: 12px;
  line-height: 1.5;
  color: $text-sub;
  word-break: break-all;
}

.ignore-vw .dialog-empty-text {
  padding: 28px 0;
  text-align: center;
  color: $text-sub;
  font-size: 14px;
}

.ignore-vw .dialog-footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ignore-vw :deep(.el-form-item) {
  margin-bottom: 14px;
}

.ignore-vw :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.ignore-vw :deep(.el-form-item__label) {
  padding-bottom: 6px;
  font-size: 12px;
  line-height: 1.5;
  font-weight: 700;
  color: $text-light;
}

.ignore-vw :deep(.el-input__wrapper),
.ignore-vw :deep(.el-textarea__inner) {
  border-radius: 14px;
  min-height: 42px;
  box-shadow: 0 0 0 1px rgba(219, 228, 239, 0.94) inset;
  font-size: 14px;
}

.ignore-vw :deep(.el-input__inner),
.ignore-vw :deep(.el-textarea__inner) {
  font-size: 14px;
  line-height: 1.55;
  color: $text-main;
}

.ignore-vw :deep(.el-textarea__inner) {
  padding-top: 10px;
}

.ignore-vw :deep(.el-input__count),
.ignore-vw :deep(.el-textarea__count) {
  font-size: 12px;
  color: $text-light;
}

.ignore-vw :deep(.el-radio-group) {
  min-height: 36px;
}

.ignore-vw :deep(.el-radio) {
  margin-right: 0;
}

.ignore-vw :deep(.el-radio__label) {
  padding-left: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: $text-main;
}

.ignore-vw :deep(.el-radio__inner) {
  width: 16px;
  height: 16px;
}

.ignore-vw :deep(.el-dialog) {
  border-radius: 20px;
}

.ignore-vw :deep(.el-dialog__header) {
  padding-bottom: 6px;
}

.ignore-vw :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 700;
  color: $text-main;
}

.ignore-vw :deep(.el-dialog__body) {
  padding-top: 8px;
}

.ignore-vw :deep(.van-button) {
  min-height: 42px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 16px;
}

.ignore-vw :deep(.van-button--primary) {
  border: none;
  background: linear-gradient(135deg, $brand-start 0%, $brand-end 100%);
  box-shadow: 0 12px 24px rgba(103, 121, 190, 0.18);
}

.ignore-vw :deep(.van-button--plain.van-button--primary) {
  background: rgba(247, 249, 253, 0.96);
  color: #5d6bd8;
  border: 1px solid rgba(101, 114, 220, 0.24);
  box-shadow: none;
}

@media (max-width: 768px) {
  .ignore-vw .form-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .ignore-vw .image-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ignore-vw .material-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (min-width: 769px) {
  .ignore-vw.article-editor {
    padding: 24px;
  }

  .ignore-vw .editor-shell {
    max-width: 1040px;
    margin: 0 auto;
  }

  .ignore-vw .hero-top {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }

  .ignore-vw .action-buttons {
    width: 280px;
  }
}
</style>
