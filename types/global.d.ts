import type { CSSProperties } from 'vue'

declare global {
  declare type Recordable<T = any, K = string> = Record<K extends null | undefined ? string : K, T>
}
