<script lang="ts" setup>
import { useDesign } from '@/hooks/web/useDesign'
import { useSidebarStore } from '@/stores/sidebar'
import { computed } from 'vue'
import { usePermissionStore } from '@/stores/permission'
import { RouteRecordRaw, useRoute, useRouter } from 'vue-router'
import { DashboardRoute } from './types'
import { resolveRoutePaths } from '@/utils/route'
import { isUrl } from '@/utils/request'
import LatteMenuItems from './LatteMenuItems.vue'

const emit = defineEmits<{
  (e: 'select', index: string): void
}>()

const { getPrefixClass } = useDesign()
const prefixClass = getPrefixClass('menu')

const sidebar = useSidebarStore()
const permission = usePermissionStore()

const collapsed = computed(() => sidebar.collapsed)

const routes = computed(() => {
  const adminRoute = permission.routes.find((route) => route.path === '/admin')
  if (!adminRoute?.children) return [] as DashboardRoute[]

  const visibleDashboardRoutes = adminRoute?.children
    .filter((route: RouteRecordRaw) => !route.meta?.hidden)
    .map((route: RouteRecordRaw) => toDashboardRoute(route))

  if (!visibleDashboardRoutes) {
    return [] as DashboardRoute[]
  }

  // 确保所有路由有 children 属性就一定有子路由，children 为空数组的都换为 undefined。
  // 同时，提升子路由。
  const processedRoutes = [] as DashboardRoute[]
  for (const route of visibleDashboardRoutes) {
    if (!route.children || route.children.length === 0) {
      route.children = undefined
      processedRoutes.push(route)
      continue
    }

    // 如果可见的子路由只有一个，将其提升为顶级路由
    const hoistedChildRoute = tryGetTheOnlyRoute(route)
    if (hoistedChildRoute) {
      if (hoistedChildRoute?.children?.length === 0) {
        hoistedChildRoute.children = undefined
      }
      processedRoutes.push(hoistedChildRoute)
    } else {
      processedRoutes.push(route)
    }
  }

  return processedRoutes
})

/**
 * 尝试获取路由的唯一可见子路由。
 * @return 如果没有可见子路由，返回自身，如果有多个可见子路由，返回 null。
 */
function tryGetTheOnlyRoute(parent: DashboardRoute): DashboardRoute | null {
  if (!parent.children || parent.children.length === 0) {
    return parent
  }

  const visibleChildren = parent.children.filter((child) => !child.meta?.hidden) as DashboardRoute[]
  if (visibleChildren.length === 0) {
    return parent
  }
  if (visibleChildren.length === 1) {
    // 深度获取子路由的唯一可见子路由，如果没有，返回这个子路由（因为对于 parent 来说，这个子路由就是唯一可见的子路由）
    const child = tryGetTheOnlyRoute(visibleChildren[0])
    if (child) {
      return child
    } else {
      return visibleChildren[0]
    }
  }
  return null
}

function toDashboardRoute(route: RouteRecordRaw, parent?: DashboardRoute): DashboardRoute {
  function isDashboardRoute(route: any): route is DashboardRoute {
    return route.fullPath !== undefined
  }

  if (isDashboardRoute(route)) return route

  const dashboardRoute: DashboardRoute = {
    ...route,
    fullPath: resolveRoutePaths(route.path, parent?.fullPath),
    children: undefined,
  }
  if (route.children) {
    dashboardRoute.children = route.children.map((child) => toDashboardRoute(child, dashboardRoute))
  }
  return dashboardRoute
}

const router = useRouter()

function onMenuSelect(index: string) {
  emit('select', index)

  if (isUrl(index)) {
    window.open(index)
  } else {
    router.push(index)
  }
}

const route = useRoute()
const activatedIndex = computed(() => {
  return route.path
})
</script>

