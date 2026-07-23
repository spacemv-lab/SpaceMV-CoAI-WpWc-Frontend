<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import settings from '@/settings'

const url = ref(settings.docsUrl)

function goto() {
  window.open(url.value)
}
</script>
