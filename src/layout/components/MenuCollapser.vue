<script lang="ts" setup>
import { useDesign } from '@/hooks/web/useDesign'
import { useSidebarStore } from '@/stores/sidebar'
import { computed } from 'vue'

defineProps<{
  color?: string
}>()

const { getPrefixClass } = useDesign()
const prefixClass = getPrefixClass('menu-collapser')

const sidebar = useSidebarStore()
const collapsed = computed(() => sidebar.collapsed)
</script>

<template>
  <div :class="prefixClass">
    <ElIcon :color="color" size="18px" @click="sidebar.toggleCollapsed">
      <IEpExpand v-if="collapsed" /><IEpFold v-else />
    </ElIcon>
  </div>
</template>

<style lang="less" scoped>
@prefix-class: ~'@{namespace}-menu-collapser';

.@{prefix-class} {
  cursor: pointer;
}
</style>
