import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp, isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register']

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (isWhiteList(to.path)) {
      next()
    } else {
      // 处理根路径跳转逻辑
      const shouldRedirectRoot = to.path === '/'
      
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        // 判断当前用户是否已拉取完user_info信息
        useUserStore().getInfo().then(() => {
          isRelogin.show = false
          usePermissionStore().generateRoutes().then(accessRoutes => {
            // 根据roles权限生成可访问的路由表
            accessRoutes.forEach(route => {
              if (!isHttp(route.path)) {
                router.addRoute(route) // 动态添加可访问路由表
              }
            })
            // 如果是从登录页跳转过来或直接访问根路径，则跳转到第一个路由
            if ((from.path === '/login' && to.path === '/') || shouldRedirectRoot) {
              // 直接使用generateRoutes返回的accessRoutes
              if (accessRoutes && accessRoutes.length > 0) {
                const firstRoute = accessRoutes[0]
                // 确保路径格式正确
                let targetPath = firstRoute.path
                if (!targetPath.startsWith('/')) {
                  targetPath = '/' + targetPath
                }
                
                // 如果有子路由，跳转到第一个子路由
                if (firstRoute.children && firstRoute.children.length > 0) {
                  let childPath = firstRoute.children[0].path
                  if (!childPath.startsWith('/')) {
                    childPath = targetPath + (targetPath.endsWith('/') ? '' : '/') + childPath
                  } else {
                    childPath = childPath
                  }
                  targetPath = childPath
                }

                next({ path: targetPath, replace: true })
              } else {
                // 如果没有可用路由，跳转到首页
                next({ path: '/index', replace: true })
              }
            } else {
              next({ ...to, replace: true })
            }
          })
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
        })
      } else {
        // 已经登录并获取了角色信息，直接访问根路径时跳转到第一个可用路由
        if (to.path === '/') {
          const permissionStore = usePermissionStore()
          let accessRoutes = []
          
          // 优先使用addRoutes或defaultRoutes
          if (permissionStore.addRoutes && permissionStore.addRoutes.length > 0) {
            accessRoutes = permissionStore.addRoutes
          } else if (permissionStore.defaultRoutes && permissionStore.defaultRoutes.length > 0) {
            accessRoutes = permissionStore.defaultRoutes
          }
          
          if (accessRoutes && accessRoutes.length > 0) {
            const firstRoute = accessRoutes[0]
            let targetPath = firstRoute.path
            
            // 确保路径格式正确
            if (!targetPath.startsWith('/')) {
              targetPath = '/' + targetPath
            }
            
            // 如果有子路由，跳转到第一个子路由
            if (firstRoute.children && firstRoute.children.length > 0) {
              let childPath = firstRoute.children[0].path
              if (!childPath.startsWith('/')) {
                childPath = targetPath + (targetPath.endsWith('/') ? '' : '/') + childPath
              } else {
                childPath = childPath
              }
              targetPath = childPath
            }
            
            next({ path: targetPath, replace: true })
          } else {
            next({ path: '/index', replace: true })
          }
        } else {
          next()
        }
      }
    }
  } else {
    // 没有token
    if (isWhiteList(to.path)) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
