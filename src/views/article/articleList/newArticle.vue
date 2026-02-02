/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
    <div class="article-container">
        <div class="title-container">
            <h3 class="page-title">文章编辑</h3>
            <div class="action-buttons">
                <el-button type="primary" @click="handleSaveDraft">保存草稿</el-button>
                <el-button @click="handleBack">返回</el-button>
            </div>
        </div>
        <el-form ref="articleFormRef" :model="articleForm" :rules="rules" label-width="140px" class="article-form">
            <!-- 文章标题 -->
            <el-form-item label="文章标题" prop="title" required>
                <el-input 
                    v-model="articleForm.title" 
                    placeholder="请输入文章标题" 
                    style="width: 100%;"
                />
            </el-form-item>
            
            <!-- 文章摘要 -->
            <el-form-item label="摘要" prop="digest" required>
                <el-input
                    v-model="articleForm.digest"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入文章摘要"
                    style="width: 100%;"
                />
            </el-form-item>
            
            <!-- 作者和封面图片ID -->
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="作者" prop="author" required>
                        <el-input 
                            v-model="articleForm.author" 
                            placeholder="请输入文章作者" 
                            style="width: 100%;"
                            maxlength="16"
                            show-word-limit
                        />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="封面图片媒体ID" prop="thumbMediaId" required>
                        <el-input 
                            v-model="articleForm.thumbMediaId" 
                            placeholder="请输入封面图片ID" 
                            style="width: 100%;"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            
            <!-- 评论设置 -->
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="是否打开评论">
                        <el-radio-group v-model="articleForm.needOpenComment">
                            <el-radio label="0">否</el-radio>
                            <el-radio label="1">是</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="是否粉丝才可评论">
                        <el-radio-group v-model="articleForm.onlyFansCanComment">
                            <el-radio label="0">否</el-radio>
                            <el-radio label="1">是</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
            </el-row>
            
            <!-- 文章内容 -->
            <el-form-item label="文章内容" prop="content" required class="content-form-item">
                <div class="editor-container">
                    <iframe ref="ueIframe" src="/ueditor/index.html"></iframe>
                </div>
            </el-form-item>        
            
        </el-form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'

// 获取路由实例
const router = useRouter()
const route = useRoute()

// 表单数据
const articleForm = ref({
    id: '',
    title: '',
    digest: '',
    author: '',
    thumbMediaId: '',
    needOpenComment: '0', // 默认不打开评论
    onlyFansCanComment: '0', // 默认所有人可评论
    content: '',
    articleType: 'news',
})

// 表单引用
const articleFormRef = ref()

// 表单验证规则
const rules = ref({
    title: [
        { required: true, message: '请输入文章标题', trigger: 'blur' }
    ],
    digest: [
        { required: true, message: '请输入文章摘要', trigger: 'blur' }
    ],
    author: [
        { required: true, message: '请输入作者', trigger: 'blur' }
    ],
    thumbMediaId: [
        { required: true, message: '请输入封面图片ID', trigger: 'blur' }
    ],
    content: [
        { required: true, message: '请输入文章内容', trigger: 'blur' }
    ]
})

// iframe引用
const ueIframe = ref(null)

