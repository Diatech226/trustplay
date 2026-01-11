export const normalizeBaseUrl = (value) => {
  if (!value || typeof value !== 'string') return '';
  return value.trim().replace(/\/$/, '');
};

export const resolveApiBaseUrl = (req) => {
  const configured = normalizeBaseUrl(process.env.API_PUBLIC_URL);
  if (configured) return configured;
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = forwardedProto ? forwardedProto.split(',')[0] : req.protocol;
  return `${protocol}://${req.get('host')}`;
};

export const isAbsoluteUrl = (value) => {
  if (!value || typeof value !== 'string') return false;
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  );
};

export const resolveAbsoluteUrl = (req, value) => {
  if (!value || typeof value !== 'string') return value;
  if (isAbsoluteUrl(value)) return value;
  const baseUrl = resolveApiBaseUrl(req);
  const normalized = value.startsWith('/') ? value : `/${value}`;
  return `${baseUrl}${normalized}`;
};
