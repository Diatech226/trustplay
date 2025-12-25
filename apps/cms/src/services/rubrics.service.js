import { apiClient } from '../lib/apiClient';

const normalizeRubricsResponse = (response) => {
  const payload = response?.data || response;
  return payload?.rubrics || [];
};

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, value);
  });
  return searchParams.toString();
};

export const fetchRubrics = async (params = {}) => {
  const query = buildQuery(params);
  const response = await apiClient.get(`/api/rubrics${query ? `?${query}` : ''}`);
  return normalizeRubricsResponse(response);
};

export const createRubric = async (payload) => {
  const response = await apiClient.post('/api/rubrics', { body: payload });
  return response?.data?.rubric || response?.rubric || response?.data;
};

export const updateRubric = async (id, payload) => {
  const response = await apiClient.put(`/api/rubrics/${id}`, { body: payload });
  return response?.data?.rubric || response?.rubric || response?.data;
};

export const deleteRubric = async (id) => {
  const response = await apiClient.del(`/api/rubrics/${id}`);
  return response?.data?.rubric || response?.rubric || response?.data;
};
