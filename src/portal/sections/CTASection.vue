<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->
<script setup>
import { ArrowRight, ChevronDown } from 'lucide-vue-next'
</script>

<template>
  <section
    class="relative overflow-hidden py-24 lg:py-32"
    style="background: linear-gradient(180deg, #050816 0%, #1a1f3d 50%, #050816 100%);"
  >
    <div
      class="absolute inset-0 bg-cover bg-center opacity-15"
      style="background-image: url('/ring-debris.jpg');"
    />

    <div class="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-10">
      <svg viewBox="0 0 200 200" class="h-full w-full animate-spin-slow">
        <circle cx="100" cy="100" r="80" fill="none" stroke="#c084fc" stroke-width="0.5" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="#60a5fa" stroke-width="0.5" />
        <ellipse
          cx="100"
          cy="100"
          rx="100"
          ry="30"
          fill="none"
          stroke="#fbbf24"
          stroke-width="0.5"
          transform="rotate(30 100 100)"
        />
      </svg>
    </div>

    <div class="relative z-10 mx-auto max-w-3xl px-5 text-center md:px-10">
      <h2 class="mb-4 font-heading text-3xl font-medium text-starlight md:text-4xl lg:text-5xl">
        启动你的产业星球运营之旅
      </h2>
      <p class="mx-auto mb-6 max-w-xl text-base leading-relaxed text-stardust md:text-lg">
        立即访问 coai.spacemv.com，体验一站式企业内容营销与智能运营
      </p>

      <div class="mb-12 flex flex-wrap items-center justify-center gap-4 pt-4">
        <a
          href="/login"
          class="glow-button group flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-medium text-white"
        >
          在线体验
          <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>

      <div class="mb-4 space-y-2">
        <p class="text-sm text-stardust/60">更多详细产品介绍</p>
        <div class="flex justify-center">
          <ChevronDown class="h-5 w-5 animate-bounce text-stardust/40" />
        </div>
      </div>

      <div class="-mt-4">
        <a
          href="https://mp.weixin.qq.com/s/a_xHH4uaA14TSvuEPFd17w"
          target="_blank"
          rel="noopener noreferrer"
          class="mx-auto block w-full max-w-md rounded-xl border border-nebula-light/30 bg-nebula-mid/30 px-8 py-3 text-sm font-medium text-cosmic-blue transition-all hover:border-cosmic-blue/50 hover:bg-nebula-mid/50"
        >
          SpaceMV-CoAI产业星球运营智能体 - 内容生产及运维工具
        </a>
      </div>
    </div>
  </section>
</template>
