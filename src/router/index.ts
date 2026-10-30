import { createRouter, createWebHistory } from 'vue-router'
import ProjectsView from '../views/ProjectsView.vue'
import ProjectFormView from '../views/ProjectFormView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: ProjectsView },
    { path: '/new', component: ProjectFormView },
    { path: '/edit/:slug', component: ProjectFormView },
  ],
})
