/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
    <div class="product-container">
        <div class="title-container">
            <h3 class="page-title">产品内容设置</h3>
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
                <el-button  v-if="publishStatus !== '1'"  type="success" @click="handlePublish">发布</el-button>
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
        <template v-if="auth.hasPermi('product:industry:set') || auth.hasPermi('product:device:set')">
            <el-tabs v-model="activeTab" class="product-tabs">
                <el-tab-pane v-if="auth.hasPermi('product:industry:set')" label="大模型" name="model">
                </el-tab-pane>
                <el-tab-pane v-if="auth.hasPermi('product:device:set')" label="小装置" name="device">
                </el-tab-pane>
            </el-tabs>
            <!-- 产品基础信息 -->
            <el-form :model="currentProductBasicInfo" label-width="120px" ref="productFormRef">
                <el-card shadow="hover" class="company-card">
                    <template #header>
                        <div class="card-header">
                            <span>产品基础信息</span>
                        </div>
                    </template>

                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="产品名称" prop="productName"
                                :rules="[{ required: true, message: '请输入产品名称', trigger: 'blur' }, { max: 20, message: '产品名称最多20个字符', trigger: 'blur' }]">
                                <el-input v-model="currentProductBasicInfo.productName" placeholder="请输入产品名称"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="产品简介" prop="productIntro">
                                <el-input v-model="currentProductBasicInfo.productIntro" placeholder="请输入产品简介"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="24">
                            <el-form-item label="背景图片" prop="backgroundImage"
                                :rules="[{ required: true, message: '请选择背景图片', trigger: ['blur', 'change'] }]">
                                <div class="logo-upload-wrapper">
                                    <el-input v-model="currentProductBasicInfo.backgroundImage" type="textarea"
                                        placeholder="请选择背景图片" readonly class="image-url-input" />
                                    <el-upload class="image-upload-btn" :http-request="(params) => handleBasicImageUpload(params)"
                                        :before-upload="handleBeforeUpload"
                                        :file-list="currentProductBasicInfo.backgroundImageFileList" :limit="1"
                                        :on-exceed="handleExceed" :on-remove="(file, fileList) => handleBasicImageRemove(file, fileList)" list-type="text">
                                        <el-button type="primary">选择图片</el-button>
                                    </el-upload>
                                </div>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="24">
                            <el-form-item label="详细介绍" prop="detailedIntroduction"
                                :rules="[{ max: 500, message: '详细介绍最多500个字符', trigger: 'blur' }]">
                                <el-input v-model="currentProductBasicInfo.detailedIntroduction" placeholder="请详细描述产品内容"
                                    type="textarea" :rows="5"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-card>
            </el-form>
            
            <!-- 应用场景设置 -->
            <el-form :model="currentApplicationScenariosTemp" label-width="120px">
                <el-card shadow="hover" class="company-card">
                    <template #header>
                        <div class="card-header">
                            <span>应用场景设置</span>
                            <el-tooltip content="最多可添加5个应用场景" placement="top">
                                <el-icon class="info-icon"><question-filled /></el-icon>
                            </el-tooltip>
                        </div>
                    </template>
                    <div class="certification-settings">
                        <div v-for="(scenario, index) in currentApplicationScenariosTemp" :key="index" class="certification-item">
                            <el-form :model="scenario" label-width="120px" :ref="el => scenarioFormRefs[index] = el">
                                <el-row :gutter="20">
                                    <el-col :span="12">
                                        <el-form-item label="应用场景名称" prop="scenarioName"
                                            :rules="[{ required: true, message: '请输入应用场景名称', trigger: 'blur' }, { max: 20, message: '应用场景名称最多20个字符', trigger: 'blur' }]">
                                            <el-input v-model="scenario.scenarioName" placeholder="请输入应用场景名称" show-word-limit
                                                maxlength="20"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="应用场景简介" prop="scenarioIntro">
                                            <el-input v-model="scenario.scenarioIntro" placeholder="请输入应用场景简介" show-word-limit
                                                maxlength="60"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row :gutter="20">
                                    <el-col :span="24">
                                        <el-form-item label="场景缩略图地址" prop="iconUrl">
                                            <div class="logo-upload-wrapper">
                                                <el-input v-model="scenario.iconUrl" type="textarea"
                                                    placeholder="请选择产品缩略图" readonly class="image-url-input" />
                                                <el-upload class="image-upload-btn"
                                                    :http-request="(params) => handleScenarioThumbnailUpload(params, scenario)"
                                                    :before-upload="handleBeforeUpload"
                                                    :file-list="scenario.thumbnailImageFileList" :limit="1"
                                                    :on-exceed="handleExceed"
                                                    :on-remove="(file, fileList) => handleScenarioThumbnailRemove(file, fileList, scenario)"
                                                    list-type="text">
                                                    <el-button type="primary">选择图片</el-button>
                                                </el-upload>
                                            </div>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row :gutter="20">
                                    <el-col :span="24">
                                        <el-form-item label="背景图片地址" prop="backgroundImageUrl"
                                            :rules="[{ required: true, message: '请选择背景图片', trigger: ['blur', 'change'] }]">
                                            <div class="logo-upload-wrapper">
                                                <el-input v-model="scenario.backgroundImageUrl" type="textarea"
                                                    placeholder="请选择背景图片" readonly class="image-url-input" />
                                                <el-upload class="image-upload-btn"
                                                    :http-request="(params) => handleScenarioBackgroundUpload(params, scenario)"
                                                    :before-upload="handleBeforeUpload"
                                                    :file-list="scenario.backgroundImageFileList" :limit="1"
                                                    :on-exceed="handleExceed"
                                                    :on-remove="(file, fileList) => handleScenarioBackgroundRemove(file, fileList, scenario)"
                                                    list-type="text">
                                                    <el-button type="primary">选择图片</el-button>
                                                </el-upload>
                                            </div>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row :gutter="20">
                                    <el-col :span="24">
                                        <el-form-item label="详细介绍" prop="detailedIntroduction">
                                            <el-input v-model="scenario.detailedIntroduction" placeholder="请详细描述产品内容"
                                                type="textarea" :rows="5" show-word-limit maxlength="500"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                            </el-form>
                            <div v-if="index > 0" class="remove-button">
                                <el-button type="danger" text @click="removeScenario(index)">
                                    <el-icon>
                                        <Delete />
                                    </el-icon> 删除
                                </el-button>
                            </div>
                        </div>
                        <div class="add-certification-container">
                            <el-button type="primary" size="small" @click="addScenario" :disabled="currentApplicationScenariosTemp.length >= 5">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                                添加应用场景
                            </el-button>
                        </div>
                    </div>
                </el-card>
            </el-form>

            <!-- 典型案例/产品设置 -->
            <el-form :model="currentTypicalCasesTemp" label-width="120px">
                <el-card shadow="hover" class="company-card">
                    <template #header>
                        <div class="card-header">
                            <span>典型案例/产品设置</span>
                            <el-tooltip content="最多可添加5个典型案例/产品" placement="top">
                                <el-icon class="info-icon"><question-filled /></el-icon>
                            </el-tooltip>
                        </div>
                    </template>
                    <div class="certification-settings">
                        <div v-for="(caseItem, index) in currentTypicalCasesTemp" :key="index" class="certification-item">
                            <el-form :model="caseItem" label-width="120px" :ref="el => caseFormRefs[index] = el">
                                <el-row :gutter="20">
                                    <el-col :span="12">
                                        <el-form-item label="案例/产品名称" prop="caseName"
                                            :rules="[{ required: true, message: '请输入案例/产品名称', trigger: 'blur' }, { max: 20, message: '案例/产品名称最多20个字符', trigger: 'blur' }]">
                                            <el-input v-model="caseItem.caseName" placeholder="请输入案例/产品名称" show-word-limit
                                                maxlength="20"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item label="案例/产品简介" prop="caseIntro">
                                            <el-input v-model="caseItem.caseIntro" placeholder="请输入案例/产品简介" show-word-limit
                                                maxlength="60"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row :gutter="20">
                                    <el-col :span="24">
                                        <el-form-item label="标配功能" prop="titleFeatures">
                                            <el-input v-model="caseItem.titleFeatures" placeholder="请输入标配功能，多个用'，'隔开" show-word-limit
                                                maxlength="200"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row :gutter="20">
                                    <el-col :span="24">
                                        <el-form-item label="定制服务" prop="customServices">
                                            <el-input v-model="caseItem.customServices" placeholder="请输入定制服务，多个用'，'隔开" show-word-limit
                                                maxlength="200"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row :gutter="20">
                                    <el-col :span="24">
                                        <el-form-item label="案例/产品图片" prop="caseImageUrl"
                                            :rules="[{ required: true, message: '请选择案例/产品图片', trigger: ['blur', 'change'] }]">
                                            <div class="logo-upload-wrapper">
                                                <el-input v-model="caseItem.caseImageUrl" type="textarea"
                                                    placeholder="请选择案例/产品图片" readonly class="image-url-input" />
                                                <el-upload class="image-upload-btn"
                                                    :http-request="(params) => handleCaseImageUpload(params, caseItem)"
                                                    :before-upload="handleBeforeUpload"
                                                    :file-list="caseItem.caseImageFileList" :limit="1"
                                                    :on-exceed="handleExceed"
                                                    :on-remove="(file, fileList) => handleCaseImageRemove(file, fileList, caseItem)"
                                                    list-type="text">
                                                    <el-button type="primary">选择图片</el-button>
                                                </el-upload>
                                            </div>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row :gutter="20">
                                    <el-col :span="24">
                                        <el-form-item label="详细介绍" prop="detailedIntroduction">
                                            <el-input v-model="caseItem.detailedIntroduction" placeholder="请详细描述案例/产品内容"
                                                type="textarea" :rows="5" show-word-limit maxlength="500"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                            </el-form>
                            <div v-if="index > 0" class="remove-button">
                                <el-button type="danger" text @click="removeCase(index)">
                                    <el-icon>
                                        <Delete />
                                    </el-icon> 删除
                                </el-button>
                            </div>
                        </div>
                        <div class="add-certification-container">
                            <el-button type="primary" size="small" @click="addCase" :disabled="currentTypicalCasesTemp.length >= 5">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                                添加典型案例/产品
                            </el-button>
                        </div>
                    </div>
                </el-card>
            </el-form>
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { Plus, Delete, QuestionFilled, ArrowDown } from '@element-plus/icons-vue'
import QrcodeVue from 'qrcode.vue'

