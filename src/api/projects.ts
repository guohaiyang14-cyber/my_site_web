import { request } from './client'

export interface Project {
  slug: string
  title: string
  summary: string
  techStack: string[]
  repoUrl: string | null
  demoUrl: string | null
  featured: boolean
}

export interface ProjectCreatePayload {
  slug: string
  title: string
  summary: string
  techStack: string[]
  repoUrl: string | null
  demoUrl: string | null
  featured: boolean
}

export interface ProjectsListResponse {
  data: Project[]
}

export interface ProjectCreateResponse {
  data: Project
}

export const projectsApi = {
  list: async ({ featured }: { featured?: boolean } = {}): Promise<ProjectsListResponse> => {
    const qs = featured === undefined ? '' : `?featured=${featured}`
    return request<ProjectsListResponse>(`/api/projects${qs}`)
  },
  create: async (
    payload: ProjectCreatePayload,
    opts: Omit<RequestInit, 'body'> & { silent?: boolean } = {}
  ): Promise<ProjectCreateResponse> =>
    request<ProjectCreateResponse>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
      silent: false,
      ...opts,
    }),
}
