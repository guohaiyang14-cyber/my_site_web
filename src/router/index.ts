import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import ProjectsView from '../views/ProjectsView.vue'
import ProjectNewView from '../views/ProjectNewView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', component: ProjectsView },
  { path: '/new', component: ProjectNewView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
