<template>
  <div class="mobile-layout ignore-vw">
    <mobile-navbar @toggle-menu="menuOpened = true" />
    <mobile-menu-drawer v-model:show="menuOpened" />
    <main class="mobile-layout-main">
      <app-main />
    </main>
    <settings ref="settingRef" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import MobileNavbar from './MobileNavbar.vue'
import MobileMenuDrawer from './MobileMenuDrawer.vue'
import { AppMain, Settings } from '@/layout/components'

const menuOpened = ref(false)

onMounted(() => {
  document.body.classList.add('ignore-vw')
})
</script>

<style scoped lang="scss">
.ignore-vw.mobile-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(180deg, #f7f9ff 0%, #edf2fb 100%);
}

.ignore-vw .mobile-layout-main {
  min-height: calc(100dvh - 60px - env(safe-area-inset-top, 0px));
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
  box-sizing: border-box;
}

.ignore-vw :deep(.app-main) {
  min-height: auto;
  padding-top: 0;
}

.ignore-vw :deep(.fixed-header + .app-main) {
  margin-top: 0;
  height: auto;
  min-height: auto;
}

.ignore-vw :deep(.app-main > .app-container) {
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
  box-sizing: border-box;
}
</style>
