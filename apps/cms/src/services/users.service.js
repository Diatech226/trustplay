import { apiClient } from '../lib/apiClient';

const normalizeUsersResponse = (response) => {
  const users = response?.users || response?.data?.users || [];
  return {
    users,
    totalUsers: response?.totalUsers ?? response?.data?.totalUsers ?? 0,
    lastMonthUsers: response?.lastMonthUsers ?? response?.data?.lastMonthUsers ?? 0,
  };
};

export const fetchUsers = async (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, value);
  });
  const query = searchParams.toString();
  const response = await apiClient.get(`/api/user/getusers${query ? `?${query}` : ''}`);
  return normalizeUsersResponse(response);
};
