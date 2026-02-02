/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
    <div class="company-info-container">
        <div class="title-container">
            <h3 class="page-title">首页内容设置</h3>
            <div class="action-buttons">

                <div class="publish-info">
                    <span v-if="publishedTime" class="info-item">最近一次发布时间：{{ publishedTime }}</span>
                    <span v-if="publishedBy" class="info-item">发布人：{{ publishedBy }}</span>
                </div>
                
                <div class="status-container">
                    <el-tag :type="hasUnsavedChanges() ? 'warning' : (publishStatus === '1' ? 'success' : 'info')"
                        class="publish-status">
                        {{ hasUnsavedChanges() ? '未保存' : (publishStatus === '1' ? '已发布' : '未发布') }}
                    </el-tag>
                </div>

                <el-button type="primary" @click="handleSave">保存</el-button>
                <el-dropdown v-if="publishStatus !== '1'" trigger="hover">
                    <el-button>
                        预览
                        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="handlePcPreview">PC端预览</el-dropdown-item>
                            <el-dropdown-item @click="handleMobilePreview">移动端预览</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
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
                <el-button v-if="publishStatus !== '1'"  type="success" @click="handlePublish">发布</el-button>
                <el-button @click="goBack">返回</el-button>
                
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
            </div>
        </div>

        <!-- 轮播图设置 -->
        <el-card shadow="hover" class="company-card">
            <template #header>
                <div class="card-header">
                    <span>轮播图设置</span>
                    <el-tooltip content="最多可添加5张轮播图" placement="top">
                        <el-icon class="info-icon"><question-filled /></el-icon>
                    </el-tooltip>
                </div>
            </template>
            <div class="follow-settings">
                <div v-for="(carousel, index) in carouselImageListsTemp" :key="index" class="follow-item">
                    <el-form :model="carousel" label-width="80px" :ref="el => carouselFormRefs[index] = el">
                        <el-row :gutter="20">
                            <el-col :span="24">
                                <el-form-item label="图片地址" prop="imageUrl"
                                    :rules="[{ required: true, message: '请选择轮播图片', trigger: ['blur', 'change'] }]">
                                    <div class="logo-upload-wrapper">
                                        <el-input v-model="carousel.imageUrl" type="textarea" placeholder="请选择轮播图片"
                                            readonly class="image-url-input" />
                                        <el-upload class="image-upload-btn"
                                            :http-request="(params) => handleHttpRequest(params, carousel)"
                                            :before-upload="handleBeforeUpload" :file-list="carousel.imageFileList"
                                            :limit="1" :on-exceed="handleExceed"
                                            :on-remove="(file, fileList) => handleRemove(file, fileList, carousel)"
                                            list-type="text">
                                            <el-button type="primary">选择图片</el-button>
                                        </el-upload>
                                    </div>
                                </el-form-item>
                            </el-col>
                            <el-col :span="24">
                                <el-form-item label="是否显示" prop="isShow"
                                    :rules="[{ required: true, message: '请设置是否显示', trigger: ['blur', 'change'] }]">
                                    <el-switch v-model="carousel.isShow"></el-switch>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                    <div v-if="index > 0" class="remove-button">
                        <el-button type="danger" text @click="removeCarousel(index)">
                            <el-icon>
                                <Delete />
                            </el-icon> 删除
                        </el-button>
                    </div>
                </div>
                <div class="add-follow-container">
                    <el-button type="primary" size="small" @click="addCarousel"
                        :disabled="carouselImageListsTemp.length >= 5">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        添加轮播图
                    </el-button>
                </div>
            </div>
        </el-card>

        <!-- 主要产品设置 -->
        <el-card shadow="hover" class="company-card">
            <template #header>
                <div class="card-header">
                    <span>主要产品设置</span>
                    <el-tooltip content="最多可添加5个产品" placement="top">
                        <el-icon class="info-icon"><question-filled /></el-icon>
                    </el-tooltip>
                </div>
            </template>
            <div class="certification-settings">
                <div v-for="(product, index) in mainProductsTemp" :key="index" class="certification-item">
                    <el-form :model="product" label-width="80px" :ref="el => productFormRefs[index] = el">
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-form-item label="产品名称" prop="productName"
                                    :rules="[{ required: true, message: '请输入产品名称', trigger: 'blur' }]">
                                    <el-input v-model="product.productName" placeholder="请输入产品名称" show-word-limit
                                        maxlength="20"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="跳转菜单" prop="jumpUrl">
                                    <el-select v-model="product.jumpUrl" placeholder="请选择跳转菜单" style="width: 100%;">
                                        <el-option v-for="dict in website_menu" :key="dict.value" :label="dict.label"
                                            :value="dict.value" </el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="24">
                                <el-form-item label="产品图片" prop="imageUrl"
                                    :rules="[{ required: true, message: '请选择产品图片', trigger: ['blur', 'change'] }]">
                                    <div class="logo-upload-wrapper">
                                        <el-input v-model="product.imageUrl" type="textarea" placeholder="请选择产品图片"
                                            readonly class="image-url-input" />
                                        <el-upload class="image-upload-btn"
                                            :http-request="(params) => handleHttpRequest(params, product)"
                                            :before-upload="handleBeforeUpload" :file-list="product.imageFileList"
                                            :limit="1" :on-exceed="handleExceed"
                                            :on-remove="(file, fileList) => handleRemove(file, fileList, product)"
                                            list-type="text">
                                            <el-button type="primary">选择图片</el-button>
                                        </el-upload>
                                    </div>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                    <div v-if="index > 0" class="remove-button">
                        <el-button type="danger" text @click="removeProduct(index)">
                            <el-icon>
                                <Delete />
                            </el-icon> 删除
                        </el-button>
                    </div>
                </div>
                <div class="add-certification-container">
                    <el-button type="primary" size="small" @click="addProduct" :disabled="mainProductsTemp.length >= 5">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        添加产品
                    </el-button>
                </div>
            </div>
        </el-card>

        <!-- 典型客户设置 -->
        <el-card shadow="hover" class="company-card">
            <template #header>
                <div class="card-header">
                    <span>典型客户设置</span>
                </div>
            </template>
            <el-form :model="typicalCustomerTemp" label-width="80px" :ref="customerFormRef">
                <el-form-item label="客户图片" prop="customerImageUrl">
                    <div class="logo-upload-wrapper">
                        <el-input v-model="typicalCustomerTemp.customerImageUrl" type="textarea" placeholder="请选择客户图片"
                            readonly class="image-url-input" />
                        <el-upload class="image-upload-btn" :http-request="handleCustomerImageUpload"
                            :before-upload="handleBeforeUpload" :file-list="customerImageFileList" :limit="1"
                            :on-exceed="handleExceed" :on-remove="handleCustomerImageRemove" list-type="text">
                            <el-button type="primary">选择图片</el-button>
                        </el-upload>
                    </div>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { Plus, Delete, QuestionFilled, ArrowDown } from '@element-plus/icons-vue'
