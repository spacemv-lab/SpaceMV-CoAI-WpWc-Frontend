<template>
  <div class="register">
    <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
      <h3 class="title">{{ title }}</h3>
      <el-form-item prop="username">
        <el-input
          v-model="registerForm.username"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="请输入用户名"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
        <div v-if="showUsernameExistsError" class="username-exists-error">
          用户名已存在，<span class="clickable-link" @click="router.push('/login')">去登录</span>
        </div>
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="密码（8-20位，支持字母和数字组合）"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="确认密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="contact">
        <el-input
          v-model="registerForm.contact"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="请输入手机号或邮箱"
        >
          <template #prefix><svg-icon icon-class="phone" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <el-input
          size="large"
          v-model="registerForm.code"
          auto-complete="off"
          :placeholder="codePlaceholder"
          style="width: 63%"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="register-code">
          <el-button
            size="large"
            type="info"
            @click="getVerificationCode"
            :disabled="countdown > 0 || captchaLocked"
          >
            {{ captchaLocked ? `${captchaLockCountdown}秒后重试` : (countdown > 0 ? `${countdown}秒后重试` : '获取验证码') }}
          </el-button>
        </div>
      </el-form-item>
      <div class="backup-contact-row">
        <span class="backup-contact-text">补充备用联系方式，找回账号更方便</span>
        <a href="javascript:void(0)" class="toggle-link" @click="toggleBackupContact">
          {{ showBackupContact ? '收起' : '展开' }}
        </a>
      </div>
      <el-form-item v-if="showBackupContact" prop="backupContact">
        <el-input
          v-model="registerForm.backupContact"
          type="text"
          size="large"
          auto-complete="off"
          :placeholder="backupContactPlaceholder"
        >
          <template #prefix><svg-icon icon-class="edit" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="agree" class="agreement">
        <el-checkbox v-model="registerForm.agree">
          我已阅读并同意 <router-link to="/terms" class="agreement-link" target="_blank">《服务条款》</router-link> 和 <router-link to="/privacy" class="agreement-link" target="_blank">《隐私声明》</router-link>
        </el-checkbox>
      </el-form-item>
      <div class="login-actions">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          style="width:100%;"
          @click.prevent="handleRegister"
        >
          <span v-if="!loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
        <div style="float: right; margin-top: 10px;">
          <router-link class="link-type" :to="'/login'">使用已有账户登录</router-link>
        </div>
      </div>
    </el-form>

    <!-- 安全验证弹窗 -->
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

    <!-- 注册成功页面 -->
    <el-dialog
      v-model="showSuccessDialog"
      title="注册成功"
      width="40%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      show-close="false"
    >
      <div class="success-content">
        <div class="success-icon">
          <el-icon class="success-icon-large"><CircleCheckFilled /></el-icon>
        </div>
        <h3>注册成功！</h3>
        <p>您的账号已生效，现在可以登录系统</p>
        <div class="success-actions">
          <el-button @click="showSuccessDialog = false; router.push('/login')">立即登录</el-button>
        </div>
      </div>
    </el-dialog>

    <!--  底部  -->
    <div class="el-register-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, computed } from "vue"
import { ElMessageBox, ElMessage } from "element-plus"
import { CircleCheckFilled, Refresh } from '@element-plus/icons-vue'
import { checkUnique, register, checkHuman, sendSmsCode, sendEmailCode, getCodeImg } from "@/api/newRegister"
import defaultSettings from '@/settings'
import { useRouter } from 'vue-router'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const router = useRouter()
const { proxy } = getCurrentInstance()

const SENSITIVE_WORDS = ['admin', 'root', '系统', '管理员', 'administrator', 'superadmin', 'system', 'manage', 'manager', 'test', '测试']

const registerForm = ref({
  username: "",
  contact: "",
  password: "",
  confirmPassword: "",
  code: "",
  backupContact: "",
  agree: false
})

const showBackupContact = ref(false)
const showUsernameExistsError = ref(false)
const codeUrl = ref("")
const captchaEnabled = ref(true)
const loading = ref(false)
const countdown = ref(0)
const showSuccessDialog = ref(false)

const showCaptchaDialog = ref(false)
const captchaForm = ref({ checkCode: "" })
const captchaRef = ref(null)
const captchaUuid = ref("")
const captchaFailCount = ref(0)
const captchaLocked = ref(false)
const captchaLockCountdown = ref(0)

const validateCaptchaCheckCode = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入图形验证码"))
    return
  }
  callback()
}

const captchaRules = {
  checkCode: [
    { required: true, validator: validateCaptchaCheckCode, trigger: "blur" }
  ]
}

const codePlaceholder = computed(() => {
  const isEmail = registerForm.value.contact.includes('@')
  if (!registerForm.value.contact) {
    return '请填写验证码'
  }
  return isEmail ? '邮箱验证码' : '手机验证码'
})

const backupContactPlaceholder = computed(() => {
  const isEmail = registerForm.value.contact.includes('@')
  if (!registerForm.value.contact) {
    return '请输入备用联系方式'
  }
  return isEmail ? '请输入备用手机号' : '请输入备用邮箱'
})

