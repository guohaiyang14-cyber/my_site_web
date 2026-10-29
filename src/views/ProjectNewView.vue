<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAsync } from '../composables/useAsync'
import { projectsApi } from '../api/projects'
import ErrorState from '../components/ErrorState.vue'

const router = useRouter()

const form = ref({
  slug: '',
  title: '',
  summary: '',
  techStack: '', // 逗号分隔，提交时转数组
  repoUrl: '',
  demoUrl: '',
  featured: false,
})

const { loading, error, run } = useAsync(payload => projectsApi.create(payload))

async function onSubmit() {
  await run({
    slug: form.value.slug.trim(),
    title: form.value.title.trim(),
    summary: form.value.summary.trim(),
    techStack: form.value.techStack
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    repoUrl: form.value.repoUrl.trim() || null,
    demoUrl: form.value.demoUrl.trim() || null,
    featured: form.value.featured,
  })

  if (!error.value) router.push('/') // 成功才跳，失败留在原地显示错误
}
</script>

<template>
  <div>
    <header class="page-header">
      <h1>新增作品</h1>
      <RouterLink to="/">← 返回</RouterLink>
    </header>

    <ErrorState v-if="error" :error="error" />

    <form @submit.prevent="onSubmit" class="form" novalidate>
      <label>Slug（kebab-case）<input v-model="form.slug" placeholder="my-project" /></label>
      <label>标题<input v-model="form.title" /></label>
      <label>简介<textarea v-model="form.summary" rows="3" /></label>
      <label>技术栈（逗号分隔）<input v-model="form.techStack" placeholder="Vue, Express" /></label>
      <label>仓库地址<input v-model="form.repoUrl" placeholder="https://github.com/..." /></label>
      <label>演示地址<input v-model="form.demoUrl" placeholder="https://..." /></label>
      <label class="checkbox"><input type="checkbox" v-model="form.featured" /> 精选作品</label>

      <button type="submit" :disabled="loading">
        {{ loading ? '提交中…' : '提交' }}
      </button>
    </form>
  </div>
</template>
