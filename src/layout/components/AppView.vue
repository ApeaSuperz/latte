<template>
  <section class="app-wrapper" :class="{ 'app-wrapper--has-footer': false /* TODO */ }">
    <router-view>
      <template #default="{ Component, route }">
        <component :is="Component" :key="route.fullPath" />
      </template>
    </router-view>
  </section>
</template>

<style lang="less" scoped>
.app-wrapper {
  padding: var(--app-content-padding);
  width: 100%;
  background-color: var(--app-content-bg-color);
  min-height: 100%;

  .dark & {
    background-color: var(--el-bg-color);
  }

  &--has-footer {
    min-height: calc(100% - var(--app-footer-height));
  }
}
</style>