<template>
  <div :id="prefixClass" :class="[prefixClass, { [prefixClass + '--collapsed']: collapsed }]">
    <ElScrollbar>
      <ElMenu
        :collapse="collapsed"
        :default-active="activatedIndex"
        active-text-color="var(--left-menu-text-active-color)"
        background-color="var(--left-menu-bg-color)"
        text-color="var(--left-menu-text-color)"
        @select="onMenuSelect"
      >
        <LatteMenuItems :prefix-class="prefixClass" :routes="routes" />
      </ElMenu>
    </ElScrollbar>
  </div>
</template>

<style lang="less" scoped>
@prefix-class: ~'@{namespace}-menu';

.is-active--after {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  background-color: var(--el-color-primary);
  content: '';
}

.@{prefix-class} {
  position: relative;
  height: 100%;
  width: var(--left-menu-max-width);
  overflow: hidden;
  background-color: var(--left-menu-bg-color);
  transition: width var(--transition-time-02);

  &--collapsed {
    width: var(--left-menu-min-width);
  }

  &:after {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    border-left: 1px solid var(--left-menu-border-color);
    content: '';
  }

  :deep(.@{elNamespace}-menu) {
    width: 100%;
    border-right: none;
    --bg-color: var(--left-menu-bg-color);
    --text-color: var(--left-menu-text-color);
    --active-color: var(--left-menu-text-active-color);

    // 选中时子标题的颜色
    .is-active {
      & > .@{elNamespace}-sub-menu__title {
        color: var(--left-menu-text-active-color);
      }
    }

    // 子菜单悬停的高亮和背景色
    .@{elNamespace}-sub-menu__title,
    .@{elNamespace}-menu-item {
      &:hover {
        color: var(--left-menu-text-active-color);
        background-color: var(--left-menu-bg-color);
      }
    }

    // 选中时的高亮背景和高亮颜色
    .@{elNamespace}-sub-menu.is-active,
    .@{elNamespace}-menu-item.is-active {
      color: var(--left-menu-text-active-color);
      background-color: var(--left-menu-bg-active-color);

      &:hover {
        background-color: var(--left-menu-bg-active-color);
      }
    }

    .@{elNamespace}-menu-item.is-active {
      position: relative;

      &:after {
        .is-active--after;
      }
    }

    // 子菜单的背景颜色
    .@{elNamespace}-menu {
      .@{elNamespace}-sub-menu__title,
      .@{elNamespace}-menu-item:not(.is-active) {
        background-color: var(--left-menu-bg-light-color);
      }
    }
  }

  // 折叠时的最小宽度
  :deep(.@{elNamespace}-menu--collapse) {
    width: var(--left-menu-min-width);

    & > .is-active,
    & > .is-active > .@{elNamespace}-sub-menu__title {
      position: relative;
      background-color: var(--left-menu-collapse-bg-active-color);

      &:after {
        .is-active--after;
      }
    }
  }

  // 折叠动画播放的时候，就需要把文字给隐藏掉
  :deep(.horizontal-collapse-transition) {
    // transition: 0s width ease-in-out, 0s padding-left ease-in-out, 0s padding-right ease-in-out !important;
    .@{prefix-class}__title {
      display: none;
    }
  }
}
</style>

<style lang="less">
@prefix-class: ~'@{namespace}-menu-popper';

.is-active--after {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  background-color: var(--el-color-primary);
  content: '';
}

.@{prefix-class} {
  // 选中时子标题的颜色
  .is-active {
    & > .el-sub-menu__title {
      color: var(--left-menu-text-active-color);
    }
  }

  // 子菜单悬停的高亮和背景色
  .el-sub-menu__title,
  .el-menu-item {
    &:hover {
      color: var(--left-menu-text-active-color);
      background-color: var(--left-menu-bg-color);
    }
  }

  // 选中时的高亮背景
  .el-menu-item.is-active {
    position: relative;
    background-color: var(--left-menu-bg-active-color);

    &:hover {
      background-color: var(--left-menu-bg-active-color);
    }

    &:after {
      .is-active--after;
    }
  }
}
</style>
