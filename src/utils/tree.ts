interface TreeHelperOptions {
  id: string
  children: string
  pid: string
}

const DEFAULT_OPTIONS: TreeHelperOptions = {
  id: 'id',
  children: 'children',
  pid: 'pid',
}

function ensureOptions(options: Partial<TreeHelperOptions>): TreeHelperOptions {
  return Object.assign({}, DEFAULT_OPTIONS, options)
}

export function filterTree<T = any>(
  tree: T[],
  predicate: (node: T) => boolean,
  options: Partial<TreeHelperOptions> = {}
) {
  const nonNullOptions = ensureOptions(options)
  const children = nonNullOptions.children

  function filterList(list: T[]) {
    return list
      .map((node: any) => ({ ...node }))
      .filter((node) => {
        if (node[children]) {
          node[children] = filterList(node[children])
        }
        return predicate(node) || (node[children] && node[children].length)
      })
  }

  return filterList(tree)
}

export function treeToList<T = any>(tree: any, options: Partial<TreeHelperOptions> = {}): T {
  const nonNullOptions = ensureOptions(options)
  const { children } = nonNullOptions
  const result: any = [...tree]
  for (let i = 0; i < result.length; i++) {
    if (!result[i][children]) continue
    result.splice(i + 1, 0, ...result[i][children])
  }
  return result
}