import { saveProduct, publishProduct, getProduct } from '@/api/content/product'
import { uploadImage } from '@/api'
import settings from '@/settings'

import auth from '@/plugins/auth'

// 当前激活的标签页
const activeTab = ref('model')

// 发布状态：0-已保存未发布，1-已发布
const publishStatus = ref('0')

// 发布信息
const publishedTime = ref('')
const publishedBy = ref('')

// 预览相关变量
const mobilePreviewVisible = ref(false)
const mobilePreviewUrl = ref(`${settings.mobileWeb}/preview?type=product`)
const pcPreviewUrl = ref(`${settings.pcWeb}/preview?type=product`)

// 查看相关变量
const mobileViewVisible = ref(false)
const mobileViewUrl = ref(settings.mobileWeb)
const pcViewUrl = ref(settings.pcWeb)

// 产品基础信息表单引用
const productFormRef = ref()

// 应用场景表单引用数组
const scenarioFormRefs = ref([])

// 典型案例表单引用数组
const caseFormRefs = ref([])

// 原始数据（用于比较是否有未保存的修改）
const originalData = ref({})

// 计算属性：当前激活标签页的产品基础信息
const currentProductBasicInfo = computed({
    get() {
        return activeTab.value === 'model' ? modelData.value.productBasicInfo : deviceData.value.productBasicInfo
    },
    set(value) {
        if (activeTab.value === 'model') {
            modelData.value.productBasicInfo = value
        } else {
            deviceData.value.productBasicInfo = value
        }
    }
})

