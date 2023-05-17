<script lang="ts" setup>
import { aMapInjectionKey, registerAMapComponentFuncInjectionKey, useAMapEventListener } from '@/utils/a-map'
import { inject, onMounted, Ref, ref, watch } from 'vue'

const props = defineProps<{
  geo: [number, number]
  visible?: boolean
  offset?: [number, number]
  autoMove?: boolean
  anchor?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'middle-left'
    | 'center'
    | 'middle-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
}>()

const map = inject(aMapInjectionKey)
const register = inject(registerAMapComponentFuncInjectionKey)

const content = ref<HTMLDivElement>()

const infoWindow: Ref<AMap.InfoWindow | undefined> = ref()
onMounted(() => {
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
})

function open(geo?: [number, number]) {
  const m = map?.value
  if (m) infoWindow.value?.open(m, geo ?? props.geo)
}

function close() {
  infoWindow.value?.close()
}

watch(
  () => [props.visible, props.geo],
  ([visible]) => {
    if (visible) {
      open()
    } else {
      close()
    }
  }
)
</script>

<template>
  <div style="display: none">
    <div ref="content">
      <slot></slot>
    </div>
  </div>
</template>
