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
    startIndex: (resolvedPage - 1) * resolvedLimit,
    limit: resolvedLimit,
  });
  const response = await apiClient.get(`/api/user/getusers${query ? `?${query}` : ''}`);
  return normalizeUsersResponse(response);
};

export const createUser = async (payload) => {
  const response = await apiClient.post('/api/user/admin-create', { body: payload });
  return response?.data?.user || response?.user || response?.data;
};

export const updateUser = async (id, payload) => {
  const response = await apiClient.put(`/api/user/${id}`, { body: payload });
  return response?.data?.user || response?.user || response?.data;
};

export const updateUserRole = async (id, role) => {
  const response = await apiClient.patch(`/api/user/${id}/role`, { body: { role } });
  return response?.data?.user || response?.user || response?.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.del(`/api/user/delete/${id}`);
  return response?.data || response;
};
