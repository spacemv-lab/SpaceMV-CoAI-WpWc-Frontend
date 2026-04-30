
<template>
   <el-form ref="userRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="用户名称">
        {{form.userName}}
      </el-form-item>
      <el-form-item label="手机号码">
        <div class="contact-container">
            <span>{{form.phonenumber || '未绑定'}}</span>
            <el-button v-if="form.email && !form.phonenumber" class="bind-btn" type="primary" plain size="small" @click="openBindDialog('phone')">去绑定手机</el-button>
        </div>
        </el-form-item>
      <el-form-item label="邮箱"  >
        <div class="contact-container">
            <span>{{form.email}}</span>
            <el-button v-if="form.phonenumber && !form.email" class="bind-btn" type="primary" plain size="small" @click="openBindDialog('email')">去绑定邮箱</el-button>
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
          <el-button v-if="registerStatus === '0'" type="danger" plain @click="openDeleteAccountDialog">注销账号</el-button>
          <el-tag v-else-if="registerStatus === '1'" type="info" effect="plain">已停用</el-tag>
          <div v-else-if="registerStatus === '2'" class="cancel-status-wrapper">
            <el-tag type="warning" effect="plain">注销中</el-tag>
            <el-tooltip content="提交注销申请后，有7天的冷却期，7天后将彻底注销账号并清除数据。" placement="top">
              <el-icon class="cancel-tip-icon"><Warning /></el-icon>
            </el-tooltip>
            <span class="cool-period">提交注销申请时间：{{ applyTime }}</span>
          </div>
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
          <el-input :value="backupContact" placeholder="请输入备用手机号" style="width: 280px" />
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
        <p class="delete-warning">冷却期内，账号、用户名、手机号/邮箱全部保持占用，不释放、不允许他人注册登录。</p>
        
        <template v-if="form.phonenumber && form.email">
          <el-form :model="deleteForm" :rules="deleteFormRules" class="delete-form">
            <el-form-item prop="contact">
              <el-input
                v-model="deleteForm.contact"
                placeholder="请输入已绑定的手机或邮箱"
              >
              </el-input>
            </el-form-item>
            <el-form-item prop="code">
              <div class="captcha-row">
                <el-input
                  v-model="deleteForm.code"
                  placeholder="请输入验证码"
                  style="width: 180px"
                >
                </el-input>
                <el-button
                  type="primary"
                  size="small"
                  :disabled="deleteCountdown > 0"
                  style="margin-left: 10px"
                  @click="sendDeleteVerificationCode"
                >
                  {{ deleteCountdown > 0 ? `${deleteCountdown}s后重试` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </template>
        
        <template v-else>
          <div class="single-contact-tip" v-if="form.phonenumber">
            将使用 <span class="contact-value">{{ form.phonenumber }}</span> 收取验证码
          </div>
          <div class="single-contact-tip" v-else-if="form.email">
            将使用 <span class="contact-value">{{ form.email }}</span> 收取验证码
          </div>
          
          <!-- <el-radio-group v-model="deleteForm.verificationType" class="verification-type-group" v-if="form.phonenumber && form.email">
            <el-radio label="sms">手机验证码</el-radio>
            <el-radio label="email">邮箱验证码</el-radio>
          </el-radio-group>
           -->
          <el-radio-group v-model="deleteForm.verificationType" class="verification-type-group" v-else>
            <el-radio label="sms" v-if="form.phonenumber">手机验证码</el-radio>
            <el-radio label="email" v-if="form.email">邮箱验证码</el-radio>
            <el-radio label="password">密码验证</el-radio>
          </el-radio-group>

          <el-form :model="deleteForm" :rules="deleteFormRules" class="delete-form">
            <el-form-item v-if="deleteForm.verificationType !== 'password'" prop="code">
              <div class="captcha-row">
                <el-input
                  v-model="deleteForm.code"
                  placeholder="请输入验证码"
                  style="width: 180px"
                >
                </el-input>
                <el-button
                  type="primary"
                  size="small"
                  :disabled="deleteCountdown > 0"
                  style="margin-left: 10px"
                  @click="sendDeleteVerificationCode"
                >
                  {{ deleteCountdown > 0 ? `${deleteCountdown}s后重试` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item v-if="deleteForm.verificationType === 'password'" prop="password">
              <el-input
                v-model="deleteForm.password"
                type="password"
                placeholder="请输入密码"
              >
              </el-input>
            </el-form-item>
          </el-form>
        </template>
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
import { getBackupContact, bindBackupContact, applyLogout } from "@/api/system/userInfoNew"
import { checkHuman, sendSmsCode, sendEmailCode, getCodeImg } from "@/api/newRegister"
import { getRegisterUserList, getCancelledUserList } from "@/api/system/registerUser"
import { Refresh, Warning } from '@element-plus/icons-vue'
import useUserStore from '@/store/modules/user'

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
// const rules = ref({
//   // nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
//   email: [{ required: true, message: "邮箱地址不能为空", trigger: "blur" }, { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
//   phonenumber: [{ required: true, message: "手机号码不能为空", trigger: "blur" }, { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }],
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

// Delete account related variables
const showDeleteDialog = ref(false)
const deleteForm = ref({
  verificationType: 'sms',
  code: '',
  password: '',
  contact: ''
})
const deleteFormRules = {
  contact: [
    { required: true, trigger: 'blur', message: '请输入已绑定的手机或邮箱' }
  ],
  code: [
    { required: true, trigger: 'blur', message: '请输入验证码' }
  ],
  password: [
    { required: true, trigger: 'blur', message: '请输入密码' }
  ]
}
const deleteCountdown = ref(0)
const deleteCaptchaLocked = ref(false)
const deleteCaptchaFailCount = ref(0)
const deleteCaptchaLockCountdown = ref(0)
const registerStatus = ref(null)
const applyTime = ref('')
const coolEndTime = ref('')

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
  bindDialogTitle.value = type === 'phone' ? '绑定备用手机' : '绑定备用邮箱'
  showBindDialog.value = true
  
  // 获取备用联系方式
  getBackupContact().then(response => {
    if (response.code === 200) {
      backupContact.value = type === 'phone' ? response.data.backupPhone : response.data.backupEmail
    } else {
      ElMessage.error(response.msg || '获取备用联系方式失败')
    }
  })
}

// 获取图形验证码
function getCode() {
  getCodeImg().then(res => {
    captchaUuid.value = res.uuid
    codeUrl.value = "data:image/gif;base64," + res.img
  })
}

// 验证图形验证码
function verifyCaptcha() {
  captchaRef.value.validate(valid => {
    if (valid) {
      checkHuman({ uuid: captchaUuid.value, code: captchaForm.value.checkCode }).then(res => {
        if (res.code === 200) {
          showCaptchaDialog.value = false
          // 判断是绑定还是注销账号的验证码
          if (showBindDialog.value) {
            sendVerifyCode()
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
  showCaptchaDialog.value = true
  getCode()
}

// 发送验证码
function sendVerifyCode() {
  sendingCode.value = true
  const data = bindType.value === 'phone' 
    ? { phone: backupContact.value }
    : { email: backupContact.value }
  
  const sendCodePromise = bindType.value === 'phone' ? sendSmsCode(data) : sendEmailCode(data)
  
  sendCodePromise.then(() => {
    ElMessage.success('验证码发送成功')
    startCountdown()
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
      const data = bindType.value === 'phone' 
        ? { bindPhone: backupContact.value, verifyCode: bindForm.value.verifyCode }
        : { bindEmail: backupContact.value, verifyCode: bindForm.value.verifyCode }
      
      bindBackupContact(data).then(response => {
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
  
  showDeleteDialog.value = true
}

function sendDeleteVerificationCode() {
  if (deleteCaptchaLocked.value) {
    ElMessage.warning(`操作频繁，请${deleteCaptchaLockCountdown.value}秒后再试`)
    return
  }
  
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
  const userId = props.user?.userId
  if (!userId) {
    ElMessage.error('获取用户信息失败')
    return
  }
  
  const requestData = {
    userId: userId,
    account: form.value.phonenumber || form.value.email,
    verifyCode: deleteForm.value.verificationType === 'password' ? deleteForm.value.password : deleteForm.value.code
  }
  
  applyLogout(requestData).then(response => {
    if (response.code === 200) {
      ElMessage.success(response.msg || '注销申请提交成功，7天后自动注销')
      showDeleteDialog.value = false
    } else {
      ElMessage.error(response.msg || '注销申请失败')
    }
  })
}
// 回显当前登录用户信息
watch(() => props.user, user => {
  if (user) {
    form.value = { userName: user.userName, phonenumber: user.phonenumber, email: user.email, sex: user.sex }
    
    const userName = user.userName
    const userId = user.userId
    if (userName) {
      getRegisterUserList({ userName: userName }, {}).then(res => {
        if (res.code === 200 && res.rows && res.rows.length > 0) {
          registerStatus.value = res.rows[0].status
        } 
      })
    }
    
    if (userId) {
      getCancelledUserList({ userId: userId }, {}).then(res => {
        if (res.code === 200 && res.rows && res.rows.length > 0) {
          const cancelledData = res.rows[0]
          applyTime.value = formatDateTime(cancelledData.applyTime)
          coolEndTime.value = formatDateTime(cancelledData.coolEndTime)
        }
      })
    }
  }
},{ immediate: true })

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

.bind-btn {
  margin-left: 10px;
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
