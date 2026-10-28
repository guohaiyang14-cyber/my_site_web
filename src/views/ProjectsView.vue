<script setup>
import { computed, onMounted } from 'vue';
import { useAsync } from '../composables/useAsync';
import { projectsApi } from '../api/projects';
import LoadingState from '../components/LoadingState.vue';
import ErrorState from '../components/ErrorState.vue';
import EmptyState from '../components/EmptyState.vue';

const { data, loading, error, run } = useAsync(() => projectsApi.list());
const projects = computed(() => data.value?.data ?? []);

onMounted(run);
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
      </li>
    </ul>
  </div>
</template>