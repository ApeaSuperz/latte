import '@amap/amap-jsapi-types'
import {InjectionKey, Ref, shallowRef, ShallowRef, watch} from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import {
  Arrayable,
  Fn,
  GeneralEventListener,
  MaybeRefOrGetter,
  toValue,
  tryOnMounted,
  tryOnScopeDispose
} from "@vueuse/core";

export interface CollectionPoint {
  name: string
  address: string
  geo: [number, number]
}

// 交通银行代收点
export const BCM_POINTS: CollectionPoint[] = [
  {name: '扬州分行营业部', address: '扬州市邗江中路477号', geo: [119.399563, 32.381203]},
  {name: '扬州分行荷花支行', address: '扬州市荷花池路5号', geo: [119.430961, 32.379221]},
  {name: '扬州分行竹西支行', address: '扬州市邗沟路60号', geo: [119.441582, 32.417127]},
  {name: '扬州分行琼花支行', address: '扬州市文昌中路251号', geo: [119.44838, 32.394977]},
  {name: '扬州分行润扬支行', address: '扬州市邗江区蒋王红旗大街1号', geo: [119.387752, 32.365451]},
]

// 邮政集团代收点
export const EMS_POINTS: CollectionPoint[] = [
  {name: '邗城邮政支局', address: '扬州市文汇西路209号', geo: [119.39965, 32.379639]},
  {name: '文昌苑邮政支局', address: '扬州市广陵区曲江街道办观潮路719号', geo: [119.47025, 32.39231]},
  {name: '头桥邮政支局', address: '扬州市头桥镇通达路90号', geo: [119.647174, 32.326026]},
  {name: '杨庙邮政支局', address: '扬州市邗江区杨庙镇振兴路', geo: [119.338585, 32.414557]},
  {name: '瓜洲邮政支局', address: '扬州市瓜洲镇洛家路62号', geo: [119.386044, 32.250741]},
]

// 降速银行代收点
export const BJS_POINTS: CollectionPoint[] = [
  {name: '广陵支行', address: '扬州市运河西路520号', geo: [119.46556, 32.388565]},
  {name: '蜀冈支行', address: '扬州市扬子江北路959号', geo: [119.398065, 32.436626]},
  {name: '渡江桥支行', address: '扬州市渡江南路112号', geo: [119.445502, 32.370886]},
  {name: '文昌阁支行', address: '扬州市汶河南路71号', geo: [119.43361, 32.394464]},
  {name: '分行营业部', address: '扬州市文昌西路525号10号楼', geo: [119.383991, 32.389077]},
]

const MARKER_HTML =
  '<div style="position: relative; width: 50px; height: 68px">' +
  '  <img src="{{IMAGE}}" alt="标记点" style="width: 100%; height: 100%"/>' +
  '</div>'

export interface Network {
  name: string
  points: CollectionPoint[]
  marker: string
  image: string
}

export const NETWORKS: Network[] = [
  {
    name: '交通银行代收电费(现金缴费)营业网点',
    points: BCM_POINTS,
    marker: MARKER_HTML.replace('{{IMAGE}}', new URL('../assets/marker_bcm.png', import.meta.url).href),
    image: new URL('../assets/marker_bcm.png', import.meta.url).href,
  },
  {
    name: '中国邮政集团有限公司代收电费(现金缴费)营业网点',
    points: EMS_POINTS,
    marker: MARKER_HTML.replace('{{IMAGE}}', new URL('../assets/marker_ems.png', import.meta.url).href),
    image: new URL('../assets/marker_ems.png', import.meta.url).href,
  },
  {
    name: '江苏银行代收电费(现金缴费) 营业网点',
    points: BJS_POINTS,
    marker: MARKER_HTML.replace('{{IMAGE}}', new URL('../assets/marker_bjs.png', import.meta.url).href),
    image: new URL('../assets/marker_bjs.png', import.meta.url).href,
  },
]