import QrcodeVue from 'qrcode.vue'
import { uploadImage } from '@/api'
import { saveMainPage, publishMainPage, getMainPage } from '@/api/content/mainPage'
import settings from '@/settings'
import { sortOrders } from 'element-plus/es/components/table-v2/src/constants.mjs'

const { proxy } = getCurrentInstance()
const { website_menu } = proxy.useDict("website_menu")

// 发布状态：0-已保存未发布，1-已发布
const publishStatus = ref('0')

// 发布信息
const publishedTime = ref('')
const publishedBy = ref('')

// 预览相关变量
const mobilePreviewVisible = ref(false)
const mobilePreviewUrl = ref(`${settings.mobileWeb}/preview?type=mainPage`)
const pcPreviewUrl = ref(`${settings.pcWeb}/preview?type=mainPage`)

// 查看相关变量
const mobileViewVisible = ref(false)
const mobileViewUrl = ref(settings.mobileWeb)
const pcViewUrl = ref(settings.pcWeb)

// 表单引用
const carouselFormRefs = ref([])
const productFormRefs = ref([])
const customerFormRef = ref(null)

// 典型客户表单数据
const typicalCustomerTemp = ref({
    customerImageUrl: ''
})

// 原始数据（用于比较是否有未保存的修改）
const originalData = ref({})

// 轮播图数据
const carouselImageListsTemp = ref([
    {
        imageUrl: '',
        imageFileList: [],
        isShow: true
    }
])

