<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->

<template>
   <el-form ref="userRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="用户名称">
        {{form.userName}}
      </el-form-item>
      <el-form-item label="手机号码">
        <div class="contact-container">
            <span>{{ showRealPhone ? realPhone : (form.phonenumber || '未绑定') }}</span>
            <el-icon v-if="form.phonenumber" class="eye-icon" @click="showRealPhone = !showRealPhone">
              <Eye v-if="!showRealPhone" />
              <EyeOff v-else />
            </el-icon>
            <!-- <el-input v-model="form.phonenumber" placeholder="请输入手机号" size="small" /> -->
            <el-button v-if="!form.phonenumber" class="bind-btn" type="primary" plain size="small" @click="openBindDialog('phone')">去绑定手机</el-button>
            <el-button v-if="form.phonenumber && !isPhonePrimary" class="unbind-btn" type="danger" plain size="small" @click="openUnbindDialog('phone')">解绑手机</el-button>
        </div>
        </el-form-item>
      <el-form-item label="邮箱"  >
        <div class="contact-container">
            <span>{{ showRealEmail ? realEmail : (form.email || '未绑定') }}</span>
            <el-icon v-if="form.email" class="eye-icon" @click="showRealEmail = !showRealEmail">
              <Eye v-if="!showRealEmail" />
              <EyeOff v-else />
            </el-icon>
            <el-button v-if="!form.email" class="bind-btn" type="primary" plain size="small" @click="openBindDialog('email')">去绑定邮箱</el-button>
            <el-button v-if="form.email && !isEmailPrimary" class="unbind-btn" type="danger" plain size="small" @click="openUnbindDialog('email')">解绑邮箱</el-button>
        </div>
      </el-form-item>
      <!-- <el-form-item label="性别">
         <el-radio-group v-model="form.sex">
            <el-radio value="0">男</el-radio>
            <el-radio value="1">女</el-radio>
         </el-radio-group>
      </el-form-item> -->
      <el-form-item>
        <div class="form-btn-container">
          <!-- <el-button type="primary" @click="submit">保存</el-button>
          <el-button type="danger" @click="close">关闭</el-button> -->

          <el-button v-if="deactivateStatus === '0'" type="danger" plain @click="openDeleteAccountDialog">注销账号</el-button>
          <template v-else-if="deactivateStatus === '1'">
            <el-button type="primary" plain @click="cancelDeactivateAccount">撤销注销申请</el-button>
            <div class="cancel-status-wrapper">
              <el-tag type="warning" effect="plain">注销中</el-tag>
              <el-tooltip content="提交注销申请后，有7天的冷却期，7天后将彻底注销账号并清除数据。" placement="top">
                <el-icon class="cancel-tip-icon"><Warning /></el-icon>
              </el-tooltip>
              <span v-if="applyTime" class="cool-period">提交注销申请时间：{{applyTime }}</span>
              <span v-if="coolEndTime" class="cool-period">冷却到期时间：{{coolEndTime }}</span>
            </div>
          </template>
          <el-tag v-else-if="deactivateStatus === '2'" type="success" effect="plain">已注销</el-tag>
          <el-tag v-else-if="registerStatus === '1'" type="info" effect="plain">已停用</el-tag>
          <el-tag v-else-if="registerStatus === '2'" type="warning" effect="plain">已锁定</el-tag>
        </div>
      </el-form-item>
   </el-form>
   
   <!-- 绑定备用联系方式弹窗 -->
   <el-dialog
      v-model="showBindDialog"
      :title="bindDialogTitle"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form ref="bindRef" :model="bindForm" :rules="bindRules" class="bind-dialog-content">
        <el-form-item>
          <el-input v-model="backupContact" placeholder="请输入备用联系方式" style="width: 280px" />
        </el-form-item>
        <el-form-item prop="verifyCode">
          <div class="captcha-row">
            <el-input
              v-model="bindForm.verifyCode"
              placeholder="请输入验证码"
              style="width: 180px"
              @keyup.enter="handleBind"
            >
            </el-input>
            <el-button 
              type="primary" 
              :loading="sendingCode"
              :disabled="countdown > 0 || sendingCode"
              style="margin-left: 10px"
              @click="getVerifyCode"
            >
              {{ countdown > 0 ? `${countdown}s后重新获取` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBindDialog = false">取消</el-button>
          <el-button type="primary" @click="handleBind">绑定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 解绑通道弹窗 -->
    <el-dialog
      v-model="showUnbindDialog"
      :title="unbindDialogTitle"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form ref="unbindRef" :model="unbindForm" :rules="unbindRules" class="unbind-form">
        <div v-if="unbindType === 'phone'" class="unbind-tip">
          将向 <span class="contact-value">{{ form.phonenumber }}</span> 发送验证码进行验证
        </div>
        <div v-else class="unbind-tip">
          解绑邮箱需要验证登录密码和邮箱验证码
        </div>
        
        <el-form-item v-if="unbindType === 'email'" prop="password">
          <el-input
            v-model="unbindForm.password"
            type="password"
            placeholder="请输入登录密码"
          >
          </el-input>
        </el-form-item>
        
        <el-form-item prop="verifyCode">
          <div class="captcha-row">
            <el-input
              v-model="unbindForm.verifyCode"
              placeholder="请输入验证码"
              style="width: 180px"
            >
            </el-input>
            <el-button 
              type="primary" 
              :loading="sendingUnbindCode"
              :disabled="unbindCountdown > 0 || sendingUnbindCode"
              style="margin-left: 10px"
              @click="getUnbindVerifyCode"
            >
              {{ unbindCountdown > 0 ? `${unbindCountdown}s后重新获取` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUnbindDialog = false">取消</el-button>
          <el-button type="danger" @click="handleUnbind">确认解绑</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 图形验证码弹窗 -->
    <el-dialog
      v-model="showCaptchaDialog"
      title="安全验证"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form ref="captchaRef" :model="captchaForm" :rules="captchaRules" class="captcha-dialog-content">
        <p class="captcha-tip">请完成以下验证，以获取验证码</p>
        <el-form-item prop="checkCode">
          <div class="captcha-row">
            <el-input
              v-model="captchaForm.checkCode"
              placeholder="请输入图形验证码"
              style="width: 180px"
              @keyup.enter="verifyCaptcha"
            >
            </el-input>
            <div class="captcha-image-wrapper">
              <img :src="codeUrl" @click="getCode" class="captcha-img"/>
              <el-icon class="refresh-icon" @click="getCode"><Refresh /></el-icon>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCaptchaDialog = false">取消</el-button>
          <el-button type="primary" @click="verifyCaptcha">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 注销账号确认弹窗 -->
    <el-dialog
      v-model="showDeleteDialog"
      title="账号注销"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="delete-account-content">
        <p class="delete-warning">提交注销申请后，有7天的冷却期，7天后将彻底注销账号并清除数据。</p>
        <p class="delete-warning">冷却期间，您可通过点击“撤销注销申请”按钮或联系我们（028 - 8564 - 6535），随时撤销您的注销申请。</p>
        <p class="delete-warning">冷却期内，账号、用户名、手机号/邮箱全部保持占用，不释放、不允许他人注册登录。</p>
        
        <el-form ref="deleteRef" :model="deleteForm" :rules="deleteFormRules" class="delete-form">
          <el-form-item prop="password">
            <el-input
              v-model="deleteForm.password"
              type="password"
              placeholder="请输入当前登录密码"
              show-password
            >
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDeleteDialog = false">取消</el-button>
          <el-button type="danger" @click="confirmDeleteAccount">提交注销申请</el-button>
        </span>
      </template>
    </el-dialog>
</template>

<script setup>
import { ref, onMounted, watch, getCurrentInstance, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { updateUserProfile } from "@/api/system/user"
import { getBackupContact, sendCode, getCurrentUser, bindBackupContact, applyLogout, bindChannel, unbindChannel, deactivate, getDeactivateStatus, cancelDeactivate } from "@/api/system/userInfoNew"
import { checkHuman, sendSmsCode, sendEmailCode, getCodeImg } from "@/api/newRegister"
import { getRegisterUserList } from "@/api/system/registerUser"
import { Refresh, Warning } from '@element-plus/icons-vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import useUserStore from '@/store/modules/user'
import { encrypt } from "@/utils/jsencrypt"

const userStore = useUserStore()

// 判断用户角色是否为 txwx_common
const isCommonUser = computed(() => {
  return userStore.roles.some(role => role === 'txwx_common')
})

const props = defineProps({
  user: {
    type: Object
  }
})

const { proxy } = getCurrentInstance()

const form = ref({})
const userType = ref('')
// 主账号标记（isPrimary === '1' 表示主账号，不允许解绑）
const isPhonePrimary = ref(false)
const isEmailPrimary = ref(false)
// 是否存在非主账号的联系方式
const hasOtherPhone = ref(false)
const hasOtherEmail = ref(false)
// 是否显示真实手机号/邮箱（用于切换加密显示）
const showRealPhone = ref(false)
const showRealEmail = ref(false)
// 存储真实的联系方式（用于解绑）
const realPhone = ref('')
const realEmail = ref('')
// 存储真实的备用联系方式（用于绑定发送验证码）
const realBackupContact = ref('')
// 存储初始的加密备用联系方式（用于判断用户是否修改）
const initialBackupContact = ref('')
// const rules = ref({
  // nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  // email: [{ required: true, message: "邮箱地址不能为空", trigger: "blur" }, { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
  // phonenumber: [{ required: true, message: "手机号码不能为空", trigger: "blur" }, { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }],
// })

// 绑定弹窗相关
const showBindDialog = ref(false)
const bindDialogTitle = ref('')
const bindType = ref('') // 'phone' 或 'email'
const backupContact = ref('')
const bindForm = ref({
  verifyCode: ''
})
const bindRules = ref({
  verifyCode: [{ required: true, message: "验证码不能为空", trigger: "blur" }]
})
const bindRef = ref(null)

// 解绑弹窗相关
const showUnbindDialog = ref(false)
const unbindDialogTitle = ref('')
const unbindType = ref('') // 'phone' 或 'email'
const unbindForm = ref({
  password: '',
  verifyCode: ''
})
const unbindRules = ref({
  password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
  verifyCode: [{ required: true, message: "验证码不能为空", trigger: "blur" }]
})
const unbindRef = ref(null)
const unbindCountdown = ref(0)
const sendingUnbindCode = ref(false)

// 验证码相关
const showCaptchaDialog = ref(false)
const captchaForm = ref({
  checkCode: ''
})
const captchaRules = ref({
  checkCode: [{ required: true, message: "验证码不能为空", trigger: "blur" }]
})
const captchaRef = ref(null)
const codeUrl = ref('')
const captchaUuid = ref('')
const countdown = ref(0)
const sendingCode = ref(false)

// 查询注销状态的公共方法
function fetchDeactivateStatus() {
  getDeactivateStatus().then(res => {
    if (res.code === 200) {
      deactivateStatus.value = res.data.status
      // 获取注销申请时间和冷却到期时间
      if (res.data.deleteApplyTime) {
        applyTime.value = formatDateTime(res.data.deleteApplyTime)
      }
      if (res.data.deleteScheduledAt) {
        coolEndTime.value = formatDateTime(res.data.deleteScheduledAt)
      }
    }
  }).catch(() => {
    // 查询失败不影响页面展示
  })
}

// Delete account related variables
const showDeleteDialog = ref(false)
const deleteForm = ref({
  password: ''
})
const deleteFormRules = {
  password: [
    { required: true, trigger: 'blur', message: '请输入当前登录密码' }
  ]
}
const deleteCountdown = ref(0)
const deleteCaptchaLocked = ref(false)
const deleteCaptchaFailCount = ref(0)
const deleteCaptchaLockCountdown = ref(0)
const registerStatus = ref(null)
const isRegisteredUser = ref(false)
const applyTime = ref('')
const coolEndTime = ref('')
const deactivateStatus = ref('active') // active, cooling, cancelled

// 格式化时间
function formatDateTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/** 提交按钮 */
function submit() {
  proxy.$refs.userRef.validate(valid => {
    if (valid) {
      updateUserProfile(form.value).then(response => {
        proxy.$modal.msgSuccess("修改成功")
        props.user.phonenumber = form.value.phonenumber
        props.user.email = form.value.email
      })
    }
  })
}

/** 关闭按钮 */
function close() {
  proxy.$tab.closePage()
}

// 打开绑定弹窗
function openBindDialog(type) {
  bindType.value = type
  bindDialogTitle.value = type === 'phone' ? '绑定手机' : '绑定邮箱'
  showBindDialog.value = true
  // 清空验证码输入框
  bindForm.value.verifyCode = ''
  
  // 获取备用联系方式
  getBackupContact().then(response => {
    if (response.code === 200) {
      backupContact.value = type === 'phone' ? response.data.bakPhone : response.data.bakEmail
      // 保存初始值（用于判断用户是否修改）
      initialBackupContact.value = backupContact.value
      // 保存真实的备用联系方式（用于发送验证码）
      realBackupContact.value = type === 'phone' ? (response.data.rawBakPhone || response.data.bakPhone) : (response.data.rawBakEmail || response.data.bakEmail)
    } else {
      ElMessage.error(response.msg || '获取备用联系方式失败')
    }
  })
}

// 获取图形验证码
function getCode() {
  getCodeImg().then(res => {
    const data = res.data || res
    captchaUuid.value = data.uuid
    codeUrl.value = "data:image/gif;base64," + data.img
  })
}

// 验证图形验证码
function verifyCaptcha() {
  captchaRef.value.validate(valid => {
    if (valid) {
      checkHuman({ uuid: captchaUuid.value, code: captchaForm.value.checkCode }).then(res => {
        if (res.code === 200) {
          showCaptchaDialog.value = false
          // 判断是绑定、解绑还是注销账号的验证码
          if (showBindDialog.value) {
            sendVerifyCode()
          } else if (showUnbindDialog.value) {
            sendUnbindCode()
          } else if (showDeleteDialog.value) {
            doSendDeleteVerificationCode()
          }
        } else {
          ElMessage.error(res.msg || '图形验证码错误')
          getCode()
        }
      }).catch(() => {
        getCode()
      })
    }
  })
}

// 获取验证码
function getVerifyCode() {
  // 清空图形验证码输入框
  captchaForm.value.checkCode = ''
  showCaptchaDialog.value = true
  getCode()
}

// 发送验证码
function sendVerifyCode() {
  sendingCode.value = true
  // 判断用户是否修改了输入
  const isModified = backupContact.value !== initialBackupContact.value
  // 如果用户修改了输入，使用新输入的值；否则使用真实值
  const contact = isModified ? backupContact.value : (realBackupContact.value || backupContact.value)
  const isEmail = contact.includes('@')
  const data = { 
    channelType: isEmail ? 'email' : 'phone', 
    channelAccount: contact,
  }
  
  const sendCodePromise = sendCode(data)
  
  sendCodePromise.then(res => {
    if (res.code === 200) {
      ElMessage.success(res.msg || '验证码已发送')
      startCountdown()
    } else {
      ElMessage.error(res.msg || '验证码发送失败')
    }
  }).catch(error => {
    ElMessage.error(error.response?.data?.msg || '验证码发送失败')
  }).finally(() => {
    sendingCode.value = false
  })
}

// 开始倒计时
function startCountdown() {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 处理绑定
function handleBind() {
  bindRef.value.validate(valid => {
    if (valid) {
      // 判断用户是否修改了输入
      const isModified = backupContact.value !== initialBackupContact.value
      // 如果用户修改了输入，使用新输入的值；否则使用真实值
      const contact = isModified ? backupContact.value : (realBackupContact.value || backupContact.value)
      const data = {
        channelType: bindType.value,
        channelAccount: contact,
        verifyCode: bindForm.value.verifyCode
      }
      
      bindChannel(data).then(response => {
        if (response.code === 200) {
          ElMessage.success('绑定成功')
          showBindDialog.value = false
          // 更新表单数据
          if (bindType.value === 'phone') {
            form.value.phonenumber = backupContact.value
            props.user.phonenumber = backupContact.value
          } else {
            form.value.email = backupContact.value
            props.user.email = backupContact.value
          }
        } else {
          ElMessage.error(response.msg || '绑定失败')
        }
      }).catch(() => {
        ElMessage.error('绑定失败')
      })
    }
  })
}

  

// 解绑相关函数
function openUnbindDialog(type) {
  unbindType.value = type
  unbindDialogTitle.value = type === 'phone' ? '解绑手机' : '解绑邮箱'
  showUnbindDialog.value = true
  unbindForm.value = {
    password: '',
    verifyCode: ''
  }
}

function getUnbindVerifyCode() {
  // 清空图形验证码输入框
  captchaForm.value.checkCode = ''
  showCaptchaDialog.value = true
  getCode()
}

function sendUnbindCode() {
  sendingUnbindCode.value = true
  // 使用真实的联系方式发送验证码
  const contact = unbindType.value === 'phone' ? (realPhone.value || form.value.phonenumber) : (realEmail.value || form.value.email)
  const data = { 
    channelType: unbindType.value, 
    channelAccount: contact,
  }
  
  const sendCodePromise = sendCode(data)
  
  sendCodePromise.then(() => {
    ElMessage.success('验证码发送成功')
    unbindCountdown.value = 60
    const timer = setInterval(() => {
      unbindCountdown.value--
      if (unbindCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  }).catch(error => {
    ElMessage.error(error.response?.data?.msg || '验证码发送失败')
  }).finally(() => {
    sendingUnbindCode.value = false
  })
}

function handleUnbind() {
  unbindRef.value.validate(valid => {
    if (valid) {
      const data = {
        channelType: unbindType.value,
        verifyCode: unbindForm.value.verifyCode
      }
      
      if (unbindType.value === 'email') {
        data.password = unbindForm.value.password
      }
      
      unbindChannel(data).then(response => {
        if (response.code === 200) {
          ElMessage.success('解绑成功')
          showUnbindDialog.value = false
          // 更新表单数据
          if (unbindType.value === 'phone') {
            form.value.phonenumber = ''
            props.user.phonenumber = ''
          } else {
            form.value.email = ''
            props.user.email = ''
          }
        } else {
          ElMessage.error(response.msg || '解绑失败')
        }
      })
    }
  })
}

// Delete account functions
function openDeleteAccountDialog() {
  
  let verificationType = 'password'
  if (form.value?.phonenumber) {
    verificationType = 'sms'
  } else if (form.value?.email) {
    verificationType = 'email'
  }
  
  deleteForm.value = {
    verificationType: verificationType,
    code: '',
    password: ''
  }
  
  console.log('deleteForm.value:', deleteForm.value)
  showDeleteDialog.value = true
  console.log('showDeleteDialog.value set to:', showDeleteDialog.value)
}

function sendDeleteVerificationCode() {
  if (deleteCaptchaLocked.value) {
    ElMessage.warning(`操作频繁，请${deleteCaptchaLockCountdown.value}秒后再试`)
    return
  }
  
  // 清空图形验证码输入框
  captchaForm.value.checkCode = ''
  showCaptchaDialog.value = true
  getCode()
}

function doSendDeleteVerificationCode() {
  let sendData = {}
  let sendCodePromise
  
  const bothBound = form.value.phonenumber && form.value.email
  
  if (bothBound) {
    const contact = deleteForm.value.contact
    if (/^1[3|4|5|6|7|8|9][0-9]\d{8}$/.test(contact)) {
      sendData = { phone: contact }
      sendCodePromise = sendSmsCode(sendData)
    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
      sendData = { email: contact }
      sendCodePromise = sendEmailCode(sendData)
    } else {
      ElMessage.error('请输入正确的手机号或邮箱')
      return
    }
  } else if (deleteForm.value.verificationType === 'sms' && form.value.phonenumber) {
    sendData = { phone: form.value.phonenumber }
    sendCodePromise = sendSmsCode(sendData)
  } else if (deleteForm.value.verificationType === 'email' && form.value.email) {
    sendData = { email: form.value.email }
    sendCodePromise = sendEmailCode(sendData)
  } else {
    ElMessage.error('请选择有效的验证方式')
    return
  }
  
  sendCodePromise.then(res => {
    if (res.code === 200) {
      ElMessage.success(res.msg || '验证码发送成功')
      startDeleteCountdown()
    } else {
      ElMessage.error(res.msg || '验证码发送失败')
    }
  }).catch(error => {
    ElMessage.error(error.response?.data?.msg || '验证码发送失败')
  })
}

function startDeleteCountdown() {
  deleteCountdown.value = 60
  const timer = setInterval(() => {
    deleteCountdown.value--
    if (deleteCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

function confirmDeleteAccount() {
  const userStore = useUserStore()
  const requestData = {
    password: encrypt(deleteForm.value.password)
  }
  
  deactivate(requestData).then(response => {
    if (response.code === 200) {
      ElMessage.success(response.msg || '注销申请提交成功，7天后自动注销')
      showDeleteDialog.value = false
      deleteForm.value.password = ''
      // 更新注销状态
      fetchDeactivateStatus()
    } else {
      ElMessage.error(response.msg || '注销申请失败')
    }
  })
}

function cancelDeactivateAccount() {
  cancelDeactivate().then(response => {
    if (response.code === 200) {
      ElMessage.success(response.msg || '已取消注销')
      deactivateStatus.value = 'active'
    } else {
      ElMessage.error(response.msg || '取消注销失败')
    }
  }).finally(() => {
    fetchDeactivateStatus()
  })
}
// 从新接口获取用户信息并映射到表单
function mapNewUserInfo(data) {
  const formData = {
    userName: data.username || data.displayName || '',
    phonenumber: '',
    email: '',
    sex: ''
  }
  
  // 重置标记
  isPhonePrimary.value = false
  isEmailPrimary.value = false
  hasOtherPhone.value = false
  hasOtherEmail.value = false
  
  // 从channels中提取手机号和邮箱，并记录主账号状态
  if (data.channels && Array.isArray(data.channels)) {
    data.channels.forEach(channel => {
      if (channel.channelType === 'phone') {
        formData.phonenumber = channel.channelAccount || ''  // 加密值用于展示
        realPhone.value = channel.rawChannelAccount || ''    // 真实值用于解绑
        // 判断是否为主账号
        if (channel.isPrimary === '1') {
          isPhonePrimary.value = true
        } else {
          // 非主账号联系方式
          hasOtherPhone.value = true
        }
      } else if (channel.channelType === 'email') {
        formData.email = channel.channelAccount || ''        // 加密值用于展示
        realEmail.value = channel.rawChannelAccount || ''    // 真实值用于解绑
        // 判断是否为主账号
        if (channel.isPrimary === '1') {
          isEmailPrimary.value = true
        } else {
          // 非主账号联系方式
          hasOtherEmail.value = true
        }
      }
    })
  }
  
  return formData
}

// 回显当前登录用户信息
watch(() => props.user, user => {
  if (user) {
    userType.value = user.userType
    const userName = user.userName
    const userId = user.userId
    
    // 查询注销状态
    fetchDeactivateStatus()
    
    // 判断是否是注册用户（userType === '10'）
    if (user.userType === '10') {
      // 注册用户，调用新接口获取用户信息
      getCurrentUser().then(userRes => {
        // 兼容两种返回码：0（新接口）和 200（系统其他接口）
        if ((userRes.code === 0 || userRes.code === 200) && userRes.data) {
          form.value = mapNewUserInfo(userRes.data)
          // // 更新props.user以便父组件也能获取到最新数据
          // if (props.user) {
          //   props.user.userName = form.value.userName
          //   props.user.phonenumber = form.value.phonenumber
          //   props.user.email = form.value.email
          // }
        } else {
          form.value = { userName: user.userName, phonenumber: user.phonenumber, email: user.email, sex: user.sex }
        }
      }).catch(() => {
        // 如果新接口调用失败，使用原有的用户信息
        form.value = { userName: user.userName, phonenumber: user.phonenumber, email: user.email, sex: user.sex }
      })
    } else {
      // 非注册用户，使用原有的用户信息
      form.value = { userName: user.userName, phonenumber: user.phonenumber, email: user.email, sex: user.sex }
    }
    
    if (userName) {
      getRegisterUserList({ userName: userName }, {}).then(res => {
        if (res.code === 200 && res.rows && res.rows.length > 0) {
          registerStatus.value = res.rows[0].status
          isRegisteredUser.value = true
        } else {
          isRegisteredUser.value = false
        }
      })
    }
    
  } else {
    console.log('userInfoNew - props.user为空')
  }
},{ immediate: true })

// 监听图形验证码弹窗打开，清空输入框
watch(showCaptchaDialog, (val) => {
  if (val) {
    captchaForm.value.checkCode = ''
  }
})

// 监听解绑弹窗打开，清空输入框
watch(showUnbindDialog, (val) => {
  if (val) {
    unbindForm.value.verifyCode = ''
    unbindForm.value.password = ''
  }
})

// 初始化获取验证码
onMounted(() => {
  getCode()
})
</script>

<style scoped>
.contact-container {
  display: flex;
  align-items: center;
}

.contact-container .phone-label {
  margin-right: 10px;
}

.contact-container .phone-input {
  flex: 1;
}

.contact-container .phone-btn {
  margin-left: 10px;
}

.captcha-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.captcha-row {
  display: flex;
  align-items: center;
}

.captcha-image-wrapper {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.captcha-img {
  width: 100px;
  height: 40px;
  cursor: pointer;
}

.refresh-icon {
  margin-left: 5px;
  cursor: pointer;
  color: #666;
}

.captcha-tip {
  margin-bottom: 20px;
  color: #666;
}

.bind-btn, .unbind-btn {
  margin-left: 10px;
}

.eye-icon {
  margin-left: 8px;
  cursor: pointer;
  color: #666;
  font-size: 16px;
  
  &:hover {
    color: #409eff;
  }
}

.unbind-tip {
  margin-bottom: 12px;
}

.form-btn-container {
  display: flex;
  gap: 10px;
  
  .status-text {
    color: #909399;
    line-height: 28px;
  }
  
  .cancel-status-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .cool-period {
      color: #909399;
      font-size: 12px;
    }
    
    .cancel-tip-icon {
      color: #e6a23c;
      cursor: pointer;
      font-size: 16px;
      
      &:hover {
        color: #ebb563;
      }
    }
  }
}

.nickname-input {
  width: 300px;
}

.delete-account-content {
  .delete-warning {
    color: #f56c6c;
    margin-bottom: 15px;
    line-height: 1.5;
  }
  
  .verification-type-group {
    margin: 20px 0;
  }
  
  .delete-form {
    margin-top: 20px;
  }
  
  .single-contact-tip {
    margin-bottom: 15px;
    color: #606266;
    
    .contact-value {
      color: #667eea;
      font-weight: bold;
    }
  }
}
</style>
