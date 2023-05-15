import { StorageSerializers, useSessionStorage } from '@vueuse/core'
import { defineStore, skipHydrate } from 'pinia'
import { computed, ref } from 'vue'

interface UserCredentials {
  accessToken: string
  refreshToken: string
}

export const useUserStore = defineStore('user', () => {
  const credentials = useSessionStorage<UserCredentials | null>('credentials', null, {
    serializer: StorageSerializers.object,
  })
  const name = ref('')
  const username = ref('')

  const loggedIn = computed(() => credentials.value !== null)

  function logout() {
    credentials.value = null
    name.value = ''
    username.value = ''
  }

  return {
    credentials: skipHydrate(credentials),
    name,
    username,
    loggedIn,
    logout,
  }
})
