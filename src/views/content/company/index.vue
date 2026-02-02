/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
    <div class="company-info-container">
        <div class="title-container">
            <h3 class="page-title">公司信息设置</h3>
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
                <el-button @click="goBack">返回</el-button>
            </div>
        </div>
        
        <!-- 公司基本信息 -->
        <el-form :model="txwxCompanyInfoTemp" label-width="120px" ref="companyFormRef">
            <el-card shadow="hover" class="company-card">
                <template #header>
                    <div class="card-header">
                        <span>公司基本信息</span>
                    </div>
                </template>
            
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="公司名称" prop="companyName" :rules="[{ required: true, message: '请输入公司名称', trigger: 'blur' }]">
                                <el-input v-model="txwxCompanyInfoTemp.companyName" placeholder="请输入公司名称"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="版权信息" prop="copyrightInfo" :rules="[{ required: true, message: '请输入版权信息', trigger: 'blur' }]">
                                <el-input v-model="txwxCompanyInfoTemp.copyrightInfo" placeholder="请输入版权信息"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="版本号" prop="versionNumber" :rules="[{ required: true, message: '请输入版本号', trigger: 'blur' }]">
                                <el-input v-model="txwxCompanyInfoTemp.versionNumber" placeholder="请输入版本号"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="公司地址" prop="companyAddress" :rules="[{ required: true, message: '请输入公司地址', trigger: 'blur' }]">
                                <el-input v-model="txwxCompanyInfoTemp.companyAddress" placeholder="请输入公司地址"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="网安备案信息" prop="securityRecord" :rules="[{ required: true, message: '请输入网安备案信息', trigger: 'blur' }]">
                                <el-input v-model="txwxCompanyInfoTemp.securityRecord" placeholder="请输入网安备案信息"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="ICP备案信息" prop="icpRecord" :rules="[{ required: true, message: '请输入ICP备案信息', trigger: 'blur' }]">
                                <el-input v-model="txwxCompanyInfoTemp.icpRecord" placeholder="请输入ICP备案信息"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="商务合作途径" prop="businessCooperation">
                                <el-input 
                                    v-model="txwxCompanyInfoTemp.businessCooperation" 
                                    placeholder="请输入商务合作途径，例如电话、邮箱等，多个用逗号隔开"
                                    type="textarea"
                                    :rows="3"
                                ></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="简历投递途径" prop="resumeDelivery">
                                <el-input 
                                    v-model="txwxCompanyInfoTemp.resumeDelivery" 
                                    placeholder="请输入简历投递途径，例如电话、邮箱等，多个用逗号隔开"
                                    type="textarea"
                                    :rows="3"
                                ></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    
                    <el-row :gutter="20">
                        <el-col :span="24">
                            <el-form-item label="公司logo设置" prop="logoUrl" >
                                <div class="logo-upload-wrapper">
                                    <el-input 
                                        v-model="txwxCompanyInfoTemp.logoUrl" 
                                        type="textarea"
                                        placeholder="请选择图片"
                                        readonly
                                        class="image-url-input"
                                    />
                                    <el-upload
                                        class="image-upload-btn"
                                        :http-request="handleHttpRequest"
                                        :before-upload="handleBeforeUpload"
                                        :file-list="txwxCompanyInfoTemp.logoImageFileList"
                                        :limit="1"
                                        :on-exceed="handleExceed"
                                        :on-remove="handleRemove"
                                        list-type="text"
                                    >
                                        <el-button type="primary">选择图片</el-button>
                                    </el-upload>
                                </div>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="24">
                            <el-form-item label="公司地址图片" prop="addrUrl" >
                                <div class="logo-upload-wrapper">
                                    <el-input 
                                        v-model="txwxCompanyInfoTemp.addrUrl" 
                                        type="textarea"
                                        placeholder="请选择图片"
                                        readonly
                                        class="image-url-input"
                                    />
                                    <el-upload
                                        class="image-upload-btn"
                                        :http-request="handleAddressUpload"
                                        :before-upload="handleBeforeUpload"
                                        :file-list="txwxCompanyInfoTemp.addrUrlImageFileList"
                                        :limit="1"
                                        :on-exceed="handleExceed"
                                        :on-remove="handleAddressRemove"
                                        list-type="text"
                                    >
                                        <el-button type="primary">选择图片</el-button>
                                    </el-upload>
                                </div>
                            </el-form-item>
                        </el-col>
                    </el-row>
            
            </el-card>
        </el-form>
            
            <!-- 关注设置 -->
        <el-form :model="txwxFocusTemp" label-width="120px" ref="focusFormRef">
            <el-card shadow="hover" class="company-card">
                <template #header>
                    <div class="card-header">
                        <span>关注设置</span>
                        <el-tooltip content="最多可添加5个关注方式" placement="top">
                            <el-icon class="info-icon"><question-filled /></el-icon>
                        </el-tooltip>
                    </div>
                </template>
                <div class="follow-settings">
                    <div 
                        v-for="(followItem, index) in txwxFocusTemp" 
                        :key="index" 
                        class="follow-item"
                    >
                        <el-form-item label="关注类型名称" :prop="`${index}.focusName`" :rules="[{ required: true, message: '请输入关注类型名称', trigger: 'blur' }]">
                            <el-input v-model="followItem.focusName" placeholder="请输入关注类型名称"></el-input>
                        </el-form-item>
                        <el-form-item label="关注二维码" :prop="`${index}.imageUrl`" 
                            :rules="[{ required: true, message: '请上传关注二维码', trigger: ['blur', 'change'] }]">
                            <div class="logo-upload-wrapper">
                                <el-input 
                                    v-model="followItem.imageUrl" 
                                    type="textarea"
                                    placeholder="请选择图片"
                                    readonly
                                    class="image-url-input"
                                />
                                <el-upload
                                    class="image-upload-btn"
                                    :http-request="(params) => handleFollowQrUpload(params, followItem)"
                                    :before-upload="handleBeforeUpload"
                                    :file-list="followItem.imageFileList"
                                    :limit="1"
                                    :on-exceed="handleExceed"
                                    :on-remove="(file, fileList) => handleFollowQrRemove(file, fileList, followItem)"
                                    list-type="text"
                                >
                                    <el-button type="primary">选择图片</el-button>
                                </el-upload>
                            </div>
                        </el-form-item>
                        
                        <div class="remove-button">
                            <el-button type="danger" text @click="removeFollowItem(index)">
                                <el-icon><Delete /></el-icon> 删除
                            </el-button>
                        </div>
                    </div>
                    
                    <div class="add-follow-container">
                        <el-button 
                            type="primary" 
                            size="small" 
                            @click="addFollowItem" 
                            :disabled="txwxFocusTemp.length >= 5"
                        >
                            <el-icon><Plus /></el-icon>
                            添加关注方式
                        </el-button>
                    </div>
                </div>
            </el-card>
        </el-form>
        
        <!-- 产品认证设置 -->
        <el-form :model="txwxProductCertsTemp" label-width="120px" ref="certFormRef">
            <el-card shadow="hover" class="company-card">
                <template #header>
                    <div class="card-header">
                        <span>产品认证设置</span>
                    </div>
                </template>
                <div class="certification-settings">
                    <div 
                        v-for="(certItem, index) in txwxProductCertsTemp" 
                        :key="index" 
                        class="certification-item"
                    >
                        <el-form-item label="认证名称" :prop="`${index}.certName`" >
                            <el-input v-model="certItem.certName" placeholder="请输入认证名称"></el-input>
                        </el-form-item>
                        
                        <el-form-item label="认证图片" :prop="`${index}.imageUrl`" :rules="[{ required: true, message: '请上传认证图片', trigger: ['blur', 'change'] }]">
                            <div class="logo-upload-wrapper">
                                <el-input 
                                    v-model="certItem.imageUrl" 
                                    type="textarea"
                                    placeholder="请选择图片"
                                    readonly
                                    class="image-url-input"
                                />
                                <el-upload
                                    class="image-upload-btn"
                                    :http-request="(params) => handleCertUpload(params, certItem)"
                                    :before-upload="handleBeforeUpload"
                                    :file-list="certItem.imageFileList"
                                    :limit="1"
                                    :on-exceed="handleExceed"
                                    :on-remove="(file, fileList) => handleCertRemove(file, fileList, certItem)"
                                    list-type="text"
                                >
                                    <el-button type="primary">选择图片</el-button>
                                </el-upload>
                            </div>
                        </el-form-item>
                        
                        <div class="remove-button">
                            <el-button type="danger" text @click="removeCertificationItem(index)">
                                <el-icon><Delete /></el-icon> 删除
                            </el-button>
                        </div>
                    </div>
                    
                    <div class="add-certification-container">
                        <el-button 
                            type="primary" 
                            size="small" 
                            @click="addCertificationItem"
                        >
                            <el-icon><Plus /></el-icon>
                            添加认证
                        </el-button>
                    </div>
                </div>
            </el-card>
        </el-form>
        
        <!-- 公司简介 -->
        <el-form :model="txwxCompanyProfileTemp" label-width="166px" ref="profileFormRef">
            <el-card shadow="hover" class="company-card">
                <template #header>
                    <div class="card-header">
                        <span>公司简介</span>
                    </div>
                </template>
                <el-row :gutter="20">
                    <el-col :span="24">
                        <el-form-item label="公司简介（关于我们）" prop="profileTwo" :rules="[{ 
                            required: true, 
                            validator: (rule, value, callback) => {
                                if (!value || value === '<p><br></p>') {
                                    callback(new Error('请输入公司简介（关于我们）'))
                                } else {
                                    callback()
                                }
                            }, 
                            trigger: 'blur' 
                        }]">
                            <editor 
                                v-model="txwxCompanyProfileTemp.profileTwo" 
                                :min-height="300"
                            ></editor>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="公司简介（首页）" prop="profileOne">
                            <editor 
                                v-model="txwxCompanyProfileTemp.profileOne" 
                                :min-height="300"
                            ></editor>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="公司简介（移动端首页）" prop="profileThree">
                            <editor 
                                v-model="txwxCompanyProfileTemp.profileThree" 
                                :min-height="300"
                            ></editor>
                        </el-form-item>
                    </el-col>
                </el-row>   
            </el-card>
        </el-form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { Plus, Delete, QuestionFilled, ArrowDown } from '@element-plus/icons-vue'
