/**
 * Copyright (c) 2018 RuoYi | Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
  <div class="forget-password">
    <div class="forget-password-form">
      <h3 class="title">找回密码</h3>

      <el-form ref="forgotRef" :model="forgotForm" :rules="forgotRules" v-if="step === 1">
        <p class="forgot-tip">请输入您已经绑定的手机号或邮箱</p>
        <el-form-item prop="contact">
          <el-input
            v-model="forgotForm.contact"
            type="text"
            auto-complete="off"
            placeholder="请输入手机号或邮箱"
          >
            <template #prefix><svg-icon icon-class="phone" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="code">
          <el-input
            v-model="forgotForm.code"
            auto-complete="off"
            placeholder="请输入验证码"
            style="width: 63%"
            @keyup.enter="verifyCode"
          >
            <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
          </el-input>
          <div class="login-code">
            <el-button
              size="large"
              type="primary"
              @click="getCode"
              :disabled="countdown > 0"
            >
              {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <el-form ref="resetRef" :model="resetForm" :rules="resetRules" v-else-if="step === 2">
        <p class="forgot-tip">请设置新密码</p>
        <el-form-item prop="password">
          <el-input
            v-model="resetForm.password"
            type="password"
            auto-complete="off"
            placeholder="密码（8-20位，支持字母和数字组合）"
          >
            <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="resetForm.confirmPassword"
            type="password"
            auto-complete="off"
            placeholder="确认密码"
            @keyup.enter="handleResetPassword"
          >
            <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
      </el-form>

      <div class="form-footer">
        <el-button @click="goBack">返回登录</el-button>
        <el-button type="primary" @click="step === 1 ? toResetPwd() : handleResetPassword()">
          {{ step === 1 ? '重置密码' : '确定' }}
        </el-button>
      </div>

    </div>

    <!--  底部  -->
    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>

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
              <img :src="codeUrl" @click="getCaptcha" class="captcha-img"/>
              <el-icon class="refresh-icon" @click="getCaptcha"><Refresh /></el-icon>
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { sendSmsCode, sendEmailCode, getCodeImg, checkHuman } from '@/api/newRegister'
import { verifyCode, checkUnique, resetPassword } from '@/api/forgetPassword'
import defaultSettings from '@/settings'

const router = useRouter()


const footerContent = defaultSettings.footerContent

const step = ref(1)
const countdown = ref(0)
const forgotRef = ref(null)
const resetRef = ref(null)

// Captcha related variables
const showCaptchaDialog = ref(false)
const captchaForm = ref({ checkCode: "" })
const captchaRef = ref(null)
const captchaRules = {
  checkCode: [
    { required: true, trigger: "blur", message: "请输入图形验证码" }
  ]
}
const codeUrl = ref("")
const captchaUuid = ref("")
const captchaEnabled = ref(true)
const captchaLocked = ref(false)
const captchaFailCount = ref(0)
const captchaLockCountdown = ref(0)

const forgotForm = ref({
  contact: '',
  code: ''
})

const resetForm = ref({
  password: '',
  confirmPassword: ''
})

const forgotRules = {
  contact: [{ required: true, trigger: 'blur', message: '请输入手机号或邮箱' }],
  code: [{ required: true, trigger: 'blur', message: '请输入验证码' }]
}

const resetRules = {
  password: [
    { required: true, trigger: 'blur', message: '请输入密码' },
    { min: 8, max: 20, trigger: 'blur', message: '密码长度为8-20位' },
    { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/, trigger: 'blur', message: '密码必须包含字母和数字' }
  ],
  confirmPassword: [
    { required: true, trigger: 'blur', message: '请确认密码' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetForm.value.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

function getCode() {
  const contact = forgotForm.value.contact
  if (!contact) {
    ElMessage.error('请先填写手机号或邮箱')
    return
  }

  // Validate contact format
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

  if (captchaLocked.value) {
    ElMessage.warning(`操作频繁，请${captchaLockCountdown.value}秒后再试`)
    return
  }

  // Show captcha dialog
  showCaptchaDialog.value = true
  captchaForm.value.checkCode = ""
  getCaptcha()
}

function getCaptcha() {
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

function verifyCaptcha() {
  captchaRef.value.validate((valid) => {
    if (valid) {
      checkHuman({ uuid: captchaUuid.value, code: captchaForm.value.checkCode }).then(res => {
        if (res.code === 200) {
          showCaptchaDialog.value = false
          doSendVerificationCode()
        } else {
          ElMessage.error('图形验证码错误')
          getCaptcha()
          captchaFailCount.value++
          if (captchaFailCount.value >= 3) {
            lockCaptcha()
          }
        }
      }).catch(() => {
        ElMessage.error('图形验证码验证失败')
        getCaptcha()
        captchaFailCount.value++
        if (captchaFailCount.value >= 3) {
          lockCaptcha()
        }
      })
    }
  })
}

function doSendVerificationCode() {
  const contact = forgotForm.value.contact
  const isEmail = contact.includes('@')
  const sendData = { [isEmail ? 'email' : 'phone']: contact }

  const sendCodePromise = isEmail ? sendEmailCode(sendData) : sendSmsCode(sendData)

  sendCodePromise.then(res => {
    if (res.code === 200) {
      ElMessage.success(res.msg || '验证码发送成功')
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

function toResetPwd() {
  forgotRef.value.validate((valid) => {
    if (valid) {
      const contact = forgotForm.value.contact
      const code = forgotForm.value.code

      Promise.all([
        verifyCode({account: contact, code: code}),
        checkUnique({accountName: contact})
      ]).then(([verifyRes, checkRes]) => {
        if (verifyRes.code === 200 && verifyRes.data === true && checkRes.code === 200 && checkRes.data === false) {
          step.value = 2
        } else {
          ElMessage.error('账号验证失败')
        }
      })
    }
  })
}

function handleResetPassword() {
  resetRef.value.validate((valid) => {
    if (valid) {
      const contact = forgotForm.value.contact
      const resetData = {
        accountName: contact,
        password: resetForm.value.password
      }

      resetPassword(resetData).then(res => {
        if (res.code === 200 && res.data === true) {
          ElMessage.success('密码重置成功')
          router.push('/login')
        } else {
          ElMessage.error(res.msg || '密码重置失败')
        }
      }).catch(error => {
        ElMessage.error(error.response?.data?.msg || '密码重置失败')
      })
    }
  })
}

function resetFormFn() {
  step.value = 1
  forgotForm.value = { contact: '', code: '' }
  resetForm.value = { password: '', confirmPassword: '' }
  countdown.value = 0
  if (forgotRef.value) {
    forgotRef.value.resetFields()
  }
  if (resetRef.value) {
    resetRef.value.resetFields()
  }
}

function goBack() {
  router.push('/login')
}

// Initialize captcha
getCaptcha()
</script>

<style lang="scss" scoped>
.forget-password {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
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

.forget-password-form {
  width: 400px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1;
}

.title {
  text-align: center;
  margin: 0 auto 30px auto;
  font-size: 24px;
  font-weight: 600;
  color: #606266;
//   letter-spacing: 1px;
//   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//   -webkit-background-clip: text;
//   -webkit-text-fill-color: transparent;
//   background-clip: text;
}

.forgot-tip {
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
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

.login-code {
  display: inline-block;
  vertical-align: middle;
  margin-left: 10px;

  .el-button {
    height: 40px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: #fff;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
      background: linear-gradient(135deg, #5a6fd8 0%, #6b46c1 100%);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  
  .el-button {
    height: 40px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    padding: 0 20px;
    transition: all 0.3s ease;
    
    &.el-button--primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: #fff;
      
      &:hover {
        opacity: 0.9;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
    }
    
  }
}


.captcha-dialog-content {
  .captcha-tip {
    margin-bottom: 20px;
    color: #606266;
    font-size: 14px;
  }

  .captcha-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .captcha-image-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .captcha-img {
    width: 120px;
    height: 40px;
    cursor: pointer;
    border-radius: 4px;
  }

  .refresh-icon {
    position: absolute;
    right: -25px;
    cursor: pointer;
    color: #667eea;
    font-size: 16px;
    transition: color 0.3s ease;

    &:hover {
      color: #5a6fd8;
    }
  }
}

.el-login-footer {
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