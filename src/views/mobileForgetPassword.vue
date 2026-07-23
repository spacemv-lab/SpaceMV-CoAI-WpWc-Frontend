<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->
<template>
  <div class="mobile-forget ignore-vw">
    <div class="mobile-forget-shell">
      <div class="mobile-forget-panel">
        <h1 class="mobile-title">找回密码</h1>
        <p class="mobile-subtitle">请输入已绑定的手机号或邮箱，完成验证后即可重置密码。</p>

        <el-form ref="forgotRef" :model="forgotForm" :rules="forgotRules" class="mobile-form">
          <el-form-item prop="contact">
            <el-input
              v-model="forgotForm.contact"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="请输入手机号或邮箱"
            >
              <template #prefix>
                <svg-icon icon-class="phone" class="mobile-input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="code" class="mobile-code-item">
            <div class="mobile-code-row">
              <el-input
                v-model="forgotForm.code"
                size="large"
                auto-complete="off"
                placeholder="请输入验证码"
                @keyup.enter="toResetPwd"
              >
                <template #prefix>
                  <svg-icon icon-class="validCode" class="mobile-input-icon" />
                </template>
              </el-input>
              <el-button
                size="large"
                type="primary"
                class="mobile-code-btn"
                :disabled="countdown > 0"
                @click="getCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="forgotForm.password"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="密码（8-20 位，支持字母和数字组合）"
              show-password
            >
              <template #prefix>
                <svg-icon icon-class="password" class="mobile-input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="forgotForm.confirmPassword"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="确认密码"
              show-password
              @keyup.enter="toResetPwd"
            >
              <template #prefix>
                <svg-icon icon-class="password" class="mobile-input-icon" />
              </template>
            </el-input>
          </el-form-item>

          <div class="mobile-action-row">
            <el-button class="mobile-secondary-btn" size="large" @click="goBack">返回登录</el-button>
            <el-button class="mobile-primary-btn" size="large" type="primary" @click="toResetPwd">重置密码</el-button>
          </div>
        </el-form>
      </div>
    </div>

    <div class="mobile-footer">
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
        <p class="captcha-tip">请输入图形验证码后再发送短信或邮箱验证码</p>
        <el-form-item prop="checkCode">
          <div class="captcha-dialog-row">
            <el-input
              v-model="captchaForm.checkCode"
              placeholder="请输入图形验证码"
              size="large"
              @keyup.enter="verifyCaptcha"
            />
            <div class="captcha-dialog-img-wrap">
              <img :src="codeUrl" @click="getCaptcha" class="captcha-dialog-img" alt="验证码" />
              <el-icon class="captcha-refresh-icon" @click="getCaptcha"><Refresh /></el-icon>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="captcha-dialog-footer">
          <el-button size="large" class="captcha-cancel-btn" @click="showCaptchaDialog = false">取消</el-button>
          <el-button size="large" type="primary" class="captcha-confirm-btn" @click="verifyCaptcha">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { Refresh } from "@element-plus/icons-vue"
import { sendCode, getCodeImg, checkHuman } from "@/api/newRegister"
import { checkUnique, resetPassword } from "@/api/forgetPassword"
import { encrypt } from "@/utils/jsencrypt"
import defaultSettings from "@/settings"

const router = useRouter()
const footerContent = defaultSettings.footerContent

const countdown = ref(0)
const forgotRef = ref(null)

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
  contact: "",
  code: "",
  password: "",
  confirmPassword: ""
})

const showContactNotExistsError = ref(false)

