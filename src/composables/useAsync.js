import { ref } from 'vue';
import { ApiError } from '../api/client';

function normalizeError(e) {
  return e instanceof ApiError
    ? e
    : new ApiError({ status: 0, code: 'NETWORK_ERROR', message: '无法连接服务器' });
}

export function useAsync(fn) {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);     // 保留，供列表页做"重试 UI"

  async function run(...args) {
    loading.value = true;
    error.value = null;
    try {
      data.value = await fn(...args);
      return { ok: true, data: data.value };
    } catch (e) {
      error.value = normalizeError(e);   // 全局 toast 已经弹过了
      return { ok: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, run };
}