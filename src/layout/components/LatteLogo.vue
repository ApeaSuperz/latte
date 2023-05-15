<script lang="ts" setup>
import { useDesign } from '@/hooks/web/useDesign'
import { onMounted, ref, watch } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'

const { getPrefixClass } = useDesign()
const prefixClass = getPrefixClass('logo')

const sidebar = useSidebarStore()

const collapsed = ref(false)

onMounted(() => {
  if (sidebar.collapsed) {
    collapsed.value = true
  }
})

let collapseTimer: number
watch(
  () => sidebar.collapsed,
  (val) => {
    clearTimeout(collapseTimer)
    if (!val) {
      collapseTimer = setTimeout(() => {
        collapsed.value = false
      }, 400)
    } else {
      collapsed.value = true
    }
  }
)
</script>

<template>
  <div>
    <router-link :class="prefixClass" to="/admin">
      <img alt="♥" class="image" src="@/assets/imgs/logo.svg" />
      <div v-if="!collapsed" class="name">Latte 管理页</div>
    </router-link>
  </div>
</template>

<style lang="less" scoped>
@prefix-class: ~'@{namespace}-logo';

.@{prefix-class} {
  position: relative;
  display: flex;
  height: var(--logo-height);
  align-items: center;
  cursor: pointer;
  padding-left: 8px;

  .dark & {
    background-color: var(--el-bg-color);
  }

  .image {
    width: calc(var(--logo-height) - 10px);
    height: calc(var(--logo-height) - 10px);
  }

  .name {
    margin-left: 10px;
    font-size: 16px;
    font-weight: 700;
    color: var(--logo-title-text-color);
  }
}
</style>
