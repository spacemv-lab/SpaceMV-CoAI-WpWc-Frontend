<template>
  <div></div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { params, query } = route
const { path } = params

// 增加错误处理，确保路径存在且格式正确
if (path) {
  // 确保路径以/开头
  const targetPath = path.startsWith('/') ? path : '/' + path
  router.replace({ path: targetPath, query })
} else {
  // 如果没有路径参数，默认跳转到首页或404页面
  router.replace({ path: '/404', query })
}
</script>