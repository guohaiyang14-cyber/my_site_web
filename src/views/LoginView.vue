<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { request } from '../api/client.ts'
import ErrorState from '../components/ErrorState.vue'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref<any>(null)
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = null
  try {
    const res = await request<{ data: { token: string; user: any } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.value, password: password.value }),
      silent: true,
    })
    localStorage.setItem('auth_token', res.data.token)
    localStorage.setItem('auth_user', JSON.stringify(res.data.user))
    router.push('/') // 登录成功跳主页
  } catch (err: any) {
    error.value = err
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <h1>管理员登录</h1>
    <ErrorState v-if="error" :error="error" />
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="邮箱" required />
      <input v-model="password" type="password" placeholder="密码" required />
      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>
    <p class="switch-link">还没有账号？ <RouterLink to="/register">去注册</RouterLink></p>
  </div>
</template>
