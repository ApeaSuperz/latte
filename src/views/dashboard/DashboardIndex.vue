<script lang="ts" setup>
import DashboardSidebar from './components/DashboardSidebar.vue'
import DashboardHeader from './components/DashboardHeader.vue'
import { useUserStore } from '@/stores/user.ts'
import request from '../../utils/request.ts'

const user = useUserStore()

if (user.loggedIn && user.name.length === 0) {
  request('/me').then((res) => {
    if (res.data) {
      user.$patch(res.data)
    }
  })
}
</script>

<template>
  <ElContainer class="full-height">
    <ElHeader class="no-padding">
      <DashboardHeader />
    </ElHeader>
    <ElContainer class="full-height">
      <ElAside class="full-height">
        <DashboardSidebar />
      </ElAside>
      <ElMain class="no-padding">
        <RouterView v-slot="{ Component }">
          <transition mode="out-in" name="move">
            <component :is="Component" />
          </transition>
        </RouterView>
      </ElMain>
    </ElContainer>
  </ElContainer>
</template>

<style scoped>
.no-padding {
  padding: 0;
}

.full-height {
  position: relative;
  height: 100%;
}
</style>
