<template>
  <div class="user-profile ignore-vw">
    <div class="user-profile-container">
      <section class="mobile-panel header-panel">
        <div class="card-header">
          <span v-if="showTitle" class="card-title">用户画像分析</span>
        </div>
        <div v-if="isWeChatPlatform" class="note-box">
          <van-icon name="info-o" class="title-icon" />
          <span>仅统计通过导入方式获取的数据。</span>
        </div>
      </section>

      <section class="mobile-panel tab-panel">
        <van-tabs v-model:active="activeTab" swipeable class="profile-tabs" @change="onTabChange" lazy-render>
          <van-tab name="gender" title="性别分布">
            <Gender ref="genderRef" />
          </van-tab>
          <van-tab name="age" title="年龄分布">
            <Age ref="ageRef" />
          </van-tab>
          <van-tab name="region" title="地域分布">
            <Region ref="regionRef" />
          </van-tab>
          <van-tab name="channel" title="渠道构成">
            <Channel ref="channelRef" />
          </van-tab>
        </van-tabs>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Gender from './Gender.vue'
import Age from './Age.vue'
import Region from './Region.vue'
import Channel from './Channel.vue'
import useMediaProductStore from '@/store/modules/mediaProduct'

const props = defineProps({
  showTitle: {
    type: Boolean,
    default: true
  }
})

const mediaProductStore = useMediaProductStore()
const isWeChatPlatform = computed(() => mediaProductStore.channelId === 1)
const activeTab = ref('gender')

// 子组件引用
const genderRef = ref(null)
const ageRef = ref(null)
const regionRef = ref(null)
const channelRef = ref(null)

// 初始化时加载第一个 tab 的数据
onMounted(() => {
  genderRef.value?.refresh()
})

// tab 切换时刷新对应组件的数据
const onTabChange = (name) => {
  switch (name) {
    case 'gender':
      genderRef.value?.refresh()
      break
    case 'age':
      ageRef.value?.refresh()
      break
    case 'region':
      regionRef.value?.refresh()
      break
    case 'channel':
      channelRef.value?.refresh()
      break
  }
}
</script>

<style scoped>
.ignore-vw.user-profile {
  min-height: 100%;
  background: #f4f7fb;
}

.ignore-vw .user-profile-container {
  padding: 12px 12px calc(env(safe-area-inset-bottom, 0px) + 28px);
}

.ignore-vw .mobile-panel {
  margin-bottom: 12px;
  padding: 14px;
  background: #ffffff;
  border: 1px solid #e7ecf5;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(66, 88, 122, 0.06);
}

.ignore-vw .card-title {
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: #25324a;
}

.ignore-vw .note-box {
  margin-top: 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: #f7faff;
  border: 1px solid #d9e6ff;
  border-radius: 12px;
  font-size: 13px;
  line-height: 20px;
  color: #5e6b85;
}

.ignore-vw .title-icon {
  margin-top: 2px;
  font-size: 15px;
  color: #4c84ff;
}

.ignore-vw .profile-tabs :deep(.van-tabs__wrap) {
  position: relative;
  background: transparent;
}

.ignore-vw .profile-tabs :deep(.van-tab) {
  flex: none;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: #6c7890;
}

.ignore-vw .profile-tabs :deep(.van-tab--active) {
  color: #386ff6;
}

.ignore-vw .profile-tabs :deep(.van-tabs__line) {
  background: #386ff6;
}
</style>
