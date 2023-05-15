<script lang="ts" setup>
import { useDesign } from '@/hooks/web/useDesign'
import { computed, nextTick, ref, unref, watch } from 'vue'
import Iconify from '@purge-icons/generated'

const props = withDefaults(
  defineProps<{
    icon: string
    color?: string
    size: number | string
  }>(),
  {
    size: 16,
  }
)

const { getPrefixClass } = useDesign()
const prefixClass = getPrefixClass('latte-icon')

const elRef = ref<HTMLElement | null>(null)

function isLocal(icon: string): boolean {
  return icon.startsWith('svg-icon:')
}

const local = computed(() => isLocal(props.icon))

const symbolId = computed(() => {
  return unref(local) ? `#icon-${props.icon.split('svg-icon:')[1]}` : props.icon
})

const iconifyStyle = computed(() => {
  const { color, size } = props
  return {
    fontSize: `${size}px`,
    color,
  }
})

async function update(icon: string) {
  if (isLocal(icon)) return

  const el = unref(elRef)
  if (!el) return

  await nextTick()

  if (!icon) return

  const svg = Iconify.renderSVG(icon, {})
  if (svg) {
    el.textContent = ''
    el.appendChild(svg)
  } else {
    const span = document.createElement('span')
    span.className = 'iconify'
    span.dataset.icon = icon
    el.textContent = ''
    el.appendChild(span)
  }
}

watch(
  () => props.icon,
  (icon) => {
    update(icon)
  }
)
</script>

<template>
  <ElIcon :class="prefixClass" :color="color" :size="size">
    <svg v-if="local" aria-hidden="true">
      <use :xlink:href="symbolId" />
    </svg>
    <span v-else ref="elRef" :class="$attrs.class" :style="iconifyStyle">
      <span :data-icon="symbolId" class="iconify"></span>
    </span>
  </ElIcon>
</template>