// 计算属性：当前激活标签页的应用场景
const currentApplicationScenariosTemp = computed({
    get() {
        return activeTab.value === 'model' ? modelData.value.applicationScenariosTemp : deviceData.value.applicationScenariosTemp
    },
    set(value) {
        if (activeTab.value === 'model') {
            modelData.value.applicationScenariosTemp = value
        } else {
            deviceData.value.applicationScenariosTemp = value
        }
    }
})

// 计算属性：当前激活标签页的典型案例
const currentTypicalCasesTemp = computed({
    get() {
        return activeTab.value === 'model' ? modelData.value.typicalCasesTemp : deviceData.value.typicalCasesTemp
    },
    set(value) {
        if (activeTab.value === 'model') {
            modelData.value.typicalCasesTemp = value
        } else {
            deviceData.value.typicalCasesTemp = value
        }
    }
})

// 大模型数据
const modelData = ref({
    productBasicInfo: {
        productName: "",
        productIntro: "",
        backgroundImage: "",
        backgroundImageFileList: [],
        detailedIntroduction: "",
        productType: 1
    },
    applicationScenariosTemp: [
        {
            scenarioName: "",
            scenarioIntro: "",
            iconUrl: "",
            thumbnailImageFileList: [],
            backgroundImageUrl: "",
            backgroundImageFileList: [],
            detailedIntroduction: ""
        }
    ],
    typicalCasesTemp: [
        {
            caseName: "",
            caseIntro: "",
            titleFeatures: "",
            customServices: "",
            caseImageUrl: "",
            caseImageFileList: [],
            detailedIntroduction: ""
        }
    ]
})