import QrcodeVue from 'qrcode.vue'
import { uploadImage } from '@/api'
import { saveCompanyInfo, publishCompanyInfo, getCompanyDetail } from '@/api/content/company'
import settings from '@/settings'

// 发布状态：0-已保存未发布，1-已发布
const publishStatus = ref('0')

// 发布信息
const publishedTime = ref('')
const publishedBy = ref('')

// 预览相关变量
const mobilePreviewVisible = ref(false)
const mobilePreviewUrl = ref(`${settings.mobileWeb}/preview?type=company`)
const pcPreviewUrl = ref(`${settings.pcWeb}/preview?type=company`)

// 查看相关变量
const mobileViewVisible = ref(false)
const mobileViewUrl = ref(settings.mobileWeb)
const pcViewUrl = ref(settings.pcWeb)

// 表单引用
const companyFormRef = ref()
const focusFormRef = ref()
const certFormRef = ref()
const profileFormRef = ref()

// 原始数据（用于比较是否有未保存的修改）
const originalData = ref({})

// 公司基本信息
const txwxCompanyInfoTemp = ref({
    companyName: "",
    copyrightInfo: "",
    versionNumber: "",
    companyAddress: "",
    securityRecord: "",
    icpRecord: "",
    businessCooperation: "",
    resumeDelivery: "",
    logoUrl: "",
    addrUrl: "",
    logoImageFileList: [],
    addrUrlImageFileList: [],
})

