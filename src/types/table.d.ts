export type TableColumn = {
  field: string
  label?: string
  children?: TableColumn[]
} & Recordable

export type TableSlotDefault = {
  row: Recordable
  column: TableColumn
  $index: number
} & Recordable

export interface TableSetProps {
  field: string
  path: string
  value: any
}
