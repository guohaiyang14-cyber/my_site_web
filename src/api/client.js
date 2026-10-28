import { toast } from '../composables/useToast';

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8888';

export class ApiError extends Error {
  constructor({ status, code, message, details = [] }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// 默认策略：按 status 分类，toast 只显示 message（details 交给页面）
function defaultOnError(err) {
  if (err.status === 0) {
    toast('无法连接后端，请检查服务是否启动', 'error');
    return;
  }
  if (err.status === 401) {
    toast('登录已失效', 'warning');
    // 以后: router.push('/login')
    return;
  }
  if (err.status >= 500) {
    toast('服务异常，请稍后重试', 'error');
    return;
  }
  toast(err.message || '请求失败', 'error');   // 4xx 兜底弹 message
}

/**
 * @param {string} path
 * @param {RequestInit & { silent?: boolean, onError?: (e: ApiError) => void }} opts
 *   silent=true  → 完全不弹 toast（调用方自己处理）
 *   onError=fn   → 覆盖默认策略（比如表单页改成就地展示）
 */
export async function request(path, { silent = false, onError = defaultOnError, ...init } = {}) {
  const headers = new Headers(init.headers);
  if (typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers });
  } catch (networkErr) {
    const err = new ApiError({ status: 0, code: 'NETWORK_ERROR', message: '无法连接服务器' });
    if (!silent) onError(err);
    throw err;
  }

  const text = await res.text();
  let payload = null;
  if (text) { try { payload = JSON.parse(text); } catch {} }

  if (!res.ok) {
    const e = payload?.error ?? {};
    const err = new ApiError({
      status: res.status,
      code: e.code || 'UNKNOWN_ERROR',
      message: e.message || `HTTP ${res.status}`,
      details: e.details,
    });
    if (!silent) onError(err);
    throw err;
  }
  return payload;
}
