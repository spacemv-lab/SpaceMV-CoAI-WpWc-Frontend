<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvasRef = ref(null)
const points = []
const mouse = { x: -100, y: -100, lastMove: 0 }
let animationId = 0
let resizeHandler = null
let moveHandler = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  resizeHandler = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  moveHandler = (event) => {
    mouse.x = event.clientX
    mouse.y = event.clientY
    mouse.lastMove = performance.now()
    points.push({ x: event.clientX, y: event.clientY, life: 1 })
    if (points.length > 20) {
      points.shift()
    }
  }

  const animate = () => {
    animationId = window.requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const now = performance.now()
    if (now - mouse.lastMove > 1000) {
      for (let index = points.length - 1; index >= 0; index -= 1) {
        points[index].life -= 0.02
        if (points[index].life <= 0) {
          points.splice(index, 1)
        }
      }
    }

    if (points.length < 2) {
      return
    }

    for (let index = 1; index < points.length; index += 1) {
      const p1 = points[index - 1]
      const p2 = points[index]
      const alpha = (index / points.length) * p2.life * 0.6

      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    points.forEach((point, index) => {
      const alpha = (index / points.length) * point.life * 0.8
      ctx.beginPath()
      ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`
      ctx.fill()
    })
  }

  resizeHandler()
  window.addEventListener('resize', resizeHandler)
  window.addEventListener('mousemove', moveHandler)
  animate()
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationId)
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  if (moveHandler) {
    window.removeEventListener('mousemove', moveHandler)
  }
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="pointer-events-none fixed inset-0 z-[9999]"
    style="mix-blend-mode: screen;"
  />
</template>
