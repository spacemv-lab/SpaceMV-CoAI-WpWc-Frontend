<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->
<script setup>
import { Globe, Github, Heart } from 'lucide-vue-next'

const currentYear = new Date().getFullYear()

const footerLinks = [
  {
    title: '产品',
    links: [
      { label: '产品特性', href: '#features' },
      { label: '更新日志', href: 'https://github.com/spacemv-lab/SpaceMV-CoAI/releases' },
      { label: '产品试用', href: '/login' },
    ],
  },
  {
    title: '资源',
    links: [
      { label: '帮助文档', href: 'https://github.com/spacemv-lab/SpaceMV-CoAI' },
      { label: '开源仓库', href: 'https://github.com/spacemv-lab/SpaceMV-CoAI' },
    ],
  },
  {
    title: '联系我们',
    links: [
      { label: '商务合作', href: 'mailto:contact@spacemv.com', tooltip: '028 - 8564 - 6535、txms@spacemv.com' },
      { label: '简历投递', href: '#', tooltip: '191-8223-5403、hr@spacemv.com' },
      { label: '反馈建议', href: '#', tooltip: '028 - 8564 - 6535、txms@spacemv.com' },
    ],
  },
]
</script>

<template>
  <footer class="relative border-t border-nebula-light/30 bg-deep-space">
    <div class="mx-auto max-w-7xl px-5 py-16 md:px-10 xl:px-48">
      <div class="grid grid-cols-2 gap-12 lg:gap-16 md:grid-cols-8">
        <div class="col-span-2 space-y-4 md:col-span-4">
          <div class="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" class="h-8 w-8 rounded-full" />
            <span class="text-sm font-semibold text-starlight">SpaceMV-CoAI</span>
            <div class="flex items-center gap-3">
              <a
                href="https://github.com/spacemv-lab"
                target="_blank"
                rel="noopener noreferrer"
                class="group relative rounded-lg bg-nebula-mid/50 p-2 text-stardust transition-all hover:bg-nebula-mid hover:text-starlight"
                aria-label="GitHub"
              >
                <Github class="h-4 w-4" />
                <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden min-w-max rounded-lg border border-nebula-light/30 bg-deep-space px-3 py-2 text-xs text-stardust/80 shadow-lg group-hover:block whitespace-nowrap">
                  GitHub
                </span>
              </a>
              <a
                href="http://spacemv.com"
                target="_blank"
                rel="noopener noreferrer"
                class="group relative rounded-lg bg-nebula-mid/50 p-2 text-stardust transition-all hover:bg-nebula-mid hover:text-starlight"
                aria-label="官网"
              >
                <Globe class="h-4 w-4" />
                <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden min-w-max rounded-lg border border-nebula-light/30 bg-deep-space px-3 py-2 text-xs text-stardust/80 shadow-lg group-hover:block whitespace-nowrap">
                  SpaceMV
                </span>
              </a>
            </div>
          </div>

          <p class="text-xs leading-relaxed text-stardust/60">
            AI Agent 驱动的一站式企业内容营销与智能运营平台
          </p>

          <div class="flex items-center gap-3">
            <img src="/SpaceMV-Lab.jpg" alt="SpaceMV-Lab" class="h-20 w-20 rounded-lg" />
            <img src="/SpaceMV.jpg" alt="SpaceMV" class="h-20 w-20 rounded-lg" />
            <img src="/SpaceMV-Wendao.jpg" alt="SpaceMV问道" class="h-20 w-20 rounded-lg" />
          </div>
        </div>

        <div class="col-span-2 flex gap-12 md:col-span-4 lg:gap-24">
          <div
            v-for="section in footerLinks"
            :key="section.title"
            class="w-max space-y-2"
          >
            <h4 class="text-sm font-medium text-starlight">
              {{ section.title }}
            </h4>
            <ul class="space-y-1.5">
              <li v-for="link in section.links" :key="link.label">
                <a
                  :href="link.href"
                  :target="link.href.startsWith('http') ? '_blank' : undefined"
                  :rel="link.href.startsWith('http') ? 'noopener noreferrer' : undefined"
                  class="group relative flex flex-col text-xs text-stardust/60 transition-colors hover:text-cosmic-blue"
                >
                  <span>{{ link.label }}</span>
                  <span
                    v-if="link.tooltip"
                    class="absolute bottom-full left-0 mb-2 hidden min-w-max rounded-lg border border-nebula-light/30 bg-deep-space px-3 py-2 text-xs text-stardust/80 shadow-lg group-hover:block"
                  >
                    {{ link.tooltip }}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-nebula-light/20 pt-8 md:flex-row">
        <p class="text-xs text-stardust/40">
          Copyright © 2020-{{ currentYear }} SpaceMV.com All Rights Reserved.
        </p>
        <p class="flex items-center gap-1 text-xs text-stardust/40">
          Made with <Heart class="h-3 w-3 text-cosmic-purple" /> by SpaceMV
        </p>
      </div>
    </div>
  </footer>
</template>
