export interface ColProps {
  span?: number
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
  tag?: string
}

export type ComponentOptions = {
  label?: string
  value?: FormValueType
  disabled?: boolean
  key?: string | number
  children?: ComponentOptions[]
  options?: ComponentOptions[]
} & Recordable

export interface ComponentOptionAlias {
  labelField?: string
  valueField?: string
}

export type ComponentProps = {
  optionsAlias?: ComponentOptionAlias
  options?: ComponentOptions[]
  optionSlot?: string
} & Recordable
