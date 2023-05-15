<script lang="ts" setup>
import { useDesign } from '@/hooks/web/useDesign'
import { useUserStore } from '@/stores/user'
import { UserFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const { getPrefixClass } = useDesign()
const prefixClass = getPrefixClass('user-info')

const user = useUserStore()
const router = useRouter()

function handleDropdownCommand(command: string) {
  if (command === 'logout') {
    user.logout()
    router.push('/admin/login')
  }
}
</script>

<template>
  <ElDropdown :class="prefixClass" trigger="click" @command="handleDropdownCommand">
    <div class="container">
      <ElAvatar :icon="UserFilled" class="user-avatar" />
      <span class="user-name">{{ user.name }}</span>
    </div>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem command="logout">退出登录</ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>

<style lang="less" scoped>
@prefix-class: ~'@{namespace}-user-info';

.size(@size) {
  width: @size;
  height: @size;
}

.@{prefix-class} {
  .container {
    display: flex;
    align-items: center;
  }

  .user-avatar {
    --el-avatar-bg-color: var(--el-color-primary);
    .size(calc(var(--logo-height) - 25px));
  }

  .user-name {
    font-size: 14px;
    padding-left: 5px;
    color: var(--top-header-hover-color);

    @media (max-width: 1024px) {
      display: none;
    }
  }
}
</style>
