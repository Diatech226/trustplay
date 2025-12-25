import { apiClient, uploadFile } from '../lib/apiClient';

const normalizeMediaResponse = (response) => {
  const media = response?.media || response?.data?.media || [];
  const totalMedia = response?.totalMedia ?? response?.data?.totalMedia ?? 0;
  return { media, totalMedia };
};

export const fetchMedia = async ({ search, category, kind, startIndex, limit, order } = {}) => {
  const searchParams = new URLSearchParams();
  if (search) searchParams.set('search', search);
  if (category) searchParams.set('category', category);
  if (kind) searchParams.set('kind', kind);
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

export const uploadMedia = async (file, metadata = {}) => uploadFile(file, { metadata });
