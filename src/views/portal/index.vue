<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->
<script setup>
import '@/portal/index.css'
import CursorTrail from '@/portal/components/CursorTrail.vue'
import NavigationBar from '@/portal/components/NavigationBar.vue'
import HeroSection from '@/portal/sections/HeroSection.vue'
import FeaturesSection from '@/portal/sections/FeaturesSection.vue'
import OpenSourceSection from '@/portal/sections/OpenSourceSection.vue'
import CTASection from '@/portal/sections/CTASection.vue'
import FooterSection from '@/portal/sections/FooterSection.vue'
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden bg-deep-space text-starlight">
    <CursorTrail />
    <NavigationBar />

    <main>
      <HeroSection />
      <FeaturesSection />
      <OpenSourceSection />
      <CTASection />
    </main>

    <FooterSection />
  </div>
</template>
