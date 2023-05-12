type AlignType = 'left' | 'center' | 'right'

export interface DescriptionsSchema {
  span?: number
  field: string
  label?: string
  width?: string | number
  minWidth?: string | number
  align?: AlignType
  labelAlign?: AlignType
  className?: string
  labelClassName?: string
}
