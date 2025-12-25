const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000';

const isAbsoluteUrl = (value) => {
  if (!value || typeof value !== 'string') return false;
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  );
};

export const resolveMediaUrl = (value) => {
  if (!value) return '';
  if (isAbsoluteUrl(value)) return value;
  if (!value.startsWith('/')) {
    return `${API_BASE_URL}/${value}`;
  }
  return `${API_BASE_URL}${value}`;
};

