<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { request } from '../api/client'
import ErrorState from '../components/ErrorState.vue'
import { toast } from '../composables/useToast'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref<any>(null)
const loading = ref(false)

// 极简密码强度提示
const passwordStrength = computed(() => {
  if (!password.value) return { text: '', color: '' }
  if (password.value.length < 6) return { text: '密码太短（至少 6 位）', color: 'red' }
  if (password.value.length < 10) return { text: '中等强度', color: 'orange' }
  return { text: '强密码', color: 'green' }
})

async function handleRegister() {
  if (passwordStrength.value.color === 'red') return

  loading.value = true
  error.value = null

  try {
    await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value,
      }),
      silent: true,
    })

    // 注册成功，自动跳转到登录页（或者直接登录）
    toast('注册成功，请登录', 'success')
    router.push('/login')
  } catch (err: any) {
    error.value = err // 如果邮箱已存在，会在这里展示 details
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-container">
    <h1>注册管理员</h1>
    <ErrorState v-if="error" :error="error" />

    <form @submit.prevent="handleRegister" class="auth-form">
      <label>
        昵称 (可选)
        <input v-model="name" type="text" placeholder="你的名字" />
      </label>
      <label>
        邮箱
        <input v-model="email" type="email" placeholder="admin@example.com" required />
      </label>
      <label>
        密码
        <input v-model="password" type="password" placeholder="至少 6 位" required />
        <small v-if="password" :style="{ color: passwordStrength.color }">
          {{ passwordStrength.text }}
        </small>
      </label>

      <button type="submit" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </form>

    <p class="switch-link">已有账号？ <RouterLink to="/login">去登录</RouterLink></p>
  </div>
</template>
