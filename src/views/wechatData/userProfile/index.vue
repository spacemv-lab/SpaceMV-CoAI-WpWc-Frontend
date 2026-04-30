/** * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司 *This project is licensed under the MIT
License - see the LICENSE file in the project root for details. **/
<template>
  <div class="user-profile">
    <div class="user-profile-container">
      <div class="card-header">
        <span v-if="showTitle" class="card-title">用户画像分析</span>
        <span v-if="isWeChatPlatform" class="note-text"><el-icon class="title-icon"><WarningFilled /></el-icon>仅统计通过导入获取的数据</span>
      </div>

      <!-- Tab切换 -->
      <el-tabs v-model="activeTab" class="profile-tabs">
        <!-- 性别分布 -->
        <el-tab-pane label="性别分布" name="gender">
          <Gender v-if="activeTab === 'gender'" />
        </el-tab-pane>

        <!-- 年龄分布 -->
        <el-tab-pane label="年龄分布" name="age">
          <Age v-if="activeTab === 'age'" />
        </el-tab-pane>

        <!-- 地域分布 -->
        <el-tab-pane label="地域分布" name="region">
          <Region v-if="activeTab === 'region'" />
        </el-tab-pane>

        <!-- 渠道构成 -->
        <el-tab-pane label="渠道构成" name="channel">
          <Channel v-if="activeTab === 'channel'" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { WarningFilled } from '@element-plus/icons-vue';
import Gender from '../../wechatdata/userprofile/Gender.vue';
import Age from '../../wechatdata/userprofile/Age.vue';
import Region from '../../wechatdata/userprofile/Region.vue';
import Channel from '../../wechatdata/userprofile/Channel.vue';
import useMediaProductStore from '@/store/modules/mediaProduct';

const props = defineProps({
  showTitle: {
    type: Boolean,
    default: true,
  },
});

// 使用媒体产品store
const mediaProductStore = useMediaProductStore();

// 是否为微信平台（channelId 为 1）
const isWeChatPlatform = computed(() => {
  return mediaProductStore.channelId === 1
})

const activeTab = ref('gender')
</script>

<style scoped>
.user-profile {
  min-height: 100%;
}

.user-profile-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.card-title {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.note-text {
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.title-icon {
  font-size: 14px;
  color: #909399;
}

.profile-tabs :deep(.el-tabs__content) {
  margin-top: 20px;
}
</style>
