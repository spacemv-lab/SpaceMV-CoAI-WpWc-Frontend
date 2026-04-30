/** * Copyright (c) 2018 RuoYi | Copyright (c) 2026 成都天巡微小卫星科技有限责任公司 *This project
is licensed under the MIT License - see the LICENSE file in the project root for details. **/
<template>
  <router-view />
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings';
import { handleThemeStyle } from '@/utils/theme';

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme);
  });
});
</script>
