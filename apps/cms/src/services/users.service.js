import { apiClient } from '../lib/apiClient';

const normalizeUsersResponse = (response) => {
  const payload = response?.data?.data || response?.data || response;
  const users = payload?.users || payload?.data?.users || [];
  return {
    users,
    totalUsers: payload?.totalUsers ?? 0,
    lastMonthUsers: payload?.lastMonthUsers ?? 0,
    page: payload?.page ?? 1,
    limit: payload?.limit ?? 20,
  };
};

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, value);
  });
  return searchParams.toString();
};

export const fetchUsers = async (params = {}) => {
  const { page, limit, ...rest } = params;
  const resolvedLimit = limit ?? 20;
  const resolvedPage = page ?? 1;
  const query = buildQuery({
    ...rest,
    page: resolvedPage,
    limit: resolvedLimit,
  });
  const response = await apiClient.get(`/api/admin/users${query ? `?${query}` : ''}`);
  return normalizeUsersResponse(response);
};

export const createUser = async (payload) => {
  const response = await apiClient.post('/api/admin/users', { body: payload });
  return response?.data?.user || response?.user || response?.data;
};

export const updateUser = async (id, payload) => {
  const response = await apiClient.put(`/api/admin/users/${id}`, { body: payload });
  return response?.data?.user || response?.user || response?.data;
};

export const updateUserRole = async (id, role) => {
  const response = await apiClient.put(`/api/admin/users/${id}/role`, { body: { role } });
  return response?.data?.user || response?.user || response?.data;
};

export const toggleAdminUser = async (id) => {
  const response = await apiClient.put(`/api/admin/users/${id}/toggle-admin`);
  return response?.data?.user || response?.user || response?.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.del(`/api/admin/users/${id}`);
  return response?.data || response;
};
