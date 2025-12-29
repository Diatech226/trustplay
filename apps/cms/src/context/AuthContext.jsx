import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, setUnauthorizedHandler } from '../lib/apiClient';

const AuthContext = createContext(null);

const parseUserResponse = (payload) => payload?.user || payload?.data?.user || payload?.data || payload;

const normalizeUser = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  const nextUser = { ...payload };
  if (typeof nextUser.role === 'string') {
    nextUser.role = nextUser.role.trim().toUpperCase();
  }
  return nextUser;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => normalizeUser(apiClient.getUser()));
  const [status, setStatus] = useState('loading');

  const logout = useCallback((options = {}) => {
    apiClient.setToken(null);
    apiClient.setUser(null);
    setUser(null);
    setStatus('unauthenticated');

    if (options.redirect !== false && typeof window !== 'undefined') {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      const returnTo = encodeURIComponent(currentPath);
      window.location.href = `/login${returnTo ? `?returnTo=${returnTo}` : ''}`;
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await apiClient.get('/api/user/me', { skipAuthRedirect: true });
      const nextUser = normalizeUser(parseUserResponse(data));
      setUser(nextUser);
      apiClient.setUser(nextUser);
      setStatus('authenticated');
    } catch (error) {
      apiClient.setToken(null);
      apiClient.setUser(null);
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await apiClient.post('/api/auth/signin', {
      body: { email, password },
      auth: false,
    });
    const token = data?.token || data?.data?.token;
    const nextUser = normalizeUser(parseUserResponse(data?.data || data));
    if (token) {
      apiClient.setToken(token);
    }
    apiClient.setUser(nextUser || null);
    setUser(nextUser || null);
    setStatus('authenticated');
    return nextUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      login,
      logout,
      refresh: fetchProfile,
    }),
    [user, status, login, logout, fetchProfile]
  );

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, [logout]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
