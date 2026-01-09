import { apiClient } from '../lib/apiClient';

const normalizePagesResponse = (response) => {
  const pages = response?.pages || response?.data?.pages || [];
  const totalPages = response?.totalPages ?? response?.data?.totalPages ?? 0;
  return { pages, totalPages };
};

export const fetchPages = async (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, value);
  });
  const query = searchParams.toString();
  const response = await apiClient.get(`/api/pages${query ? `?${query}` : ''}`);
  return normalizePagesResponse(response);
};

export const fetchPageById = async (pageId) => {
  if (!pageId || pageId === 'undefined' || pageId === 'null') {
    throw new Error('Identifiant de page manquant.');
  }
  const response = await apiClient.get(`/api/pages/${pageId}`);
  return response?.page || response?.data?.page || null;
};

export const createPage = async (payload) => apiClient.post('/api/pages', { body: payload });

export const updatePage = async (pageId, payload) => apiClient.put(`/api/pages/${pageId}`, { body: payload });

export const deletePage = async (pageId) => apiClient.del(`/api/pages/${pageId}`);

export const updatePageStatus = async (pageId, status, publishedAt) =>
  apiClient.patch(`/api/pages/${pageId}/status`, { body: { status, publishedAt } });
