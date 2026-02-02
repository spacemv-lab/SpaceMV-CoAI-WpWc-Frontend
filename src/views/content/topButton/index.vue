/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
  <div class="top-button-container">
    <div class="title-container">
      <h3 class="page-title">按钮设置 <el-tooltip content="最多可添加5个按钮" placement="top"><el-icon
            class="info-icon"><question-filled /></el-icon></el-tooltip></h3>
      <div class="action-buttons">
        <!-- 发布信息 -->
        <div class="publish-info">
          <span v-if="publishedTime" class="info-item">最近一次发布时间：{{ publishedTime }}</span>
          <span v-if="publishedBy" class="info-item">发布人：{{ publishedBy }}</span>
        </div>
        <div class="status-container">
          <el-tag :type="hasUnsavedChanges() ? 'warning' : (publishStatus === 1 ? 'success' : 'info')"
            class="publish-status">
            {{ hasUnsavedChanges() ? '未保存' : (publishStatus === 1 ? '已发布' : '未发布') }}
          </el-tag>
        </div>

        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-dropdown v-if="publishStatus !== 1" trigger="hover">
          <el-button>
            预览
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handlePcPreview">PC端预览</el-dropdown-item>
              <el-dropdown-item @click="handleMobilePreview">移动端预览</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 移动端预览弹窗 -->
        <el-dialog v-model="mobilePreviewVisible" title="移动端预览" width="30%" center>
          <div class="mobile-preview-content">
            <div class="qrcode-container">
              <qrcode-vue :value="mobilePreviewUrl" :size="200" level="H" />
            </div>
            <div class="preview-hint">请用移动设备扫描二维码查看</div>
            <div v-if="settings.env === 'intranet'" class="intranet-hint">当前系统为内网环境，移动设备扫描二维码查看前，需确保已连接内网环境。</div>
          </div>
        </el-dialog>
        <!-- 移动端查看弹窗 -->
        <el-dialog v-model="mobileViewVisible" title="移动端查看" width="30%" center>
          <div class="mobile-preview-content">
            <div class="qrcode-container">
              <qrcode-vue :value="mobileViewUrl" :size="200" level="H" />
            </div>
            <div class="preview-hint">请用移动设备扫描二维码查看</div>
            <div v-if="settings.env === 'intranet'" class="intranet-hint">当前系统为内网环境，移动设备扫描二维码查看前，需确保已连接内网环境。</div>
          </div>
        </el-dialog>
        <el-dropdown trigger="hover">
          <el-button>
            查看
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handlePcView">PC端查看</el-dropdown-item>
              <el-dropdown-item @click="handleMobileView">移动端查看</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button v-if="publishStatus !== 1" type="success" @click="handlePublish">发布</el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <div class="button-list">
      <div v-for="(button, index) in buttons" :key="index" class="button-item">
        <el-card shadow="hover">
          <div class="button-form">
            <el-form :model="button" label-width="120px" :ref="el => formRefs[index] = el">
              <el-form-item label="按钮类型" prop="buttonType"
                :rules="[{ required: true, message: '请选择按钮类型', trigger: ['blur', 'change'] }]">
                <el-radio-group v-model="button.buttonType">
                  <el-radio label="1">文字按钮</el-radio>
                  <el-radio label="2">图片按钮</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="按钮文案" prop="buttonText"
                    :rules="[{ required: true, message: '请输入按钮文案', trigger: 'blur' }]">
                    <el-input v-model="button.buttonText" placeholder="请输入按钮文案" show-word-limit
                      maxlength="20"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item v-if="button.buttonType === '1'" label="背景色" prop="backgroundColor"
                    :rules="[{ required: true, message: '请选择按钮背景色', trigger: ['blur', 'change'] }]">
                    <div class="color-picker-container">
                      <el-input v-model="button.backgroundColor" placeholder="点击右侧按钮，选择按钮背景色" class="color-input"
                        readonly />
                      <el-color-picker :model-value="button.backgroundColor"
                        @update:model-value="(color) => { button.backgroundColor = convertToHex(color) }" show-alpha
                        class="color-picker-btn" :predefine="predefineColors" color-format="hex" />
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item v-if="button.buttonType === '2'" label="图片地址" prop="imageUrl"
                :rules="[{ required: true, message: '请选择图片', trigger: ['blur', 'change'] }]">
                <div class="image-upload-container">
                  <el-input v-model="button.imageUrl" type="textarea" placeholder="请选择图片" readonly
                    class="image-url-input" />
                  <el-upload class="image-upload-btn" :http-request="(params) => handleHttpRequest(params, button)"
                    :before-upload="handleBeforeUpload" :file-list="button.imageFileList" :limit="1"
                    :on-exceed="handleExceed" :on-remove="(file, fileList) => handleRemove(file, fileList, button)"
                    list-type="text">
                    <el-button type="primary">选择图片</el-button>
                  </el-upload>
                </div>
              </el-form-item>

              <el-form-item label="按钮形态" prop="state"
                :rules="[{ required: true, message: '请选择按钮形态', trigger: ['blur', 'change'] }]">
                <el-radio-group v-model="button.state">
                  <!-- 1：complete，新窗口打开链接
                                     2：completeSelf，当前窗口打开链接
                                     3：completeNav，nav路由
                                     4：developing，正在开发中
                                    -->
                  <el-radio label="1">新窗口打开链接</el-radio>
                  <el-radio label="2">当前窗口打开链接</el-radio>
                  <el-radio label="3">nav路由</el-radio>
                  <el-radio label="4">正在开发中</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="跳转地址" prop="jumpUrl"
                :rules="[{ required: button.state !== '4', message: '请输入跳转地址', trigger: ['blur', 'change'] }]">
                <el-input v-model="button.jumpUrl" type="textarea" placeholder="请输入跳转地址" show-word-limit
                      maxlength="500">
                </el-input>
              </el-form-item>

              <el-form-item label="是否对外展示" prop="isShow"
                :rules="[{ required: true, message: '请设置是否对外展示', trigger: ['blur', 'change'] }]">
                <el-switch v-model="button.isShow"></el-switch>
              </el-form-item>
            </el-form>
          </div>
          <div v-if="index !== 0" class="remove-button">
            <el-button type="danger" text @click="removeButton(index)">
              <el-icon>
                <Delete />
              </el-icon>
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <div class="add-button-container">
      <el-button type="primary" size="large" @click="addButton" :disabled="buttons.length >= 5">
        <el-icon>
          <Plus />
        </el-icon>
        添加按钮
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { Plus, Delete, QuestionFilled, ArrowDown } from '@element-plus/icons-vue'
import QrcodeVue from 'qrcode.vue'
import { convertToHex } from '@/utils/tianxun.js'
import { saveTopButtons, publishTopButtons, getTopButtons, getPreviewButtons, getDisplayButtons } from '@/api/content/topButton'
import { uploadImage } from '@/api'
import settings from '@/settings'

