<script lang="ts" setup>
import { useDesign } from '@/hooks/web/useDesign'
import MenuCollapser from './MenuCollapser.vue'
import HeaderBreadcrumb from './HeaderBreadcrumb.vue'
import { useAppStore } from '@/stores/app'
import { computed } from 'vue'
import UserInfo from './UserInfo.vue'

const { getPrefixClass } = useDesign()
const prefixClass = getPrefixClass('tool-header')

const app = useAppStore()
const mobile = computed(() => app.mobile)
</script>

<template>
  <div :id="prefixClass" :class="prefixClass">
    <div :class="prefixClass + '__left'">
      <MenuCollapser class="collapse-icon hover-trigger" />
      <HeaderBreadcrumb class="breadcrumb" :class="{ 'breadcrumb--hidden': mobile }" />
    </div>
    <div :class="prefixClass + '__right'">
      <UserInfo class="hover-trigger" />
    </div>
  </div>
</template>

<style lang="less" scoped>
@prefix-class: ~'@{namespace}-tool-header';

.@{prefix-class} {
  position: relative;
  height: var(--top-tool-height);
  padding-left: var(--top-tool-p-x);
  padding-right: var(--top-tool-p-x);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: left var(--transition-time-02);

  .dark & {
    background-color: var(--el-bg-color) !important;
  }

  &__left {
    height: 100%;
    display: flex;
    align-items: center;
  }

  .collapse-icon {
    color: var(--top-header-text-color);
  }

  .breadcrumb--hidden {
    display: none;
  }

  &__right {
    height: 100%;
    display: flex;
    align-items: center;
  }
}
</style>
