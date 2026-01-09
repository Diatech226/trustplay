const API_BASE_URL = (
  import.meta.env?.VITE_API_URL ||
  import.meta.env?.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000'
).replace(/\/$/, '');
const MEDIA_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');
const API_ORIGIN = (() => {
  try {
    return new URL(MEDIA_BASE_URL).origin;
  } catch (error) {
    return MEDIA_BASE_URL;
  }
})();

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

const normalizePath = (value) => {
  if (!value) return '';
  const cleaned = value.trim().replace(/\\/g, '/');
  if (!cleaned) return '';
  const uploadsIndex = cleaned.indexOf('/uploads/');
  if (uploadsIndex !== -1) {
    return cleaned.slice(uploadsIndex);
  }
  const publicUploadsIndex = cleaned.indexOf('public/uploads/');
  if (publicUploadsIndex !== -1) {
    return `/${cleaned.slice(publicUploadsIndex + 'public/'.length)}`;
  }
  if (cleaned.startsWith('uploads/')) {
    return `/${cleaned}`;
  }
  if (cleaned.startsWith('./uploads/')) {
    return `/${cleaned.slice(2)}`;
  }
  if (!cleaned.startsWith('/') && !cleaned.includes('/')) {
    return `/uploads/${cleaned}`;
  }
  if (!cleaned.startsWith('/')) {
    return `/${cleaned}`;
  }
  return cleaned;
};

const resolveFallback = (fallback) => {
  const fallbackValue = normalizeInput(fallback);
  if (!fallbackValue) return '';
  if (isAbsoluteUrl(fallbackValue)) return fallbackValue;
  const normalized = normalizePath(fallbackValue);
  return `${MEDIA_BASE_URL}${normalized || ''}`;
};

export const resolveAssetUrl = (value, fallback = DEFAULT_MEDIA_PLACEHOLDER) => {
  const resolved = normalizeInput(value);
  if (!resolved) return resolveFallback(fallback || DEFAULT_MEDIA_PLACEHOLDER);
  if (isAbsoluteUrl(resolved)) return resolved;
  const normalized = normalizePath(resolved);
  if (normalized.startsWith('/uploads')) {
    return `${API_ORIGIN}${normalized}`;
  }
  return `${MEDIA_BASE_URL}${normalized || ''}`;
};

export const resolveMediaUrl = (value, fallback = '') =>
  resolveAssetUrl(value, fallback || DEFAULT_MEDIA_PLACEHOLDER);