// 加载文章数据
const loadArticleData = (articleId) => {
    // 调用获取草稿详情接口前创建全屏loading遮罩
    const loadingMask = ElLoading.service({
        lock: true,
        text: '正在加载文章数据...',
        background: 'rgba(0, 0, 0, 0.5)'
    })
    
    getDraftDetail(articleId)
        .then(res => {
            if (res.code === 200) {
                    // 获取响应数据
                const articleData = res.data
                
                // 将needOpenComment和onlyFansCanComment转换为字符串
                articleData.needOpenComment = String(articleData.needOpenComment || '0')
                articleData.onlyFansCanComment = String(articleData.onlyFansCanComment || '0')

                // articleData.content = '<section data-tools="135编辑器" data-id="121531" class="_135editor" style="margin-bottom: 0px; color: rgb(53, 53, 53); background-color: rgb(255, 255, 255); pointer-events: initial;font-family:&quot;Helvetica Neue&quot;, &quot;Hiragino Sans GB&quot;, &quot;Microsoft YaHei&quot;, 黑体, Arial, sans-serif;"><section style="margin: 10px auto; pointer-events: initial;"><section style="margin: -1px 5px; padding: 15px 10px; border-width: 1px; border-style: solid; border-color: rgb(84, 141, 212); pointer-events: initial; box-sizing: border-box;"><section data-autoskip="1" style="line-height: 1.75em; letter-spacing: 1.5px; font-size: 14px; color: rgb(51, 51, 51); background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; pointer-events: initial;"><section style="margin-bottom: 8px; pointer-events: initial;"><span style="font-size: 15px; pointer-events: initial;"><strong style="pointer-events: initial;"><span style="letter-spacing: 0.578px; background-color: #A5C8FF; color: #FFFFFF; pointer-events: initial;"><span style="display: inline-block; text-indent: initial;">公</span><span style="display: inline-block; text-indent: initial;">司</span><span style="display: inline-block; text-indent: initial;">介</span><span style="display: inline-block; text-indent: initial;">绍</span></span></strong></span></section><p style="pointer-events: initial;"><span style="color: rgba(0, 0, 0, 0.9); letter-spacing: 0.578px; pointer-events: initial;"><span style="display: inline-block; text-indent: initial;"></span></span>成都天巡微小卫星科技有限责任公司成立于2020年，致力于突破空天协同技术关键，公司是国家高新技术企业、四川省专精特新企业。<span style="display: inline-block; text-indent: initial;"></span></p></section></section><section style="display: flex; justify-content: space-between; align-items: flex-end; pointer-events: initial;"><section style="flex-shrink: 0; pointer-events: initial;"><section style="width: 6px; height: 6px; border-width: 1px; border-style: solid; border-color: rgb(84, 141, 212); pointer-events: initial;box-sizing:border-box;"></section></section><section style="flex-shrink: 0; pointer-events: initial;"><section style="width: 6px; height: 6px; border-width: 1px; border-style: solid; border-color: rgb(84, 141, 212); pointer-events: initial;box-sizing:border-box;"></section></section></section></section></section><p><section style="margin-bottom: 0px; text-indent: 0em; color: rgb(53, 53, 53); background-color: rgb(255, 255, 255); line-height: normal; pointer-events: initial;font-family:&quot;Helvetica Neue&quot;, &quot;Hiragino Sans GB&quot;, &quot;Microsoft YaHei&quot;, 黑体, Arial, sans-serif;"><span style="color: #888888; font-size: 12px; letter-spacing: 0.578px; text-decoration-style: solid; text-decoration-color: #888888; pointer-events: initial;"></span></section></p><p style="margin-bottom: 0px; letter-spacing: 0.578px; text-align: center;"><img class="rich_pages wxw-img" data-backh="268" data-backw="578" data-imgfileid="100003378" data-ratio="0.46296296296296297" data-s="300,640" data-type="png" data-w="1080" data-src="https://mmbiz.qpic.cn/mmbiz_png/bpdOE6WIzW6sFBNRMVRy6SmHmL50kaHMxaFQZD65klPPOzI9HqvY7tOviaMFSNu2Vtn1Rmx1FtxM0B2QKCVXbng/640?wx_fmt=png&from=appmsg" style="width: 100%; height: auto; vertical-align: baseline;box-sizing:border-box;"></p><p><br  /></p>'
                
                // 设置表单数据
                articleForm.value = {
                    ...articleForm.value,
                    ...articleData
                }
                // 初始化编辑器内容
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
            // 无论成功失败，都关闭loading遮罩
            loadingMask.close()
        })
}

// 页面加载时处理
onMounted(() => {
    // 检查是否有文章ID参数（编辑模式）
    const articleId = route.query.id
    if (articleId) {
        // 如果是编辑模式，设置文章ID
        articleForm.value.id = articleId
        // 加载文章数据
        loadArticleData(articleId)
        console.log('编辑文章ID:', articleId)
    } else {
        // 监听iframe加载完成事件
        if (ueIframe.value) {
            ueIframe.value.onload = () => {
                initEditor()
            }
        }
    }
})

// 初始化编辑器内容和事件监听
const initEditor = () => {
    if (!ueIframe.value || !ueIframe.value.contentWindow) {
        return
    }
    
    const iframeWindow = ueIframe.value.contentWindow
    if (!iframeWindow.UE || !iframeWindow.UE.getEditor) {
        return
    }
    
    // 获取UEditor实例
    const ueInstance = iframeWindow.UE.getEditor('editor')
    if (!ueInstance) {
        return
    }
    
    // 使用UEditor的ready方法确保编辑器完全初始化
    ueInstance.ready(() => {
        // 设置编辑器初始内容
        ueInstance.setContent(articleForm.value.content)
        
        // 监听编辑器内容变化事件
        ueInstance.addListener('contentChange', () => {
            articleForm.value.content = ueInstance.getContent()
        })
    })
}

// 导入草稿相关API
import { addDraft, updateDraft, getDraftDetail } from '@/api/article'
// 导入Base64处理库
import { Base64 } from 'js-base64'

// 保存草稿
const handleSaveDraft = () => {
    articleFormRef.value.validate(valid => {
        if (valid) {
            console.log('表单数据:', articleForm.value.content)
            
            // 将content进行base64编码
            const encodedContent = Base64.encode(articleForm.value.content)
            
            const draftParams = {
                ...articleForm.value,
                content: encodedContent,
                needOpenComment: parseInt(articleForm.value.needOpenComment),
                onlyFansCanComment: parseInt(articleForm.value.onlyFansCanComment)
            }
            
            // 根据是否有id参数判断是新建还是编辑模式
            const apiCall = articleForm.value.id ? updateDraft : addDraft
            const successMessage = articleForm.value.id ? '草稿更新成功' : '草稿保存成功'
            
            // 调用相应的API
            // 创建全屏loading遮罩
            const loadingMask = ElLoading.service({
                lock: true,
                text: '正在保存草稿...',
                background: 'rgba(0, 0, 0, 0.5)'
            })

            apiCall(draftParams)
                .then(response => {
                    if (response.code === 200) {
                        ElMessage.success(successMessage)
                        // 保存成功后返回文章列表
                        router.push('/article/articleList')
                    } else {
                        ElMessage.error(response.message || '草稿保存失败')
                    }
                })
                .catch(error => {
                    ElMessage.error('草稿保存失败，请稍后重试')
                })
                .finally(() => {
                    // 关闭loading遮罩
                    loadingMask.close()
                })
        } else {
            return false
        }
    })
}

// 从iframe中获取UEditor编辑器内容
const getIframeUEditorContent = () => {
    // 确保iframe已经加载完成
    if (!ueIframe.value || !ueIframe.value.contentWindow) {
        return
    }
    
    // 获取iframe内部的window对象
    const iframeWindow = ueIframe.value.contentWindow
    
    // 检查UEditor是否已加载完成
    if (!iframeWindow.UE || !iframeWindow.UE.getEditor) {
        return
    }
    
    // 获取UEditor实例（假设iframe内部的UEditor实例id为'editor'）
    const ueInstance = iframeWindow.UE.getEditor('editor')
    
    if (!ueInstance) {
        return
    }
    
    // 获取编辑器内容并赋值给表单字段
    articleForm.value.content = ueInstance.getContent()
    console.log('iframe中UEditor的内容:', articleForm.value.content)
}

// 返回按钮
const handleBack = () => {
    // 返回文章列表
    router.push('/article/articleList')
}
</script>

<style scoped lang="scss">
.article-container {
    padding: 20px;
    min-height: 100vh;
    
    .title-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .page-title {
        font-size: 18px;
        font-weight: bold;
        color: var(--el-text-color-primary);
    }
    
    .action-buttons {
        display: flex;
        gap: 10px;
    }
}

.article-form {
    width: 80%;
    /* 居左展示，默认就是左对齐，无需额外设置margin-left: 0; */
}

.content-form-item {
    width: 100%;
}

.editor-container {
    width: 100%;
}

.editor-container iframe {
    width: 100% !important;
    height: 580px;
    border: none;
}
</style>