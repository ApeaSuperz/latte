import type { CSSProperties } from 'vue'
import { ColProps, ComponentProps } from '@/types/components'
import type { AxiosPromise } from 'axios'

export interface FormSetProps {
  field: string
  path: string
  value: any
}

export type FormValueType = string | number | string[] | number[] | boolean | undefined | null

export interface FormItemProps {
  labelWidth?: string | number
  required?: boolean
  rules?: Recordable
  error?: string
  showMessage?: boolean
  inlineMessage?: boolean
  style: CSSProperties
}

export interface FormSchema {
  field: string
  label?: string
  labelMessage?: string
  colProps?: ColProps
  componentProps?: { slots?: Recordable } & ComponentProps
  formItemProps?: FormItemProps
  component?: any // TODO
  value?: FormValueType
  hidden?: boolean
  api?: <T = any>() => AxiosPromise<T>
}
