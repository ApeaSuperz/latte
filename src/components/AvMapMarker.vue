<script lang="ts" setup>
import { inject, ref, useSlots, watch } from 'vue'
import { registerAMapComponentFuncInjectionKey, useAMapEventListener } from '@/utils/a-map'

const props = defineProps<{
  geo: [number, number]
  offset?: [number, number]
  title?: string
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const register = inject(registerAMapComponentFuncInjectionKey)

const slots = useSlots()
const content = ref<HTMLDivElement>()

let marker: AMap.Marker | undefined = undefined

function init(map: AMap.Map) {
  if (marker) {
    marker.setMap(null)
  }

  const markerOptions: AMap.MarkerOptions = {
    position: props.geo,
    offset: props.offset ? new AMap.Pixel(props.offset[0], props.offset[1]) : undefined,
    title: props.title,
  }

  if (slots && slots.default) {
    markerOptions.content = content.value
  }

  marker = new AMap.Marker(markerOptions)

  useAMapEventListener(marker, 'click', () => {
    emit('click')
  })

  marker.setMap(map)
}

register?.((map: AMap.Map) => {
  watch(
    props,
    () => {
      init(map)
    },
    { immediate: true }
  )
})
</script>

<template>
  <div style="display: none">
    <div ref="content">
      <slot></slot>
    </div>
  </div>
</template>
