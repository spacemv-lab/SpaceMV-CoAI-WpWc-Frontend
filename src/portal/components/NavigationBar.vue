<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Github, Globe, Menu, X } from 'lucide-vue-next'

const scrolled = ref(false)
const mobileOpen = ref(false)

const navLinks = [
  { label: '产品特性', href: '#features' },
  { label: '开源生态', href: '#opensource' },
  { label: '在线体验', href: '/login' },
]

const navClass = computed(() =>
  scrolled.value
    ? 'h-14 bg-[rgba(5,8,22,0.95)] shadow-nav backdrop-blur-xl'
    : 'h-16 bg-[rgba(5,8,22,0.8)] backdrop-blur-lg',
)

const handleScroll = () => {
  scrolled.value = window.scrollY > 100
}

const closeMobileMenu = () => {
  mobileOpen.value = false
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav
    :class="[
      'fixed left-0 right-0 top-0 z-50 transition-all duration-300',
      navClass,
    ]"
    :style="{
      borderBottom: scrolled
        ? '1px solid rgba(45,53,97,0.5)'
        : '1px solid transparent',
    }"
  >
    <div class="mx-auto flex h-full max-w-7xl items-center justify-between px-5 md:px-10">
      <a href="#" class="group flex items-center gap-2">
        <img
          src="/logo.png"
          alt="Logo"
          class="h-8 w-8 rounded-full transition-shadow group-hover:shadow-glow"
        />
        <span class="hidden text-sm font-semibold tracking-wide text-starlight md:block">
          SpaceMV-CoAI
        </span>
      </a>

      <div class="hidden items-center gap-8 md:flex">
        <a
          v-for="link in navLinks"
          :key="link.label"
          :href="link.href"
          class="group relative text-sm text-stardust transition-colors hover:text-starlight"
        >
          {{ link.label }}
          <span class="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-cosmic-purple to-cosmic-blue transition-all duration-300 group-hover:w-full" />
        </a>
      </div>

      <div class="hidden items-center gap-3 md:flex">
        <a
          href="https://github.com/spacemv-lab/SpaceMV-CoAI"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 rounded-lg border border-nebula-light/30 bg-nebula-mid/60 px-3 py-1.5 text-xs text-stardust transition-all hover:bg-nebula-mid hover:text-starlight"
        >
          <Github class="h-3.5 w-3.5" />
          <span>GitHub</span>
        </a>
        <a
          href="http://spacemv.com"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 rounded-lg border border-nebula-light/30 bg-nebula-mid/60 px-3 py-1.5 text-xs text-stardust transition-all hover:bg-nebula-mid hover:text-starlight"
        >
          <Globe class="h-3.5 w-3.5" />
          <span>SpaceMV</span>
        </a>
        <a
          href="/login"
          class="glow-button rounded-xl px-4 py-2 text-xs font-medium text-white"
        >
          进入SpaceMV-CoAI
        </a>
      </div>

      <button
        type="button"
        class="p-2 text-stardust transition-colors hover:text-starlight md:hidden"
        @click="mobileOpen = !mobileOpen"
      >
        <X v-if="mobileOpen" class="h-5 w-5" />
        <Menu v-else class="h-5 w-5" />
      </button>
    </div>

    <div
      v-if="mobileOpen"
      class="absolute left-0 right-0 top-full space-y-4 border-b border-nebula-light/30 bg-[rgba(5,8,22,0.98)] p-5 backdrop-blur-xl md:hidden"
    >
      <a
        v-for="link in navLinks"
        :key="link.label"
        :href="link.href"
        class="block text-stardust transition-colors hover:text-starlight"
        @click="closeMobileMenu"
      >
        {{ link.label }}
      </a>

      <div class="flex gap-3 border-t border-nebula-light/30 pt-4">
        <a
          href="https://github.com/spacemv-lab/SpaceMV-CoAI"
          target="_blank"
          rel="noopener noreferrer"
          class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-nebula-mid py-2 text-sm text-stardust"
        >
          <Github class="h-4 w-4" />
          GitHub
        </a>
        <a
          href="/login"
          class="glow-button flex-1 rounded-lg py-2 text-center text-sm font-medium text-white"
        >
          进入SpaceMV-CoAI
        </a>
      </div>
    </div>
  </nav>
</template>