// 表单引用数组，用于表单校验
const formRefs = ref([])

// 按钮列表数据
const buttons = ref([
  {
    buttonType: '1',
    buttonText: '',
    backgroundColor: '',
    imageUrl: '',
    jumpUrl: '',
    isShow: '0',
    state: '1',
    isPublish: '0' // 默认未发布
  }
])

// 保存原始数据用于比较
const originalButtons = ref([])

// 发布状态：0-已保存未发布，1-已发布
const publishStatus = ref(0)

// 发布信息
const publishedTime = ref('')
const publishedBy = ref('')

// 预览相关变量
const mobilePreviewVisible = ref(false)
const mobilePreviewUrl = ref(`${settings.mobileWeb}/preview?type=topButton`)
const pcPreviewUrl = ref(`${settings.pcWeb}/preview?type=topButton`)

// 查看相关变量
const mobileViewVisible = ref(false)
const mobileViewUrl = ref(settings.mobileWeb)
const pcViewUrl = ref(settings.pcWeb)

// 预定义颜色
const predefineColors = ref([
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  '#ff1493',
  '#000000',
  '#ffffff'
])
// 检测是否有未保存的修改
const hasUnsavedChanges = () => {
  // 如果长度不同，肯定有变化
  if (buttons.value.length !== originalButtons.value.length) {
    return true
  }

  // 比较每一个按钮的属性（忽略imageFileList临时字段）
  for (let i = 0; i < buttons.value.length; i++) {
    const current = { ...buttons.value[i] }
    const original = { ...originalButtons.value[i] }

    // 删除临时字段
    delete current.imageFileList
    delete original.imageFileList

    // 比较JSON字符串
    if (JSON.stringify(current) !== JSON.stringify(original)) {
      return true
    }
  }

  return false
}