// 关注设置
const txwxFocusTemp = ref([])

// 产品认证设置
const txwxProductCertsTemp = ref([])

// 公司简介
const txwxCompanyProfileTemp = ref({
    profileOne: "",
    profileTwo: "",
    profileThree: "",
})

// 初始化图片文件列表（用于编辑已有数据时）
const initImageFileLists = () => {
    // 初始化logo图片列表
    if (txwxCompanyInfoTemp.value.logoUrl && txwxCompanyInfoTemp.value.logoUrl.trim()) {
        const fileName = txwxCompanyInfoTemp.value.logoUrl.split('/').pop() || 'logo.png'
        txwxCompanyInfoTemp.value.logoImageFileList = [{ name: fileName, url: txwxCompanyInfoTemp.value.logoUrl }]
    }

    // 初始化地址图片列表
    if (txwxCompanyInfoTemp.value.addrUrl && txwxCompanyInfoTemp.value.addrUrl.trim()) {
        const fileName = txwxCompanyInfoTemp.value.addrUrl.split('/').pop() || ''
        txwxCompanyInfoTemp.value.addrUrlImageFileList = [{ name: fileName, url: txwxCompanyInfoTemp.value.addrUrl }]
    }
    
    // 初始化关注二维码图片列表
    txwxFocusTemp.value.forEach(item => {
        if (item.imageUrl && item.imageUrl.trim()) {
            const fileName = item.imageUrl.split('/').pop() || 'qrcode.png'
            item.imageFileList = [{ name: fileName, url: item.imageUrl }]
        }
    })
    
    // 初始化认证图片列表
    txwxProductCertsTemp.value.forEach(item => {
        if (item.imageUrl && item.imageUrl.trim()) {
            const fileName = item.imageUrl.split('/').pop() || 'cert.png'
            item.imageFileList = [{ name: fileName, url: item.imageUrl }]
        }
    })
}

