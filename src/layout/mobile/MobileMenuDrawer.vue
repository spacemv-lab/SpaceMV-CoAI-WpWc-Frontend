<template>
  <van-popup
    :show="show"
    position="left"
    :style="{ width: '88vw', maxWidth: '360px', height: '100dvh' }"
    overlay
    safe-area-inset-top
    safe-area-inset-bottom
    class="mobile-menu-popup"
    @update:show="handleUpdateShow"
  >
    <div class="mobile-drawer ignore-vw">
      <div v-if="showLogo" class="mobile-drawer-logo">
        <img v-if="logo" :src="logo" class="mobile-drawer-logo-image" />
        <span class="mobile-drawer-logo-title">{{ title }}</span>
      </div>

      <div class="mobile-drawer-scroll">
        <template v-for="(route, index) in visibleRouters" :key="route.path + index">
          <div v-if="route.meta" class="mobile-menu-group">
            <button
              v-if="shouldRenderSingle(route)"
              type="button"
              :class="['mobile-menu-link', { active: isActive(resolvePath(route.path, getSingleVisibleChild(route).path)) }]"
              @click="handleNavigate(resolvePath(route.path, getSingleVisibleChild(route).path, getSingleVisibleChild(route).query))"
            >
              <span class="mobile-menu-icon">
                <svg-icon :icon-class="getSingleVisibleChild(route).meta?.icon || route.meta?.icon" />
              </span>
              <span class="mobile-menu-text">{{ getSingleVisibleChild(route).meta?.title }}</span>
            </button>

            <template v-else>
              <button
                type="button"
                class="mobile-menu-parent"
                :class="{ active: isGroupActive(route) }"
                @click="toggleExpand(resolvePath(route.path, ''))"
              >
                <span class="mobile-menu-parent-main">
                  <span class="mobile-menu-icon">
                    <svg-icon :icon-class="route.meta?.icon" />
                  </span>
                  <span class="mobile-menu-text">{{ route.meta?.title }}</span>
                </span>
                <span class="mobile-menu-arrow" :class="{ expanded: expandedKeys.includes(resolvePath(route.path, '')) }">+</span>
              </button>

              <div v-show="expandedKeys.includes(resolvePath(route.path, ''))" class="mobile-menu-children">
                <button
                  v-for="(child, childIndex) in getVisibleChildren(route.children)"
                  :key="child.path + childIndex"
                  type="button"
                  :class="['mobile-menu-child', { active: isActive(resolvePath(route.path, child.path)) }]"
                  @click="handleNavigate(resolvePath(route.path, child.path, child.query))"
                >
                  <span class="mobile-menu-child-text">{{ child.meta?.title }}</span>
                </button>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import logo from '@/assets/logo/logo.png'
import { isExternal } from '@/utils/validate'
import { getNormalPath } from '@/utils/tianxun'
import usePermissionStore from '@/store/modules/permission'
import useSettingsStore from '@/store/modules/settings'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show'])

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()
const settingsStore = useSettingsStore()

const title = import.meta.env.VITE_APP_TITLE
const showLogo = computed(() => settingsStore.sidebarLogo)
const sidebarRouters = computed(() => permissionStore.sidebarRouters)
const visibleRouters = computed(() => sidebarRouters.value.filter(item => !item.hidden))
const expandedKeys = ref([])

watch(
  () => route.path,
  () => {
    syncExpandedByRoute()
  },
  { immediate: true }
)

function handleUpdateShow(value) {
  emit('update:show', value)
}

function handleNavigate(target) {
  router.push(target)
  emit('update:show', false)
}

function isActive(path) {
  return route.path === path
}

function isGroupActive(item) {
  if (!item?.children?.length) return false
  return item.children.some(child => !child.hidden && resolvePath(item.path, child.path) === route.path)
}

function toggleExpand(key) {
  if (expandedKeys.value.includes(key)) {
    expandedKeys.value = expandedKeys.value.filter(item => item !== key)
    return
  }
  expandedKeys.value = [...expandedKeys.value, key]
}

function syncExpandedByRoute() {
  const matched = route.matched?.[0]?.path
  if (matched && !expandedKeys.value.includes(matched)) {
    expandedKeys.value = [...expandedKeys.value, matched]
  }
}

function getVisibleChildren(children = []) {
  return children.filter(item => !item.hidden && item.meta)
}

function getSingleVisibleChild(parent) {
  const children = parent?.children || []
  const showingChildren = children.filter(item => !item.hidden && item.meta)
  if (showingChildren.length === 1) {
    return showingChildren[0]
  }
  if (showingChildren.length === 0) {
    return { ...parent, path: '', noShowingChildren: true }
  }
  return null
}

function shouldRenderSingle(route) {
  const singleChild = getSingleVisibleChild(route)
  return !!(singleChild && (!singleChild.children || singleChild.noShowingChildren) && !route.alwaysShow)
}

function resolvePath(basePath, routePath = '', routeQuery) {
  if (isExternal(basePath)) {
    return basePath
  }
  if (isExternal(routePath)) {
    return routePath
  }
  const fullPath = getNormalPath(`${basePath || ''}/${routePath || ''}`)
  if (routeQuery) {
    const query = JSON.parse(routeQuery)
    return { path: fullPath, query }
  }
  return fullPath
}
</script>

<style scoped lang="scss">
.mobile-menu-popup {
  background: transparent;
}

.ignore-vw.mobile-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #23324a 0%, #1f2d43 100%);
  color: #fff;
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

.ignore-vw .mobile-drawer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 64px;
  padding: calc(env(safe-area-inset-top, 0px) + 18px) 18px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.ignore-vw .mobile-drawer-logo-image {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
}

.ignore-vw .mobile-drawer-logo-title {
  font-size: 17px;
  line-height: 1.4;
  font-weight: 700;
  color: #f3f6fb;
}

.ignore-vw .mobile-drawer-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 14px 14px calc(env(safe-area-inset-bottom, 0px) + 18px);
}

.ignore-vw .mobile-menu-group + .mobile-menu-group {
  margin-top: 8px;
}

.ignore-vw .mobile-menu-link,
.ignore-vw .mobile-menu-parent,
.ignore-vw .mobile-menu-child {
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
}

.ignore-vw .mobile-menu-link,
.ignore-vw .mobile-menu-parent {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  padding: 0 16px;
  border-radius: 16px;
  color: rgba(243, 246, 251, 0.86);
}

.ignore-vw .mobile-menu-link.active,
.ignore-vw .mobile-menu-parent.active {
  background: rgba(92, 122, 244, 0.18);
  color: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(122, 151, 255, 0.16);
}

.ignore-vw .mobile-menu-parent-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.ignore-vw .mobile-menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.ignore-vw .mobile-menu-icon :deep(.svg-icon) {
  width: 20px;
  height: 20px;
  font-size: 20px;
}

.ignore-vw .mobile-menu-text,
.ignore-vw .mobile-menu-child-text {
  font-size: 16px;
  line-height: 1.5;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ignore-vw .mobile-menu-arrow {
  font-size: 20px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.56);
  transition: transform 0.2s ease;
}

.ignore-vw .mobile-menu-arrow.expanded {
  transform: rotate(45deg);
  color: #ffffff;
}

.ignore-vw .mobile-menu-children {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  padding-left: 12px;
}

.ignore-vw .mobile-menu-child {
  min-height: 46px;
  padding: 0 16px 0 22px;
  border-radius: 14px;
  color: rgba(243, 246, 251, 0.72);
}

.ignore-vw .mobile-menu-child.active {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}
</style>
