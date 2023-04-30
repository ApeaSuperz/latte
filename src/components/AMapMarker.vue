<script lang="ts" setup>
import {inject, ref, useSlots} from "vue";
import {registerAMapComponentFuncInjectionKey, useAMapEventListener} from "../utils/a-map.ts";

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

register?.((map: AMap.Map) => {
  const markerOptions: AMap.MarkerOptions = {
    position: props.geo,
    offset: props.offset ? new AMap.Pixel(props.offset[0], props.offset[1]) : undefined,
    title: props.title,
  }

  if (slots && slots.default) {
    markerOptions.content = content.value
  }

  const marker = new AMap.Marker(markerOptions)

  useAMapEventListener(marker, 'click', () => {
    emit('click')
  })

  marker.setMap(map)
})
</script>

<template>
  <div style="display: none">
    <div ref="content">
      <slot/>
    </div>
  </div>
</template>
