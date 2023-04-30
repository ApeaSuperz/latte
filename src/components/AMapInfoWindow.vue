<script lang="ts" setup>
import {aMapInjectionKey, registerAMapComponentFuncInjectionKey, useAMapEventListener} from "../utils/a-map.ts";
import {inject, Ref, ref, watch} from "vue";

const props = defineProps<{
  geo: [number, number]
  visible?: boolean
  offset?: [number, number]
  autoMove?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
}>()

const map = inject(aMapInjectionKey)
const register = inject(registerAMapComponentFuncInjectionKey)

const content = ref<HTMLDivElement>()

const infoWindow: Ref<AMap.InfoWindow | undefined> = ref()
register?.(() => {
  const w = new AMap.InfoWindow({
    ...props,
    content: content.value,
  })
  infoWindow.value = w
  useAMapEventListener(w, 'close', () => {
    emit('update:visible', false)
  })
})

function open(geo?: [number, number]) {
  if (map?.value) {
    infoWindow.value?.open(map.value!, geo ?? props.geo)
  }
}

function close() {
  infoWindow.value?.close()
}

watch(() => [props.visible, props.geo], ([visible]) => {
  if (visible) {
    open()
  } else {
    close()
  }
})
</script>

<template>
  <div style="display: none">
    <div ref="content">
      <slot/>
    </div>
  </div>
</template>
