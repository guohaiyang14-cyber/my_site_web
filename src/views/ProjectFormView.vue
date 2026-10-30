<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAsync } from '../composables/useAsync'
import { projectsApi, type ProjectCreatePayload } from '../api/projects'
import ErrorState from '../components/ErrorState.vue'
import LoadingState from '../components/LoadingState.vue'

const route = useRoute()
const router = useRouter()
const slug = computed(() => (typeof route.params.slug === 'string' ? route.params.slug : ''))
const isEdit = computed(() => !!slug.value)

const emptyForm: ProjectCreatePayload = {
  slug: '',
  title: '',
  summary: '',
  techStack: [],
  repoUrl: null,
  demoUrl: null,
  featured: false,
}

const form = ref<ProjectCreatePayload>({ ...emptyForm })

// 为了表单里输入方便，用一个字符串变量绑定 techStack
const techStackInput = ref('')

// 1. 详情请求 (编辑模式)
const {
  data: detailData,
  loading: loadingDetail,
  error: detailError,
  run: fetchDetail,
} = useAsync(() => projectsApi.get(slug.value))

// 2. 表单提交请求
const {
  loading: submitting,
  error: submitError,
  run: submitForm,
} = useAsync((payload: ProjectCreatePayload) => {
  if (isEdit.value) return projectsApi.update(slug.value, payload)
  return projectsApi.create(payload)
})

// 3. 监听路由变化，新增/编辑时分别重置并拉取数据
watch(
  slug,
  currentSlug => {
    if (!currentSlug) {
      form.value = { ...emptyForm }
      techStackInput.value = ''
      return
    }

    fetchDetail()
  },
  { immediate: true }
)

// 4. 监听详情返回，回显数据
watch(detailData, newVal => {
  if (newVal && newVal.data) {
    const p = newVal.data
    form.value = {
      slug: p.slug,
      title: p.title,
      summary: p.summary || '',
      techStack: p.techStack,
      repoUrl: p.repoUrl || null,
      demoUrl: p.demoUrl || null,
      featured: p.featured,
    }
    // 将数组转成逗号分隔的字符串供用户编辑
    techStackInput.value = p.techStack.join(', ')
  }
})

// 5. 提交逻辑
async function onSubmit() {
  // 把用户输入的字符串重新转为数组
  form.value.techStack = techStackInput.value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const { ok } = await submitForm(form.value)

  if (ok) {
    router.push('/') // 只有成功才跳转
  }
}
</script>

<template>
  <div>
    <header class="page-header">
      <h1>{{ isEdit ? '编辑作品' : '新增作品' }}</h1>
      <RouterLink to="/">← 返回</RouterLink>
    </header>

    <LoadingState v-if="loadingDetail" />
    <div v-else>
      <!-- 展示详情加载的错误（比如 slug 不存在） -->
      <ErrorState v-if="detailError" :error="detailError" />

      <!-- 展示提交时的校验错误 -->
      <ErrorState v-if="submitError" :error="submitError" />

      <form @submit.prevent="onSubmit" class="form" novalidate>
        <label>Slug<input v-model="form.slug" placeholder="my-project" /></label>
        <label>标题<input v-model="form.title" /></label>
        <label>简介<textarea v-model="form.summary" rows="3" /></label>
        <label>技术栈<input v-model="techStackInput" placeholder="Vue, Express" /></label>
        <label>仓库地址<input v-model="form.repoUrl" /></label>
        <label>演示地址<input v-model="form.demoUrl" /></label>
        <label class="checkbox"><input type="checkbox" v-model="form.featured" /> 精选作品</label>

        <button type="submit" :disabled="submitting">
          {{ submitting ? '提交中…' : '保存' }}
        </button>
      </form>
    </div>
  </div>
</template>
