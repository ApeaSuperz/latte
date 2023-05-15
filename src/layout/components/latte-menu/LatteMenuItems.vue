<script lang="ts" setup>
import { useDesign } from '@/hooks/web/useDesign'
import { DashboardRoute } from './types'

defineProps<{
  routes: DashboardRoute[]
  prefixClass: string
}>()

const { getPrefixClass } = useDesign()
</script>

<template>
  <template v-for="route in routes" :key="route.path">
    <ElSubMenu v-if="route.children" :index="route.fullPath" :popper-class="getPrefixClass('menu-popper')">
      <template #title>
        <ElIcon v-if="route.meta?.icon"><component :is="route.meta.icon" /></ElIcon>
        <span :class="prefixClass + '__title'">{{ route.meta?.title ?? '无标题' }}</span>
      </template>
      <template #default>
        <LatteMenuItems :routes="route.children" :prefix-class="prefixClass" />
      </template>
    </ElSubMenu>
    <ElMenuItem v-else :index="route.fullPath">
      <ElIcon v-if="route.meta?.icon"><component :is="route.meta.icon" /></ElIcon>
      <span :class="prefixClass + '__title'">{{ route.meta?.title ?? '无标题' }}</span>
    </ElMenuItem>
  </template>
</template>
