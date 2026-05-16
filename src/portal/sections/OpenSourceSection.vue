<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->
<script setup>
import { ArrowRight, Github } from 'lucide-vue-next'

const repos = [
  {
    name: 'SpaceMV-CoAI',
    desc: '产业星球运营智能体 - 内容生产及运维工具',
    url: 'https://github.com/spacemv-lab/SpaceMV-CoAI',
    color: '#c084fc',
  },
  {
    name: 'SpaceMV-CoAI-Wp/Wc Backend',
    desc: '平台的核心后端组件，为前端提供逻辑实现和交互接口',
    url: 'https://github.com/spacemv-lab/SpaceMV-CoAI-WpWc-Backend',
    color: '#60a5fa',
  },
  {
    name: 'SpaceMV-CoAI-Wp/Wc Frontend',
    desc: '平台核心前端组件，承担内容可视化编辑、自媒体内容统一创作编排等关键职能',
    url: 'https://github.com/spacemv-lab/SpaceMV-CoAI-WpWc-Frontend',
    color: '#22d3ee',
  },
  {
    name: 'SpaceMV-CoAI-Wp PC端',
    desc: '产业星球运营智能体之 SpaceMV-CoAI-Wp（企业官网）PC端前端展示系统',
    url: 'https://github.com/spacemv-lab/SpaceMV-CoAI-Wp-PC-Frontend',
    color: '#fbbf24',
  },
  {
    name: 'SpaceMV-CoAI-Wp 移动端',
    desc: '产业星球运营智能体之 SpaceMV-CoAI-Wp（企业官网）移动端前端展示系统，响应式布局适配',
    url: 'https://github.com/spacemv-lab/SpaceMV-CoAI-Wp-Mobile-Frontend',
    color: '#fb923c',
  },
]
</script>

<template>
  <section
    id="opensource"
    class="relative py-24 lg:py-32"
    style="background: linear-gradient(180deg, #050816 0%, #0a0e27 50%, #050816 100%);"
  >
    <div class="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
      <div class="grid gap-12 lg:grid-cols-5 lg:gap-16">
        <div class="space-y-8 lg:col-span-2">
          <div class="space-y-4">
            <h2 class="font-heading text-3xl font-medium text-starlight md:text-4xl">
              开源生态
            </h2>
            <p class="text-base leading-relaxed text-stardust">
              五大核心仓库，开放共建内容运营基础设施
            </p>
          </div>

          <a
            href="https://github.com/spacemv-lab"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-center gap-2 text-sm text-cosmic-blue transition-colors hover:text-cosmic-purple"
          >
            <Github class="h-4 w-4" />
            <span>访问 GitHub 组织</span>
            <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div class="space-y-3 lg:col-span-3">
          <a
            v-for="repo in repos"
            :key="repo.name"
            :href="repo.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-center gap-4 rounded-xl border border-nebula-light/20 bg-nebula-mid/50 p-4 transition-all duration-300 hover:border-nebula-light/40 hover:bg-nebula-mid/80"
          >
            <div
              class="w-1 self-stretch rounded-full opacity-60 transition-opacity group-hover:opacity-100"
              :style="{ backgroundColor: repo.color }"
            />

            <div class="min-w-0 flex-1">
              <div class="mb-1 flex items-center gap-2">
                <Github class="h-4 w-4 text-stardust/60" />
                <h3 class="truncate text-sm font-medium text-starlight">
                  {{ repo.name }}
                </h3>
              </div>
              <p class="text-xs leading-relaxed text-stardust/70">
                {{ repo.desc }}
              </p>
            </div>

            <ArrowRight class="h-4 w-4 shrink-0 text-stardust/40 transition-all group-hover:translate-x-1 group-hover:text-starlight" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
