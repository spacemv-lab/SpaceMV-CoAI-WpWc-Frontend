/**
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
 **/
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const phaseColors = {
  dawn: {
    sunColor: '#fdba74',
    ambientColor: '#4a3728',
    skyHue: 25,
    label: '清晨',
  },
  day: {
    sunColor: '#ffffff',
    ambientColor: '#1a1f3d',
    skyHue: 220,
    label: '白昼',
  },
  dusk: {
    sunColor: '#fb923c',
    ambientColor: '#3d2828',
    skyHue: 15,
    label: '黄昏',
  },
  night: {
    sunColor: '#818cf8',
    ambientColor: '#0a0e27',
    skyHue: 260,
    label: '夜晚',
  },
}

function getPhaseByHour(hour) {
  if (hour >= 5 && hour < 8) {
    return 'dawn'
  }
  if (hour >= 8 && hour < 17) {
    return 'day'
  }
  if (hour >= 17 && hour < 19) {
    return 'dusk'
  }
  return 'night'
}

export function useTimeOfDay() {
  const now = ref(new Date())
  let timerId = null

  const update = () => {
    now.value = new Date()
  }

  onMounted(() => {
    update()
    timerId = window.setInterval(update, 60000)
  })

  onBeforeUnmount(() => {
    if (timerId) {
      window.clearInterval(timerId)
    }
  })

  const hour = computed(() => now.value.getHours())
  const minute = computed(() => now.value.getMinutes())
  const phase = computed(() => getPhaseByHour(hour.value))
  const colors = computed(() => phaseColors[phase.value])
  const formattedTime = computed(() => {
    const h = String(hour.value).padStart(2, '0')
    const m = String(minute.value).padStart(2, '0')
    return `${h}:${m} · ${colors.value.label}`
  })

  return {
    hour,
    minute,
    phase,
    colors,
    formattedTime,
  }
}
