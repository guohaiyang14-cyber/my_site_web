<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAsync } from '../composables/useAsync'
import { projectsApi, type ProjectCreatePayload } from '../api/projects'
import ErrorState from '../components/ErrorState.vue'

const router = useRouter()

const form = ref({
  slug: '',
  title: '',
  summary: '',
  techStack: '',
  repoUrl: '',
  demoUrl: '',
  featured: false,
})

const { loading, error, run } = useAsync((payload: ProjectCreatePayload) =>
  projectsApi.create(payload)
)

async function onSubmit(): Promise<void> {
  const result = await run({
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

  if (result.ok) {
    router.push('/')
  }
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