const toggleBackupContact = () => {
  showBackupContact.value = !showBackupContact.value
}

const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入用户名"))
    return
  }
  if (value.length > 20) {
    callback(new Error("用户名长度不能超过20个字符"))
    return
  }
  if (/^\d+$/.test(value)) {
    callback(new Error("用户名不能为纯数字"))
    return
  }
  if (/\s/.test(value)) {
    callback(new Error("用户名不能包含空格"))
    return
  }
  if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(value)) {
    callback(new Error("用户名只能包含中文、英文、数字和下划线"))
    return
  }
  const lowerValue = value.toLowerCase()
  for (const word of SENSITIVE_WORDS) {
    if (lowerValue.includes(word.toLowerCase())) {
      callback(new Error(`用户名不能包含敏感词"${word}"`))
      return
    }
  }
  callback()
}



const validateContact = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入手机号或邮箱"))
    return
  }
  if (value.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      callback(new Error("请输入正确的邮箱格式"))
    } else {
      callback()
    }
  } else {
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(value)) {
      callback(new Error("请输入正确的手机号格式"))
    } else {
      callback()
    }
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入密码"))
    return
  }
  if (value.length < 8 || value.length > 20) {
    callback(new Error("密码长度需在 8-20 位之间"))
    return
  }
  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    callback(new Error("密码只能包含字母和数字"))
    return
  }
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
    callback(new Error("密码需包含字母和数字组合"))
    return
  }
  callback()
}

const equalToPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请再次输入您的密码"))
    return
  }
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}

const validateCode = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请输入验证码"))
    return
  }
  if (!/^\d{6}$/.test(value)) {
    callback(new Error("验证码为6位数字"))
    return
  }
  callback()
}

const validateBackupContact = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const isEmail = registerForm.value.contact.includes('@')
  if (isEmail) {
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(value)) {
      callback(new Error("请输入正确的手机号格式"))
    } else {
      callback()
    }
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      callback(new Error("请输入正确的邮箱格式"))
    } else {
      callback()
    }
  }
}

const validateAgree = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请阅读并勾选服务条款"))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, trigger: "blur", validator: validateUsername },
    {
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (value && value.length > 0) {
          checkUnique({ accountName: value }).then(res => {
            if (res.code === 200 && res.data === false) {
              showUsernameExistsError.value = true
            } else {
              showUsernameExistsError.value = false
              callback()
            }
          }).catch(() => {
            showUsernameExistsError.value = false
            callback()
          })
        } else {
          showUsernameExistsError.value = false
          callback()
        }
      }
    }
  ],
  contact: [
    { required: true, trigger: "blur", validator: validateContact }
  ],
  password: [
    { required: true, trigger: "blur", validator: validatePassword }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", validator: equalToPassword }
  ],
  code: [
    { required: true, trigger: "blur", validator: validateCode }
  ],
  backupContact: [
    { trigger: "blur", validator: validateBackupContact }
  ],
  agree: [
    { required: true, validator: validateAgree, trigger: "change" }
  ]
}

function handleRegister() {
  proxy.$refs.registerRef.validate(valid => {
    if (valid) {
      loading.value = true
      const isEmail = registerForm.value.contact.includes('@')
      const hasEmailCode = isEmail && registerForm.value.code
      const hasPhoneCode = !isEmail && registerForm.value.code
      const registerData = {
        phonenumber: hasEmailCode ? registerForm.value.backupContact : (isEmail ? '' : registerForm.value.contact),
        email: hasPhoneCode ? registerForm.value.backupContact : (isEmail ? registerForm.value.contact : ''),
        username: registerForm.value.username,
        password: registerForm.value.password,
        source: 'from-source',
        phoneVerifyCode: isEmail ? '' : registerForm.value.code,
        emailVerifyCode: isEmail ? registerForm.value.code : ''
      }
      register(registerData).then(res => {
        loading.value = false
        showSuccessDialog.value = true
      }).catch(error => {
        loading.value = false
        if (error.response && error.response.data && error.response.data.code === 400 && error.response.data.message.includes('账号已存在')) {
          ElMessageBox.confirm(
            '账号已存在，是否跳转到登录页面？',
            '系统提示',
            {
              confirmButtonText: '去登录',
              cancelButtonText: '填写新账号',
              type: 'warning'
            }
          ).then(() => {
            router.push('/login')
          }).catch(() => {})
        }
      })
    }
  })
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img
      captchaUuid.value = res.uuid
    }
  })
}

function lockCaptcha() {
  captchaLocked.value = true
  captchaLockCountdown.value = 60
  const timer = setInterval(() => {
    captchaLockCountdown.value--
    if (captchaLockCountdown.value <= 0) {
      clearInterval(timer)
      captchaLocked.value = false
      captchaFailCount.value = 0
    }
  }, 1000)
}

