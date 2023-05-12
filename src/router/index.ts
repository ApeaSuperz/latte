import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { App } from 'vue'

export const constantRouterMap: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Map',
    meta: {
      title: '地图',
    },
    component: () => import('@/views/IndexMap.vue'),
  },
  {
    path: '/admin',
    name: 'AdminIndex',
    meta: {
      hidden: true,
    },
    redirect: '/admin/business-halls',
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    meta: {
      title: '管理员登录',
      hidden: true,
    },
    component: () => import('@/views/AdminLogin.vue'),
  },
  // TODO: 404
]

export const asyncRouterMap: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('@/views/dashboard/DashboardIndex.vue'),
    redirect: '/admin/business-halls', // TODO: 数据分析页
    name: 'Dashboard',
    meta: {
      title: '营业厅管理',
    },
    children: [
      {
        path: 'business-halls',
        component: () => import('@/views/dashboard/components/BusinessHalls.vue'),
        name: 'BusinessHalls',
        meta: {
          title: '营业厅管理',
        },
      },
      {
        path: 'agents-groups',
        component: () => import('@/views/dashboard/components/AgentsGroups.vue'),
        name: 'AgentsGroups',
        meta: {
          title: '代收点管理',
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  strict: true,
  routes: constantRouterMap,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

export function resetRouter() {
  const resetWhiteNameList = ['Map', 'AdminLogin']
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !resetWhiteNameList.includes(name as string)) {
      if (router.hasRoute(name)) {
        router.removeRoute(name)
      }
    }
  })
}

export function setupRouter(app: App<Element>) {
  app.use(router)
}

export default router
