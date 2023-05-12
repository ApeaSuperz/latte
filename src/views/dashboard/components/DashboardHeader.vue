<script lang="ts" setup>
import { useSidebarStore } from '@/stores/sidebar.ts'
import { useUserStore } from '@/stores/user.ts'
import { UserFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const user = useUserStore()
const sidebar = useSidebarStore()
const router = useRouter()

function handleDropdownCommand(command: string) {
  if (command === 'logout') {
    user.$patch((state) => {
      state.name = ''
      state.username = ''
      state.credentials = null
    })
    router.push('/admin/login')
  }
}
</script>

<template>
  <div class="header">
    <div class="collapse-sidebar-button" @click="sidebar.toggleCollapsed">
      <ElIcon v-if="sidebar.collapsed">
        <IEpExpand />
      </ElIcon>
      <ElIcon v-else>
        <IEpFold />
      </ElIcon>
    </div>
    <div class="logo">Latte 管理页</div>
    <div class="user-control">
      <ElAvatar :icon="UserFilled" :size="30" class="user-avatar" />
      <ElDropdown class="user-name" trigger="click" @command="handleDropdownCommand">
        <span class="dropdown-link">
          <span>{{ user.name }}</span>
          <ElIcon class="el-icon--right"><IEpArrowDown /></ElIcon>
        </span>
        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem command="logout">退出登录</ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </div>
  </div>
</template>

<style scoped>
.header {
  position: relative;
  box-sizing: border-box;
  padding: 0 20px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 22px;
  background-color: var(--el-bg-color);
  color: var(--el-text-color-regular);
}

.collapse-sidebar-button {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin-right: 21px;
  cursor: pointer;
}

.header .logo {
  flex: 1;
  text-align: start;
}

.header .user-control {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.user-avatar {
  --el-avatar-bg-color: var(--el-color-primary);
}

.user-name {
  margin-left: 10px;
  font-size: 14px;
}

.user-name .dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style>
