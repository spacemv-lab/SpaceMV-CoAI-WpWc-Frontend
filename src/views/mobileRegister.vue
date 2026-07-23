<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->
<template>
  <div class="mobile-register ignore-vw">
    <div class="mobile-register-shell">
      <div class="mobile-register-panel">
        <h1 class="mobile-title">{{ title }}</h1>
        <p class="mobile-subtitle">创建账号，开启您的旅程</p>

        <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="mobile-form">
          <el-form-item prop="username" class="mobile-account-item">
            <el-input
              v-model="registerForm.username"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="请输入用户名"
              @input="registerForm.username === '' && (showUsernameExistsError = false)"
            >
              <template #prefix><svg-icon icon-class="user" class="mobile-input-icon" /></template>
            </el-input>
            <div v-if="showUsernameExistsError" class="mobile-error-tip">
              用户名已存在，<span class="mobile-link-inline" @click="router.push('/login')">去登录</span>
            </div>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="密码（8-20位，支持字母和数字组合）"
              show-password
              @keyup.enter="handleRegister"
            >
              <template #prefix><svg-icon icon-class="password" class="mobile-input-icon" /></template>
            </el-input>
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="确认密码"
              show-password
              @keyup.enter="handleRegister"
            >
              <template #prefix><svg-icon icon-class="password" class="mobile-input-icon" /></template>
            </el-input>
          </el-form-item>

          <el-form-item prop="contact" class="mobile-account-item">
            <el-input
              v-model="registerForm.contact"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="请输入手机号或邮箱"
            >
              <template #prefix><svg-icon icon-class="phone" class="mobile-input-icon" /></template>
            </el-input>
            <div v-if="showContactExistsError" class="mobile-error-tip">
              该联系方式已被注册
            </div>
          </el-form-item>

          <el-form-item prop="code" class="captcha-form-item">
            <div class="captcha-input-row">
              <el-input
                size="large"
                v-model="registerForm.code"
                auto-complete="off"
                :placeholder="codePlaceholder"
                @keyup.enter="handleRegister"
              >
                <template #prefix><svg-icon icon-class="validCode" class="mobile-input-icon" /></template>
              </el-input>
              <el-button
                size="large"
                type="primary"
                class="sms-btn"
                :disabled="countdown > 0 || captchaLocked"
                @click="getVerificationCode"
              >
                {{ captchaLocked ? `${captchaLockCountdown}s` : (countdown > 0 ? `${countdown}s` : '获取验证码') }}
              </el-button>
            </div>
          </el-form-item>

          <div class="backup-contact-row">
            <span class="backup-contact-text">补充备用联系方式</span>
            <a href="javascript:void(0)" class="toggle-link" @click="toggleBackupContact">
              {{ showBackupContact ? '收起' : '展开' }}
            </a>
          </div>

          <el-form-item v-if="showBackupContact" prop="backupContact">
            <el-input
              v-model="backupContactValue"
              type="text"
              size="large"
              auto-complete="off"
              :placeholder="backupContactPlaceholder"
            >
              <template #prefix><svg-icon icon-class="edit" class="mobile-input-icon" /></template>
            </el-input>
          </el-form-item>

          <el-form-item prop="agree" class="agreement-item">
            <el-checkbox v-model="registerForm.agree">
              我已阅读并同意 <router-link to="/terms" class="agreement-link" target="_blank">《服务条款》</router-link> 和 <router-link to="/privacy" class="agreement-link" target="_blank">《隐私声明》</router-link>
            </el-checkbox>
          </el-form-item>

          <el-button
            :loading="loading"
            size="large"
            type="primary"
            class="mobile-submit-btn"
            @click.prevent="handleRegister"
          >
            <span v-if="!loading">注 册</span>
            <span v-else>注 册 中...</span>
          </el-button>

          <div class="mobile-bottom-links">
            <router-link class="mobile-link strong" :to="'/login'">使用已有账户登录</router-link>
          </div>
        </el-form>
      </div>
    </div>

    <div class="mobile-register-footer">
      <span>{{ footerContent }}</span>
    </div>

    <!-- 安全验证弹窗 -->
    <el-dialog
      v-model="showCaptchaDialog"
      title="安全验证"
      width="calc(100vw - 32px)"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      align-center
      class="mobile-captcha-dialog"
    >
      <el-form ref="captchaRef" :model="captchaForm" :rules="captchaRules">
        <p class="captcha-tip">请完成以下验证，以获取验证码</p>
        <el-form-item prop="checkCode">
          <div class="captcha-dialog-row">
            <el-input
              v-model="captchaForm.checkCode"
              placeholder="请输入图形验证码"
              size="large"
              @keyup.enter="verifyCaptcha"
            />
            <div class="captcha-dialog-img-wrap">
              <img :src="codeUrl" @click="getCode" class="captcha-dialog-img" alt="验证码" />
              <el-icon class="captcha-refresh-icon" @click="getCode"><Refresh /></el-icon>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="captcha-dialog-footer">
          <el-button size="large" @click="showCaptchaDialog = false" class="captcha-cancel-btn">取消</el-button>
          <el-button size="large" type="primary" @click="verifyCaptcha" class="captcha-confirm-btn">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 注册成功弹窗 -->
    <el-dialog
      v-model="showSuccessDialog"
      title="注册成功"
      width="calc(100vw - 48px)"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      align-center
      class="mobile-captcha-dialog"
      show-close="false"
    >
      <div class="success-content">
        <div class="success-icon">
          <el-icon class="success-icon-large"><CircleCheckFilled /></el-icon>
        </div>
        <h3>注册成功！</h3>
        <p>您的账号已生效，现在可以登录系统</p>
        <div class="success-actions">
          <el-button
            size="large"
            type="primary"
            class="mobile-submit-btn"
            @click="showSuccessDialog = false; router.push('/login')"
          >立即登录</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, computed } from "vue"
