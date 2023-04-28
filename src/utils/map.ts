import AMapLoader from '@amap/amap-jsapi-loader'
import { ShallowRef, shallowRef } from 'vue'
import '@amap/amap-jsapi-types'

export function useAMap(mapContainerId: string, styleClass, options?: AMap.MapOptions): { map: ShallowRef<AMap.Map | null> } {
  // @ts-ignore
  window._AMapSecurityConfig = {
    serviceHost: 'http://latte.hurring.cn/_AMapService',
  }

  const map: ShallowRef<AMap.Map | null> = shallowRef(null)
  AMapLoader.load({
    key: 'ca5e4ecf2567c7806d2c04b2c5742975',
    version: '2.0',
  }).then((AMap) => {
    map.value = new AMap.Map(mapContainerId, options)
  }).catch((e) => {
    console.error(e)
  })

  return { map }
}

export type CollectionPoint = {
  name: string
  address: string
  geo: [number, number]
}

// 交通银行代收点
export const BCM_POINTS: CollectionPoint[] = [
  { name: '扬州分行营业部', address: '扬州市邗江中路477号', geo: [119.399563, 32.381203] },
  { name: '扬州分行荷花支行', address: '扬州市荷花池路5号', geo: [119.430961, 32.379221] },
  { name: '扬州分行竹西支行', address: '扬州市邗沟路60号', geo: [119.441582, 32.417127] },
  { name: '扬州分行琼花支行', address: '扬州市文昌中路251号', geo: [119.44838, 32.394977] },
  { name: '扬州分行润扬支行', address: '扬州市邗江区蒋王红旗大街1号', geo: [119.387752, 32.365451] },
]

// 邮政集团代收点
export const EMS_POINTS: CollectionPoint[] = [
  { name: '邗城邮政支局', address: '扬州市文汇西路209号', geo: [119.39965, 32.379639] },
  { name: '文昌苑邮政支局', address: '扬州市广陵区曲江街道办观潮路719号', geo: [119.47025, 32.39231] },
  { name: '头桥邮政支局', address: '扬州市头桥镇通达路90号', geo: [119.647174, 32.326026] },
  { name: '杨庙邮政支局', address: '扬州市邗江区杨庙镇振兴路', geo: [119.338585, 32.414557] },
  { name: '瓜洲邮政支局', address: '扬州市瓜洲镇洛家路62号', geo: [119.386044, 32.250741] },
]

// 降速银行代收点
export const BJS_POINTS: CollectionPoint[] = [
  { name: '广陵支行', address: '扬州市运河西路520号', geo: [119.46556, 32.388565] },
  { name: '蜀冈支行', address: '扬州市扬子江北路959号', geo: [119.398065, 32.436626] },
  { name: '渡江桥支行', address: '扬州市渡江南路112号', geo: [119.445502, 32.370886] },
  { name: '文昌阁支行', address: '扬州市汶河南路71号', geo: [119.43361, 32.394464] },
  { name: '分行营业部', address: '扬州市文昌西路525号10号楼', geo: [119.383991, 32.389077] },
]

const MARKER_HTML =
  '<div>' +
  '  <img src="{{IMAGE}}" alt="标记点"/>' +
  '</div>'

export type Network = {
  name: string
  points: CollectionPoint[]
  marker: string
}

export const NETWORKS: Network[] = [
  {
    name: '交通银行代收电费(现金缴费)营业网点',
    points: BCM_POINTS,
    marker: MARKER_HTML.replace('{{IMAGE}}', new URL('../assets/marker_bcm.png', import.meta.url).href),
  },
  {
    name: '中国邮政集团有限公司代收电费(现金缴费)营业网点',
    points: EMS_POINTS,
    marker: MARKER_HTML.replace('{{IMAGE}}', new URL('../assets/marker_ems.png', import.meta.url).href),
  },
  {
    name: '江苏银行代收电费(现金缴费) 营业网点',
    points: BJS_POINTS,
    marker: MARKER_HTML.replace('{{IMAGE}}', new URL('../assets/marker_bjs.png', import.meta.url).href),
  },
]
