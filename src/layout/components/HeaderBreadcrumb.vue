<script lang="ts" setup>
import { useDesign } from '@/hooks/web/useDesign'
import { usePermissionStore } from '@/stores/permission'
import { resolveRoutePaths as resolveRoutePath } from '@/utils/route'
import { computed, ref, unref, watch } from 'vue'
import { RouteMeta, RouteRecordRaw, useRoute } from 'vue-router'
import { filterTree, treeToList } from '@/utils/tree'

const { getPrefixClass } = useDesign()
const prefixClass = getPrefixClass('header-breadcrumb')

const permission = usePermissionStore()
const menuRoutes = computed(() => filterBreadcrumb(permission.routes as RouteRecordRaw[]))

const route = useRoute()
const levelList = ref<RouteRecordRaw[]>([])
watch(
  route,
  (route) => {
    if (route.path.startsWith('/redirect')) {
      return
    }

    const currentPath = route.matched.slice(-1)[0].path
    levelList.value = treeToList(
      filterTree<RouteRecordRaw>(unref(menuRoutes) as RouteRecordRaw[], (node) => {
        return node.path === currentPath
      })
    )
  },
  { immediate: true }
)

function filterBreadcrumb(routes: RouteRecordRaw[], parentPath?: string): RouteRecordRaw[] {
  const adminRoutes = routes.find((route) => route.path === '/admin')
  return (adminRoutes?.children ?? routes)
    .filter((route) => !route.meta?.hidden)
    .map((route) => {
      const data =
        route.children?.length === 1
          ? {
              ...route.children[0],
              path: resolveRoutePath(route.children[0].path, adminRoutes ? `/admin/${route.path}` : route.path),
            }
          : { ...route } // 必须要复制一份，否则会修改原始数据
      data.path = resolveRoutePath(data.path, parentPath)
      if (data.children) {
        data.children = filterBreadcrumb(data.children, data.path)
      }
      return data as RouteRecordRaw
    })
}
</script>

<template>
  <ElBreadcrumb :class="prefixClass" separator="/">
    <transition-group appear enter-active-class="animate__animated animate__fadeInRight">
      <ElBreadcrumbItem
        v-for="breadcrumb in levelList"
        :key="breadcrumb.path"
        :to="!breadcrumb.redirect || breadcrumb.redirect === 'noredirect' ? '' : breadcrumb.path"
      >
        <ElIcon v-if="(breadcrumb.meta as RouteMeta)?.icon" :class="prefixClass + '__icon'">
          <component :is="(breadcrumb.meta as RouteMeta).icon as any" />
        </ElIcon>
        {{ breadcrumb.meta?.title }}
      </ElBreadcrumbItem>
    </transition-group>
  </ElBreadcrumb>
</template>

<style lang="less" scoped>
@prefix-class: ~'@{namespace}-header-breadcrumb';
@el-class: ~'@{elNamespace}-breadcrumb';

.@{prefix-class} {
  display: flex;
  align-items: center;
  height: 100%;
  margin-left: 10px;

  &__icon {
    margin-right: 5px;
  }
}

.@{el-class} {
  :deep(&__item) {
    display: flex;

    .@{el-class}__inner {
      display: flex;
      align-items: center;
      color: var(--top-header-text-color);

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  :deep(&__item):not(:last-child) {
    .@{el-class}__inner {
      color: var(--top-header-text-color);

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  :deep(&__item):last-child {
    .@{el-class}__inner {
      color: var(--el-text-color-placeholder);

      &:hover {
        color: var(--el-text-color-placeholder);
      }
    }
  }
}
</style>
