export interface BusinessHour {
  id: number
  weekday: number
  open: string
  close: string
}

export interface BusinessHall {
  id: number
  name: string
  address: string
  landmark: string
  traffic: string
  longitude: number
  latitude: number
  businessTime: BusinessHour[]
}

export interface AgentsGroup {
  id: number
  name: string
}

export interface Agent {
  id: number
  name: string
  address: string
  longitude: number
  latitude: number
  businessTime: BusinessHour[]
}
