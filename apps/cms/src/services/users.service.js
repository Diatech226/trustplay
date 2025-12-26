import { apiClient } from '../lib/apiClient';

const normalizeUsersResponse = (response) => {
  const payload = response?.data || response;
  const users = payload?.users || [];
  return {
    users,
    totalUsers: payload?.totalUsers ?? 0,
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
  const { page, limit, startIndex, ...rest } = params;
  const resolvedLimit = limit ?? 20;
  const resolvedStartIndex =
    startIndex ?? (page ? Math.max(0, (page - 1) * resolvedLimit) : undefined);
  const query = buildQuery({
    ...rest,
    limit: resolvedLimit,
    startIndex: resolvedStartIndex,
  });
  const response = await apiClient.get(`/api/user/getusers${query ? `?${query}` : ''}`);
  return normalizeUsersResponse(response);
};

export const createUser = async (payload) => {
  const response = await apiClient.post('/api/user/create', { body: payload });
  return response?.data?.user || response?.user || response?.data;
};

export const updateUser = async (id, payload) => {
  const response = await apiClient.put(`/api/user/${id}`, { body: payload });
  return response?.data?.user || response?.user || response?.data;
};

export const updateUserRole = async (id, role) => {
  const response = await apiClient.put(`/api/user/${id}`, { body: { role } });
  return response?.data?.user || response?.user || response?.data;
};

export const toggleAdminUser = async (id) => {
  const response = await apiClient.put(`/api/user/${id}/toggle-admin`);
  return response?.data?.user || response?.user || response?.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.del(`/api/user/delete/${id}`);
  return response?.data || response;
};
