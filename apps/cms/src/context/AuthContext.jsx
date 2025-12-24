import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient, setUnauthorizedHandler } from '../lib/apiClient';

const AuthContext = createContext(null);

const parseUserResponse = (payload) => payload?.user || payload?.data?.user || payload?.data || payload;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');

  const logout = useCallback((options = {}) => {
    apiClient.setToken(null);
    setUser(null);
    setStatus('unauthenticated');

    if (options.redirect !== false && typeof window !== 'undefined') {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      const returnTo = encodeURIComponent(currentPath);
      window.location.href = `/login${returnTo ? `?returnTo=${returnTo}` : ''}`;
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    const token = apiClient.getToken();
    if (!token) {
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');
    try {
      const data = await apiClient.get('/api/user/me', { skipAuthRedirect: true });
      const nextUser = parseUserResponse(data);
      setUser(nextUser);
      setStatus('authenticated');
    } catch (error) {
      apiClient.setToken(null);
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
    const nextUser = parseUserResponse(data?.data || data);
    if (token) {
      apiClient.setToken(token);
    }
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
