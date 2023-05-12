<script lang="ts" setup>
import { computed, provide, watch } from 'vue'
import { aMapInjectionKey, registerAMapComponentFuncInjectionKey, useAMap, UseAMapOptions } from '../utils/a-map.ts'
import { generateUuid } from '../utils/random.ts'

const props = defineProps<{
  mapId?: string
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

  // 如果地图已经就绪，立即执行一次回调
  const m = map.value
  if (m) fn(m)
}

let lazyUuid: string | undefined = undefined
const mapId = computed(() => {
  if (props.mapId) {
    return props.mapId
  } else {
    if (!lazyUuid) {
      lazyUuid = generateUuid()
    }
    return lazyUuid
  }
})

const aMapOptions: UseAMapOptions = { ...props, mapId }
const { map } = useAMap(aMapOptions)

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
  if (props.center) map.value?.setCenter(props.center)
  if (props.zoom) map.value?.setZoom(props.zoom)
  map.value?.setPitch(0)
  map.value?.setRotation(0)
}

provide(aMapInjectionKey, map)
provide(registerAMapComponentFuncInjectionKey, registerAMapComponent)
defineExpose({ map, reset })
</script>

<template>
  <div class="latte-a-map-container">
    <div :id="mapId" class="a-map" />
    <slot />
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
