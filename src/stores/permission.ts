import { defineStore } from 'pinia'
import { RouteRecordRaw } from 'vue-router'
import { ref, Ref } from 'vue'
import { cloneDeep } from 'lodash'
import { asyncRoutesMap, constantRoutesMap } from '@/router'

export const usePermissionStore = defineStore('permission', () => {
  const routes: Ref<RouteRecordRaw[]> = ref([])
  const isAddedRouters = ref(false)
  const additionalRouters: Ref<RouteRecordRaw[]> = ref([])

  function generateRoutes() {
    return new Promise<void>((resolve) => {
      let routerMap: RouteRecordRaw[] = []
      // TODO: 从后端获取路由表
      routerMap = cloneDeep(asyncRoutesMap)

      // 动态路由，404 一定要放在最后
      additionalRouters.value = routerMap.concat([
        {
          path: '/:path(.*)*',
          redirect: '/404',
          name: '404',
          meta: {
            hidden: true,
          },
        },
      ])

      routes.value = cloneDeep(constantRoutesMap).concat(routerMap)
      resolve()
    })
  }

  return {
    routes,
    isAddedRouters,
    additionalRouters,
    generateRoutes,
  }
})
