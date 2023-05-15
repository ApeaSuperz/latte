<script lang="ts" setup>
import { computed } from 'vue'
import { useDesign } from '@/hooks/web/useDesign'
import { useAppStore } from '@/stores/app'
import { useSidebarStore } from '@/stores/sidebar'
import LatteLogo from './components/LatteLogo.vue'
import LatteMenu from './components/latte-menu/LatteMenu.vue'
import ToolHeader from './components/ToolHeader.vue'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'
import { onMounted } from 'vue'
import AppView from './components/AppView.vue'

const { getPrefixClass } = useDesign()

const app = useAppStore()
const sidebar = useSidebarStore()
const user = useUserStore()

onMounted(() => {
  if (user.loggedIn && user.name.length === 0) {
    request('/me').then((res) => {
      if (res.data) {
        user.$patch(res.data)
      }
    })
  }
})

const mobile = computed(() => app.mobile)
const collapsed = computed(() => sidebar.collapsed)
const pageLoading = computed(() => app.pageLoading)

const prefixClass = getPrefixClass('layout')

function handleClickOutside() {
  sidebar.collapsed = true
}
</script>

<template>
  <section :class="[prefixClass, { [prefixClass + '--mobile']: mobile, [prefixClass + '--collapsed']: collapsed }]">
    <div v-if="mobile && !collapsed" class="fullscreen-overlay" @click="handleClickOutside"></div>
    <div class="left-menu">
      <LatteLogo class="left-menu__logo" />
      <LatteMenu class="left-menu__menu" />
    </div>
    <div class="content">
      <ElScrollbar v-loading="pageLoading" class="content-wrapper">
        <div class="header-wrapper">
          <ToolHeader class="header" />
        </div>
        <AppView />
      </ElScrollbar>
    </div>
  </section>
</template>

<style lang="less" scoped>
@prefix-class: ~'@{namespace}-layout';

.@{prefix-class} {
  background-color: var(--app-content-bg-color);
  width: 100%;
  height: 100%;
  position: relative;

  &--mobile {
    .left-menu {
      position: fixed !important;
      z-index: 3000;
    }
    .content {
      position: fixed;
      width: 100%;
      left: 0;
    }
    .header-wrapper {
      width: 100%;
      left: 0;
    }
  }

  &--collapsed {
    .left-menu {
      &__logo {
        width: var(--left-menu-min-width);
      }
    }
  }

  &--mobile&--collapsed {
    .left-menu {
      &__logo {
        width: 0;
      }
    }
  }

  &--collapsed:not(&--mobile) {
    .content {
      width: calc(100% - var(--left-menu-min-width));
      left: var(--left-menu-min-width);
    }
    .header-wrapper {
      width: calc(100% - var(--left-menu-min-width));
      left: var(--left-menu-min-width);
    }
  }

  &:not(&--mobile):not(&--collapsed) {
    .content {
      width: calc(100% - var(--left-menu-max-width));
      left: var(--left-menu-max-width);
    }
    .header-wrapper {
      width: calc(100% - var(--left-menu-max-width));
      left: var(--left-menu-max-width);
    }
  }

  :deep(.@{elNamespace}-scrollbar__view) {
    height: 100% !important;
  }

  :deep(.hover-trigger) {
    display: flex;
    height: 100%;
    padding: 1px 10px 0;
    cursor: pointer;
    align-items: center;
    transition: background-color var(--transition-time-02);

    &:hover {
      background-color: var(--top-header-hover-color);

      .dark & {
        background-color: var(--el-bg-color-overlay);
      }
    }
  }

  .fullscreen-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.3;
    z-index: 99;
    background-color: var(--el-color-black);
  }

  .left-menu {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;

    &__logo {
      background-color: var(--left-menu-bg-color);
      border-bottom-width: 1px;
      border-bottom-color: var(--logo-border-color);
      width: var(--left-menu-max-width);
      transition: all var(--transition-time-02);

      .dark & {
        border-bottom-color: var(--el-border-color);
      }
    }

    &__menu {
      height: calc(100% - var(--logo-height));
    }
  }

  .content {
    position: absolute;
    top: 0;
    height: 100%;
    transition: all var(--transition-time-02);
  }

  .content-wrapper {
    height: calc(100% - var(--top-tool-height));
    margin-top: calc(var(--top-tool-height));
  }

  .header-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    transition: all var(--transition-time-02);
  }

  .header {
    border-bottom: 1px solid var(--top-tool-border-color);
    background-color: var(--top-header-bg-color);

    .dark & {
      border-color: var(--el-border-color);
    }
  }
}
</style>
