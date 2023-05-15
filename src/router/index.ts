import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { App } from 'vue'
import { HotWater, OfficeBuilding } from '@element-plus/icons-vue'

export const constantRoutesMap: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Map',
    meta: {
      title: '地图',
      hidden: true,
    },
    component: () => import('@/views/IndexMap.vue'),
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

export const asyncRoutesMap: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('@/layout/DashboardLayout.vue'),
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
          icon: OfficeBuilding,
        },
      },
      {
        path: 'agents-groups',
        component: () => import('@/views/dashboard/components/AgentsGroups.vue'),
        name: 'AgentsGroups',
        meta: {
          title: '代收点管理',
          icon: HotWater,
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  strict: true,
  routes: constantRoutesMap,
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
