import { request } from './client'

export const projectsApi = {
  list: ({ featured } = {}) => {
    const qs = featured === undefined ? '' : `?featured=${featured}`
    return request(`/api/projects${qs}`)
  },
  create: (payload, opts = {}) =>
    request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
      silent: false,
      ...opts,
    }),
}
