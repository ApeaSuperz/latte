<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'

const account = reactive({
  username: '',
  password: '',
})

const size = ref<'large' | 'default' | 'small'>('large')
const { width } = useWindowSize()
watch(width, (width) => {
  if (width < 768) {
    size.value = 'small'
  } else {
    size.value = 'large'
  }
})

function login() {
  // TODO
}
</script>

<template>
  <div class="container">
    <div class="title">登录到 Latte 管理页</div>
    <ElForm :model="account" :size="size" class="form" label-position="right" label-width="4em">
      <ElFormItem label="用户名">
        <ElInput v-model="account.username" />
      </ElFormItem>
      <ElFormItem label="密码">
        <ElInput v-model="account.password" show-password />
      </ElFormItem>
      <ElButton class="login-button" type="primary" @click="login">登录</ElButton>
    </ElForm>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
  font-family: var(--el-font-family);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 24px;
  color: #fff;
  margin-bottom: 30px;
}

.form {
  background-color: #fff;
  padding: 48px;
  border-radius: var(--el-border-radius-base);
  min-width: 300px;
}

.login-button.el-button--large {
  min-width: 120px;
}
</style>
