<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router' // 引入路由
import { useAsync } from '../composables/useAsync'
import { projectsApi } from '../api/projects'
import LoadingState from '../components/LoadingState.vue'
import ErrorState from '../components/ErrorState.vue'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()
const { data, loading, error, run } = useAsync(() => projectsApi.list())
const projects = computed(() => data.value?.data ?? [])

onMounted(run)

// 删除逻辑
async function handleDelete(slug) {
  if (!confirm(`确定要删除作品 "${slug}" 吗？`)) return

  try {
    await projectsApi.remove(slug)
    run() // 删除成功后刷新列表
  } catch {
    // 全局 toast 已经弹了错误（因为没加 silent），这里不用额外处理
  }
}
</script>

<template>
  <div>
    <header class="page-header">
      <h1>作品集</h1>
      <RouterLink to="/new" class="btn">+ 新增作品</RouterLink>
    </header>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :error="error" :retry="run" />
    <EmptyState v-else-if="projects.length === 0" />
    <ul v-else class="project-list">
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

        <!-- 新增：操作按钮 -->
        <div class="actions">
          <button @click="router.push(`/edit/${p.slug}`)">编辑</button>
          <button class="danger" @click="handleDelete(p.slug)">删除</button>
        </div>
      </li>
    </ul>
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
</style>
