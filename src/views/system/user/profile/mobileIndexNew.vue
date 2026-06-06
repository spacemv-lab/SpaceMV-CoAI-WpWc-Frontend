<template>
  <div class="mobile-profile-page ignore-vw">
    <section class="hero-card">
      <div class="hero-avatar-wrap">
        <user-avatar />
      </div>
      <div class="hero-copy">
        <h1 class="hero-title">{{ state.user.nickName || state.user.userName || '个人中心' }}</h1>
        <p class="hero-subtitle">{{ state.roleGroup || '欢迎回来' }}</p>
      </div>
    </section>

    <section class="mobile-panel summary-panel">
      <div class="panel-title">基本信息</div>
      <div class="summary-grid">
        <div v-for="item in summaryItems" :key="item.label" class="summary-item">
          <span class="summary-label">{{ item.label }}</span>
          <span class="summary-value">{{ item.value }}</span>
        </div>
      </div>
    </section>

    <section class="mobile-panel tabs-panel">
      <div class="tab-chip-row">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          type="button"
          :class="['tab-chip', { active: selectedTab === tab.name }]"
          @click="handleTabChange(tab.name)"
        >
          {{ tab.label }}
        </button>
      </div>
    </section>

    <section class="mobile-panel content-panel">
      <mobile-user-info-new v-if="selectedTab === 'userinfo'" :user="state.user" />
      <mobile-reset-pwd-new v-else />
    </section>
  </div>
</template>

<script setup>
defineOptions({
  name: 'MobileProfile'
})

import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserProfile } from '@/api/system/user'
import userAvatar from './userAvatar'
import MobileUserInfoNew from './mobileUserInfoNew.vue'
import MobileResetPwdNew from './mobileResetPwdNew.vue'

const route = useRoute()
const router = useRouter()
const selectedTab = ref('userinfo')
const tabs = [
  { name: 'userinfo', label: '基本资料' },
  { name: 'resetPwd', label: '修改密码' }
]

const state = reactive({
  user: {},
  roleGroup: '',
  postGroup: ''
})

const summaryItems = computed(() => [
  { label: '用户名', value: state.user.userName || '-' },
  { label: '手机号', value: state.user.phonenumber || '-' },
  { label: '邮箱', value: state.user.email || '-' },
  {
    label: '所属部门',
    value: state.user.dept ? `${state.user.dept.deptName || '-'} / ${state.postGroup || '-'}` : '-'
  },
  { label: '所属角色', value: state.roleGroup || '-' },
  { label: '创建日期', value: state.user.createTime || '-' }
])

function syncSelectedTab(activeTab) {
  selectedTab.value = activeTab === 'resetPwd' ? 'resetPwd' : 'userinfo'
}

function getUser() {
  getUserProfile().then(response => {
    state.user = response.data || {}
    state.roleGroup = response.roleGroup || ''
    state.postGroup = response.postGroup || ''
  })
}

function handleTabChange(tabName) {
  if (selectedTab.value === tabName) {
    return
  }
  selectedTab.value = tabName
  router.replace({
    name: 'Profile',
    params: {
      activeTab: tabName === 'userinfo' ? undefined : tabName
    }
  })
}

watch(
  () => route.params?.activeTab,
  (activeTab) => {
    syncSelectedTab(activeTab)
  },
  { immediate: true }
)

getUser()
</script>

<style scoped lang="scss">
$page-top: #f7f9ff;
$page-bottom: #edf2fb;
$card-bg: rgba(255, 255, 255, 0.96);
$card-border: rgba(225, 231, 244, 0.95);
$card-shadow: 0 16px 34px rgba(106, 124, 163, 0.12);
$text-main: #3f4963;
$text-sub: #8f97ad;
$text-light: #a8b0c4;

.ignore-vw.mobile-profile-page {
  min-height: 100vh;
  min-height: 100dvh;
  padding: calc(env(safe-area-inset-top, 0px) + 16px) 16px calc(env(safe-area-inset-bottom, 0px) + 28px);
  background:
    radial-gradient(circle at 14% 10%, rgba(107, 126, 239, 0.15), rgba(107, 126, 239, 0) 26%),
    radial-gradient(circle at 86% 6%, rgba(111, 161, 224, 0.14), rgba(111, 161, 224, 0) 24%),
    linear-gradient(180deg, $page-top 0%, $page-bottom 100%);
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

.ignore-vw .hero-card,
.ignore-vw .mobile-panel {
  width: 100%;
  background: $card-bg;
  border: 1px solid $card-border;
  border-radius: 24px;
  box-shadow: $card-shadow;
  backdrop-filter: blur(16px);
  box-sizing: border-box;
}

.ignore-vw .hero-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 16px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 84px;
    background: linear-gradient(180deg, rgba(105, 124, 232, 0.12), rgba(105, 124, 232, 0));
    pointer-events: none;
  }
}

.ignore-vw .hero-avatar-wrap,
.ignore-vw .hero-copy {
  position: relative;
  z-index: 1;
}

.ignore-vw .hero-avatar-wrap {
  flex-shrink: 0;
}

.ignore-vw .hero-copy {
  min-width: 0;
}

.ignore-vw .hero-title {
  margin: 0 0 6px;
  font-size: 20px;
  line-height: 1.25;
  font-weight: 700;
  color: $text-main;
  word-break: break-word;
}

.ignore-vw .hero-subtitle {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: $text-sub;
}

.ignore-vw .mobile-panel {
  padding: 16px 14px;
}

.ignore-vw .summary-panel,
.ignore-vw .tabs-panel {
  margin-bottom: 12px;
}

.ignore-vw .panel-title {
  margin: 0 0 14px;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 700;
  color: $text-main;
}

.ignore-vw .summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ignore-vw .summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(248, 250, 255, 0.96);
  box-shadow: inset 0 0 0 1px rgba(228, 233, 244, 0.88);
}

.ignore-vw .summary-label {
  font-size: 12px;
  line-height: 1.45;
  color: $text-light;
}

.ignore-vw .summary-value {
  font-size: 14px;
  line-height: 1.55;
  font-weight: 600;
  color: $text-main;
  word-break: break-word;
}

.ignore-vw .tab-chip-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ignore-vw .tab-chip {
  appearance: none;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid rgba(226, 231, 242, 0.94);
  border-radius: 14px;
  background: rgba(247, 249, 253, 0.96);
  color: $text-sub;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.22s ease;
  cursor: pointer;
}

.ignore-vw .tab-chip.active {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 248, 255, 1));
  box-shadow:
    0 10px 22px rgba(103, 121, 190, 0.14),
    inset 0 0 0 1px rgba(101, 114, 220, 0.16);
  border-color: rgba(101, 114, 220, 0.34);
  color: #5d6bd8;
  transform: translateY(-1px);
}

.ignore-vw .content-panel {
  padding: 16px;
}

@media (max-width: 420px) {
  .ignore-vw.mobile-profile-page {
    padding-left: 12px;
    padding-right: 12px;
  }

  .ignore-vw .hero-card {
    align-items: flex-start;
    border-radius: 20px;
  }

  .ignore-vw .hero-title {
    font-size: 20px;
  }

  .ignore-vw .summary-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
