<script lang="ts" setup>
import { useDesign } from '@/hooks/web/useDesign'
import { FormSchema } from '@/types/form'
import { ElForm } from 'element-plus'
import { PropType, ref } from 'vue'

withDefaults(
  defineProps<{
    schema: PropType<FormSchema[]>
    model: PropType<Recordable>
  }>(),
  {
    model: () => ({}),
  }
)

const { getPrefixClass } = useDesign()
const prefixClass = getPrefixClass('latte-form')

const elFormRef = ref<InstanceType<typeof ElForm>>()
</script>

<template>
  <ElForm ref="elFormRef" :class="prefixClass" />
</template>
