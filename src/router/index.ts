import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Map',
    meta: {
      title: '地图',
    },
    component: () => import('../views/IndexMap.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
