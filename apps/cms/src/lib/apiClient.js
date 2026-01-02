import { createApiClient } from './apiClientCore';

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'cms_token';
const USER_KEY = 'cms_current_user';

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

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

const redirectToLogin = () => {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    const returnTo = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    window.location.href = `/login?returnTo=${returnTo}&reason=unauthorized`;
  }
};

const handleUnauthorized = () => {
  if (unauthorizedHandler) {
    unauthorizedHandler();
    return;
  }
  redirectToLogin();
};

const client = createApiClient({
  apiBaseUrl: API_BASE_URL,
  getToken: getStoredToken,
  setToken: setStoredToken,
  getUser: getStoredUser,
  setUser: setStoredUser,
  onUnauthorized: handleUnauthorized,
});

export const apiClient = {
  ...client,
  getToken: getStoredToken,
  setToken: setStoredToken,
  getUser: getStoredUser,
  setUser: setStoredUser,
};

export const uploadFile = async (file, options = {}) => client.uploadFile(file, options);