// 加载公司信息数据
const loadCompanyData = () => {
    // 调用接口加载公司信息数据
    getCompanyDetail().then(res => {
        if (res.code === 200 && res.data) {
            const data = res.data
            // 更新发布状态
            publishStatus.value = data.isPublish || '0'
            
            // 更新发布信息
            if (publishStatus.value === '1') {
                // 从已发布的数据中获取发布时间和发布人
                const publishedInfo = data.txwxCompanyInfo || data.txwxFocus?.[0] || data.txwxProductCerts?.[0] || data.txwxCompanyProfile
                publishedTime.value = publishedInfo?.publishedTime || ''
                publishedBy.value = publishedInfo?.publishedBy || ''
            } else {
                publishedTime.value = ''
                publishedBy.value = ''
            }
            
            // 更新公司基本信息
            txwxCompanyInfoTemp.value = {
                ...txwxCompanyInfoTemp.value,
                ...(publishStatus.value === '0' ? data.txwxCompanyInfoTemp : data.txwxCompanyInfo),
                logoImageFileList: [],
                addrUrlImageFileList: [],
            }
            
            // 更新关注设置
            txwxFocusTemp.value = ((publishStatus.value === '0'? data.txwxFocusTemp : data.txwxFocus) || []).map(item => ({
                ...item,
                imageFileList: []
            }))
            
            // 更新产品认证设置
            txwxProductCertsTemp.value = ((publishStatus.value === '0' ? data.txwxProductCertsTemp : data.txwxProductCerts) || []).map(item => ({
                ...item,
                imageFileList: []
            }))
            
            // 更新公司简介
            txwxCompanyProfileTemp.value = {
                ...txwxCompanyProfileTemp.value,
                ...(publishStatus.value === '0' ? data.txwxCompanyProfileTemp : data.txwxCompanyProfile)
            }
            
            // 初始化图片文件列表和原始数据
            initImageFileLists()
            initOriginalData()
        } else {
            ElMessage.error(res.message || '加载公司信息失败，请稍后重试')
        }
    }).catch(err => {
        ElMessage.error('加载公司信息失败，请稍后重试')
    })
}

