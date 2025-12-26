const API_BASE_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export const DEFAULT_MEDIA_PLACEHOLDER =
  'https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png';

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
    return (
      value.url ||
      value.path ||
      value.src ||
      value.originalUrl ||
      value.coverUrl ||
      value.thumbUrl ||
      value.mediumUrl ||
      value.coverAvifUrl ||
      value.thumbAvifUrl ||
      value.mediumAvifUrl ||
      value.image ||
      ''
    );
  }
  return '';
};

const resolveFallback = (fallback) => {
  const fallbackValue = normalizeInput(fallback);
  if (!fallbackValue) return '';
  if (isAbsoluteUrl(fallbackValue)) return fallbackValue;
  if (!fallbackValue.startsWith('/')) {
    return `${API_BASE_URL}/${fallbackValue}`;
  }
  return `${API_BASE_URL}${fallbackValue}`;
};

export const resolveMediaUrl = (value, fallback = '') => {
  const resolved = normalizeInput(value);
  if (!resolved) return resolveFallback(fallback);
  if (isAbsoluteUrl(resolved)) return resolved;
  if (!resolved.startsWith('/')) {
    return `${API_BASE_URL}/${resolved}`;
  }
  return `${API_BASE_URL}${resolved}`;
};
