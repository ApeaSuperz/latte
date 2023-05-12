import {TableColumn} from '@/types/table'
import {FormSchema} from '@/types/form'
import {DescriptionsSchema} from '@/types/descriptions'
import {reactive} from 'vue';
import {eachTree} from '@/utils/tree.ts';
import {AxiosPromise} from 'axios';
import {findIndex} from 'lodash';

export type CrudSchema = Omit<TableColumn, 'children'> & {
  search?: CrudSearchParams
  table?: CrudTableParams
  form?: CrudFormParams
  detail?: CrudDescriptionsParams
  children?: CrudSchema[]
}

type CrudSearchParams = {
  show?: boolean
  dictName?: string
  api?: () => Promise<any>
  field?: string
} & Omit<FormSchema, 'field'>

type CrudTableParams = {
  show?: boolean
} & Omit<FormSchema, 'field'>

type CrudFormParams = {
  dictName?: string
  api?: () => Promise<any>
  show?: boolean
} & Omit<FormSchema, 'field'>

type CrudDescriptionsParams = {
  show?: boolean
} & Omit<DescriptionsSchema, 'field'>

interface AllSchemas {
  searchSchema: FormSchema[]
  tableColumns: TableColumn[]
  formSchema: FormSchema[]
  detailSchema: DescriptionsSchema[]
}

/**
 *
 */
function filterOptions(options: Recordable, labelField?: string) {
  return options?.map((v: Recordable) => {
    if (labelField) {
      v['labelField'] = v.labelField
    } else {
      v['label'] = v.label
    }
    return v
  })
}

function filterSearchSchema(crudSchemas: CrudSchema[], allSchemas: AllSchemas): FormSchema[] {
  const searchSchemas: FormSchema[] = []

  // 获取字典列表队列
  const searchRequestTask: Array<() => Promise<void>> = []

  eachTree(crudSchemas, (schemaItem: CrudSchema) => {
    if (schemaItem?.search?.show) {
      const searchSchema = {
        component: schemaItem.search.component ?? 'Input',
        componentProps: {},
        ...schemaItem.search,
        field: schemaItem.search?.field ?? schemaItem.field,
        label: schemaItem.search?.label ?? schemaItem.label,
      }

      if (searchSchema.dictName) {
        // 如果有字典名称，就从字典列表中获取数据
        // TODO
      } else if (searchSchema.api) {
        searchRequestTask.push(async () => {
          const res = await (searchSchema.api as () => AxiosPromise)()
          if (res) {
            const index = findIndex(allSchemas.searchSchema, (v: FormSchema) => {
              return v.field === searchSchema.field
            })
            if (index !== -1) {
              allSchemas.searchSchema[index].componentProps.options = filterOptions(res, searchSchema.componentProps.optionsAlias?.labelField)
            }
          }
        })
      }
    }
  })
}

export function useCrudSchemas(crudSchemas: CrudSchema[]): AllSchemas {
  const allSchemas = reactive<AllSchemas>({
    searchSchema: [],
    tableColumns: [],
    formSchema: [],
    detailSchema: [],
  })

  const searchSchema =
}