import { ElMessage } from "element-plus"
import { CircleCheckFilled, Refresh } from '@element-plus/icons-vue'
import { checkUnique, register, checkHuman, sendCode, getCodeImg } from "@/api/newRegister"
import defaultSettings from '@/settings'
import { useRouter } from 'vue-router'
import { encrypt } from "@/utils/jsencrypt"

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
  bakPhone: "",
  bakEmail: "",
  agree: false
})

const isPhoneRegister = computed(() => {
  const contact = registerForm.value.contact
  return contact && !contact.includes('@')
})

const isEmailRegister = computed(() => {
  const contact = registerForm.value.contact
  return contact && contact.includes('@')
})

const showBackupContact = ref(false)

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

const backupContactValue = computed({
  get: () => {
    return registerForm.value.backupContact
  },
  set: (value) => {
    registerForm.value.backupContact = value
  }
})

const showUsernameExistsError = ref(false)
const showContactExistsError = ref(false)
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

const validateBackupContact = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }

  const mainContact = registerForm.value.contact
  const isEmailRegister = mainContact.includes('@')

  if (isEmailRegister) {
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
          checkUnique({ fieldType: 'username', fieldValue: value, productLine: 'spacemv-coai' }).then(res => {
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
    { required: true, trigger: "blur", validator: validateContact },
    {
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (value && value.length > 0) {
          const fieldType = value.includes('@') ? 'email' : 'phone'
          checkUnique({ fieldType: fieldType, fieldValue: value, productLine: 'spacemv-coai' }).then(res => {
            if (res.code === 200 && res.data === false) {
              showContactExistsError.value = true
            } else {
              showContactExistsError.value = false
              callback()
            }
          }).catch(() => {
            showContactExistsError.value = false
            callback()
          })
        } else {
          showContactExistsError.value = false
          callback()
        }
      }
    }
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
      const registerData = {
        channelType: isEmail ? 'email' : 'phone',
        channelAccount: registerForm.value.contact,
        verifyCode: registerForm.value.code,
        password: encrypt(registerForm.value.password),
        username: registerForm.value.username,
        bakPhone: isEmail ? registerForm.value.backupContact : '',
        bakEmail: isEmail ? '' : registerForm.value.backupContact
      }
      register(registerData).then(res => {
        loading.value = false
        showSuccessDialog.value = true
      }).catch(error => {
        loading.value = false
        if (error.response && error.response.data && error.response.data.code === 400 && error.response.data.message.includes('账号已存在')) {
          ElMessage.warning('账号已存在，即将跳转到登录页面')
          setTimeout(() => {
            router.push('/login')
          }, 1500)
        }
      })
    }
  })
}

