<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('http:/example.com/');

function goto() {
  window.open(url.value);
}
</script>
