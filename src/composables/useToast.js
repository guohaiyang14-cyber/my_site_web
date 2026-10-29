import { reactive } from 'vue'

export const toasts = reactive([])

export function toast(message, type = 'error', timeout = 3000) {
  const id = Symbol('toast')
  toasts.push({ id, message, type })
  setTimeout(() => {
    const i = toasts.findIndex(t => t.id === id)
    if (i >= 0) toasts.splice(i, 1)
  }, timeout)
}