// 主要产品数据
const mainProductsTemp = ref([
    {
        productName: '',
        imageUrl: '',
        jumpUrl: '',
        imageFileList: []
    }
])

// 典型客户数据
const customerImageFileList = ref([])

// 初始化图片文件列表（用于编辑已有数据时）
const initImageFileLists = () => {
    // 初始化轮播图图片列表
    carouselImageListsTemp.value.forEach(item => {
        if (item.imageUrl && item.imageUrl.trim()) {
            const fileName = item.imageUrl.split('/').pop() || 'carousel.png'
            item.imageFileList = [{ name: fileName, url: item.imageUrl }]
        }
    })

    // 初始化产品图片列表
    mainProductsTemp.value.forEach(item => {
        if (item.imageUrl && item.imageUrl.trim()) {
            const fileName = item.imageUrl.split('/').pop() || 'product.png'
            item.imageFileList = [{ name: fileName, url: item.imageUrl }]
        }
    })

    // 初始化客户图片列表
    if (typicalCustomerTemp.value.customerImageUrl && typicalCustomerTemp.value.customerImageUrl.trim()) {
        const fileName = typicalCustomerTemp.value.customerImageUrl.split('/').pop() || 'customer.png'
        customerImageFileList.value = [{ name: fileName, url: typicalCustomerTemp.value.customerImageUrl }]
    }
}

// 加载主页面数据
const loadMainPageData = () => {
    getMainPage()
        .then(res => {
            if (res.code === 200) {

                // 根据发布状态获取对应的数据字段
                const isPublish = res.data.isPublish || '0'
                publishStatus.value = isPublish
                const carouselField = isPublish === '1' ? 'carouselImageLists' : 'carouselImageListsTemp'
                const productsField = isPublish === '1' ? 'mainProducts' : 'mainProductsTemp'
                const customerField = isPublish === '1' ? 'typicalCustomer' : 'typicalCustomerTemp'
                
                // 获取发布信息
                const carouselData = res.data[carouselField] || []
                if (carouselData.length > 0) {
                    publishedTime.value = carouselData[0].publishedTime || ''
                    publishedBy.value = carouselData[0].publishedBy || ''
                } else {
                    publishedTime.value = ''
                    publishedBy.value = ''
                }

                if (res.data[carouselField] && res.data[carouselField].length > 0) {
                    carouselImageListsTemp.value = res.data[carouselField].map(item => ({
                        ...item,
                        isShow: item.isShow === '1',
                        imageFileList: [],
                        sortOrder: item.sortOrder || 0
                    }))
                }

                if (res.data[productsField] && res.data[productsField].length > 0) {
                    mainProductsTemp.value = res.data[productsField].map(item => ({
                        ...item,
                        imageFileList: [],
                        sortOrder: item.sortOrder || 0,
                    }))
                }

                typicalCustomerTemp.value.customerImageUrl = res.data[customerField]?.imageUrl || ''

                // 初始化图片列表
                initImageFileLists()
                // 保存原始数据
                initOriginalData()
            }
        })
        .catch(err => {
            ElMessage.error(err.message)
        })
}

// 组件挂载后初始化
onMounted(() => {
    // 调用加载数据函数
    loadMainPageData()
})

// 初始化原始数据
const initOriginalData = () => {
    // 深拷贝当前数据到原始数据中
    originalData.value = JSON.parse(JSON.stringify({
        carouselImageListsTemp: carouselImageListsTemp.value,
        mainProductsTemp: mainProductsTemp.value,
        customerImageUrl: typicalCustomerTemp.value.customerImageUrl,
        publishStatus: publishStatus.value
    }))
}

// 比较当前数据与原始数据是否一致
const hasUnsavedChanges = () => {
    // 深拷贝当前数据和原始数据，忽略临时字段
    const current = JSON.parse(JSON.stringify({
        carouselImageListsTemp: carouselImageListsTemp.value,
        mainProductsTemp: mainProductsTemp.value,
        customerImageUrl: typicalCustomerTemp.value.customerImageUrl,
        publishStatus: publishStatus.value
    }))

    const original = JSON.parse(JSON.stringify(originalData.value))

    // 移除临时字段（imageFileList）
    const removeTempFields = (data) => {
        if (data.carouselImageListsTemp) {
            data.carouselImageListsTemp.forEach(item => {
                if (item.imageFileList) {
                    delete item.imageFileList
                }
            })
        }

        if (data.mainProductsTemp) {
            data.mainProductsTemp.forEach(item => {
                if (item.imageFileList) {
                    delete item.imageFileList
                }
            })
        }

        return data
    }

    // 比较处理后的数据
    return JSON.stringify(removeTempFields(current)) !== JSON.stringify(removeTempFields(original))
}

