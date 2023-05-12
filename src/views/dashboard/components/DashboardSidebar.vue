<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { HotWater, OfficeBuilding } from '@element-plus/icons-vue'
import { useSidebarStore } from '@/stores/sidebar.ts'
import { ElMessageBox } from 'element-plus'

const items = [
  {
    index: '/admin/business-halls',
    title: '营业厅',
    icon: OfficeBuilding as any,
  },
  {
    index: '/admin/agents-groups',
    title: '代收点',
    icon: HotWater as any,
  },
]

const route = useRoute()
const activatedIndex = computed(() => {
  return route.path
})

const sidebar = useSidebarStore()
sidebar.$subscribe(() => {
  ElMessageBox.alert('功能暂未实现', '折叠菜单', {
    confirmButtonText: '确定',
    type: 'info',
  })
})
</script>

<template>
  <div class="sidebar">
    <ElMenu :collapse="false" :default-active="activatedIndex" class="sidebar-menu" router unique-opened>
      <template v-for="item in items" :key="item.index">
        <ElMenuItem :index="item.index" class="sidebar-menu--item">
          <ElIcon>
            <component :is="item.icon" />
          </ElIcon>
          <template #title>{{ item.title }}</template>
        </ElMenuItem>
      </template>
    </ElMenu>
  </div>
</template>

<style scoped>
.sidebar {
  position: relative;
  height: 100%;
}

.sidebar-menu {
  position: relative;
  height: 100%;
}
</style>
