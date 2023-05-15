import { defineStore, skipHydrate } from 'pinia'
import { ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { isBrowserDarkMode } from '@/utils/css'

export const useAppStore = defineStore('app', () => {
  const mobile = ref(false)
  const dark = useLocalStorage('dark', isBrowserDarkMode)
  const pageLoading = ref(false)

  return {
    mobile,
    dark: skipHydrate(dark),
    pageLoading,
  }
})
