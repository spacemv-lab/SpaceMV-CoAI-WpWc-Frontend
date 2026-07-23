<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->
<script setup>
import {
  BarChart3,
  Database,
  FileText,
  Globe,
  Layout,
  MapPin,
  Monitor,
  Share2,
  Shield,
  Sparkles,
  Users,
} from 'lucide-vue-next'

const features = [
  {
    icon: BarChart3,
    title: '智能运营分析中台',
    desc: '',
    tags: ['全渠道数据', '深度洞察', '安全预警'],
    color: '#22d3ee',
    details: [
      {
        icon: Database,
        text: '全渠道数据抓取：实时同步各自媒体平台原生数据，确保数据来源的准确性。',
      },
      {
        icon: Sparkles,
        text: '深度运营洞察：提供用户增长、阅读趋势及内容传播规律的自动化分析报告。',
      },
      {
        icon: Shield,
        text: '安全监测预警：提供页面防篡改与流量异常监测，全方位守护企业数字资产。',
      },
    ],
  },
  {
    icon: Share2,
    title: 'SpaceMV-CoAI-Wc',
    desc: '自媒体创作与分发中心',
    tags: ['统一创作', '审核机制', '交互增强'],
    color: '#c084fc',
    details: [
      {
        icon: Users,
        text: '统一创作平台：集成微信公众号、小红书等主流平台，实现跨平台内容一键同步与下架。',
      },
      {
        icon: Shield,
        text: '严谨审核机制：内置基于角色的审核流程，保障企业品牌安全与内容质量。',
      },
      {
        icon: MapPin,
        text: '交互式内容增强：支持在推文中嵌入交互式数据报表与地图，提升内容吸引力。',
      },
    ],
  },
  {
    icon: Globe,
    title: 'SpaceMV-CoAI-Wp',
    desc: '智能官网内容管理',
    tags: ['插件化设计', '实时编辑', '多端适配'],
    color: '#60a5fa',
    details: [
      {
        icon: Layout,
        text: '插件化设计：提供丰富的版面插件库，支持用户自主导入并动态构建个性化页面布局。',
      },
      {
        icon: FileText,
        text: '实时交互编辑：直观的图文替换与实时发布功能，确保品牌信息第一时间触达用户。',
      },
      {
        icon: Monitor,
        text: '多端适配渲染：自动适配 PC 端与移动端，提供一致的高质量视觉体验。',
      },
    ],
  },
]
</script>

<template>
  <section
    id="features"
    class="relative py-24 lg:py-32"
    style="background: radial-gradient(ellipse at center, rgba(10,14,39,1) 0%, rgba(5,8,22,1) 70%);"
  >
    <div
      class="absolute inset-0 bg-cover bg-center opacity-10"
      style="background-image: url('/data-flow.jpg');"
    />

    <div class="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
      <div class="mb-16 space-y-4 text-center">
        <h2 class="font-heading text-3xl font-medium text-starlight md:text-4xl">
          核心模块
        </h2>
        <p class="mx-auto max-w-md text-base text-stardust">
          三大轨道系统，构建内容运营宇宙
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-3 lg:gap-8">
        <article
          v-for="feature in features"
          :key="feature.title"
          class="group relative rounded-2xl border border-nebula-light/30 bg-nebula-dark/80 p-6 transition-all duration-500 hover:-translate-y-2 hover:border-nebula-light/60 lg:p-8"
        >
          <div
            class="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            :style="{ background: `linear-gradient(135deg, ${feature.color}20, transparent)` }"
          />

          <div class="relative mb-6 flex items-start gap-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110"
              :style="{ backgroundColor: `${feature.color}15`, color: feature.color }"
            >
              <component :is="feature.icon" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="mb-1 font-heading text-xl font-medium text-starlight">
                {{ feature.title }}
              </h3>
              <p class="text-sm leading-relaxed text-stardust">
                {{ feature.desc }}
              </p>
            </div>
          </div>

          <div class="relative mb-6 space-y-3">
            <div
              v-for="detail in feature.details"
              :key="detail.text"
              class="flex items-start gap-3 rounded-lg bg-nebula-mid/40 p-3"
            >
              <div class="mt-0.5" :style="{ color: feature.color }">
                <component :is="detail.icon" class="h-4 w-4" />
              </div>
              <span class="text-xs leading-relaxed text-stardust/80">
                {{ detail.text }}
              </span>
            </div>
          </div>

          <div class="relative flex flex-wrap gap-2">
            <span
              v-for="tag in feature.tags"
              :key="tag"
              class="rounded-lg px-2.5 py-1 text-xs text-stardust/80"
              :style="{ backgroundColor: `${feature.color}15` }"
            >
              {{ tag }}
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
