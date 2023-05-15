export type DashboardRoute = Omit<RouteRecordRaw, 'children'> & {
  fullPath: string
  children?: DashboardRoute[]
}
