import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
  state: () => {
    return {
      collapsed: false,
    }
  },
  actions: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed
    },
  },
})
