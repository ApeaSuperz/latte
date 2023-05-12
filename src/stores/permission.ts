import { defineStore } from 'pinia'
import { RouteRecordRaw } from 'vue-router'
import { ref, Ref } from 'vue'
import { cloneDeep } from 'lodash'
import { asyncRouterMap, constantRouterMap } from '@/router'

export const usePermissionStore = defineStore('permission', () => {
  const routers: Ref<RouteRecordRaw[]> = ref([])
  const isAddedRouters = ref(false)
  const additionalRouters: Ref<RouteRecordRaw[]> = ref([])

  function generateRoutes() {
    return new Promise<void>((resolve) => {
      let routerMap: RouteRecordRaw[] = []
      // TODO: 从后端获取路由表
      routerMap = cloneDeep(asyncRouterMap)

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

      routers.value = cloneDeep(constantRouterMap).concat(routerMap)
      resolve()
    })
  }

  return {
    routers,
    isAddedRouters,
    additionalRouters,
    generateRoutes,
  }
})
