import asyncStorage from './asyncStorage';
import { store, logoutAndClearPersistedData } from '../redux/store';

export const API_BASE_URL =
  import.meta.env?.VITE_API_URL ||
  import.meta.env?.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

const buildUrl = (path) => {
  if (path.startsWith('http')) return path;
  if (!path.startsWith('/')) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path}`;
};

const INVALID_TOKEN_PATTERNS = [
  'invalid token',
  'jwt expired',
  'token expired',
  'expired token',
];

const isInvalidTokenResponse = (data) => {
  const message = `${data?.message || ''}`.toLowerCase();
  return INVALID_TOKEN_PATTERNS.some((pattern) => message.includes(pattern));
};

const buildReturnTo = () => {
  if (typeof window === 'undefined') return '';
  const { pathname, search, hash } = window.location;
  return `${pathname}${search}${hash}`;
};

const handleUnauthorized = async () => {
  await asyncStorage.removeItem('auth');
  try {
    store.dispatch(logoutAndClearPersistedData());
  } catch (error) {
    // store not ready
  }
  if (typeof window !== 'undefined' && window.location.pathname !== '/sign-in') {
    const returnTo = encodeURIComponent(buildReturnTo());
    window.location.href = `/sign-in${returnTo ? `?returnTo=${returnTo}` : ''}`;
  }
};

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
};

const parseResponse = async (
  response,
  { hadToken = false, needsAuth = false, allowLogout = true } = {}
) => {
  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    // ignore
  }

  if (!response.ok) {
    const isUnauthorized = response.status === 401;
    const errorMessage =
      data?.message ||
      (isUnauthorized && hadToken
        ? 'Session expirée, merci de vous reconnecter.'
        : `Requête échouée (${response.status})`);

    if (allowLogout && isUnauthorized && needsAuth && hadToken && isInvalidTokenResponse(data)) {
      await handleUnauthorized();
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  if (data && typeof data === 'object' && !('success' in data)) {
    data.success = true;
  }
  return data;
};

const getStoredToken = async () => {
  const state = store.getState?.();
  const tokenFromState = state?.user?.token || state?.user?.currentUser?.token;
  if (tokenFromState) return tokenFromState;

  const rawAuth = await asyncStorage.getItem('auth');
  if (rawAuth) {
    try {
      const parsed = JSON.parse(rawAuth);
      return parsed?.token || parsed?.currentUser?.token || parsed?.user?.token || null;
    } catch (error) {
      return null;
    }
  }

  const rawPersist = await asyncStorage.getItem('persist:root');
  if (!rawPersist) return null;
  try {
    const parsed = JSON.parse(rawPersist);
    const userState = typeof parsed.user === 'string' ? JSON.parse(parsed.user) : parsed.user;
    return userState?.token || userState?.currentUser?.token || null;
  } catch (error) {
    return null;
  }
};

const validateSession = async (token) => {
  if (!token) return { status: 'unknown' };
  try {
    const response = await fetch(buildUrl('/api/user/me'), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    if (response.status === 401) {
      const data = await safeJson(response);
      if (isInvalidTokenResponse(data)) {
        return { status: 'invalid' };
      }
      return { status: 'unauthorized' };
    }
    if (!response.ok) {
      return { status: 'unknown' };
    }
    const data = await safeJson(response);
    return { status: 'valid', data };
  } catch (error) {
    return { status: 'unknown' };
  }
};

const request = async (method, path, { body, headers = {}, auth = true, ...rest } = {}) => {
  const config = {
    method,
    headers: { ...headers },
    ...rest,
  };

  const needsAuth = auth !== false;
  config.credentials = rest.credentials || 'include';

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined) {
    config.body = isFormData ? body : JSON.stringify(body);
  }
  if (!isFormData) {
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  }

  const token = needsAuth ? await getStoredToken() : null;
  if (needsAuth && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), config);

  if (response.status === 401 && needsAuth && token && !rest.__retry) {
    const clone = response.clone();
    const responseData = await safeJson(clone);
    if (isInvalidTokenResponse(responseData)) {
      await handleUnauthorized();
      return parseResponse(response, { hadToken: Boolean(token), needsAuth, allowLogout: false });
    }

    const validation = await validateSession(token);
    if (validation.status === 'valid') {
      return request(method, path, { body, headers, auth, ...rest, __retry: true });
    }
    if (validation.status === 'invalid') {
      await handleUnauthorized();
      return parseResponse(response, { hadToken: Boolean(token), needsAuth, allowLogout: false });
    }
  }

  return parseResponse(response, { hadToken: Boolean(token), needsAuth });
};

export const get = (path, options) => request('GET', path, options);
export const post = (path, options) => request('POST', path, options);
export const put = (path, options) => request('PUT', path, options);
export const del = (path, options) => request('DELETE', path, options);

export async function uploadFile(file, options = {}) {
  if (!file) {
    throw new Error('Aucun fichier sélectionné');
  }

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

  const response = await post('/api/uploads', {
    body: formData,
    auth: true,
    headers: {},
  });

  const data = response?.data || response;
  const payload = data?.data || {};
  const media = data?.media || response?.media || payload?.media;
  return {
    ...data,
    ...payload,
    media,
    url: media?.url || data?.url || data?.location || data?.path,
    name: media?.name || data?.name || data?.filename,
    mime: media?.mimeType || data?.mime || data?.mimetype,
  };
}

export async function apiRequest(path, options) {
  const method = options?.method || 'GET';
  if (method === 'GET') return get(path, options);
  if (method === 'POST') return post(path, options);
  if (method === 'PUT') return put(path, options);
  if (method === 'DELETE') return del(path, options);
  return request(method, path, options);
}

export async function fetchJson(url, options) {
  return apiRequest(url, options);
}

export async function getAuthToken() {
  return getStoredToken();
}

export const authUtils = {
  isInvalidTokenResponse,
};

export const forgotPassword = (email) =>
  post('/api/auth/forgot-password', {
    body: { email },
    auth: false,
  });

export const resetPassword = (email, token, newPassword) =>
  post('/api/auth/reset-password', {
    body: { email, token, newPassword },
    auth: false,
  });

export const authApi = { forgotPassword, resetPassword };
