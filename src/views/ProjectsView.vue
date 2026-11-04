<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
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
const hasToken = computed(() => !!localStorage.getItem('auth_token'))

async function loadPage(nextPage: number) {
  const targetPage = Math.max(1, nextPage)
  page.value = targetPage
  await run(targetPage)
}

onMounted(() => {
  loadPage(1)
})

async function handleDelete(slug: string) {
  try {
    await ElMessageBox.confirm(`确定要删除作品 "${slug}" 吗？`, '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })

    try {
      await projectsApi.remove(slug)
      await loadPage(Math.max(1, page.value))
      ElMessage.success('删除成功')
    } catch {
      ElMessage.error('删除失败')
    }
  } catch {
    // 用户取消删除，不做处理
  }
}

function handleLoginOut() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  router.push('/login')
}
</script>

<template>
  <div class="page-shell">
    <header class="page-header">
      <div>
        <h1>作品集</h1>
      </div>

      <div class="header-actions">
        <el-button type="primary" @click="router.push('/new')">+ 新增作品</el-button>
        <el-button v-if="hasToken" plain @click="handleLoginOut">退出登录</el-button>
      </div>
    </header>

    <el-card shadow="hover" class="panel-card">
      <LoadingState v-if="loading" />
      <ErrorState v-else-if="error" :error="error" :retry="() => loadPage(page)" />
      <EmptyState v-else-if="projects.length === 0" />

      <template v-else>
        <div class="project-grid">
          <el-card v-for="p in projects" :key="p.slug" shadow="hover" class="project-card">
            <div class="project-top">
              <div>
                <p class="project-label">作品</p>
                <h2>{{ p.title }}</h2>
              </div>
              <el-tag v-if="p.featured" type="warning" effect="light">精选</el-tag>
            </div>

            <p class="summary">{{ p.summary }}</p>

            <div class="tag-list">
              <el-tag v-for="t in p.techStack" :key="t" type="info" size="small" effect="plain">
                {{ t }}
              </el-tag>
            </div>

            <div class="project-links">
              <el-link v-if="p.repoUrl" :href="p.repoUrl" target="_blank" rel="noreferrer"
                >代码</el-link
              >
              <el-link v-if="p.demoUrl" :href="p.demoUrl" target="_blank" rel="noreferrer"
                >在线</el-link
              >
            </div>

            <div class="project-actions" v-if="hasToken">
              <el-button size="small" type="primary" plain @click="router.push(`/edit/${p.slug}`)">
                编辑
              </el-button>
              <el-button size="small" type="danger" plain @click="handleDelete(p.slug)">
                删除
              </el-button>
            </div>
          </el-card>
        </div>

        <div v-if="totalPages > 1" class="pagination-wrap">
          <el-pagination
            :current-page="page"
            :page-size="PAGE_SIZE"
            :total="data?.pagination?.total ?? projects.length"
            background
            layout="prev, pager, next"
            @current-change="loadPage"
          />
        </div>
      </template>
    </el-card>
  </div>
</template>
