<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { ElMessageBox } from 'element-plus'
import request from '../utils/request'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

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

const loading = ref(false)
const router = useRouter()
const user = useUserStore()

function login() {
  loading.value = true
  request('/authenticate', {
    method: 'POST',
    data: account,
  })
    .then((res) => {
      user.credentials = res.data.credentials

      // TODO: 处理 redirect
      router.push('/admin/business-halls')
    })
    .catch((err: Error) => {
      ElMessageBox.alert(err?.message ?? '未知错误', '登录失败', {
        confirmButtonText: '确定',
        type: 'error',
      })
    })
    .finally(() => {
      loading.value = false
    })
}

function openForgetPasswordTip() {
  ElMessageBox.alert('本系统半封闭，无账号注册和密码找回功能，请联系管理员重置密码。', '忘记了密码？', {
    confirmButtonText: '确定',
    type: 'warning',
  })
}
</script>

<template>
  <div class="page-container">
    <div class="title">登录到 Latte 管理页</div>
    <ElForm :model="account" :size="size" class="form" label-position="right" label-width="4em">
      <ElFormItem label="用户名">
        <ElInput v-model="account.username" />
      </ElFormItem>
      <ElFormItem label="密码">
        <ElInput v-model="account.password" show-password />
      </ElFormItem>
      <ElRow>
        <ElCol :span="6" />
        <ElCol :span="12">
          <ElButton :loading="loading" class="login-button" type="primary" @click="login">登录</ElButton>
        </ElCol>
        <ElCol :span="6">
          <ElButton text @click="openForgetPasswordTip">忘记密码</ElButton>
        </ElCol>
      </ElRow>
    </ElForm>
  </div>
</template>

<style scoped>
.page-container {
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