const forgotRules = {
  contact: [
    { required: true, trigger: "blur", message: "请输入手机号或邮箱" },
    {
      validator: (rule, value, callback) => {
        if (value && value.length > 0) {
          const isEmail = value.includes("@")
          checkUnique({ fieldType: isEmail ? "email" : "phone", fieldValue: value, productLine: "spacemv-coai" }).then(res => {
            if (res.code === 200 && res.data === true) {
              showContactNotExistsError.value = true
              callback(new Error("该账号不存在"))
            } else {
              showContactNotExistsError.value = false
              callback()
            }
          }).catch(() => {
            showContactNotExistsError.value = false
            callback()
          })
        } else {
          showContactNotExistsError.value = false
          callback()
        }
      },
      trigger: "blur"
    }
  ],
  code: [{ required: true, trigger: "blur", message: "请输入验证码" }],
  password: [
    { required: true, trigger: "blur", message: "请输入密码" },
    { min: 8, max: 20, trigger: "blur", message: "密码长度为 8-20 位" },
    { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/, trigger: "blur", message: "密码必须包含字母和数字" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请确认密码" },
    {
      validator: (rule, value, callback) => {
        if (value !== forgotForm.value.password) {
          callback(new Error("两次输入密码不一致"))
        } else {
          callback()
        }
      },
      trigger: "blur"
    }
  ]
}

function getCode() {
  const contact = forgotForm.value.contact
  if (!contact) {
    ElMessage.error("请先填写手机号或邮箱")
    return
  }

  const isEmail = contact.includes("@")
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^1[3-9]\d{9}$/
  if (isEmail && !emailRegex.test(contact)) {
    ElMessage.error("请输入正确的邮箱格式")
    return
  }
  if (!isEmail && !phoneRegex.test(contact)) {
    ElMessage.error("请输入正确的手机号格式")
    return
  }

  if (captchaLocked.value) {
    ElMessage.warning(`操作频繁，请${captchaLockCountdown.value}秒后再试`)
    return
  }

  showCaptchaDialog.value = true
  captchaForm.value.checkCode = ""
  getCaptcha()
}

function getCaptcha() {
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

function verifyCaptcha() {
  captchaRef.value.validate(valid => {
    if (valid) {
      checkHuman({ uuid: captchaUuid.value, code: captchaForm.value.checkCode }).then(res => {
        if (res.code === 200) {
          showCaptchaDialog.value = false
          doSendVerificationCode()
        } else {
          ElMessage.error("图形验证码错误")
          getCaptcha()
          captchaFailCount.value++
          if (captchaFailCount.value >= 3) {
            lockCaptcha()
          }
        }
      }).catch(() => {
        ElMessage.error("图形验证码验证失败")
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
  const isEmail = contact.includes("@")
  const sendData = {
    channelType: isEmail ? "email" : "phone",
    channelAccount: contact
  }

  sendCode(sendData).then(res => {
    if (res.code === 200) {
      ElMessage.success(res.msg || "验证码发送成功")
      startCountdown()
    } else {
      ElMessage.error(res.msg || "验证码发送失败")
    }
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

function toResetPwd() {
  forgotRef.value.validate(valid => {
    if (valid) {
      handleResetPassword(forgotForm.value.password)
    }
  })
}

function handleResetPassword(password) {
  const contact = forgotForm.value.contact
  const resetData = {
    channelAccount: contact,
    newPassword: encrypt(password),
    verifyCode: forgotForm.value.code
  }

  resetPassword(resetData).then(res => {
    if (res.code === 200) {
      ElMessage.success("密码重置成功")
      router.push("/login")
    } else {
      ElMessage.error(res.msg || "密码重置失败")
    }
  }).catch(error => {
    ElMessage.error(error.response?.data?.msg || "密码重置失败")
  })
}

function goBack() {
  router.push("/login")
}

getCaptcha()
</script>

<style lang="scss" scoped>
$brand-start: #5f7cf0;
$brand-end: #7c55c7;
$brand-text: #6473e5;
$brand-text-strong: #5b68df;
$border-color: #dde2ee;
$panel-bg: rgba(255, 255, 255, 0.92);
$panel-shadow: 0 30px 70px rgba(92, 110, 214, 0.16);
$text-main: #4c5570;
$text-sub: #a0a7bb;
$line-soft: rgba(126, 136, 176, 0.16);

.ignore-vw.mobile-forget {
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

  .mobile-forget-shell {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    position: relative;
    z-index: 1;
  }

  .mobile-forget-panel {
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
    margin: 0 0 10px;
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
  }

  .mobile-subtitle {
    margin: 0 0 18px;
    text-align: center;
    color: #8791a8;
    font-size: 13px;
    line-height: 1.6;
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

  .mobile-code-item {
    :deep(.el-form-item__content) {
      display: block;
    }
  }

  .mobile-code-row {
    display: flex;
    align-items: stretch;
    gap: 10px;

    :deep(.el-input) {
      flex: 1;
      min-width: 0;
    }
  }

  .mobile-code-btn {
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

  .mobile-action-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 10px;
  }

  .mobile-secondary-btn,
  .mobile-primary-btn {
    height: 48px !important;
    border-radius: 14px !important;
    font-size: 15px !important;
    font-weight: 600 !important;
  }

  .mobile-secondary-btn {
    background: rgba(255, 255, 255, 0.9) !important;
    color: #6f7890 !important;
    border: 1px solid rgba(220, 225, 238, 0.95) !important;
    box-shadow: 0 8px 16px rgba(123, 136, 180, 0.05);
  }

  .mobile-primary-btn {
    border: none !important;
    background: linear-gradient(135deg, $brand-start 0%, $brand-end 100%) !important;
    box-shadow: 0 16px 28px rgba(102, 115, 229, 0.24);
    letter-spacing: 1px !important;
  }

  .mobile-footer {
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
  .ignore-vw.mobile-forget {
    padding-left: 12px;
    padding-right: 12px;

    .mobile-forget-panel {
      padding-left: 14px;
      padding-right: 14px;
      border-radius: 22px;
    }

    .mobile-title {
      font-size: 18px;
    }

    .mobile-code-row,
    .captcha-dialog-row,
    .mobile-action-row {
      grid-template-columns: 1fr;
      flex-direction: column;
      align-items: stretch;
    }

    .mobile-code-btn {
      width: 100%;
      min-width: 0;
    }

    .captcha-dialog-img-wrap {
      justify-content: space-between;
    }
  }
}
</style>
