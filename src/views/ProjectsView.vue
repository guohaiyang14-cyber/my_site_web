<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router' // 引入路由
import { useAsync } from '../composables/useAsync'
import { projectsApi } from '../api/projects'
import LoadingState from '../components/LoadingState.vue'
import ErrorState from '../components/ErrorState.vue'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()
const PAGE_SIZE = 6
const page = ref(1)

const { data, loading, error, run } = useAsync((currentPage: number) =>
  projectsApi.list({ page: currentPage, pageSize: PAGE_SIZE })
)

const projects = computed(() => data.value?.data ?? [])
const totalPages = computed(() => {
  const meta = data.value?.pagination
  if (meta?.totalPages) return Math.max(1, meta.totalPages)
  if (!meta?.total && projects.value.length === 0) return 1
  if (meta?.total) return Math.max(1, Math.ceil(meta.total / PAGE_SIZE))
  return Math.max(1, Math.ceil(projects.value.length / PAGE_SIZE))
})
const hasPrevPage = computed(() => page.value > 1)
const hasNextPage = computed(() => page.value < totalPages.value)
const hasToken = localStorage.getItem('auth_token') ?? false

async function loadPage(nextPage: number) {
  const targetPage = Math.max(1, nextPage)
  page.value = targetPage
  await run(targetPage)
}

onMounted(() => {
  loadPage(1)
})

// 删除逻辑
async function handleDelete(slug: string) {
  if (!confirm(`确定要删除作品 "${slug}" 吗？`)) return

  try {
    await projectsApi.remove(slug)
    await loadPage(Math.max(1, page.value))
  } catch {
    // 全局 toast 已经弹了错误（因为没加 silent），这里不用额外处理
  }
}

// 退出登录
function handleLoginOut() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  router.push('/login')
}
</script>

<template>
  <div>
    <header class="page-header">
      <h1>作品集</h1>
      <RouterLink to="/new" class="btn">+ 新增作品</RouterLink>
      <button v-if="hasToken" @click="handleLoginOut">退出登录</button>
    </header>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :error="error" :retry="() => loadPage(page)" />
    <EmptyState v-else-if="projects.length === 0" />
    <template v-else>
      <ul class="project-list">
        <li v-for="p in projects" :key="p.slug" class="project-card">
          <h2>{{ p.title }}</h2>
          <p>{{ p.summary }}</p>
          <div class="tags">
            <span v-for="t in p.techStack" :key="t" class="tag">{{ t }}</span>
          </div>
          <div class="links">
            <a v-if="p.repoUrl" :href="p.repoUrl" target="_blank" rel="noreferrer">代码</a>
            <a v-if="p.demoUrl" :href="p.demoUrl" target="_blank" rel="noreferrer">在线</a>
          </div>

          <div class="actions">
            <button @click="router.push(`/edit/${p.slug}`)">编辑</button>
            <button class="danger" @click="handleDelete(p.slug)">删除</button>
          </div>
        </li>
      </ul>

      <nav v-if="totalPages > 1" class="pagination" aria-label="分页导航">
        <button :disabled="!hasPrevPage" @click="loadPage(page - 1)">上一页</button>
        <button
          v-for="pageNumber in totalPages"
          :key="pageNumber"
          :class="{ active: pageNumber === page }"
          :disabled="pageNumber === page"
          @click="loadPage(pageNumber)"
        >
          {{ pageNumber }}
        </button>
        <button :disabled="!hasNextPage" @click="loadPage(page + 1)">下一页</button>
      </nav>
    </template>
  </div>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.actions button {
  cursor: pointer;
  padding: 4px 8px;
}
.danger {
  color: red;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  flex-wrap: wrap;
}
.pagination button {
  cursor: pointer;
  padding: 6px 10px;
}
.pagination button.active {
  background: #1f6feb;
  color: #fff;
}
</style>
