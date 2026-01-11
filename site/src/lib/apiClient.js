import asyncStorage from './asyncStorage';
import { store, logoutAndClearPersistedData } from '../redux/store';
import { createApiClient } from '../shared/apiClientCore';

export const API_BASE_URL =
  import.meta.env?.VITE_API_URL ||
  import.meta.env?.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

const buildReturnTo = () => {
  if (typeof window === 'undefined') return '';
  const { pathname, search, hash } = window.location;
  return `${pathname}${search}${hash}`;
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

const clearAuth = async () => {
  await asyncStorage.removeItem('auth');
  try {
    store.dispatch(logoutAndClearPersistedData());
  } catch (error) {
    // store not ready
  }
};

const client = createApiClient({
  apiBaseUrl: API_BASE_URL,
  getToken: getStoredToken,
  onUnauthorized: clearAuth,
  redirectPath: '/sign-in',
  buildReturnTo,
});

export const { authUtils } = client;

export const get = (path, options) => client.get(path, options);
export const post = (path, options) => client.post(path, options);
export const put = (path, options) => client.put(path, options);
export const patch = (path, options) => client.patch(path, options);
export const del = (path, options) => client.del(path, options);
export const uploadFile = (...args) => client.uploadFile(...args);

export async function apiRequest(path, options) {
  const method = options?.method || 'GET';
  if (method === 'GET') return get(path, options);
  if (method === 'POST') return post(path, options);
  if (method === 'PUT') return put(path, options);
  if (method === 'PATCH') return patch(path, options);
  if (method === 'DELETE') return del(path, options);
  return client.request(method, path, options);
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