// 初始化函数，获取顶部按钮配置
const initTopButtons = () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  // 并行调用三个接口
  Promise.all([
    getTopButtons(),
    getPreviewButtons(),
    getDisplayButtons()
  ]).then(([topButtonsRes, previewRes, displayRes]) => {
    // 处理按钮列表数据
    if (topButtonsRes.code === 200) {
      if (topButtonsRes.data && topButtonsRes.data.length > 0) {
        // 将后端返回的isShow字段从字符串'0'或'1'转换为布尔值
        buttons.value = topButtonsRes.data.map(button => ({
          ...button,
          isShow: button.isShow === '1'
        }))
        // 保存原始数据副本用于比较
        originalButtons.value = JSON.parse(JSON.stringify(buttons.value))
      } else {
        // 如果没有数据，使用默认数据并保存为原始数据
        originalButtons.value = JSON.parse(JSON.stringify(buttons.value))
      }
    }

    // 处理发布状态
    const previewData = previewRes.code === 200 ? previewRes.data || [] : []
    const displayData = displayRes.code === 200 ? displayRes.data || [] : []

    if (displayData.length > 0) {
      // 获取发布信息
      publishedTime.value = displayData[0].publishedTime || ''
      publishedBy.value = displayData[0].publishedBy || ''
    }
    // 根据新规则判断发布状态
    if (previewData.length === 0 && displayData.length > 0) {
      publishStatus.value = 1 // 已发布
    } else {
      publishStatus.value = 0 // 未发布
    }
  })
    .finally(() => {
      loading.close()
    })
}

// 保存成功后更新原始数据
const updateOriginalData = () => {
  originalButtons.value = JSON.parse(JSON.stringify(buttons.value))
}

// 页面加载时调用初始化函数
initTopButtons()

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
  ElMessage.warning('每个按钮只能上传一个图片，请删除旧图片再上传新图片')
}

// 处理文件移除事件
const handleRemove = (file, fileList, button) => {
  button.imageUrl = '' // 清空图片地址字段
}

// 自定义上传方法
const handleHttpRequest = (params, button) => {
  const formData = new FormData()
  formData.append('file', params.file)

  uploadImage(formData)
    .then(res => {
      if (res.code === 200) {
        button.imageUrl = res.url || ''
        ElMessage.success('图片上传成功!')

        params.onSuccess(res) // 通知上传组件上传成功
      } else {
        // 接口返回错误码，清空选择的图片
        button.imageFileList = []
        params.onError(res) // 通知上传组件上传失败
      }
    })
    .catch(error => {
      // 网络错误或其他异常，清空选择的图片
      button.imageFileList = []
      params.onError(error) // 通知上传组件上传失败
    })
}

// 处理按钮数据，用于API请求（将isShow布尔值转换为字符串'0'或'1'）
const processButtonsForAPI = (buttons) => {
  return buttons.map(button => ({
    buttonType: button.buttonType,
    buttonText: button.buttonText,
    backgroundColor: button.backgroundColor,
    imageUrl: button.imageUrl,
    jumpUrl: button.jumpUrl,
    isShow: button.isShow ? '1' : '0',
    state: button.state,
    isPublish: button.isPublish || '0'
  }))
}

const addButton = () => {
  if (buttons.value.length >= 5) {
    ElMessage.warning('最多只能添加5个按钮')
    return
  }
  buttons.value.push({
    buttonType: '1',
    buttonText: '',
    backgroundColor: '',
    imageUrl: '',
    imageFileList: [],
    jumpUrl: '',
    isShow: '0',
    state: '1',
    isPublish: '0' // 默认未发布
  })
}

const removeButton = (index) => {
  buttons.value.splice(index, 1)
}

const goBack = () => {
  // 这里可以添加返回逻辑
  window.history.back()
}

// PC端预览按钮点击事件
const handlePcPreview = () => {
  if (hasUnsavedChanges()) {
    ElMessage.warning('请先保存当前修改')
    return
  }

  // 打开PC端预览链接
  window.open(pcPreviewUrl.value, '_blank')
}

// 移动端预览按钮点击事件
const handleMobilePreview = () => {
  if (hasUnsavedChanges()) {
    ElMessage.warning('请先保存当前修改')
    return
  }

  // 显示移动端预览弹窗
  mobilePreviewVisible.value = true
}

// PC端查看按钮点击事件（跳转到企业官网）
const handlePcView = () => {
  window.open(pcViewUrl.value, '_blank')
}

// 移动端查看按钮点击事件
const handleMobileView = () => {
  // 显示移动端查看弹窗
  mobileViewVisible.value = true
}

