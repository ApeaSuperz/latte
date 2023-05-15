import { isUrl } from './request'

export function resolveRoutePaths(path: string, parentPath?: string) {
  if (isUrl(path)) return path

  let parentPathCopy
  if (!parentPath || parentPath.length === 0) {
    parentPathCopy = '/admin'
  } else {
    parentPathCopy = parentPath
  }
  const childPath = path.startsWith('/') ? path : `/${path}`
  return `${parentPathCopy}${childPath}`.replace(/\/\//g, '/')
}
