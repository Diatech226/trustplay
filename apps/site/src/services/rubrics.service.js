import { get } from '../lib/apiClient';

export const fetchRubrics = async (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, value);
  });
  const query = searchParams.toString();
  const response = await get(`/api/rubrics${query ? `?${query}` : ''}`, { auth: false });
  const payload = response?.data || response;
  return payload?.rubrics || [];
};
