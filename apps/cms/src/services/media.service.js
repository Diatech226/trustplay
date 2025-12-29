import { apiClient } from '../lib/apiClient';

const normalizeMediaResponse = (response) => {
  const media = response?.media || response?.data?.media || [];
  const totalMedia = response?.totalMedia ?? response?.data?.totalMedia ?? 0;
  return { media, totalMedia };
};

export const fetchMedia = async ({ search, category, subCategory, kind, startIndex, limit, order, status } = {}) => {
  const searchParams = new URLSearchParams();
  if (search) searchParams.set('search', search);
  if (category) searchParams.set('category', category);
  if (subCategory) searchParams.set('subCategory', subCategory);
  if (kind) searchParams.set('type', kind);
  if (status) searchParams.set('status', status);
  if (startIndex !== undefined) searchParams.set('startIndex', startIndex);
  if (limit) searchParams.set('limit', limit);
  if (order) searchParams.set('order', order);
  const query = searchParams.toString();
  const response = await apiClient.get(`/api/media${query ? `?${query}` : ''}`);
  return normalizeMediaResponse(response);
};

export const createMedia = async (payload) => apiClient.post('/api/media', { body: payload });

export const updateMedia = async (id, payload) => apiClient.put(`/api/media/${id}`, { body: payload });

export const deleteMedia = async (id) => apiClient.del(`/api/media/${id}`);

export const uploadMedia = async (file, metadata = {}) => {
  if (!file) throw new Error('Aucun fichier sélectionné');
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });
  const response = await apiClient.post('/api/media/upload', {
    body: formData,
    headers: {},
  });
  const payload = response?.data || {};
  const media = response?.media || payload?.media;
  return {
    ...response,
    ...payload,
    media,
    url: payload?.url || media?.url || response?.url,
  };
};