function getCode() {
  getCodeImg().then(res => {
    const data = res.data || res
    captchaEnabled.value = data.captchaEnabled === undefined ? true : data.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = `data:image/gif;base64,${data.img}`
      captchaUuid.value = data.uuid
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
    ElMessage.error('请先填写联系方式')
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
          ElMessage.error("图形验证码错误")
          getCode()
          captchaFailCount.value++
          if (captchaFailCount.value >= 3) {
            lockCaptcha()
          }
        }
      }).catch(() => {
        ElMessage.error("图形验证码验证失败")
        getCode()
        captchaFailCount.value++
        if (captchaFailCount.value >= 3) {
          lockCaptcha()
        }
      })
    }
  })
}

function doSendVerificationCode() {
  const contact = registerForm.value.contact
  const isEmail = contact.includes('@')
  const sendData = {
    channelType: isEmail ? 'email' : 'phone',
    channelAccount: contact
  }

  sendCode(sendData).then(res => {
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

<style lang="scss" scoped>
$brand-start: #5f7cf0;
$brand-end: #7c55c7;
$brand-text: #6473e5;
$brand-text-strong: #5b68df;
$border-color: #dde2ee;
$panel-bg: rgba(255, 255, 255, 0.92);
$panel-shadow: 0 30px 70px rgba(92, 110, 214, 0.16);
$error: #f56c6c;
$text-main: #4c5570;
$text-sub: #a0a7bb;
$line-soft: rgba(126, 136, 176, 0.16);

.ignore-vw.mobile-register {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  padding: calc(env(safe-area-inset-top, 0px) + 24px) 16px calc(env(safe-area-inset-bottom, 0px) + 18px);
  background:
    radial-gradient(circle at 16% 12%, rgba(126, 104, 241, 0.14), rgba(126, 104, 241, 0) 28%),
    radial-gradient(circle at 88% 12%, rgba(95, 124, 240, 0.16), rgba(95, 124, 240, 0) 24%),
    linear-gradient(180deg, #f8faff 0%, #f0f3fb 52%, #f7f8fc 100%);

  &::before,
  &::after {
    content: "";
    position: absolute;
    border-radius: 999px;
    pointer-events: none;
    filter: blur(10px);
  }

  &::before {
    top: -90px;
    right: -70px;
    width: 220px;
    height: 220px;
    background: rgba(124, 85, 199, 0.12);
  }

  &::after {
    left: -80px;
    bottom: 120px;
    width: 180px;
    height: 180px;
    background: rgba(95, 124, 240, 0.1);
  }

  .mobile-register-shell {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    position: relative;
    z-index: 1;
  }

  .mobile-register-panel {
    width: 100%;
    max-width: 368px;
    padding: 28px 18px 22px;
    border-radius: 28px;
    background: $panel-bg;
    box-shadow: $panel-shadow;
    border: 1px solid rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px);
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 88px;
      background: linear-gradient(180deg, rgba(109, 126, 236, 0.11), rgba(109, 126, 236, 0));
      pointer-events: none;
    }

    &::after {
      content: "";
      position: absolute;
      top: 18px;
      right: 18px;
      width: 82px;
      height: 82px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(124, 85, 199, 0.12), rgba(124, 85, 199, 0));
      pointer-events: none;
    }
  }

  .mobile-title {
    position: relative;
    margin: 0 0 8px;
    padding-top: 8px;
    text-align: center;
    font-size: 21px;
    line-height: 1.3;
    font-weight: 800;
    letter-spacing: 0.3px;
    background: linear-gradient(135deg, $brand-start 0%, $brand-end 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    word-break: break-word;
  }

  .mobile-subtitle {
    margin: 0 0 20px;
    text-align: center;
    color: #8791a8;
    font-size: 13px;
    line-height: 1.6;
  }

  .mobile-form {
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }

    :deep(.el-form-item.is-error) {
      margin-bottom: 22px;
    }

    :deep(.el-form-item__error) {
      padding-top: 6px;
      font-size: 12px;
      line-height: 1.35;
    }

    .mobile-account-item {
      margin-bottom: 14px;
    }

    .agreement-item {
      margin-bottom: 20px;

      :deep(.el-checkbox__label) {
        font-size: 13px;
        color: $text-main;
        line-height: 1.5;
      }
    }
  }

  :deep(.el-input) {
    --el-input-height: 46px;

    .el-input__wrapper {
      border-radius: 14px;
      padding: 0 14px;
      background: rgba(255, 255, 255, 0.98);
      box-shadow:
        0 8px 20px rgba(123, 136, 180, 0.05),
        inset 0 0 0 1px $border-color;
      border: 1px solid transparent;
      transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;

      &:hover {
        background: #fff;
        box-shadow:
          0 10px 24px rgba(123, 136, 180, 0.07),
          inset 0 0 0 1px rgba(108, 120, 214, 0.28);
      }

      &.is-focus {
        background: #fff;
        box-shadow:
          0 12px 26px rgba(101, 113, 220, 0.1),
          inset 0 0 0 1px rgba(102, 115, 229, 0.9),
          0 0 0 4px rgba(102, 115, 229, 0.08);
        transform: translateY(-1px);
      }
    }

    .el-input__inner {
      height: 46px;
      font-size: 14px;
      color: $text-main;
      -webkit-appearance: none;
      appearance: none;

      &::placeholder {
        color: $text-sub;
      }
    }
  }

  .mobile-input-icon {
    width: 15px;
    height: 15px;
    color: #b6bdcf;
  }

  .captcha-form-item {
    :deep(.el-form-item__content) {
      display: block;
    }
  }

  .captcha-input-row {
    display: flex;
    align-items: stretch;
    gap: 10px;

    :deep(.el-input) {
      flex: 1;
      min-width: 0;
    }
  }

  .sms-btn {
    width: 116px;
    min-width: 116px;
    height: 46px !important;
    padding: 0 10px !important;
    border: none !important;
    border-radius: 14px !important;
    background: linear-gradient(135deg, $brand-start 0%, $brand-end 100%) !important;
    box-shadow: 0 12px 22px rgba(102, 115, 229, 0.24);
    font-size: 14px !important;
    font-weight: 700 !important;

    &:disabled {
      opacity: 0.72;
      background: linear-gradient(135deg, $brand-start 0%, $brand-end 100%) !important;
    }
  }

  .mobile-submit-btn {
    width: 100%;
    height: 48px !important;
    margin-top: 10px;
    border: none !important;
    border-radius: 14px !important;
    background: linear-gradient(135deg, $brand-start 0%, $brand-end 100%) !important;
    box-shadow: 0 16px 28px rgba(102, 115, 229, 0.24);
    font-size: 15px !important;
    font-weight: 700 !important;
    letter-spacing: 4px !important;
  }

  .mobile-bottom-links {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 18px;
    padding: 16px 6px 0;
    border-top: 1px solid $line-soft;
  }

  .mobile-link {
    color: $brand-text;
    font-size: 12px;
    text-decoration: none;
    line-height: 1;
    transition: opacity 0.18s ease;

    &.strong {
      font-weight: 700;
    }

    &:active {
      opacity: 0.8;
    }
  }

  .mobile-error-tip {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.35;
    color: $error;
  }

  .mobile-link-inline {
    color: $brand-text-strong;
    font-weight: 700;
  }

  .backup-contact-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 4px;

    .backup-contact-text {
      font-size: 13px;
      color: $text-sub;
    }

    .toggle-link {
      font-size: 13px;
      color: $brand-text;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.18s ease;

      &:active {
        opacity: 0.7;
      }
    }
  }

  .agreement-link {
    color: $brand-text-strong;
    text-decoration: none;
    font-weight: 500;

    &:active {
      opacity: 0.7;
    }
  }

  .mobile-register-footer {
    margin-top: 16px;
    text-align: center;
    color: #aeb6c8;
    font-size: 11px;
    line-height: 1.55;
    position: relative;
    z-index: 1;
  }

  .mobile-captcha-dialog {
    :deep(.el-dialog) {
      border-radius: 20px;
      margin: 0 auto;
      overflow: hidden;
      box-shadow: 0 28px 60px rgba(66, 77, 135, 0.22);
    }

    :deep(.el-dialog__header) {
      padding: 18px 18px 8px;
      margin-right: 0;

      .el-dialog__title {
        color: $text-main;
        font-weight: 700;
      }
    }

    :deep(.el-dialog__body) {
      padding: 8px 18px 18px;
    }

    :deep(.el-dialog__footer) {
      padding: 0 18px 18px;
    }
  }

  .captcha-tip {
    margin: 0 0 14px;
    color: #7f879b;
    font-size: 13px;
    line-height: 1.6;
  }

  .captcha-dialog-row {
    display: flex;
    align-items: center;
    gap: 10px;

    :deep(.el-input) {
      flex: 1;
      min-width: 0;
    }
  }

  .captcha-dialog-img-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .captcha-dialog-img {
    height: 44px;
    width: auto;
    border-radius: 12px;
    border: none;
    background: #fff;
    cursor: pointer;
    clip-path: inset(2px round 10px);
  }

  .captcha-refresh-icon {
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    font-size: 18px;
    color: $brand-text;
    background: rgba(99, 117, 232, 0.08);
    cursor: pointer;
  }

  .captcha-dialog-footer {
    display: flex;
    gap: 10px;

    .el-button {
      flex: 1;
      height: 42px !important;
      border-radius: 12px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
    }

    .captcha-cancel-btn {
      border: 1px solid $border-color !important;
      color: #6f7890 !important;
      background: #fff !important;
    }

    .captcha-confirm-btn {
      border: none !important;
      background: linear-gradient(135deg, $brand-start 0%, $brand-end 100%) !important;
    }
  }

  .success-content {
    text-align: center;
    padding: 20px 0;

    .success-icon {
      margin-bottom: 16px;

      .success-icon-large {
        font-size: 56px;
        color: #67c23a;
      }
    }

    h3 {
      margin: 0 0 8px;
      font-size: 19px;
      font-weight: 700;
      color: $text-main;
    }

    p {
      margin: 0 0 24px;
      font-size: 14px;
      color: $text-sub;
      line-height: 1.5;
    }

    .success-actions {
      margin-top: 16px;
    }
  }
}

@media (max-width: 360px) {
  .ignore-vw.mobile-register {
    padding-left: 12px;
    padding-right: 12px;

    .mobile-register-panel {
      padding-left: 14px;
      padding-right: 14px;
      border-radius: 22px;
    }

    .mobile-title {
      font-size: 18px;
    }

    .captcha-input-row,
    .captcha-dialog-row {
      flex-direction: column;
      align-items: stretch;
    }

    .sms-btn {
      width: 100%;
      min-width: 0;
    }

    .captcha-dialog-img-wrap {
      justify-content: space-between;
    }
  }
}
</style>