// 返回上一页
const goBack = () => {
    window.history.back()
}

// 添加轮播图
const addCarousel = () => {
    if (carouselImageListsTemp.value.length >= 5) {
        ElMessage.warning('最多只能添加5张轮播图')
        return
    }
    carouselImageListsTemp.value.push({
        imageUrl: '',
        imageFileList: [],
        isShow: true
    })
}

// 删除轮播图
const removeCarousel = (index) => {
    carouselImageListsTemp.value.splice(index, 1)
}

// 添加产品
const addProduct = () => {
    if (mainProductsTemp.value.length >= 5) {
        ElMessage.warning('最多只能添加5个产品')
        return
    }
    mainProductsTemp.value.push({
        productName: '',
        imageUrl: '',
        jumpUrl: '',
        imageFileList: []
    })
}

// 删除产品
const removeProduct = (index) => {
    mainProductsTemp.value.splice(index, 1)
}

// 处理典型客户图片上传
const handleCustomerImageUpload = (params) => {
    const formData = new FormData()
    formData.append('file', params.file)

    uploadImage(formData)
        .then(res => {
            if (res.code === 200) {
                typicalCustomerTemp.value.customerImageUrl = res.url || ''
                ElMessage.success('图片上传成功!')

                // 更新文件列表
                customerImageFileList.value = [{ name: params.file.name, url: res.url }]

                params.onSuccess(res) // 通知上传组件上传成功
            } else {
                // 接口返回错误码，清空选择的图片
                customerImageFileList.value = []
                params.onError(res) // 通知上传组件上传失败
            }
        })
        .catch(error => {
            // 网络错误或其他异常，清空选择的图片
            customerImageFileList.value = []
            params.onError(error) // 通知上传组件上传失败
        })
}

// 处理典型客户图片移除
const handleCustomerImageRemove = (file, fileList) => {
    typicalCustomerTemp.value.customerImageUrl = '' // 清空图片地址字段
    customerImageFileList.value = fileList // 更新文件列表
}

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
const handleRemove = (file, fileList, item) => {
    item.imageUrl = '' // 清空图片地址字段
    item.imageFileList = fileList // 更新文件列表
}

// 自定义上传方法
const handleHttpRequest = (params, item) => {
    const formData = new FormData()
    formData.append('file', params.file)

    uploadImage(formData)
        .then(res => {
            if (res.code === 200) {
                item.imageUrl = res.url || ''
                ElMessage.success('图片上传成功!')

                // 更新文件列表
                item.imageFileList = [{ name: params.file.name, url: res.url }]

                params.onSuccess(res) // 通知上传组件上传成功
            } else {
                // 接口返回错误码，清空选择的图片
                item.imageFileList = []
                params.onError(res) // 通知上传组件上传失败
            }
        })
        .catch(error => {
            // 网络错误或其他异常，清空选择的图片
            item.imageFileList = []
            params.onError(error) // 通知上传组件上传失败
        })
}

// PC端预览
const handlePcPreview = () => {
  if (hasUnsavedChanges()) {
    ElMessage.warning('请先保存当前修改')
    return
  }
  window.open(pcPreviewUrl.value, '_blank')
}

// 移动端预览
const handleMobilePreview = () => {
  if (hasUnsavedChanges()) {
    ElMessage.warning('请先保存当前修改')
    return
  }
  mobilePreviewVisible.value = true
}

// PC端查看
const handlePcView = () => {
  window.open(pcViewUrl.value, '_blank')
}

// 移动端查看
const handleMobileView = () => {
  mobileViewVisible.value = true
}