// 保存按钮点击事件，包含表单校验
const handleSave = async () => {
  let isValid = true

  // 遍历所有表单进行校验
  for (let i = 0; i < formRefs.value.length; i++) {
    const formRef = formRefs.value[i]
    if (formRef) {
      try {
        await formRef.validate()
      } catch (error) {
        isValid = false
        // 找到第一个错误的表单后，不再继续校验其他表单
        ElMessage.error('请检查表单填写是否完整!')
        break
      }
    }
  }

  if (isValid) {
    // 所有表单校验通过，可以进行保存操作
    const loading = ElLoading.service({
      lock: true,
      text: '保存中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    // 处理按钮数据，将isShow布尔值转换为字符串'0'或'1'
    const processedButtons = processButtonsForAPI(buttons.value)

    // 调用API保存顶部按钮数据
    return saveTopButtons(processedButtons).then((res) => {
      if (res.code === 200) {
        ElMessage.success('保存成功!')
        initTopButtons()
        // 更新原始数据
        updateOriginalData()
      }
    }).catch((error) => {
      ElMessage.error('保存失败，请稍后重试!')
      return Promise.reject(error)
    }).finally(() => {
      // 关闭loading
      loading.close()
    })
  } 
}

// 发布按钮点击事件
const handlePublish = () => {
  if (hasUnsavedChanges()) {
    ElMessage.warning('请先保存当前修改')
    return
  }

  // 执行发布操作
  const loading = ElLoading.service({
    lock: true,
    text: '发布中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  // 处理按钮数据，将isShow布尔值转换为字符串'0'或'1'
  const processedButtons = processButtonsForAPI(buttons.value)

  // 调用API发布顶部按钮数据
  publishTopButtons(processedButtons).then((res) => {
    ElMessage.success('发布成功!')
    // 发布成功后，刷新页面获取最新数据
    initTopButtons()
  }).catch((error) => {
    ElMessage.error('发布失败，请稍后重试!')
  }).finally(() => {
    // 关闭loading
    loading.close()
  })
}
</script>

<style scoped lang="scss">
.top-button-container {
  padding: 20px;

  .title-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .page-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    color: var(--el-text-color-primary);

    .info-icon {
      margin-left: 5px;
      color: #409eff;
      font-size: 16px;
      cursor: help;
      vertical-align: middle;
    }
  }

  .action-buttons {
    text-align: right;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .publish-info {
      display: flex;
      font-size: 14px;
      color: #606266;
      gap: 16px;
    }

    .status-container {
      display: flex;
      align-items: center;
      margin-left: 20px;

      .publish-status {
        margin-right: 5px;
        font-size: 14px;
      }

      .info-icon {
        font-size: 16px;
        cursor: help;
      }


    }

    .el-button {
      margin-left: 10px;
    }
  }

  .button-list {
    margin-bottom: 20px;
    width: 80%;

    .button-item {
      margin-bottom: 20px;

      .button-form {
        padding: 10px 0;
      }

      .remove-button {
        text-align: right;
        margin-top: 10px;
      }
    }
  }

  .add-button-container {
    margin-bottom: 20px;
    text-align: center;
    width: 60%;
  }

  .color-picker-container {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    /* 确保容器占满整个表单项宽度 */

    .color-input {
      flex: 1;
      /* 输入框占据剩余空间 */
    }

    .color-picker-btn {
      flex-shrink: 0;
      /* 颜色选择器不收缩 */
    }
  }

  .image-upload-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    width: 100%;
    /* 确保容器占满整个表单项宽度 */

    .image-url-input {
      flex: 1;
      /* 输入框占据剩余空间 */
    }

    .image-upload-btn {
      flex-shrink: 0;
      /* 上传按钮不收缩 */
      display: flex;
      align-items: center;
    }

    /* 确保el-upload内部的按钮与输入框对齐 */
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

  .description-box {
    background-color: #fff3cd;
    border: 1px solid #ffeeba;
    border-radius: 4px;
    padding: 15px;
    margin-top: 20px;

    h4 {
      margin: 0 0 10px 0;
      color: #856404;
    }

    ul {
      margin: 0;
      padding-left: 20px;
      color: #856404;

      li {
        margin-bottom: 5px;
      }
    }
  }

  /* 移动端预览弹窗样式 */
  .mobile-preview-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 0;
    text-align: center;
  }
  .qrcode-container {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .preview-hint {
    text-align: center;
    color: #606266;
    font-size: 14px;
  }
  
  .intranet-hint {
    text-align: center;
    color: #f56c6c;
    font-size: 14px;
    margin-top: 10px;
    font-weight: 500;
  }
}
</style>