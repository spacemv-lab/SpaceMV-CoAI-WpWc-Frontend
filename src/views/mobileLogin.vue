<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->
<template>
  <div class="mobile-login ignore-vw">
    <div class="mobile-login-shell">
      <div class="mobile-login-panel">
        <h1 class="mobile-title">{{ title }}</h1>

        <div class="mobile-tabs-row">
          <button
            type="button"
            class="mobile-tab-item"
            :class="{ active: activeTab === 'password' }"
            @click="activeTab = 'password'"
          >
            账号密码登录
          </button>
          <button
            type="button"
            class="mobile-tab-item"
            :class="{ active: activeTab === 'phoneCode' }"
            @click="activeTab = 'phoneCode'"
          >
            手机验证码登录
          </button>
        </div>

        <div class="mobile-tab-content">
          <el-form
            v-show="activeTab === 'password'"
            ref="passwordLoginRef"
            :model="passwordLoginForm"
            :rules="passwordLoginRules"
            class="mobile-form"
          >
            <el-form-item prop="channelAccount" class="mobile-account-item">
              <el-input
                v-model="passwordLoginForm.channelAccount"
                type="text"
                size="large"
                auto-complete="off"
                placeholder="请输入手机、邮箱或用户名"
                @input="passwordLoginForm.channelAccount === '' && (showUserNotExistsError = false)"
              >
                <template #prefix>
                  <svg-icon icon-class="user" class="mobile-input-icon" />
                </template>
              </el-input>
              <div v-if="showUserNotExistsError" class="mobile-error-tip">
                用户尚未注册，<span class="mobile-link-inline" @click="router.push('/register')">去注册</span>
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
                <template #prefix>
                  <svg-icon icon-class="password" class="mobile-input-icon" />
                </template>
              </el-input>
            </el-form-item>

            <el-form-item v-if="captchaEnabled" prop="code" class="captcha-form-item">
              <div class="captcha-input-row">
                <el-input
                  v-model="passwordLoginForm.code"
                  size="large"
                  auto-complete="off"
                  placeholder="验证码"
                  @keyup.enter="handlePasswordLogin"
                >
                  <template #prefix>
                    <svg-icon icon-class="validCode" class="mobile-input-icon" />
                  </template>
                </el-input>
                <img :src="codeUrl" @click="getCode" class="captcha-img" alt="验证码" />
              </div>
            </el-form-item>

            <el-button
              :loading="passwordLoading"
              size="large"
              type="primary"
              class="mobile-submit-btn"
              @click.prevent="handlePasswordLogin"
            >
              <span v-if="!passwordLoading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-form>

          <el-form
            v-show="activeTab === 'phoneCode'"
            ref="phoneLoginRef"
            :model="phoneLoginForm"
            :rules="phoneLoginRules"
            class="mobile-form"
          >
            <el-form-item prop="channelAccount" class="mobile-account-item">
              <el-input
                v-model="phoneLoginForm.channelAccount"
                type="tel"
                size="large"
                auto-complete="off"
                placeholder="请输入手机号"
              >
                <template #prefix>
                  <svg-icon icon-class="phone" class="mobile-input-icon" />
                </template>
              </el-input>
              <div v-if="showPhoneUserNotExistsError" class="mobile-error-tip">
                用户尚未注册，<span class="mobile-link-inline" @click="router.push('/register')">去注册</span>
              </div>
            </el-form-item>

            <el-form-item prop="credential" class="captcha-form-item">
              <div class="captcha-input-row">
                <el-input
                  v-model="phoneLoginForm.credential"
                  type="number"
                  size="large"
                  auto-complete="off"
                  placeholder="请输入验证码"
                  maxlength="6"
                  @keyup.enter="handlePhoneLogin"
                >
                  <template #prefix>
                    <svg-icon icon-class="validCode" class="mobile-input-icon" />
                  </template>
                </el-input>
                <el-button
                  size="large"
                  type="primary"
                  class="sms-btn"
                  :disabled="countdown > 0"
                  @click="getPhoneCode"
                >
                  {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>

            <el-button
              :loading="phoneLoading"
              size="large"
              type="primary"
              class="mobile-submit-btn"
              @click.prevent="handlePhoneLogin"
            >
              <span v-if="!phoneLoading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-form>
        </div>

        <div class="mobile-bottom-links" v-if="register">
          <router-link class="mobile-link" to="/forgetPassword">忘记密码?</router-link>
          <router-link class="mobile-link strong" to="/register">立即注册</router-link>
        </div>
      </div>
    </div>

    <div class="mobile-login-footer">
      <span>{{ footerContent }}</span>
    </div>

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
        <p class="captcha-tip">请输入图形验证码后再发送短信验证码</p>
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
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login"
import { checkHuman } from "@/api/newLogin"
import { sendCode, checkUnique } from "@/api/newRegister"
import Cookies from "js-cookie"
import { encrypt } from "@/utils/jsencrypt"
import useUserStore from "@/store/modules/user"
import defaultSettings from "@/settings"
import { ElMessage } from "element-plus"
import { Refresh } from "@element-plus/icons-vue"

const title = import.meta.env.VITE_APP_TITLE
const footerContent = defaultSettings.footerContent
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const activeTab = ref("password")

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

const passwordLoginRules = {
  channelAccount: [
    { required: true, trigger: "blur", message: "请输入手机号、邮箱或用户名" },
    {
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (value && value.length > 0) {
          let fieldType = "username"
          if (value.includes("@")) {
            fieldType = "email"
          } else if (/^1[3-9]\d{9}$/.test(value)) {
            fieldType = "phone"
          }
          checkUnique({ fieldType, fieldValue: value, productLine: "spacemv-coai" })
            .then(res => {
              if (res.code === 200 && res.data === true) {
                showUserNotExistsError.value = true
              } else {
                showUserNotExistsError.value = false
                callback()
              }
            })
            .catch(() => {
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

const phoneLoginForm = ref({
  channelAccount: "",
  credential: ""
})
const phoneLoginRef = ref(null)
const phoneLoading = ref(false)

const phoneLoginRules = {
  channelAccount: [
    { required: true, trigger: "blur", message: "请输入手机号" },
    { pattern: /^1[3-9]\d{9}$/, trigger: "blur", message: "请输入正确的手机号" },
    {
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (value && value.length > 0) {
          checkUnique({ fieldType: "phone", fieldValue: value, productLine: "spacemv-coai" })
            .then(res => {
              if (res.code === 200 && res.data === true) {
                showPhoneUserNotExistsError.value = true
              } else {
                showPhoneUserNotExistsError.value = false
                callback()
              }
            })
            .catch(() => {
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
  credential: [
    { required: true, trigger: "blur", message: "请输入验证码" },
    { length: 6, trigger: "blur", message: "验证码长度为 6 位" }
  ]
}

const codeUrl = ref("")
const captchaEnabled = ref(true)
const register = ref(true)
const redirect = ref(undefined)
const countdown = ref(0)
const showCaptchaDialog = ref(false)
const captchaForm = ref({ checkCode: "" })
const captchaRef = ref(null)
const captchaUuid = ref("")

const captchaRules = {
  checkCode: [{ required: true, trigger: "blur", message: "请输入图形验证码" }]
}

watch(route, newRoute => {
  redirect.value = newRoute.query && newRoute.query.redirect
}, { immediate: true })

function handlePasswordLogin() {
  passwordLoginRef.value.validate(valid => {
    if (valid) {
      passwordLoading.value = true
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
      codeUrl.value = `data:image/gif;base64,${data.img}`
      captchaUuid.value = data.uuid
    }
  })
}

function handlePhoneLogin() {
  phoneLoginRef.value.validate(valid => {
    if (valid) {
      phoneLoading.value = true
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

function getPhoneCode() {
  const phone = phoneLoginForm.value.channelAccount
  if (!phone) {
    ElMessage.error("请输入手机号")
    return
  }
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    ElMessage.error("请输入正确的手机号")
    return
  }
  showCaptchaDialog.value = true
  captchaForm.value.checkCode = ""
  getCode()
}

function verifyCaptcha() {
  captchaRef.value.validate(valid => {
    if (valid) {
      checkHuman({ uuid: captchaUuid.value, code: captchaForm.value.checkCode }).then(res => {
        if (res.code === 200) {
          showCaptchaDialog.value = false
          sendPhoneCode()
        } else {
          ElMessage.error(res.msg || "图形验证码错误")
          getCode()
        }
      }).catch(() => {
        getCode()
      })
    }
  })
}

function sendPhoneCode() {
  const phone = phoneLoginForm.value.channelAccount
  const sendData = {
    channelType: "phone",
    channelAccount: phone
  }
  sendCode(sendData).then(() => {
    ElMessage.success("验证码发送成功")
    startCountdown()
  }).catch(error => {
    ElMessage.error(error.response?.data?.msg || "验证码发送失败")
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

function getCookie() {
  const username = Cookies.get("username")
  const rememberMe = Cookies.get("rememberMe")
  passwordLoginForm.value = {
    channelAccount: username === undefined ? passwordLoginForm.value.channelAccount : username,
    credential: "",
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
    code: "",
    uuid: ""
  }
}

getCode()
getCookie()
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

.ignore-vw.mobile-login {
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

  .mobile-login-shell {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    position: relative;
    z-index: 1;
  }

  .mobile-login-panel {
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
    margin: 0 0 24px;
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

  .mobile-tabs-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 18px;
    padding: 0;
  }

  .mobile-tab-item {
    position: relative;
    flex: 1;
    height: 40px;
    padding: 0;
    border: none;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.54);
    color: #8f98ad;
    font-size: 13px;
    font-weight: 500;
    box-shadow: inset 0 0 0 1px rgba(228, 232, 242, 0.9);
    transition: all 0.22s ease;

    &.active {
      color: #6672d9;
      font-weight: 600;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 255, 1));
      box-shadow:
        0 8px 18px rgba(113, 124, 182, 0.12),
        inset 0 0 0 1px rgba(232, 237, 248, 0.95);
    }

    &:not(.active) {
      &:hover,
      &:active {
        color: #7f88a0;
        background: rgba(255, 255, 255, 0.72);
      }
    }
  }

  .mobile-tab-content {
    min-height: 274px;
  }

  .mobile-form {
    :deep(.el-form-item) {
      margin-bottom: 18px;
    }

    :deep(.el-form-item.is-error) {
      margin-bottom: 24px;
    }

    :deep(.el-form-item__error) {
      padding-top: 6px;
      font-size: 12px;
      line-height: 1.35;
    }

    .mobile-account-item {
      margin-bottom: 16px;
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

  .captcha-img {
    width: 110px;
    height: 46px;
    flex-shrink: 0;
    border-radius: 14px;
    border: none;
    background: linear-gradient(180deg, #ffffff, #f6f8fd);
    object-fit: cover;
    cursor: pointer;
    box-shadow: 0 10px 18px rgba(111, 124, 180, 0.1);
    clip-path: inset(2px round 12px);
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
    margin-top: 14px;
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
    justify-content: space-between;
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

  .mobile-login-footer {
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
}

@media (max-width: 360px) {
  .ignore-vw.mobile-login {
    padding-left: 12px;
    padding-right: 12px;

    .mobile-login-panel {
      padding-left: 14px;
      padding-right: 14px;
      border-radius: 22px;
    }

    .mobile-title {
      font-size: 18px;
    }

    .mobile-tab-item {
      font-size: 12px;
    }

    .captcha-input-row,
    .captcha-dialog-row {
      flex-direction: column;
      align-items: stretch;
    }

    .captcha-img,
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
