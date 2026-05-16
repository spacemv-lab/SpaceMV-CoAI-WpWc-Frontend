<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->
<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { ArrowRight, Sparkles } from 'lucide-vue-next'
import PlanetScene from '../components/PlanetScene.vue'
import { useTimeOfDay } from '../composables/useTimeOfDay'

const { colors, phase, formattedTime } = useTimeOfDay()

watch(
  () => colors.value.sunColor,
  (sunColor) => {
    document.documentElement.style.setProperty('--sun-color', sunColor)
  },
  { immediate: true },
)

watch(
  () => colors.value.skyHue,
  (skyHue) => {
    document.documentElement.style.setProperty('--sky-hue', String(skyHue))
  },
  { immediate: true },
)

watch(
  () => colors.value.ambientColor,
  (ambientColor) => {
    document.documentElement.style.setProperty('--ambient-color', ambientColor)
  },
  { immediate: true },
)

onMounted(() => {
  document.documentElement.dataset.phase = phase.value
})

onBeforeUnmount(() => {
  delete document.documentElement.dataset.phase
})

watch(
  () => phase.value,
  (nextPhase) => {
    document.documentElement.dataset.phase = nextPhase
  },
)
</script>

<template>
  <section class="relative flex items-center overflow-hidden lg:py-24">
    <div
      class="absolute inset-0 bg-cover bg-center opacity-40"
      style="background-image: url('/nebula-bg.jpg');"
    />
    <div class="absolute inset-0 bg-gradient-to-b from-deep-space/60 via-deep-space/40 to-deep-space" />

    <div class="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-20 md:px-10">
      <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
        <div class="space-y-8">
          <div class="flex items-center gap-2">
            <div
              class="h-2 w-2 animate-pulse-glow rounded-full"
              :style="{ backgroundColor: colors.sunColor }"
            />
            <span
              class="font-mono text-xs tracking-wider"
              :style="{ color: colors.sunColor }"
            >
              {{ formattedTime }}
            </span>
          </div>

          <div class="inline-flex items-center gap-2 rounded-full border border-orbit-cyan/30 bg-orbit-cyan/10 px-3 py-1.5 font-mono text-xs text-orbit-cyan">
            <Sparkles class="h-3 w-3" />
            v1.2.0 现已发布
          </div>

          <div class="space-y-2">
            <h1 class="font-display text-4xl font-semibold leading-[1.1] tracking-wide text-starlight sm:text-5xl lg:text-6xl">
              产业星球运营智能体
            </h1>
            <h1 class="font-display text-4xl font-semibold leading-[1.1] tracking-wide sm:text-5xl lg:text-6xl">
              <span class="gradient-text shimmer-text">内容生产及运维工具</span>
            </h1>
          </div>

          <p class="max-w-lg text-base leading-relaxed text-stardust">
            SpaceMV-CoAI 是由 AI Agent 驱动的「企业数字运营员工」，集成官网管理与自媒体矩阵运营能力，一站式解决多平台内容分发、品牌一致性维护与运营数据洞察难题，助力企业实现从内容生产到效果分析的全链路智能化升级。
          </p>

          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <a
              href="/login"
              class="glow-button rounded-xl px-4 py-2 text-xs sm:text-sm sm:px-5 sm:py-2.5 font-medium text-white"
            >
              立即体验
            </a>
            <a
              href="https://github.com/spacemv-lab/SpaceMV-CoAI"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1 sm:gap-2 rounded-xl border border-nebula-light px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-stardust transition-all hover:bg-nebula-mid/50 hover:text-starlight"
            >
              GitHub
            </a>
            <a
              href="http://spacemv.com"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1 sm:gap-2 rounded-xl border border-nebula-light px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-stardust transition-all hover:bg-nebula-mid/50 hover:text-starlight"
            >
              SpaceMV
            </a>
            <a
              href="https://mp.weixin.qq.com/s/a_xHH4uaA14TSvuEPFd17w"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-center gap-1 sm:gap-2 rounded-xl border border-nebula-light px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-stardust transition-all hover:bg-nebula-mid/50 hover:text-starlight"
            >
              更多内容
              <ArrowRight class="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        <div class="relative aspect-square w-full justify-self-center lg:aspect-auto lg:h-[500px]">
          <PlanetScene :sun-color="colors.sunColor" />
        </div>
      </div>
    </div>

    <div class="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-deep-space to-transparent" />
  </section>
</template>
