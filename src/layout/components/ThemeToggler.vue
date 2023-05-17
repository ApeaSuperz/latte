<script lang="ts" setup>
import { useDesign } from '@/hooks/web/useDesign'
import { useAppStore } from '@/stores/app'

const { getPrefixClass } = useDesign()
const prefixClass = getPrefixClass('theme-toggler')

const app = useAppStore()
</script>

<template>
  <div :class="prefixClass" @click="app.toggleDarkTheme">
    <div :aria-checked="app.dark" aria-label="切换暗色主题" class="switch" role="switch">
      <div class="switch__action">
        <div class="switch__icon">
          <ElIcon>
            <IEpMoon class="dark-icon" />
            <IEpSunny class="light-icon" />
          </ElIcon>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- TODO: 移动端主题切换按钮 -->
<style lang="less" scoped>
@prefix-class: ~'@{namespace}-theme-toggler';

.@{prefix-class} {
  color: var(--top-header-text-color);
  transition: border-color var(--transition-time-02), background-color var(--transition-time-02);
  background-color: transparent;
  border-radius: 50%;
  height: 24px;
  padding: 0 12px;
  display: none;

  // 只在电脑端显示，移动端做一个菜单按钮，点进去有切换主题的按钮
  @media screen and (min-width: 768px) {
    display: flex;
    align-items: center;
  }

  .switch {
    margin: 0;
    display: inline-block;
    position: relative;
    width: 40px;
    height: 20px;
    border: 1px solid var(--top-tool-border-color);
    outline: none;
    border-radius: 10px;
    box-sizing: border-box;
    background-color: var(--mute-bg-color);
    cursor: pointer;
    transition: border-color var(--transition-time-02), background-color var(--transition-time-02);

    &__action,
    &__icon {
      width: 16px;
      height: 16px;
    }

    &__action {
      position: absolute;
      top: 1px;
      left: 1px;
      border-radius: 50%;
      background-color: var(--top-header-bg-color);
      transition: border-color var(--transition-time-02), background-color var(--transition-time-02),
        transform var(--transition-time-02);

      .dark & {
        transform: translate(20px);
        background-color: var(--el-bg-color);
      }
    }

    &__icon {
      position: relative;
    }
  }

  .dark-icon {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;

    .dark & {
      opacity: 1;
    }
  }

  .light-icon {
    opacity: 1;
    position: absolute;
    top: 0;
    left: 0;

    .dark & {
      opacity: 0;
    }
  }
}
</style>
