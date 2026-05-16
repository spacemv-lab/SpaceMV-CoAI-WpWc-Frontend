<!--
 * Copyright (c) 2026 成都天巡微小卫星科技有限责任公司
 * This project is licensed under the MIT License - see the LICENSE file in the project root for details.
-->
<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  sunColor: {
    type: String,
    required: true,
  },
})

const containerRef = ref(null)

let renderer = null
let camera = null
let scene = null
let animationId = 0
let cleanupResize = null
let earthUniforms = null
let earth = null
let planetGroup = null

const earthVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const earthFragmentShader = `
  precision mediump float;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform vec3 uSunColor;

  void main() {
    float softBand = 0.5 + 0.5 * sin(vUv.y * 12.0 + uTime * 0.15);
    vec3 surfaceColor = vec3(0.02, 0.05, 0.12);
    vec3 bandColor = vec3(0.04, 0.10, 0.22);
    vec3 color = mix(surfaceColor, bandColor, softBand * 0.18);
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);
    color += vec3(0.25, 0.65, 1.0) * fresnel * 0.7;
    
    float spec = pow(max(dot(reflect(-lightDir, vNormal), viewDir), 0.0), 20.0);
    color += mix(uSunColor, vec3(0.9, 0.95, 1.0), 0.5) * spec * 0.5;
    
    gl_FragColor = vec4(color, 1.0);
  }
`

const disposeScene = () => {
  if (cleanupResize) {
    cleanupResize()
    cleanupResize = null
  }

  if (animationId) {
    window.cancelAnimationFrame(animationId)
    animationId = 0
  }

  if (renderer && containerRef.value?.contains(renderer.domElement)) {
    containerRef.value.removeChild(renderer.domElement)
  }

  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose()
      }
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => {
          if (material.map) {
            material.map.dispose()
          }
          material.dispose()
        })
      }
    })
  }

  renderer?.dispose()
  renderer = null
  camera = null
  scene = null
  earthUniforms = null
}

