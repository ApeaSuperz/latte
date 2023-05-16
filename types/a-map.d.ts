namespace AMap {
  export interface Poi {
    id: string
    name: string
    type: string
    location: LngLat
    address: string
    tel: string
    website?: string
    pcode?: string
    citycode?: string
    adcode?: string
    postcode?: string
    pname?: string
    cityname?: string
    adname?: string
    email?: string
    entr_location?: LngLat
    exit_location?: LngLat
  }

  export interface NearbyPoi extends Poi {
    distance: number
  }
}
