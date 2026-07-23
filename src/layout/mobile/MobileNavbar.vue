<template>
  <header class="mobile-navbar ignore-vw">
    <button type="button" class="mobile-nav-button" @click="emit('toggle-menu')">
      <svg-icon icon-class="tree-table" />
    </button>

    <div class="mobile-navbar-center">
      <div class="mobile-navbar-title">{{ currentTitle }}</div>
    </div>

    <el-dropdown trigger="click" @command="handleCommand">
      <button type="button" class="mobile-avatar-button">
        <img :src="userStore.avatar" class="mobile-avatar-image" />
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <router-link to="/user/profile">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </header>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import useUserStore from '@/store/modules/user'

const emit = defineEmits(['toggle-menu'])

const route = useRoute()
const userStore = useUserStore()

const currentTitle = computed(() => {
  const matched = [...(route.matched || [])].reverse().find(item => item.meta?.title)
  return matched?.meta?.title || import.meta.env.VITE_APP_TITLE
})

function handleCommand(command) {
  if (command === 'logout') {
    logout()
  }
}

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/'
    })
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.ignore-vw.mobile-navbar {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 12px;
  min-height: 60px;
  padding: calc(env(safe-area-inset-top, 0px) + 10px) 14px 10px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(223, 230, 242, 0.96);
  box-shadow: 0 10px 30px rgba(40, 59, 112, 0.08);
  box-sizing: border-box;
  position: sticky;
  top: 0;
  z-index: 20;
}

.ignore-vw .mobile-nav-button,
.ignore-vw .mobile-avatar-button {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 14px;
  background: rgba(95, 124, 240, 0.1);
  color: #5d6bd8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(95, 124, 240, 0.08);
  padding: 0;
}

.ignore-vw .mobile-nav-button :deep(.svg-icon),
.ignore-vw .mobile-avatar-button :deep(.svg-icon) {
  width: 18px;
  height: 18px;
  font-size: 18px;
}

.ignore-vw .mobile-navbar-center {
  min-width: 0;
}

.ignore-vw .mobile-navbar-title {
  font-size: 17px;
  line-height: 1.4;
  font-weight: 700;
  color: #3f4963;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.2px;
}

.ignore-vw .mobile-avatar-image {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