const initScene = () => {
  const container = containerRef.value
  if (!container) {
    return
  }

  disposeScene()

  const width = container.clientWidth
  const height = container.clientHeight

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.8
  container.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x050816, 0.04)

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.set(0, 0, 6.5)

  planetGroup = new THREE.Group()
  scene.add(planetGroup)

  const earthGeo = new THREE.SphereGeometry(1.6, 128, 64)
  earthUniforms = {
    uTime: { value: 0 },
    uSunColor: { value: new THREE.Color(props.sunColor) },
  }

  const earthMat = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms: earthUniforms,
  })

  earth = new THREE.Mesh(earthGeo, earthMat)
  planetGroup.add(earth)

  const wireMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.62, 3),
    new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    }),
  )
  planetGroup.add(wireMesh)

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.9, 64, 64),
    new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        uniform float uTime;
        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
          float pulse = 0.7 + 0.3 * sin(uTime * 0.8);
          vec3 color = vec3(0.1, 0.4, 0.8) * fresnel * pulse;
          gl_FragColor = vec4(color, fresnel * 0.8 * pulse);
        }
      `,
      uniforms: {
        uTime: earthUniforms.uTime,
      },
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  planetGroup.add(atmosphere)

  const glowCanvas = document.createElement('canvas')
  glowCanvas.width = 256
  glowCanvas.height = 256
  const glowCtx = glowCanvas.getContext('2d')
  if (!glowCtx) {
    return
  }

  const glowGradient = glowCtx.createRadialGradient(128, 128, 0, 128, 128, 128)
  glowGradient.addColorStop(0, 'rgba(30, 120, 200, 0.2)')
  glowGradient.addColorStop(0.4, 'rgba(20, 60, 140, 0.1)')
  glowGradient.addColorStop(1, 'rgba(5, 8, 22, 0)')
  glowCtx.fillStyle = glowGradient
  glowCtx.fillRect(0, 0, 256, 256)

  const glowSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(glowCanvas),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  glowSprite.scale.set(6, 6, 1)
  planetGroup.add(glowSprite)

  const rings = []
  const ringConfigs = [
    { radius: 2.3, tube: 0.01, color: 0xffffff, opacity: 0.25, tiltX: 0.3, tiltY: 0.2, speed: 0.3 },
    { radius: 2.6, tube: 0.008, color: 0x22d3ee, opacity: 0.3, tiltX: 0.6, tiltY: 0.8, speed: -0.2 },
  ]

  ringConfigs.forEach((config) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(config.radius, config.tube, 16, 200),
      new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: config.opacity,
        side: THREE.DoubleSide,
      }),
    )
    ring.rotation.x = Math.PI * config.tiltX
    ring.rotation.y = Math.PI * config.tiltY
    planetGroup.add(ring)

    const nodes = Array.from({ length: 4 }, () => {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
        }),
      )
      planetGroup.add(node)
      return node
    })

    rings.push({ ring, nodes, radius: config.radius, speed: config.speed })
  })

  const particleCount = 60
  const positions = new Float32Array(particleCount * 3)
  for (let index = 0; index < particleCount; index += 1) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const radius = 2.0 + Math.random() * 1.5
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[index * 3 + 2] = radius * Math.cos(phi)
  }

  const dataParticles = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }),
  )
  dataParticles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  planetGroup.add(dataParticles)

  const starCount = 1200
  const starPositions = new Float32Array(starCount * 3)
  const starColors = new Float32Array(starCount * 3)
  const palette = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xa0c4ff),
    new THREE.Color(0xc084fc),
    new THREE.Color(0x60a5fa),
  ]

  for (let index = 0; index < starCount; index += 1) {
    starPositions[index * 3] = (Math.random() - 0.5) * 80
    starPositions[index * 3 + 1] = (Math.random() - 0.5) * 80
    starPositions[index * 3 + 2] = (Math.random() - 0.5) * 80
    const color = palette[Math.floor(Math.random() * palette.length)]
    starColors[index * 3] = color.r
    starColors[index * 3 + 1] = color.g
    starColors[index * 3 + 2] = color.b
  }

  const stars = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    }),
  )
  stars.geometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  stars.geometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
  scene.add(stars)

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.5)
  mainLight.position.set(3, 2, 5)
  scene.add(mainLight)

  const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5)
  fillLight.position.set(-3, -1, -2)
  scene.add(fillLight)

  scene.add(new THREE.AmbientLight(0x0a1628, 0.8))

  const startTime = performance.now()
  const animate = () => {
    animationId = window.requestAnimationFrame(animate)
    const elapsed = (performance.now() - startTime) / 1000
    earthUniforms.uTime.value = elapsed
    earth.rotation.y = elapsed * 0.15
    earth.rotation.x = Math.sin(elapsed * 0.05) * 0.1
    planetGroup.rotation.y = elapsed * 0.05
    dataParticles.rotation.y = elapsed * 0.02
    dataParticles.rotation.x = Math.sin(elapsed * 0.1) * 0.1
    stars.rotation.y = elapsed * 0.005

    rings.forEach(({ ring, nodes, radius, speed }) => {
      ring.rotation.z = elapsed * speed
      nodes.forEach((node, nodeIndex) => {
        const angle = elapsed * speed * 2 + (nodeIndex / nodes.length) * Math.PI * 2
        const baseX = Math.cos(angle) * radius
        const baseY = Math.sin(angle) * radius
        const rx = ring.rotation.x
        const rz = ring.rotation.z
        node.position.x = baseX * Math.cos(rz) - baseY * Math.sin(rz)
        node.position.y = baseX * Math.sin(rz) * Math.cos(rx) + baseY * Math.cos(rz) * Math.cos(rx)
        node.position.z = baseX * Math.sin(rz) * Math.sin(rx) + baseY * Math.cos(rz) * Math.sin(rx)
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 3 + nodeIndex * 2)
        node.scale.setScalar(0.6 + pulse * 0.8)
        node.material.opacity = 0.4 + pulse * 0.6
      })
    })

    const glowPulse = 0.9 + 0.1 * Math.sin(elapsed * 0.6)
    glowSprite.scale.set(6 * glowPulse, 6 * glowPulse, 1)
    glowSprite.material.opacity = 0.6 * glowPulse
    renderer.render(scene, camera)
  }

  const handleResize = () => {
    if (!container || !camera || !renderer) {
      return
    }
    const nextWidth = container.clientWidth
    const nextHeight = container.clientHeight
    camera.aspect = nextWidth / nextHeight
    camera.updateProjectionMatrix()
    renderer.setSize(nextWidth, nextHeight)
  }

  cleanupResize = () => {
    window.removeEventListener('resize', handleResize)
  }

  window.addEventListener('resize', handleResize)
  animate()
}

watch(
  () => props.sunColor,
  (value) => {
    if (earthUniforms) {
      earthUniforms.uSunColor.value = new THREE.Color(value)
    }
  },
)

onMounted(() => {
  initScene()
})

onBeforeUnmount(() => {
  disposeScene()
})
</script>

<template>
  <div ref="containerRef" class="h-full w-full" style="touch-action: none;" />
</template>
