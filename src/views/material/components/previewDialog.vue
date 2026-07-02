/** 
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 *This project is licensed under the MIT License - see the LICENSE file in the project root for details.
**/

<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="图片预览" 
    width="50vw" 
    center
    @close="handleClose"
  >
    <div class="preview-container">
      <el-image
        v-if="imageUrl"
        :src="processedImageUrl"
        fit="contain"
        referrerpolicy="no-referrer"
        style="max-width: 100%; max-height: 100%;"
      ></el-image>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

// 定义组件的属性
const props = defineProps({
  // 控制弹窗的显示与隐藏
  visible: {
    type: Boolean,
    default: false
  },
  // 图片的URL
  url: {
    type: String,
    default: ''
  }
})

// 定义组件的事件
const emit = defineEmits(['close'])

// 内部弹窗显示状态
const dialogVisible = computed({
  get() {
    return props.visible
  },
  set(value) {
    emit('close', value)
  }
})

// 图片的URL
const imageUrl = computed(() => props.url)

// 处理后的图片URL，添加时间戳参数以清除缓存
const processedImageUrl = computed(() => {
  if (!imageUrl.value) return ''
  
  // 在URL后添加时间戳参数以清除缓存
  const urlWithNoCache = new URL(imageUrl.value)
  urlWithNoCache.searchParams.append('t', Date.now().toString())
  
  return urlWithNoCache.toString()
})

// 关闭弹窗的处理函数
const handleClose = () => {
  emit('close', false)
}
</script>

<style scoped>
.preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 60vh;
  overflow: hidden;
  background-color: #f5f7fa;
  padding: 20px;
  box-sizing: border-box;
}
</style>