export const DEFAULT_CENTER: [number, number] = [119.41565, 32.393669]
export const DEFAULT_ZOOM = 14

export interface AMapKeySecretPair {
  key: string
  secret: string
}

export interface AMapKeyHostPair {
  key: string
  serviceHost: string
}

export type AMapKeyPair = AMapKeySecretPair | AMapKeyHostPair

export interface UseAMapOptions extends AMap.MapOptions {
  mapId: MaybeRefOrGetter<string>
  keyPair: MaybeRefOrGetter<AMapKeyPair>
}

export interface UseAMapReturn {
  map: Ref<AMap.Map | null>
}

export function useAMap(options: UseAMapOptions): UseAMapReturn {
  const {mapId: id, keyPair} = options
  const map: ShallowRef<AMap.Map | null> = shallowRef(null)

  let loadPromise: Ref<Promise<typeof AMap> | null> = shallowRef(null)
  const stopWatchKeyPair = watch(
    () => toValue(keyPair),
    (keyPair) => {
      console.log('密钥对变化，加载地图')

      tryOnMounted(() => {
        (window as any)._AMapSecurityConfig = {
          serviceHost: (keyPair as AMapKeyHostPair).serviceHost,
          securityJsCode: (keyPair as AMapKeySecretPair).secret,
        }

        loadPromise.value = AMapLoader.load({
          key: keyPair.key,
          version: '2.0',
        })
      })
    },
    {immediate: true},
  )

  const stopWatchForMap = watch(
    () => [toValue(id), toValue(loadPromise)] as [string, Promise<typeof AMap> | null],
    ([id, promise]) => {
      console.log('地图加载器变化，创建地图实例')

      promise?.then((AMap) => {
        // 复制一份，传入的参数可能是只读的，高德要改这个对象
        const aMapOptions: AMap.MapOptions = {...options}

        map.value = new AMap.Map(id, aMapOptions)
      }).catch((e) => {
        console.error(e)
      })
    },
  )

  tryOnScopeDispose(() => {
    stopWatchKeyPair()
    stopWatchForMap()
  })

  return {map}
}

/**
 * 在 mounted 时使用 {@link AMap.Eventable#on} 注册，并且在 unmounted 时自动使用 {@link AMap.Eventable#off}。
 *
 * @param target
 * @param event
 * @param listener
 * @return {Function} 取消注册的函数
 */
export function useAMapEventListener<EventType = AMap.EventType>(
  target: MaybeRefOrGetter<AMap.Eventable>,
  event: Arrayable<EventType>,
  listener: Arrayable<GeneralEventListener<any>>,
): Fn {
  if (!Array.isArray(event))
    event = [event]
  if (!Array.isArray(listener))
    listener = [listener]

  const cleanups: Function[] = []
  const cleanup = () => {
    cleanups.forEach(fn => fn())
    cleanups.length = 0
  }

  const register = (el: AMap.Eventable, event: AMap.EventType, listener: any) => {
    el.on(event, listener)
    return () => el.off(event, listener)
  }

  const stopWatch = watch(
    () => toValue(target),
    (el) => {
      cleanup()
      if (!el)
        return

      cleanups.push(
        ...(event as AMap.EventType[]).flatMap((event) => {
          return (listener as Function[]).map((listener) => register(el, event, listener))
        }),
      )
    },
    {immediate: true, flush: 'post'},
  )

  const stop = () => {
    stopWatch()
    cleanup()
  }

  tryOnScopeDispose(stop)

  return stop
}

export const aMapInjectionKey = Symbol('AMap-Instance') as InjectionKey<Ref<AMap.Map | null>>
export const registerAMapComponentFuncInjectionKey =
  Symbol('AMap-Component-Register-Function') as InjectionKey<(register: (map: AMap.Map) => void) => void>

export function isAMap(obj: any): obj is AMap.Map {
  if (!obj)
    return false
  return obj instanceof AMap.Map
}
