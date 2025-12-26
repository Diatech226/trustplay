const API_BASE_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

const isAbsoluteUrl = (value) => {
  if (!value || typeof value !== 'string') return false;
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  );
};

const normalizeInput = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value.url || value.path || value.src || '';
  }
  return '';
};

export const resolveMediaUrl = (value) => {
  const resolved = normalizeInput(value);
  if (!resolved) return '';
  if (isAbsoluteUrl(resolved)) return resolved;
  if (!resolved.startsWith('/')) {
    return `${API_BASE_URL}/${resolved}`;
  }
  return `${API_BASE_URL}${resolved}`;
};
