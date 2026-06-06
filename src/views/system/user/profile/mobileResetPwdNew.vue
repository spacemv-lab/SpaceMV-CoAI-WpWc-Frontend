<template>
  <div class="mobile-reset-pwd ignore-vw">
    <el-form ref="pwdRef" :model="user" :rules="rules" label-position="top" class="pwd-form">
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input v-model="user.oldPassword" placeholder="请输入旧密码" type="password" show-password class="password-input" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="user.newPassword" placeholder="请输入新密码" type="password" show-password class="password-input" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="user.confirmPassword" placeholder="请再次输入新密码" type="password" show-password class="password-input" />
      </el-form-item>
      <div class="form-actions">
        <el-button type="primary" class="action-btn primary" @click="submit">保存修改</el-button>
        <el-button class="action-btn" @click="close">关闭</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
defineOptions({
  name: 'MobileResetPwdNew'
})

import { ref, reactive, getCurrentInstance } from 'vue'
import { updateUserPwd } from '@/api/system/user'
import { encrypt } from '@/utils/jsencrypt'
import useUserStore from '@/store/modules/user'

const { proxy } = getCurrentInstance()
const userStore = useUserStore()

const user = reactive({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
})

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = ref({
  oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    { pattern: /^[^<>"'|\\]+$/, message: '不能包含非法字符 < > " \' \\ |', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { required: true, validator: equalToPassword, trigger: 'blur' }
  ]
})

function submit() {
  proxy.$refs.pwdRef.validate(valid => {
    if (valid) {
      updateUserPwd(encrypt(user.oldPassword), encrypt(user.newPassword)).then(() => {
        proxy.$modal.msgSuccess('修改密码成功，请重新登录')
        setTimeout(() => {
          userStore.logOut().then(() => {
            location.href = '/'
          })
        }, 1000)
      })
    }
  })
}

function close() {
  proxy.$tab.closePage()
}
</script>

<style scoped lang="scss">
$text-main: #3f4963;
$brand-start: #5f7cf0;
$brand-end: #7a8fe7;

.ignore-vw.mobile-reset-pwd {
  width: 100%;
}

.ignore-vw .pwd-form {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ignore-vw :deep(.el-form-item) {
  margin-bottom: 12px;
}

.ignore-vw :deep(.el-form-item__label) {
  padding-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: $text-main;
}

.ignore-vw :deep(.el-input__wrapper) {
  min-height: 44px;
  border-radius: 14px;
  box-shadow: inset 0 0 0 1px rgba(226, 231, 242, 0.94);
}

.ignore-vw :deep(.el-input__inner) {
  font-size: 14px;
  color: $text-main;
}

.ignore-vw .form-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 4px;
}

.ignore-vw .action-btn {
  min-height: 44px;
  margin: 0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
}

.ignore-vw .action-btn.primary {
  border: none;
  background: linear-gradient(135deg, $brand-start 0%, $brand-end 100%);
  box-shadow: 0 12px 24px rgba(103, 121, 190, 0.18);
}

@media (max-width: 420px) {
  .ignore-vw .form-actions {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
