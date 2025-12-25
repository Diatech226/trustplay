import { apiClient } from '../lib/apiClient';

const normalizeSettings = (payload) => payload?.settings || payload?.data?.settings || payload?.data || payload || {};

export const fetchSettings = async () => {
  const response = await apiClient.get('/api/settings', { auth: false });
  return normalizeSettings(response);
};

export const updateSettings = async (payload) => {
  const response = await apiClient.put('/api/settings', { body: payload });
  return normalizeSettings(response);
};
