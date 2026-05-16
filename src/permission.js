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

const whiteList = ['/', '/login', '/register', '/forgetPassword', '/terms', '/privacy']

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (to.path === '/') {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        useUserStore().getInfo().then(() => {
          isRelogin.show = false
          usePermissionStore().generateRoutes().then(accessRoutes => {
            accessRoutes.forEach(route => {
              if (!isHttp(route.path)) {
                router.addRoute(route)
              }
            })
            if (accessRoutes && accessRoutes.length > 0) {
              const firstRoute = accessRoutes[0]
              let targetPath = firstRoute.path
              if (!targetPath.startsWith('/')) {
                targetPath = '/' + targetPath
              }
              if (firstRoute.children && firstRoute.children.length > 0) {
                let childPath = firstRoute.children[0].path
                if (!childPath.startsWith('/')) {
                  childPath = targetPath + (targetPath.endsWith('/') ? '' : '/') + childPath
                }
                targetPath = childPath
              }
              next({ path: targetPath, replace: true })
            } else {
              next({ path: '/index', replace: true })
            }
          })
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
        })
      } else {
        const permissionStore = usePermissionStore()
        let accessRoutes = permissionStore.addRoutes?.length > 0 
          ? permissionStore.addRoutes 
          : (permissionStore.defaultRoutes?.length > 0 ? permissionStore.defaultRoutes : [])
        
        if (accessRoutes && accessRoutes.length > 0) {
          const firstRoute = accessRoutes[0]
          let targetPath = firstRoute.path
          if (!targetPath.startsWith('/')) {
            targetPath = '/' + targetPath
          }
          if (firstRoute.children && firstRoute.children.length > 0) {
            let childPath = firstRoute.children[0].path
            if (!childPath.startsWith('/')) {
              childPath = targetPath + (targetPath.endsWith('/') ? '' : '/') + childPath
            }
            targetPath = childPath
          }
          next({ path: targetPath, replace: true })
        } else {
          next({ path: '/index', replace: true })
        }
      }
    } else if (isWhiteList(to.path)) {
      next()
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        useUserStore().getInfo().then(() => {
          isRelogin.show = false
          usePermissionStore().generateRoutes().then(accessRoutes => {
            accessRoutes.forEach(route => {
              if (!isHttp(route.path)) {
                router.addRoute(route)
              }
            })
            next({ ...to, replace: true })
          })
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    if (isWhiteList(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
