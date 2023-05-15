<script lang="ts" setup>
import { FormSchema } from '@/types/form'
import { PropType } from 'vue'

withDefaults(
  defineProps<{
    schema: PropType<FormSchema[]>
    model: PropType<Recordable>
  }>(),
  {
    model: {} as any,
  }
)
</script>

<template>
  <ElForm></ElForm>
</template>
