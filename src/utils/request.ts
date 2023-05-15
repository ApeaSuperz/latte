import { createFetch, useFetch } from '@vueuse/core'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

export const useApiFetch: typeof useFetch = createFetch({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  options: {
    async beforeFetch({ options }) {
      // TODO: 添加 token
      return { options }
    },
  },
})

export function isUrl(s: string): boolean {
  const reg =
    /(((^https?:(?:\/\/)?)(?:[-:&=+$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&%@.\w_]*)#?(?:[\w]*))?)$/
  return reg.test(s)
}

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
      useRouter().push({ name: 'AdminLogin' })
      return Promise.reject(Error('未登录'))
    } else {
      return Promise.reject()
    }
  },
  (error: AxiosError) => {
    console.log(error)

    if (error.response) {
      if (error.response.status === 401) {
        console.log('服务器响应提示未登录，尝试刷新令牌')
        // TODO

        console.log('服务器响应提示未登录，跳转到登录页')
        useUserStore().credentials = null
        useRouter().push({ name: 'AdminLogin' })
        return Promise.reject(Error('未登录或登录过期'))
      }

      ElMessage.error(error?.response?.data?.toString())
      return Promise.reject(Error(error?.response?.data?.toString()))
    }
    ElMessage.error(error.message)
    return Promise.reject()
  }
)

export default service
