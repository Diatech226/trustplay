import asyncStorage from './asyncStorage';
import { store } from '../redux/store';
import { signoutSuccess } from '../redux/user/userSlice';

export const API_BASE_URL =
  import.meta.env?.VITE_API_URL ||
  import.meta.env?.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

const buildUrl = (path) => {
  if (path.startsWith('http')) return path;
  if (!path.startsWith('/')) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path}`;
};

const handleUnauthorized = async () => {
  await asyncStorage.removeItem('auth');
  try {
    store.dispatch(signoutSuccess());
  } catch (error) {
    // store not ready
  }
  if (typeof window !== 'undefined' && window.location.pathname !== '/sign-in') {
    window.location.href = '/sign-in';
  }
};

const parseResponse = async (response, { hadToken = false, needsAuth = false } = {}) => {
  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    // ignore
  }

  if (!response.ok) {
    const isUnauthorized = response.status === 401;
    const errorMessage =
      data?.message || (isUnauthorized && hadToken ? 'Session expirée, merci de vous reconnecter.' : `Requête échouée (${response.status})`);

    if (isUnauthorized && needsAuth && hadToken) {
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
  if (!rawAuth) return null;
  try {
    const parsed = JSON.parse(rawAuth);
    return parsed?.token || parsed?.currentUser?.token;
  } catch (error) {
    return null;
  }
};

const request = async (method, path, { body, headers = {}, auth = true, ...rest } = {}) => {
  const config = {
    method,
    headers: { ...headers },
    ...rest,
  };

  const needsAuth = auth !== false;
  config.credentials = rest.credentials || (needsAuth ? 'include' : 'same-origin');

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
  return parseResponse(response, { hadToken: Boolean(token), needsAuth });
};

export const get = (path, options) => request('GET', path, options);
export const post = (path, options) => request('POST', path, options);
export const put = (path, options) => request('PUT', path, options);
export const del = (path, options) => request('DELETE', path, options);

export async function uploadFile(file, fieldName = 'file') {
  if (!file) {
    throw new Error('Aucun fichier sélectionné');
  }

  const formData = new FormData();
  formData.append(fieldName, file);
  if (fieldName !== 'file') {
    formData.append('file', file);
  }

  const response = await post('/api/uploads', {
    body: formData,
    auth: true,
    headers: {},
  });

  const data = response?.data || response;
  return {
    ...data,
    url: data?.url || data?.location || data?.path,
    name: data?.name || data?.filename,
    mime: data?.mime || data?.mimetype,
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
