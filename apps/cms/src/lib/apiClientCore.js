const DEFAULT_INVALID_TOKEN_PATTERNS = ['invalid token', 'jwt expired', 'token expired', 'expired token'];

const isInvalidTokenResponse = (data, patterns = DEFAULT_INVALID_TOKEN_PATTERNS) => {
  const message = `${data?.message || ''}`.toLowerCase();
  return patterns.some((pattern) => message.includes(pattern));
};

const buildUrl = (path, baseUrl) => {
  if (path.startsWith('http')) return path;
  if (!path.startsWith('/')) return `${baseUrl}/${path}`;
  return `${baseUrl}${path}`;
};

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const createApiClient = ({
  apiBaseUrl,
  getToken,
  setToken,
  getUser,
  setUser,
  onUnauthorized,
  redirectPath,
  buildReturnTo,
} = {}) => {
  const isDev =
    typeof import.meta !== 'undefined'
      ? Boolean(import.meta.env?.DEV)
      : typeof process !== 'undefined'
      ? process.env.NODE_ENV !== 'production'
      : true;

  const resolveToken = async () => {
    if (!getToken) return null;
    return getToken();
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleUnauthorized = async () => {
    if (onUnauthorized) {
      await onUnauthorized();
    }
    if (typeof window !== 'undefined' && redirectPath) {
      const returnTo =
        buildReturnTo?.() ||
        `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const encodedReturnTo = encodeURIComponent(returnTo);
      const separator = redirectPath.includes('?') ? '&' : '?';
      const redirectUrl = `${redirectPath}${encodedReturnTo ? `${separator}returnTo=${encodedReturnTo}` : ''}${
        encodedReturnTo ? '&' : separator
      }reason=unauthorized`;
      if (!window.location.href.endsWith(redirectUrl)) {
        window.location.href = redirectUrl;
      }
    }
  };

  const parseResponse = async (response, { hadToken = false, needsAuth = false } = {}) => {
    const data = await safeJson(response);

    if (!response.ok) {
      const isUnauthorized = response.status === 401;
      const isForbidden = response.status === 403;
      const defaultMessage = isForbidden
        ? 'Access denied (Admin required)'
        : isUnauthorized && needsAuth && hadToken
        ? 'Session expired. Please sign in again.'
        : `Requête échouée (${response.status})`;
      const error = new Error(data?.message || defaultMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    if (data && typeof data === 'object' && !('success' in data)) {
      data.success = true;
    }
    return data;
  };

  const request = async (
    method,
    path,
    { body, headers = {}, auth = true, skipAuthRedirect = false, ...rest } = {}
  ) => {
    const needsAuth = auth !== false;
    const token = needsAuth ? await resolveToken() : null;
    const config = {
      method,
      headers: { ...headers },
      ...rest,
    };

    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    if (body !== undefined) {
      config.body = isFormData ? body : JSON.stringify(body);
    }
    if (!isFormData) {
      config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
    }
    config.credentials = rest.credentials || 'include';

    if (needsAuth && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const url = buildUrl(path, apiBaseUrl);
    const maxRetries = Number.isFinite(rest.retry) ? rest.retry : 1;
    const retryDelayMs = Number.isFinite(rest.retryDelayMs) ? rest.retryDelayMs : 300;
    let response;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        response = await fetch(url, config);
        break;
      } catch (error) {
        if (attempt >= maxRetries) {
          throw error;
        }
        const wait = retryDelayMs * Math.pow(2, attempt);
        if (isDev) {
          console.warn('[API] network error, retrying...', { url, attempt: attempt + 1 });
        }
        await delay(wait);
      }
    }
    if (isDev) {
      console.debug('[API]', {
        method,
        url,
        hasToken: Boolean(token),
        status: response.status,
      });
    }
    if (response.status === 401 && needsAuth && !skipAuthRedirect) {
      await handleUnauthorized();
    }

    return parseResponse(response, { hadToken: Boolean(token), needsAuth });
  };

  const uploadFile = async (file, options = {}) => {
    if (!file) throw new Error('Aucun fichier sélectionné');
    const { fieldName = 'file', metadata = {} } = options;
    const formData = new FormData();
    formData.append(fieldName, file);
    if (fieldName !== 'file') {
      formData.append('file', file);
    }
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });

    const data = await request('POST', '/api/uploads', {
      body: formData,
      headers: {},
    });

    const payload = data?.data || {};
    const media = data?.media || payload?.media;
    return {
      ...data,
      ...payload,
      media,
      url: media?.url || data?.url || data?.location || data?.path,
      name: media?.name || data?.name || data?.filename,
      mime: media?.mimeType || data?.mime || data?.mimetype,
    };
  };

  return {
    request,
    get: (path, options) => request('GET', path, options),
    post: (path, options) => request('POST', path, options),
    put: (path, options) => request('PUT', path, options),
    patch: (path, options) => request('PATCH', path, options),
    del: (path, options) => request('DELETE', path, options),
    uploadFile,
    authUtils: { isInvalidTokenResponse },
    getToken: resolveToken,
    setToken,
    getUser,
    setUser,
  };
};