function getVerificationCode() {
  if (captchaLocked.value) {
    ElMessage.warning(`操作频繁，请${captchaLockCountdown.value}秒后再试`)
    return
  }

  const contact = registerForm.value.contact
  if (!contact) {
    ElMessage.error('请输入手机号或邮箱')
    return
  }

  const isEmail = contact.includes('@')
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^1[3-9]\d{9}$/
  if (isEmail && !emailRegex.test(contact)) {
    ElMessage.error('请输入正确的邮箱格式')
    return
  }
  if (!isEmail && !phoneRegex.test(contact)) {
    ElMessage.error('请输入正确的手机号格式')
    return
  }

  if (captchaEnabled.value) {
    showCaptchaDialog.value = true
    captchaForm.value.checkCode = ""
    getCode()
  } else {
    doSendVerificationCode()
  }
}

function verifyCaptcha() {
  captchaRef.value.validate((valid) => {
    if (valid) {
      checkHuman({ uuid: captchaUuid.value, code: captchaForm.value.checkCode }).then(res => {
        if (res.code === 200) {
          showCaptchaDialog.value = false
          doSendVerificationCode()
        } else {

          getCode()
        }
      }).catch(() => {

        getCode()
      })
    }
  })
}

function doSendVerificationCode() {
  const contact = registerForm.value.contact
  const isEmail = contact.includes('@')
  const sendData = { [isEmail ? 'email' : 'phone']: contact }

  const sendCodePromise = isEmail ? sendEmailCode(sendData) : sendSmsCode(sendData)

  sendCodePromise.then(res => {
    if (res.code === 200) {
      ElMessage.success(res.msg || '验证码已发送')
      startCountdown()
    } else {
      ElMessage.error(res.msg || '验证码发送失败')
    }
  }).catch(error => {
    ElMessage.error(error.response?.data?.msg || '验证码发送失败')
  })
}

function startCountdown() {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

getCode()
</script>

<style lang='scss' scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
  background-position: center;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(5px);
  }
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #333;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.register-form {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  width: 420px;
  padding: 40px 35px 30px 35px;
  z-index: 1;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  .el-form-item {
    margin-bottom: 25px;
    position: relative;

    &:last-child {
      margin-bottom: 20px;
    }
  }

  .el-input {
    height: 40px;
    border-radius: 8px;
    transition: all 0.3s ease;

    input {
      height: 40px;
      border-radius: 8px;
      font-size: 14px;
      border: 2px solid #e8e8e8;
      transition: all 0.3s ease;

      &:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
    }

    .el-input__wrapper {
      box-shadow: none;
      border-radius: 8px;
    }

    .el-input__prefix {
      left: 15px;
    }
  }

  .input-icon {
    height: 16px;
    width: 16px;
    color: #909399;
    transition: color 0.3s ease;
  }

  .el-input:focus-within .input-icon {
    color: #667eea;
  }

  .el-button {
    height: 40px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 1px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
      background: linear-gradient(135deg, #5a6fd8 0%, #6b46c1 100%);
    }

    &:active {
      transform: translateY(0);
    }

    &.is-loading {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  }

  .link-type {
    font-size: 13px;
    color: #667eea;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #5a6fd8;
    }
  }

  .backup-contact-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 5px;

    .backup-contact-text {
      font-size: 13px;
      color: #909399;
    }

    .toggle-link {
      font-size: 13px;
      color: #667eea;
      text-decoration: none;
      transition: color 0.3s ease;

      &:hover {
        color: #5a6fd8;
      }
    }
  }

  .agreement {
    margin-bottom: 20px;

    .agreement-link {
      color: #667eea;
      text-decoration: none;
    }
  }

  .username-exists-error {
    color: #f56c6c;
    font-size: 12px;
    line-height: 1.5;
    position: absolute;
    bottom: -20px;
    left: 0;
    
    .clickable-link {
      color: #667eea;
      cursor: pointer;
      
      &:hover {
        color: #5a6fd8;
      }
    }
  }
}

.register-code {
  width: 35%;
  height: 40px;
  float: right;
  margin-left: 6px;
  overflow: hidden;

  .el-button {
    height: 40px;
    width: 100%;
    border-radius: 8px;
  }
}

.captcha-dialog-content {
  padding: 10px 0;

  .captcha-tip {
    margin-bottom: 20px;
    color: #606266;
    font-size: 14px;
  }

  .captcha-row {
    display: flex;
    align-items: center;

    .captcha-image-wrapper {
      position: relative;
      margin-left: 12px;
      display: flex;
      align-items: center;

      .captcha-img {
        height: 40px;
        cursor: pointer;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
      }

      .refresh-icon {
        margin-left: 8px;
        cursor: pointer;
        font-size: 18px;
        color: #909399;

        &:hover {
          color: #667eea;
        }
      }
    }
  }
}

.success-content {
  text-align: center;
  padding: 20px 0;

  .success-icon {
    margin-bottom: 20px;

    .success-icon-large {
      font-size: 60px;
      color: #67c23a;
    }
  }

  h3 {
    margin-bottom: 10px;
    color: #303133;
  }

  p {
    margin-bottom: 30px;
    color: #606266;
  }

  .success-actions {
    margin-top: 20px;
  }
}

.el-register-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
</style>