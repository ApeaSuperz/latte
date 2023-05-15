<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core'
import { unref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useSidebarStore } from '@/stores/sidebar'
import { setCssVar } from '@/utils/css'
import { useDesign } from '@/hooks/web/useDesign'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

withDefaults(
  defineProps<{
    size: 'default' | 'small' | 'large'
  }>(),
  {
    size: 'default',
  }
)

const { variables } = useDesign()

const app = useAppStore()
const sidebar = useSidebarStore()

const { width } = useWindowSize()
watch(
  width,
  (width) => {
    if (width < 768) {
      app.mobile = true
      setCssVar('--left-menu-min-width', '0')
      sidebar.collapsed = true
    } else {
      app.mobile = false
      setCssVar('--left-menu-min-width', '64px')
    }
  },
  { immediate: true }
)

app.$subscribe(
  (_mutation, state) => {
    if (unref(state.dark)) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  },
  { immediate: true }
)
</script>

<template>
  <ElConfigProvider :locale="zhCn" :message="{ max: 1 }" :namespace="variables.elNamespace" :size="size">
    <slot></slot>
  </ElConfigProvider>
</template>

<style scoped></style>
