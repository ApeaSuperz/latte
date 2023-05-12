import { createFetch, useFetch } from '@vueuse/core'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.ts'

export const useApiFetch: typeof useFetch = createFetch({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  options: {
    async beforeFetch({ options }) {
      // TODO: 添加 token
      return { options }
    },
  },
})

const service = axios.create({
  timeout: 10000,
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

service.interceptors.request.use(
  (config) => {
    const user = useUserStore()
    const token = user.credentials?.accessToken
    if (token) {
      config.headers.setAuthorization(`Bearer ${token}`)
    }
    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject()
  }
)

service.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response
    } else if (response.status === 401) {
      console.log('服务器响应提示未登录，尝试刷新令牌')
      // TODO

      console.log('服务器响应提示未登录，跳转到登录页')
      useRouter().push({ name: 'AdminLogin' }).then()
      return Promise.reject(Error('未登录'))
    } else {
      return Promise.reject()
    }
  },
  (error) => {
    console.log(error)
    if (error.response) {
      return Promise.reject(Error(error.response.data))
    }
    return Promise.reject()
  }
)

export default service
