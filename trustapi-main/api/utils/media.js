export const normalizeMediaUrl = (value) => {
  if (!value || typeof value !== 'string') return value;
  const trimmed = value.trim().replace(/\\/g, '/');
  if (!trimmed) return trimmed;

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('data:') || lower.startsWith('blob:')) return trimmed;

  const uploadsIndex = trimmed.indexOf('/uploads/');
  if (uploadsIndex !== -1) {
    return trimmed.slice(uploadsIndex);
  }

  const publicUploadsIndex = trimmed.indexOf('public/uploads/');
  if (publicUploadsIndex !== -1) {
    return `/${trimmed.slice(publicUploadsIndex + 'public/'.length)}`;
  }

  if (trimmed.startsWith('uploads/')) {
    return `/${trimmed}`;
  }

  if (trimmed.startsWith('./uploads/')) {
    return `/${trimmed.slice(2)}`;
  }

  if (!trimmed.includes('/')) {
    return `/uploads/${trimmed}`;
  }

  return trimmed;
};
