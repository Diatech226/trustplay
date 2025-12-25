const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'cms_token';
const USER_KEY = 'cms_current_user';

const buildUrl = (path) => {
  if (path.startsWith('http')) return path;
  if (!path.startsWith('/')) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path}`;
};

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

const setStoredToken = (token) => {
  if (typeof window === 'undefined') return;
  if (!token) {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, token);
};

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const setStoredUser = (user) => {
  if (typeof window === 'undefined') return;
  if (!user) {
    window.localStorage.removeItem(USER_KEY);
    return;
  }
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

const handleUnauthorized = () => {
  if (unauthorizedHandler) {
    unauthorizedHandler();
    return;
  }
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    const returnTo = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    window.location.href = `/login?returnTo=${returnTo}`;
  }
};

const parseResponse = async (response) => {
  const data = await safeJson(response);
  if (!response.ok) {
    const message = data?.message || `Requête échouée (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

const validateSession = async (token) => {
  if (!token) return { status: 'missing' };
  try {
    const response = await fetch(buildUrl('/api/user/me'), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    if (!response.ok) {
      return { status: 'invalid' };
    }
    const data = await safeJson(response);
    return { status: 'valid', data };
  } catch (error) {
    return { status: 'invalid' };
  }
};

const request = async (
  method,
  path,
  { body, headers = {}, auth = true, skipAuthRedirect = false, ...rest } = {}
) => {
  const config = {
    method,
    headers: { ...headers },
    ...rest,
  };

  const needsAuth = auth !== false;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined) {
    config.body = isFormData ? body : JSON.stringify(body);
  }
  if (!isFormData) {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  }

  config.credentials = rest.credentials || 'include';

  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), config);

  if (response.status === 401 && needsAuth && token && !rest.__retry) {
    const validation = await validateSession(token);
    if (validation.status === 'valid') {
      return request(method, path, { body, headers, auth, skipAuthRedirect, ...rest, __retry: true });
    }
    if (!skipAuthRedirect) {
      handleUnauthorized();
    }
  }

  return parseResponse(response);
};

export const apiClient = {
  get: (path, options) => request('GET', path, options),
  post: (path, options) => request('POST', path, options),
  put: (path, options) => request('PUT', path, options),
  del: (path, options) => request('DELETE', path, options),
  getToken: getStoredToken,
  setToken: setStoredToken,
  getUser: getStoredUser,
  setUser: setStoredUser,
};

export const uploadFile = async (file, options = {}) => {
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

  const data = await apiClient.post('/api/uploads', {
    body: formData,
    headers: {},
  });

  const media = data?.media || data?.data?.media;
  return {
    ...data,
    media,
    url: media?.url || data?.url || data?.location || data?.path,
    name: media?.name || data?.name || data?.filename,
    mime: media?.mimeType || data?.mime || data?.mimetype,
  };
};
