<script lang="ts" setup>
import {defineComponent, provide, watch} from "vue";
import {
  aMapInjectionKey,
  AMapKeyPair,
  registerAMapComponentFuncInjectionKey,
  useAMap,
  UseAMapOptions
} from "../utils/a-map.ts";
import {generateUUID} from "../utils/random.ts";

defineComponent({
  name: 'LatteAMap',
})

const props = defineProps<{
  mapId?: string
  keyPair: AMapKeyPair
  zoom?: number
  center?: [number, number]
  viewMode?: '2D' | '3D'
}>()

const emit = defineEmits<{
  (e: 'ready', map: AMap.Map): void
}>()

const children: ((map: AMap.Map) => void)[] = []

function registerAMapComponent(fn: (map: AMap.Map) => void) {
  children.push(fn)
}

// FIXME: 上层传入的 mapId 变动，无法正确处理
const mapId = props.mapId ?? generateUUID()
const aMapOptions: UseAMapOptions = {...props, mapId}
const {map} = useAMap(aMapOptions)

watch(map, (map) => {
  if (map) {
    map.on('complete', () => {
      console.log('地图就绪，添加子元素')

      children.forEach((register) => {
        register(map)
      })

      emit('ready', map)
    })
  }
})

function reset() {
  if (props.center)
    map.value?.setCenter(props.center)
  if (props.zoom)
    map.value?.setZoom(props.zoom)
  map.value?.setPitch(0)
  map.value?.setRotation(0)
}

provide(aMapInjectionKey, map)
provide(registerAMapComponentFuncInjectionKey, registerAMapComponent)
defineExpose({map, reset})
</script>

<template>
  <div class="latte-a-map-container">
    <div :id="mapId" class="a-map"/>
    <slot/>
  </div>
</template>

<style scoped>
.latte-a-map-container {
    position: relative;
    height: 100%;
}

.a-map {
    height: 100%;
    width: 100%;
}
</style>
