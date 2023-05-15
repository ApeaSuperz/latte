import 'vue-router'
import { Component } from 'vue'

declare module 'vue-router' {
  interface RouteMeta {
    hidden?: boolean
    title?: string
    icon?: string | Component
  }
}