// 小装置数据
const deviceData = ref({
    productBasicInfo: {
        productName: "",
        productIntro: "",
        backgroundImage: "",
        backgroundImageFileList: [],
        detailedIntroduction: "",
        productType: 2
    },
    applicationScenariosTemp: [
        {
            scenarioName: "",
            scenarioIntro: "",
            iconUrl: "",
            thumbnailImageFileList: [],
            backgroundImageUrl: "",
            backgroundImageFileList: [],
            detailedIntroduction: ""
        }
    ],
    typicalCasesTemp: [
        {
            caseName: "",
            caseIntro: "",
            titleFeatures: "",
            customServices: "",
            caseImageUrl: "",
            caseImageFileList: [],
            detailedIntroduction: ""
        }
    ]
})

// 图片上传前处理
const handleBeforeUpload = (file) => {
    // 验证文件类型
    const isImage = file.type.indexOf('image/') === 0
    if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
    }
    // 验证文件大小
    const isLt2M = file.size / 1024 / 1024 < 30
    if (!isLt2M) {
        ElMessage.error('上传图片大小不能超过 30MB!')
        return false
    }
    return true
}

// 基础图片上传处理
const handleBasicImageUpload = (options) => {
    const formData = new FormData()
    formData.append('file', options.file)

    uploadImage(formData)
        .then(res => {
            if (res.code === 200) {
                const currentData = activeTab.value === 'model' ? modelData.value.productBasicInfo : deviceData.value.productBasicInfo
                currentData.backgroundImage = res.url || ''
                ElMessage.success('图片上传成功!')
                currentData.backgroundImageFileList = [{ name: options.file.name, url: res.url }]
                options.onSuccess(res) // 通知上传组件上传成功
            } else {
                const currentData = activeTab.value === 'model' ? modelData.value.productBasicInfo : deviceData.value.productBasicInfo
                currentData.backgroundImageFileList = []
                options.onError(res) // 通知上传组件上传失败
            }
        })
        .catch(error => {
            const currentData = activeTab.value === 'model' ? modelData.value.productBasicInfo : deviceData.value.productBasicInfo
            currentData.backgroundImageFileList = []
            options.onError(error) // 通知上传组件上传失败
        })
}

// 图片超出数量限制处理
const handleExceed = (files, fileList) => {
    ElMessage.warning(`最多只能上传1张图片`)
}

// 移除基础图片处理
const handleBasicImageRemove = (file, fileList) => {
    const currentData = activeTab.value === 'model' ? modelData.value.productBasicInfo : deviceData.value.productBasicInfo
    currentData.backgroundImage = ''
    currentData.backgroundImageFileList = []
}

// 初始化原始数据
const initOriginalData = () => {
    // 深拷贝当前数据到原始数据中
    originalData.value = JSON.parse(JSON.stringify({
        modelData: modelData.value,
        deviceData: deviceData.value,
        publishStatus: publishStatus.value
    }))
}

