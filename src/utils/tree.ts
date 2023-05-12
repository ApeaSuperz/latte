import { AnyFn } from '@vueuse/core'

export function eachTree(treeData: any[], callback: AnyFn, parentNode = {}) {
  treeData.forEach((element) => {
    const newNode = callback(element, parentNode) ?? element
    if (element.children) {
      eachTree(element.children, callback, newNode)
    }
  })
}