// 组件挂载后初始化图片文件列表
onMounted(() => {
    loadCompanyData()
})

// 初始化原始数据
const initOriginalData = () => {
    // 深拷贝当前数据到原始数据中
    originalData.value = JSON.parse(JSON.stringify({
        txwxCompanyInfoTemp: txwxCompanyInfoTemp.value,
        txwxFocusTemp: txwxFocusTemp.value,
        txwxProductCertsTemp: txwxProductCertsTemp.value,
        txwxCompanyProfileTemp: txwxCompanyProfileTemp.value,
        publishStatus: publishStatus.value
    }))
}

// 比较当前数据与原始数据是否一致
const hasUnsavedChanges = () => {
    // 深拷贝当前数据和原始数据，忽略临时字段
    const current = JSON.parse(JSON.stringify({
        txwxCompanyInfoTemp: txwxCompanyInfoTemp.value,
        txwxFocusTemp: txwxFocusTemp.value,
        txwxProductCertsTemp: txwxProductCertsTemp.value,
        txwxCompanyProfileTemp: txwxCompanyProfileTemp.value,
        publishStatus: publishStatus.value
    }))
    
    const original = JSON.parse(JSON.stringify(originalData.value))
    
    // 移除临时字段（imageFileList）
    const removeTempFields = (data) => {
        // 移除公司基本信息中的临时字段
        if (data.txwxCompanyInfoTemp && data.txwxCompanyInfoTemp.logoImageFileList) {
            delete data.txwxCompanyInfoTemp.logoImageFileList
        }

        // 移除公司基本信息中的临时字段
        if (data.txwxCompanyInfoTemp && data.txwxCompanyInfoTemp.addrUrlImageFileList) {
            delete data.txwxCompanyInfoTemp.addrUrlImageFileList
        }
        
        // 移除关注设置中的临时字段
        if (data.txwxFocusTemp) {
            data.txwxFocusTemp.forEach(item => {
                if (item.imageFileList) {
                    delete item.imageFileList
                }
            })
        }
        
        // 移除认证设置中的临时字段
        if (data.txwxProductCertsTemp) {
            data.txwxProductCertsTemp.forEach(item => {
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

// 添加关注方式
const addFollowItem = () => {
    if (txwxFocusTemp.value.length >= 5) {
        ElMessage.warning('最多只能添加5个关注方式')
        return
    }
    txwxFocusTemp.value.push({
        focusName: '',
        imageUrl: '',
        sortOrder: txwxFocusTemp.value.length + 1,
        imageFileList: []
    })
}

// 删除关注方式
const removeFollowItem = (index) => {
    txwxFocusTemp.value.splice(index, 1)
}

// 添加认证
const addCertificationItem = () => {
    txwxProductCertsTemp.value.push({
        certName: '',
        imageUrl: '',
        sortOrder: txwxProductCertsTemp.value.length + 1,
        imageFileList: []
    })
}

// 删除认证
const removeCertificationItem = (index) => {
    txwxProductCertsTemp.value.splice(index, 1)
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
const handleRemove = (file, fileList) => {
    txwxCompanyInfoTemp.value.logoUrl = ''

}

const handleAddressRemove = (file, fileList) => {
    txwxCompanyInfoTemp.value.addrUrl = ''
}

const handleHttpRequest = (params) => {
    const formData = new FormData()
    formData.append('file', params.file)
    
    uploadImage(formData)
        .then(res => {
            if (res.code === 200) {
                txwxCompanyInfoTemp.value.logoUrl = res.url || ''
                ElMessage.success('图片上传成功!')

                // 更新文件列表
                txwxCompanyInfoTemp.value.logoImageFileList = [{ name: params.file.name, url: res.url }]
                
                params.onSuccess(res) // 通知上传组件上传成功
                
                // 触发表单验证更新
                if (companyFormRef.value) {
                    companyFormRef.value.validateField('logoUrl')
                }
            } else {
                // 接口返回错误码，清空选择的图片
                txwxCompanyInfoTemp.value.logoImageFileList = []
                params.onError(res) // 通知上传组件上传失败
            }
        })
        .catch(error => {
            // 网络错误或其他异常，清空选择的图片
            txwxCompanyInfoTemp.value.logoImageFileList = []
            params.onError(error) // 通知上传组件上传失败
        })
}

// 公司地址图片上传方法
const handleAddressUpload = (params) => {
    const formData = new FormData()
    formData.append('file', params.file)
    
    uploadImage(formData)
        .then(res => {
            if (res.code === 200) {
                txwxCompanyInfoTemp.value.addrUrl = res.url || ''
                ElMessage.success('图片上传成功!')

                txwxCompanyInfoTemp.value.addrUrlImageFileList = [{ name: params.file.name, url: res.url }]
                
                params.onSuccess(res)
                
                if (companyFormRef.value) {
                    companyFormRef.value.validateField('addrUrl')
                }
            } else {
                txwxCompanyInfoTemp.value.addrUrlImageFileList = []
                params.onError(res)
            }
        })
        .catch(error => {
            txwxCompanyInfoTemp.value.addrUrlImageFileList = []
            params.onError(error)
        })
}

// 关注二维码上传方法
const handleFollowQrUpload = (params, followItem) => {
    const formData = new FormData()
    formData.append('file', params.file)
    
    uploadImage(formData)
        .then(res => {
            if (res.code === 200) {
                followItem.imageUrl = res.url || ''
                ElMessage.success('图片上传成功!')
                
                // 更新文件列表
                followItem.imageFileList = [{ name: params.file.name, url: res.url }]
                
                params.onSuccess(res) // 通知上传组件上传成功
            } else {
                // 接口返回错误码，清空选择的图片
                followItem.imageFileList = []
                params.onError(res) // 通知上传组件上传失败
            }
        })
        .catch(error => {
            // 网络错误或其他异常，清空选择的图片
            followItem.imageFileList = []
            params.onError(error) // 通知上传组件上传失败
        })
}

// 关注二维码删除方法
const handleFollowQrRemove = (file, fileList, followItem) => {
    followItem.imageUrl = '' // 清空图片地址字段
    followItem.imageFileList = fileList // 更新文件列表
}

// 认证图片上传方法
const handleCertUpload = (params, certItem) => {
    const formData = new FormData()
    formData.append('file', params.file)
    
    uploadImage(formData)
        .then(res => {
            if (res.code === 200) {
                certItem.imageUrl = res.url || ''
                ElMessage.success('图片上传成功!')
                
                // 更新文件列表
                certItem.imageFileList = [{ name: params.file.name, url: res.url }]
                
                params.onSuccess(res) // 通知上传组件上传成功
            } else {
                // 接口返回错误码，清空选择的图片
                certItem.imageFileList = []
                params.onError(res) // 通知上传组件上传失败
            }
        })
        .catch(error => {
            // 网络错误或其他异常，清空选择的图片
            certItem.imageFileList = []
            params.onError(error) // 通知上传组件上传失败
        })
}

// 认证图片删除方法
const handleCertRemove = (file, fileList, certItem) => {
    certItem.imageUrl = '' // 清空图片地址字段
    certItem.imageFileList = fileList // 更新文件列表
}

// PC端预览按钮点击事件
const handlePcPreview = () => {
  if (hasUnsavedChanges()) {
    ElMessage.warning('请先保存当前修改')
    return
  }
  window.open(pcPreviewUrl.value, '_blank')
}

// 移动端预览按钮点击事件
const handleMobilePreview = () => {
  if (hasUnsavedChanges()) {
    ElMessage.warning('请先保存当前修改')
    return
  }
  mobilePreviewVisible.value = true
}

// PC端查看按钮点击事件（跳转到企业官网）
const handlePcView = () => {
  window.open(pcViewUrl.value, '_blank')
}

// 移动端查看按钮点击事件（跳转到企业官网）
const handleMobileView = () => {
  mobileViewVisible.value = true
}

// 保存公司信息
const handleSave = async () => {
    let loading = null
    Promise.all([
        companyFormRef.value.validate(),
        focusFormRef.value.validate(),
        certFormRef.value.validate(),
        profileFormRef.value.validate()
    ]).then(() => {
        loading = ElLoading.service({
            lock: true,
            text: '保存中...',
            background: 'rgba(0, 0, 0, 0.7)'
        })
    
        const saveData = {
            isPublish: publishStatus.value || "0",
            txwxCompanyInfoTemp: {
                companyName: txwxCompanyInfoTemp.value.companyName,
                copyrightInfo: txwxCompanyInfoTemp.value.copyrightInfo,
                versionNumber: txwxCompanyInfoTemp.value.versionNumber,
                companyAddress: txwxCompanyInfoTemp.value.companyAddress,
                securityRecord: txwxCompanyInfoTemp.value.securityRecord,
                icpRecord: txwxCompanyInfoTemp.value.icpRecord,
                businessCooperation: txwxCompanyInfoTemp.value.businessCooperation,
                resumeDelivery: txwxCompanyInfoTemp.value.resumeDelivery,
                logoUrl: txwxCompanyInfoTemp.value.logoUrl,
                addrUrl: txwxCompanyInfoTemp.value.addrUrl,
            },
            txwxFocusTemp: txwxFocusTemp.value.map(item => ({
                focusName: item.focusName,
                imageUrl: item.imageUrl,
                sortOrder: item.sortOrder
            })),
            txwxProductCertsTemp: txwxProductCertsTemp.value.map(item => ({
                certId: item.certId,
                certName: item.certName,
                imageUrl: item.imageUrl,
                sortOrder: item.sortOrder
            })),
            txwxCompanyProfileTemp: {
                profileOne: txwxCompanyProfileTemp.value.profileOne === '<p><br></p>' ? '' : txwxCompanyProfileTemp.value.profileOne,
                profileTwo: txwxCompanyProfileTemp.value.profileTwo === '<p><br></p>' ? '' : txwxCompanyProfileTemp.value.profileTwo,
                profileThree: txwxCompanyProfileTemp.value.profileThree === '<p><br></p>' ? '' : txwxCompanyProfileTemp.value.profileThree,
            }
        }

        return saveCompanyInfo(saveData)
    }).then(res => {
        if (res.code === 200) {
            ElMessage.success('保存成功')
            initOriginalData()
            loadCompanyData()
        } else {
            ElMessage.error(res.message)
        }
    }).catch(err => {
        ElMessage.error(err.message || '请检查表单填写是否完整!')
    }).finally(() => {
        if (loading) {
            loading.close()
        }
    })
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
    
    // 调用API发布公司信息
    publishCompanyInfo().then((res) => {
        if (res.code === 200) {
            ElMessage.success('发布成功!')
            loadCompanyData()
        } else {
            ElMessage.error(res.message || '发布失败!')
        }
    }).catch((error) => {
        ElMessage.error('发布失败，请稍后重试!')
    }).finally(() => {
        // 关闭loading
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
        
        .publish-info {
            display: flex;
            font-size: 14px;
            color: #606266;
            gap: 16px;
            margin-right: 20px;
        }
        
        .el-button {
            margin-left: 10px;
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