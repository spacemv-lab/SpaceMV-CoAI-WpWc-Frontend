/** 
 * Copyright (c) 2018 RuoYi | Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/
<template>
  <div class="login">
    <div class="login-form">
      <h3 class="title">{{ title }}</h3>
      
      <!-- 登录方式切换 -->
      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="账号密码登录" name="password">
          <el-form ref="passwordLoginRef" :model="passwordLoginForm" :rules="passwordLoginRules" class="login-tab-form">
            <el-form-item prop="channelAccount">
              <el-input
                v-model="passwordLoginForm.channelAccount"
                type="text"
                size="large"
                auto-complete="off"
                placeholder="请输入手机号、邮箱或用户名"
                @input="passwordLoginForm.channelAccount === '' && (showUserNotExistsError = false)"
              >
                <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
              </el-input>
              <div v-if="showUserNotExistsError" class="user-not-exists-error">
                用户尚未注册，<span class="clickable-link" @click="router.push('/register')">去注册</span>
              </div>
            </el-form-item>
            <el-form-item prop="credential">
              <el-input
                v-model="passwordLoginForm.credential"
                type="password"
                size="large"
                auto-complete="off"
                placeholder="密码"
                @keyup.enter="handlePasswordLogin"
                show-password 
              >
                <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
              </el-input>
            </el-form-item>
            <el-form-item prop="code" v-if="captchaEnabled">
              <el-input
                v-model="passwordLoginForm.code"
                size="large"
                auto-complete="off"
                placeholder="验证码"
                style="width: 63%"
                @keyup.enter="handlePasswordLogin"
              >
                <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
              </el-input>
              <div class="login-code">
                <img :src="codeUrl" @click="getCode" class="login-code-img"/>
              </div>
            </el-form-item>
            <!-- <el-checkbox v-model="passwordLoginForm.rememberMe">记住密码</el-checkbox> -->
            <el-button
              :loading="passwordLoading"
              size="large"
              type="primary"
              style="width:100%;"
              @click.prevent="handlePasswordLogin"
            >
              <span v-if="!passwordLoading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button> 
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="手机验证码登录" name="phoneCode">
          <el-form ref="phoneLoginRef" :model="phoneLoginForm" :rules="phoneLoginRules" class="login-tab-form">
            <el-form-item prop="channelAccount">
              <el-input
                v-model="phoneLoginForm.channelAccount"
                type="text"
                size="large"
                auto-complete="off"
                placeholder="请输入手机号"
              >
                <template #prefix><svg-icon icon-class="phone" class="el-input__icon input-icon" /></template>
              </el-input>
              <div v-if="showPhoneUserNotExistsError" class="user-not-exists-error">
                用户尚未注册，<span class="clickable-link" @click="router.push('/register')">去注册</span>
              </div>
            </el-form-item>
            <el-form-item prop="credential">
              <el-input
                v-model="phoneLoginForm.credential"
                size="large"
                auto-complete="off"
                placeholder="请输入验证码"
                style="width: 63%"
                @keyup.enter="handlePhoneLogin"
              >
                <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
              </el-input>
              <div class="login-code">
                <el-button 
                  size="large" 
                  type="primary" 
                  @click="getPhoneCode" 
                  :disabled="countdown > 0"
                >
                  {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
            <el-button
              :loading="phoneLoading"
              size="large"
              type="primary"
              style="width:100%;"
              @click.prevent="handlePhoneLogin"
            >
              <span v-if="!phoneLoading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      
      <div class="register-link" v-if="register">
        <router-link class="link-type" to="/forgetPassword">忘记密码？</router-link>
        <span class="link-separator">|</span>
        <router-link class="link-type" to="/register">立即注册</router-link>
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
      align-center
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
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login"
import { checkHuman,  newLogin, } from "@/api/newLogin"
import {  sendCode } from "@/api/newRegister"
import { checkUnique } from "@/api/newRegister"
import Cookies from "js-cookie"
import { encrypt } from "@/utils/jsencrypt"
import useUserStore from '@/store/modules/user'
import defaultSettings from '@/settings'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

// 登录方式切换
const activeTab = ref('password')

// 账号密码登录表单
const passwordLoginForm = ref({
  channelAccount: "",
  credential: "",
  rememberMe: false,
  code: "",
  uuid: ""
})
const passwordLoginRef = ref(null)
const passwordLoading = ref(false)
const showUserNotExistsError = ref(false)
const showPhoneUserNotExistsError = ref(false)

// 账号密码登录验证规则
const passwordLoginRules = {
  channelAccount: [
    { required: true, trigger: "blur", message: "请输入手机号、邮箱或用户名" },
    {
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (value && value.length > 0) {
          let fieldType = 'username'
          if (value.includes('@')) {
            fieldType = 'email'
          } else if (/^1[3-9]\d{9}$/.test(value)) {
            fieldType = 'phone'
          }
          checkUnique({ fieldType: fieldType, fieldValue: value, productLine: 'spacemv-coai' }).then(res => {
            if (res.code === 200 && res.data === true) {
              showUserNotExistsError.value = true
            } else {
              showUserNotExistsError.value = false
              callback()
            }
          }).catch(() => {
            showUserNotExistsError.value = false
            callback()
          })
        } else {
          showUserNotExistsError.value = false
          callback()
        }
      }
    }
  ],
  credential: [
    { required: true, trigger: "blur", message: "请输入密码" }
  ],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
}

// 手机验证码登录表单
const phoneLoginForm = ref({
  channelAccount: "",
  credential: ""
})
const phoneLoginRef = ref(null)
const phoneLoading = ref(false)

// 手机验证码登录验证规则
const phoneLoginRules = {
  channelAccount: [
    { required: true, trigger: "blur", message: "请输入手机号" }, 
    { pattern: /^1[3-9]\d{9}$/, trigger: "blur", message: "请输入正确的手机号" },
    {
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (value && value.length > 0) {
          checkUnique({ fieldType: 'phone', fieldValue: value, productLine: 'spacemv-coai' }).then(res => {
            if (res.code === 200 && res.data === true) {
              showPhoneUserNotExistsError.value = true
            } else {
              showPhoneUserNotExistsError.value = false
              callback()
            }
          }).catch(() => {
            showPhoneUserNotExistsError.value = false
            callback()
          })
        } else {
          showPhoneUserNotExistsError.value = false
          callback()
        }
      }
    }
  ],
  credential: [{ required: true, trigger: "blur", message: "请输入验证码" }, { length: 6, trigger: "blur", message: "验证码长度为6位" }]
}

// 验证码相关
const codeUrl = ref("")
// 验证码开关
const captchaEnabled = ref(true)
// 注册开关
const register = ref(true)
const redirect = ref(undefined)

// 手机验证码倒计时
const countdown = ref(0)

// 安全验证弹窗
const showCaptchaDialog = ref(false)
const captchaForm = ref({ checkCode: "" })
const captchaRef = ref(null)
const captchaUuid = ref("")

// 验证码验证规则
const captchaRules = {
  checkCode: [{ required: true, trigger: "blur", message: "请输入图形验证码" }]
}

watch(route, (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect
}, { immediate: true })



// function handlePasswordLogin() {
//   passwordLoginRef.value.validate(valid => {
//     if (valid) {
//       passwordLoading.value = true
//       // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
//       if (passwordLoginForm.value.rememberMe) {
//         Cookies.set("channelAccount", passwordLoginForm.value.channelAccount, { expires: 30 })
//         Cookies.set("credential", encrypt(passwordLoginForm.value.credential), { expires: 30 })
//         Cookies.set("rememberMe", passwordLoginForm.value.rememberMe, { expires: 30 })
//       } else {
//         // 否则移除
//         Cookies.remove("channelAccount")
//         Cookies.remove("credential")
//         Cookies.remove("rememberMe")
//       }
//       // 调用action的登录方法
//       userStore.login({
//         channelAccount: passwordLoginForm.value.channelAccount,
//         credential: encrypt(passwordLoginForm.value.credential),
//         loginType: "password",
//         code: passwordLoginForm.value.code,
//         uuid: captchaUuid.value
//       }).then(() => {
//         const query = route.query
//         const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
//           if (cur !== "redirect") {
//             acc[cur] = query[cur]
//           }
//           return acc
//         }, {})
//         router.push({ path: redirect.value || "/", query: otherQueryParams })
//       }).catch(() => {
//         passwordLoading.value = false
//         // 重新获取验证码
//         if (captchaEnabled.value) {
//           getCode()
//         }
//       })
//     }
//   })
// }

function handlePasswordLogin() {
  passwordLoginRef.value.validate(valid => {
    if (valid) {
      passwordLoading.value = true
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      // if (passwordLoginForm.value.rememberMe) {
      //   Cookies.set("username", passwordLoginForm.value.username, { expires: 30 })
      //   Cookies.set("password", encrypt(passwordLoginForm.value.password), { expires: 30 })
      //   Cookies.set("rememberMe", passwordLoginForm.value.rememberMe, { expires: 30 })
      // } else {
      //   // 否则移除
      //   Cookies.remove("username")
      //   Cookies.remove("password")
      //   Cookies.remove("rememberMe")
      // }
      const loginData = {
        channelAccount: passwordLoginForm.value.channelAccount,
        credential: encrypt(passwordLoginForm.value.credential),
        channelType: "password",
        code: passwordLoginForm.value.code,
        uuid: captchaUuid.value
      }
      userStore.login(loginData).then(() => {
        const query = route.query
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
        router.push({ path: redirect.value || "/", query: otherQueryParams })
      }).catch(() => {
        passwordLoading.value = false
        if (captchaEnabled.value) {
          getCode()
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
      codeUrl.value = "data:image/gif;base64," + data.img
      captchaUuid.value = data.uuid
    }
  })
}

// 手机验证码登录
function handlePhoneLogin() {
  phoneLoginRef.value.validate((valid) => {
    if (valid) {
      phoneLoading.value = true
      // const loginData = {
      //   phone: phoneLoginForm.value.phone,
      //   code: phoneLoginForm.value.phoneCode
      // }
      const loginData = {
        channelAccount: phoneLoginForm.value.channelAccount,
        credential: phoneLoginForm.value.credential,
        loginType: "sms"
      }
      userStore.login(loginData).then(() => {
        phoneLoading.value = false
        const query = route.query
        const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
          if (cur !== "redirect") {
            acc[cur] = query[cur]
          }
          return acc
        }, {})
        router.push({ path: redirect.value || "/", query: otherQueryParams })
      }).catch(() => {
        phoneLoading.value = false
      })
    }
  })
}

// 获取手机验证码
function getPhoneCode() {
  const phone = phoneLoginForm.value.channelAccount
  if (!phone) {
    ElMessage.error('请输入手机号')
    return
  }
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    ElMessage.error('请输入正确的手机号')
    return
  }
  showCaptchaDialog.value = true
  captchaForm.value.checkCode = ""
  getCode()
}

// 验证图形验证码
function verifyCaptcha() {
  captchaRef.value.validate((valid) => {
    if (valid) {
      checkHuman({ uuid: captchaUuid.value, code: captchaForm.value.checkCode }).then(res => {
        if (res.code === 200) {
          showCaptchaDialog.value = false
          sendPhoneCode()
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

// 发送手机验证码
function sendPhoneCode() {
  const phone = phoneLoginForm.value.channelAccount
   const sendData = { 
    channelType: 'phone', 
    channelAccount: phone, 
  }
  sendCode(sendData).then(() => {
    ElMessage.success('验证码发送成功')
    startCountdown()
  }).catch(error => {
    ElMessage.error(error.response?.data?.msg || '验证码发送失败')
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

function getCookie() {
  const username = Cookies.get("username")
  const rememberMe = Cookies.get("rememberMe")
  passwordLoginForm.value = {
    username: username === undefined ? passwordLoginForm.value.username : username,
    password: "",
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
}

getCode()
getCookie()
</script>

<style lang='scss' scoped>
.login {
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

.login-form {
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
  
  .el-checkbox {
    font-size: 13px;
    color: #667eea;

    .el-checkbox__input {
      margin-right: 8px;

      &:is(:focus):not(:active) .el-checkbox__inner {
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .el-checkbox__inner {
        border-radius: 4px;
        border: 2px solid #dcdfe6;
        transition: all 0.3s ease;

        &:hover {
          border-color: #667eea;
        }
      }

      .el-checkbox__inner::after {
        left: 7px;
      }
    }

    &.is-checked {
      .el-checkbox__label {
        color: #667eea;
      }

      .el-checkbox__input .el-checkbox__inner {
        background-color: #667eea;
        border-color: #667eea;
      }
    }
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
      transform: translateY(-2px);
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
}

.login-code {
  width: 35%;
  height: 40px;
  float: right;
  margin-left: 6px;
  overflow: hidden;
  
  img {
    cursor: pointer;
    vertical-align: middle;
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
}

.login-code-img {
  height: 100%;
  padding-left: 0;
}

.login-tabs {
  margin-bottom: 20px;
  
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
    
    .el-tabs__nav {
      width: 100%;
      
      .el-tabs__item {
        flex: 1;
        text-align: center;
        font-size: 15px;
        font-weight: 500;
        color: #909399;
        
        &.is-active {
          color: #667eea;
        }
      }
      
      .el-tabs__active-bar {
        background-color: #667eea !important;
      }
    }
  }
}

.login-tab-form {
  .el-form-item {
    margin-bottom: 20px;
    position: relative;
  }
}

.register-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 0 5px;

  .link-separator {
    color: #dcdfe6;
    margin: 0 12px;
    font-size: 13px;
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

.forgot-tip {
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
}

.user-not-exists-error {
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

.purple-message-box {
  .el-message-box__title {
    color: #667eea;
    font-weight: 600;
  }
  
  .el-button--primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
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