// 保存数据
const handleSave = () => {
    // 验证所有表单
    validateAllForms().then(allValid => {
        if (!allValid) {
            ElMessage.error('请检查表单填写是否完整!')
            return
        }

        const loading = ElLoading.service({
            lock: true,
            text: '保存中...',
            background: 'rgba(0, 0, 0, 0.7)'
        })

        // 准备提交数据，排除imageFileList临时字段
        const submitData = {
            isPublish: publishStatus.value ? '1' : '0',
            carouselImageListsTemp: carouselImageListsTemp.value.map((item, index) => {
                const { imageFileList, ...carouselData } = item
                return {
                    ...carouselData,
                    isShow: item.isShow ? '1' : '0',
                    sortOrder: index + 1
                }
            }),
            mainProductsTemp: mainProductsTemp.value.map((item, index) => {
                const { imageFileList, ...productData } = item
                return {
                    ...productData,
                    sortOrder: index + 1
                }
            }),
            typicalCustomerTemp: {
                imageUrl: typicalCustomerTemp.value.customerImageUrl,
            }
        }

        saveMainPage(submitData)
            .then(res => {
                if (res.code === 200) {
                    ElMessage.success('保存成功')
                    // 保存成功后，重新加载最新数据
                    loadMainPageData()
                } else {
                    ElMessage.error(res.message || '保存失败')
                }
            })
            .catch(err => {
                ElMessage.error(err.message || '保存失败')
            })
            .finally(() => {
                loading.close()
            })
    })
}

// 验证所有表单
const validateAllForms = async () => {
    // 验证轮播图表单
    for (let i = 0; i < carouselFormRefs.value.length; i++) {
        if (carouselFormRefs.value[i]) {
            const valid = await carouselFormRefs.value[i].validate().catch(() => false)
            if (!valid) {
                return false
            }
        }
    }

    // 验证产品表单
    for (let i = 0; i < productFormRefs.value.length; i++) {
        if (productFormRefs.value[i]) {
            const valid = await productFormRefs.value[i].validate().catch(() => false)
            if (!valid) {
                return false
            }
        }
    }

    // 验证典型客户表单
    if (customerFormRef.value) {
        const valid = await customerFormRef.value.validate().catch(() => false)
        if (!valid) {
            return false
        }
    }

    return true
}

// 发布按钮点击事件
const handlePublish = () => {
    if (hasUnsavedChanges()) {
        ElMessage.warning('请先保存当前修改')
        return
    }

    const loading = ElLoading.service({
        lock: true,
        text: '发布中...',
        background: 'rgba(0, 0, 0, 0.7)'
    })

    publishMainPage()
        .then(res => {
            if (res.code === 200) {
                ElMessage.success('发布成功!')
                loadMainPageData()
            } else {
                ElMessage.error(res.message || '发布失败!')
            }
        })
        .catch(err => {
            ElMessage.error('发布失败，请稍后重试!')
        })
        .finally(() => {
            loading.close()
        })
}
</script>

<style scoped lang="scss">
.company-info-container {
    padding: 20px;

    .title-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .page-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 0;
        color: var(--el-text-color-primary);
    }

    .action-buttons {
        display: flex;
        align-items: center;

        .el-button {
            margin-left: 10px;
        }

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
            }

            .info-icon {
                margin-left: 5px;
                color: #409eff;
                cursor: help;
                font-size: 14px;
            }
        }
    }

    .company-card {
        margin-bottom: 20px;
        width: 80%;

        .card-header {
            display: flex;
            align-items: center;

            .info-icon {
                margin-left: 5px;
                color: #409eff;
                cursor: help;
                font-size: 14px;
            }
        }
    }

    .follow-settings,
    .certification-settings {

        .follow-item,
        .certification-item {
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 20px;
            margin-bottom: 20px;

            &:last-child {
                border-bottom: none;
                padding-bottom: 0;
                margin-bottom: 0;
            }
        }

        .remove-button {
            text-align: right;
            margin-top: 10px;
        }

        .add-follow-container,
        .add-certification-container {
            text-align: left;
            margin-top: 10px;
        }
    }

    /* LOGO上传组件样式 */
    .logo-upload-wrapper {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        width: 100%;
        /* 确保容器占满整个表单项宽度 */

        .image-url-input {
            flex: 1;
            min-width: 0;
            margin-right: 10px;
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

    /* 移动端预览/查看弹窗样式 */
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