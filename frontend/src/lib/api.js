import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  withCredentials: true,
});

export function getMediaUrl(source) {
  if (!source || typeof source !== 'string') return source;
  if (/^https?:\/\//i.test(source) || source.startsWith('data:')) return source;
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
  if (source.startsWith('/api/')) {
    if (/^https?:\/\//i.test(apiBase)) {
      try { return `${new URL(apiBase).origin}${source}`; } catch { return source; }
    }
    return source;
  }
  if (!source.startsWith('/uploads/')) return source;
  const configuredMediaBase = import.meta.env.VITE_MEDIA_BASE_URL || '';
  let base = configuredMediaBase;
  if (!base && /^https?:\/\//i.test(apiBase)) {
    try { base = new URL(apiBase).origin; } catch { base = ''; }
  }
  return base ? `${base.replace(/\/$/, '')}${source}` : source;
}

export function getErrorMessage(error) {
  const data = error?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length) return data.errors.map((item) => item.message).join(' ');
  return data?.message || error?.message || 'Something went wrong. Please try again.';
}

export default api;
