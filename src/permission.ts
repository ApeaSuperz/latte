import router from '@/router'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { useTitle } from '@vueuse/core'

// 不重定向白名单
const whitelist = ['/', '/admin/login']

router.beforeEach(async (to, from, next) => {
  const user = useUserStore()
  const permission = usePermissionStore()

  if (user.loggedIn) {
    if (to.path === '/admin/login') {
      console.log('已登录时尝试访问登录页，无需再登录，跳转到管理页')
      next({ name: 'AdminIndex' })
    } else {
      if (permission.isAddedRouters) {
        next()
        return
      }

      await permission.generateRoutes()

      permission.additionalRouters.forEach((route) => {
        router.addRoute(route)
      })
      const redirectPath = from.query.redirect ?? to.path
      const redirect = decodeURIComponent(redirectPath as string)
      const nextData = to.path === redirect ? { ...to, replace: true } : { path: redirect }
      permission.isAddedRouters = true
      next(nextData)
    }
  } else {
    if (whitelist.includes(to.path)) {
      next()
    } else {
      console.log('未登录时尝试访问需授权页面，跳转到登录页')
      next({ name: 'AdminLogin', query: { redirect: to.path } })
    }
  }
})

const title = useTitle('Latte')

router.afterEach((to) => {
  if (to?.meta?.title) {
    title.value = `${to.meta.title} | Latte`
  } else {
    title.value = 'Latte'
  }
})