// 比较当前数据与原始数据是否一致
const hasUnsavedChanges = () => {
    // 深拷贝当前数据和原始数据，忽略临时字段
    const current = JSON.parse(JSON.stringify({
        modelData: modelData.value,
        deviceData: deviceData.value,
        publishStatus: publishStatus.value
    }))

    const original = JSON.parse(JSON.stringify(originalData.value))

    // 移除临时字段（imageFileList）
    const removeTempFields = (data) => {
        // 处理大模型数据
        if (data.modelData) {
            // 移除产品基础信息的临时字段
            if (data.modelData.productBasicInfo?.backgroundImageFileList) {
                delete data.modelData.productBasicInfo.backgroundImageFileList
            }

            // 移除应用场景的临时字段
            if (data.modelData.applicationScenariosTemp) {
                data.modelData.applicationScenariosTemp.forEach(item => {
                    if (item.thumbnailImageFileList) {
                        delete item.thumbnailImageFileList
                    }
                    if (item.backgroundImageFileList) {
                        delete item.backgroundImageFileList
                    }
                })
            }

            // 移除典型案例的临时字段
            if (data.modelData.typicalCasesTemp) {
                data.modelData.typicalCasesTemp.forEach(item => {
                    if (item.caseImageFileList) {
                        delete item.caseImageFileList
                    }
                })
            }
        }

        // 处理小装置数据
        if (data.deviceData) {
            // 移除产品基础信息的临时字段
            if (data.deviceData.productBasicInfo?.backgroundImageFileList) {
                delete data.deviceData.productBasicInfo.backgroundImageFileList
            }

            // 移除应用场景的临时字段
            if (data.deviceData.applicationScenariosTemp) {
                data.deviceData.applicationScenariosTemp.forEach(item => {
                    if (item.thumbnailImageFileList) {
                        delete item.thumbnailImageFileList
                    }
                    if (item.backgroundImageFileList) {
                        delete item.backgroundImageFileList
                    }
                })
            }

            // 移除典型案例的临时字段
            if (data.deviceData.typicalCasesTemp) {
                data.deviceData.typicalCasesTemp.forEach(item => {
                    if (item.caseImageFileList) {
                        delete item.caseImageFileList
                    }
                })
            }
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

// 保存数据
const handleSave = () => {
    // 验证所有表单
    validateAllForms().then(allValid => {
        if (!allValid) {
            ElMessage.error('请检查表单填写是否完整!')
            return
        }

        // 根据当前选中的标签页设置产品类型
        const productType = activeTab.value === 'model' ? 1 : 2

        const loading = ElLoading.service({
            lock: true,
            text: '保存中...',
            background: 'rgba(0, 0, 0, 0.7)'
        })

        // 获取当前tab的数据
        const currentData = activeTab.value === 'model' ? modelData.value : deviceData.value

        // 准备提交数据，根据接口定义构造数据结构
        const submitData = {
            isPublish: publishStatus.value
        }

        // 大模型产品基础信息
        const llmBasicInfo = {
            productType: String(1),
            productName: modelData.value.productBasicInfo.productName,
            productIntroduction: modelData.value.productBasicInfo.productIntro,
            backgroundImageUrl: modelData.value.productBasicInfo.backgroundImage,
            detailedIntroduction: modelData.value.productBasicInfo.detailedIntroduction
        }
        submitData.txwxLLMProductBasicInfoTemp = llmBasicInfo

        // 小装置产品基础信息
        const deviceBasicInfo = {
            productType: String(2),
            productName: deviceData.value.productBasicInfo.productName,
            productIntroduction: deviceData.value.productBasicInfo.productIntro,
            backgroundImageUrl: deviceData.value.productBasicInfo.backgroundImage,
            detailedIntroduction: deviceData.value.productBasicInfo.detailedIntroduction
        }
        submitData.txwxDeviceProductBasicInfoTemp = deviceBasicInfo

        // 大模型应用场景数据
        const llmScenarios = modelData.value.applicationScenariosTemp.map((item, index) => ({
            productType: String(1),
            scenarioName: item.scenarioName,
            scenarioIntroduction: item.scenarioIntro,
            iconUrl: item.iconUrl,
            backgroundImageUrl: item.backgroundImageUrl,
            detailedIntroduction: item.detailedIntroduction,
            sortOrder: index + 1
        }))
        submitData.txwxLLMApplicationScenariosTemp = llmScenarios

        // 小装置应用场景数据
        const deviceScenarios = deviceData.value.applicationScenariosTemp.map((item, index) => ({
            productType: String(2),
            scenarioName: item.scenarioName,
            scenarioIntroduction: item.scenarioIntro,
            iconUrl: item.iconUrl,
            backgroundImageUrl: item.backgroundImageUrl,
            detailedIntroduction: item.detailedIntroduction,
            sortOrder: index + 1
        }))
        submitData.txwxDeviceApplicationScenariosTemp = deviceScenarios

        // 大模型典型案例数据
        const llmCases = modelData.value.typicalCasesTemp.map((item, index) => ({
            productType: String(1),
            productName: item.caseName,
            productIntroduction: item.caseIntro,
            standardFunctions: item.titleFeatures ? item.titleFeatures.split('，') : [],
            customServices: item.customServices ? item.customServices.split('，') : [],
            imageUrl: item.caseImageUrl,
            detailedIntroduction: item.detailedIntroduction,
            sortOrder: index + 1
        }))
        submitData.txwxLLMTypicalCaseProductsTemp = llmCases

        // 小装置典型案例数据
        const deviceCases = deviceData.value.typicalCasesTemp.map((item, index) => ({
            productType: String(2),
            productName: item.caseName,
            productIntroduction: item.caseIntro,
            standardFunctions: item.titleFeatures ? item.titleFeatures.split('，') : [],
            customServices: item.customServices ? item.customServices.split('，') : [],
            imageUrl: item.caseImageUrl,
            detailedIntroduction: item.detailedIntroduction,
            sortOrder: index + 1
        }))
        submitData.txwxDeviceTypicalCaseProductsTemp = deviceCases

        // 调用保存API
        saveProduct(submitData)
            .then(res => {
                if (res.code === 200) {
                    ElMessage.success('保存成功')
                    // 更新原始数据
                    initOriginalData()
                    loadProductData()
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

    // 调用发布API（根据实际情况替换为正确的API调用）
    publishProduct()
        .then(res => {
            if (res.code === 200) {
                ElMessage.success('发布成功!')
                initOriginalData()
                loadProductData()
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

// 加载产品数据
const loadProductData = () => {
    const loading = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)'
    })

    getProduct().then(res => {
        if (res.code === 200) {

            // 更新发布信息
            publishedTime.value = res.data?.txwxLLMProductBasicInfo?.publishedTime || ''
            publishedBy.value = res.data?.txwxLLMProductBasicInfo?.publishedBy || ''
            publishStatus.value = res.data.isPublish || '0'

            // 处理大模型数据
            const useTempFields = publishStatus.value !== '1'
            const llmBasicInfo = useTempFields ? res.data.txwxLLMProductBasicInfoTemp : res.data.txwxLLMProductBasicInfo
            if (llmBasicInfo) {
                modelData.value.productBasicInfo = {
                    productName: llmBasicInfo.productName || '',
                    productIntro: llmBasicInfo.productIntroduction || '',
                    backgroundImage: llmBasicInfo.backgroundImageUrl || '',
                    backgroundImageFileList: llmBasicInfo.backgroundImageUrl ? [{ name: llmBasicInfo.backgroundImageUrl.split('/').pop() || '背景图', url: llmBasicInfo.backgroundImageUrl }] : [],
                    detailedIntroduction: llmBasicInfo.detailedIntroduction || ''
                }
            }

            const llmApplicationScenarios = useTempFields ? res.data.txwxLLMApplicationScenariosTemp : res.data.txwxLLMApplicationScenarios
            modelData.value.applicationScenariosTemp = llmApplicationScenarios?.map(scenario => ({
                scenarioName: scenario.scenarioName || '',
                scenarioIntro: scenario.scenarioIntroduction || '',
                iconUrl: scenario.iconUrl || '',
                thumbnailImageFileList: scenario.iconUrl ? [{ name: scenario.iconUrl.split('/').pop() || '缩略图', url: scenario.iconUrl }] : [],
                backgroundImageUrl: scenario.backgroundImageUrl || '',
                backgroundImageFileList: scenario.backgroundImageUrl ? [{ name: scenario.backgroundImageUrl.split('/').pop() || '背景图', url: scenario.backgroundImageUrl }] : [],
                detailedIntroduction: scenario.detailedIntroduction || ''
            })) || [
                { scenarioName: "", scenarioIntro: "", iconUrl: "", thumbnailImageFileList: [], backgroundImageUrl: "", backgroundImageFileList: [], detailedIntroduction: "" }
            ]

            const llmTypicalCases = useTempFields ? res.data.txwxLLMTypicalCaseProductsTemp : res.data.txwxLLMTypicalCaseProducts
            modelData.value.typicalCasesTemp = llmTypicalCases?.map(caseItem => ({
                caseName: caseItem.productName || '',
                caseIntro: caseItem.productIntroduction || '',
                titleFeatures: caseItem.standardFunctions?.join('，') || '',
                customServices: caseItem.customServices?.join('，') || '',
                caseImageUrl: caseItem.imageUrl || '',
                caseImageFileList: caseItem.imageUrl ? [{ name: caseItem.imageUrl.split('/').pop() || '案例图', url: caseItem.imageUrl }] : [],
                detailedIntroduction: caseItem.detailedIntroduction || ''
            })) || [
                { caseName: "", caseIntro: "", titleFeatures: "", customServices: "", caseImageUrl: "", caseImageFileList: [], detailedIntroduction: "" }
            ]

            // 处理小装置数据
            const deviceBasicInfo = useTempFields ? res.data.txwxDeviceProductBasicInfoTemp : res.data.txwxDeviceProductBasicInfo
            if (deviceBasicInfo) {
                deviceData.value.productBasicInfo = {
                    productName: deviceBasicInfo.productName || '',
                    productIntro: deviceBasicInfo.productIntroduction || '',
                    backgroundImage: deviceBasicInfo.backgroundImageUrl || '',
                    backgroundImageFileList: deviceBasicInfo.backgroundImageUrl ? [{ name: deviceBasicInfo.backgroundImageUrl.split('/').pop() || '背景图', url: deviceBasicInfo.backgroundImageUrl }] : [],
                    detailedIntroduction: deviceBasicInfo.detailedIntroduction || ''
                }
            }

            const deviceApplicationScenarios = useTempFields ? res.data.txwxDeviceApplicationScenariosTemp : res.data.txwxDeviceApplicationScenarios
            deviceData.value.applicationScenariosTemp = deviceApplicationScenarios?.map(scenario => ({
                scenarioName: scenario.scenarioName || '',
                scenarioIntro: scenario.scenarioIntroduction || '',
                iconUrl: scenario.iconUrl || '',
                thumbnailImageFileList: scenario.iconUrl ? [{ name: scenario.iconUrl.split('/').pop() || '缩略图', url: scenario.iconUrl }] : [],
                backgroundImageUrl: scenario.backgroundImageUrl || '',
                backgroundImageFileList: scenario.backgroundImageUrl ? [{ name: scenario.backgroundImageUrl.split('/').pop() || '背景图', url: scenario.backgroundImageUrl }] : [],
                detailedIntroduction: scenario.detailedIntroduction || ''
            })) || [
                { scenarioName: "", scenarioIntro: "", iconUrl: "", thumbnailImageFileList: [], backgroundImageUrl: "", backgroundImageFileList: [], detailedIntroduction: "" }
            ]

            const deviceTypicalCases = useTempFields ? res.data.txwxDeviceTypicalCaseProductsTemp : res.data.txwxDeviceTypicalCaseProducts
            deviceData.value.typicalCasesTemp = deviceTypicalCases?.map(caseItem => ({
                caseName: caseItem.productName || '',
                caseIntro: caseItem.productIntroduction || '',
                titleFeatures: caseItem.standardFunctions?.join('，') || '',
                customServices: caseItem.customServices?.join('，') || '',
                caseImageUrl: caseItem.imageUrl || '',
                caseImageFileList: caseItem.imageUrl ? [{ name: '产品图', url: caseItem.imageUrl }] : [],
                detailedIntroduction: caseItem.detailedIntroduction || ''
            })) || [
                { caseName: "", caseIntro: "", titleFeatures: "", customServices: "", caseImageUrl: "", caseImageFileList: [], detailedIntroduction: "" }
            ]

        } else {
            ElMessage.error(res.message || '加载失败')
        }
    }).catch ((err) => {
        ElMessage.error(err.message || '加载失败')
    }).finally(() => {
        loading.close()
        initOriginalData()
    })
}

// 验证所有表单
const validateAllForms = async () => {
    // 验证产品基础信息表单
    if (productFormRef.value) {
        const valid = await productFormRef.value.validate().catch(() => false)
        if (!valid) {
            return false
        }
    }

    // 验证应用场景表单
    for (let i = 0; i < scenarioFormRefs.value.length; i++) {
        if (scenarioFormRefs.value[i]) {
            const valid = await scenarioFormRefs.value[i].validate().catch(() => false)
            if (!valid) {
                return false
            }
        }
    }

    // 验证典型案例表单
    for (let i = 0; i < caseFormRefs.value.length; i++) {
        if (caseFormRefs.value[i]) {
            const valid = await caseFormRefs.value[i].validate().catch(() => false)
            if (!valid) {
                return false
            }
        }
    }

    return true
}

// 组件挂载后初始化
onMounted(() => {
    // 根据权限设置默认激活的标签页
    if (auth.hasPermi('product:industry:set')) {
        activeTab.value = 'model'
    } else if (auth.hasPermi('product:device:set')) {
        activeTab.value = 'device'
    }
    // 调用加载数据函数
    loadProductData()
})

// 添加应用场景
const addScenario = () => {
    const currentData = activeTab.value === 'model' ? modelData.value : deviceData.value
    if (currentData.applicationScenariosTemp.length >= 5) {
        ElMessage.warning('最多只能添加5个应用场景')
        return
    }
    currentData.applicationScenariosTemp.push({
        scenarioName: "",
        scenarioIntro: "",
        iconUrl: "",
        thumbnailImageFileList: [],
        backgroundImageUrl: "",
        backgroundImageFileList: [],
        detailedIntroduction: ""
    })
}

// 删除应用场景
const removeScenario = (index) => {
    const currentData = activeTab.value === 'model' ? modelData.value : deviceData.value
    currentData.applicationScenariosTemp.splice(index, 1)
}

// 添加典型案例/产品
const addCase = () => {
    const currentData = activeTab.value === 'model' ? modelData.value : deviceData.value
    if (currentData.typicalCasesTemp.length >= 5) {
        ElMessage.warning('最多只能添加5个典型案例/产品')
        return
    }
    currentData.typicalCasesTemp.push({
        caseName: "",
        caseIntro: "",
        titleFeatures: "",
        customServices: "",
        caseImageUrl: "",
        caseImageFileList: [],
        detailedIntroduction: ""
    })
}

// 删除典型案例/产品
const removeCase = (index) => {
    const currentData = activeTab.value === 'model' ? modelData.value : deviceData.value
    currentData.typicalCasesTemp.splice(index, 1)
}

// 应用场景缩略图上传处理
const handleScenarioThumbnailUpload = (params, scenario) => {
    const formData = new FormData()
    formData.append('file', params.file)

    uploadImage(formData)
        .then(res => {
            if (res.code === 200) {
                scenario.iconUrl = res.url || ''
                ElMessage.success('缩略图上传成功!')
                scenario.thumbnailImageFileList = [{ name: params.file.name, url: res.url }]
                params.onSuccess(res) // 通知上传组件上传成功
            } else {
                scenario.thumbnailImageFileList = []
                params.onError(res) // 通知上传组件上传失败
            }
        })
        .catch(error => {
            scenario.thumbnailImageFileList = []
            params.onError(error) // 通知上传组件上传失败
        })
}

// 应用场景背景图片上传处理
const handleScenarioBackgroundUpload = (params, scenario) => {
    const formData = new FormData()
    formData.append('file', params.file)

    uploadImage(formData)
        .then(res => {
            if (res.code === 200) {
                scenario.backgroundImageUrl = res.url || ''
                ElMessage.success('背景图片上传成功!')
                scenario.backgroundImageFileList = [{ name: params.file.name, url: res.url }]
                params.onSuccess(res) // 通知上传组件上传成功
            } else {
                scenario.backgroundImageFileList = []
                params.onError(res) // 通知上传组件上传失败
            }
        })
        .catch(error => {
            scenario.backgroundImageFileList = []
            params.onError(error) // 通知上传组件上传失败
        })
}

// 应用场景缩略图移除处理
const handleScenarioThumbnailRemove = (file, fileList, scenario) => {
    scenario.iconUrl = ''
    scenario.thumbnailImageFileList = []
}

// 应用场景背景图片移除处理
const handleScenarioBackgroundRemove = (file, fileList, scenario) => {
    scenario.backgroundImageUrl = ''
    scenario.backgroundImageFileList = []
}

// 典型案例/产品图片上传处理
const handleCaseImageUpload = (params, caseItem) => {
    const formData = new FormData()
    formData.append('file', params.file)

    uploadImage(formData)
        .then(res => {
            if (res.code === 200) {
                caseItem.caseImageUrl = res.url || ''
                ElMessage.success('案例/产品图片上传成功!')
                caseItem.caseImageFileList = [{ name: params.file.name, url: res.url }]
                params.onSuccess(res) // 通知上传组件上传成功
            } else {
                caseItem.caseImageFileList = []
                params.onError(res) // 通知上传组件上传失败
            }
        })
        .catch(error => {
            caseItem.caseImageFileList = []
            params.onError(error) // 通知上传组件上传失败
        })
}

// 典型案例/产品图片移除处理
const handleCaseImageRemove = (file, fileList, caseItem) => {
    caseItem.caseImageUrl = ''
    caseItem.caseImageFileList = []
}
</script>

<style scoped>
.product-container {
    padding: 20px;
}

.title-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
}

.page-title {
    font-size: 18px;
    font-weight: bold;
    margin: 0;
    color: var(--el-text-color-primary);
}

.action-buttons {
    display: flex;
    align-items: center;
    .el-button {
        margin-left: 10px;
    }

    /* 移动端预览相关样式 */
    .mobile-preview-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }

    .qrcode-container {
        margin-bottom: 15px;
    }

    .preview-hint {
        font-size: 14px;
        color: #606266;
        margin-bottom: 10px;
        text-align: center;
    }

    .intranet-hint {
        font-size: 14px;
        color: #f56c6c;
        text-align: center;
        font-weight: 500;
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

.info-item {
    font-size: 12px;
    color: #666;
}

.publish-status {
    font-size: 12px;
}

/* 应用场景和典型案例的样式 */
.certification-settings {
    margin-top: 20px;
}

.certification-item {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
}

.add-certification-container {
    text-align: center;
    margin-top: 10px;
}

.product-tabs {
    margin-bottom: 20px;
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

/* 公司基本信息表单样式 */
.company-card:first-of-type .el-form {
    .el-form-item {
        margin-bottom: 20px;
    }

    .el-input--textarea {
        resize: vertical;
    }
}

    /* LOGO上传组件样式 */
    .logo-upload-wrapper {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        width: 100%; /* 确保容器占满整个表单项宽度 */
        
        .image-url-input {
            flex: 1;
            min-width: 0;
            margin-right: 10px;
        }

         
        .image-upload-btn {
            flex-shrink: 0; /* 上传按钮不收缩 */
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

    /* 应用场景设置样式 */
    .certification-settings {
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

        .add-certification-container {
            text-align: left;
            margin-top: 10px;
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

</style>