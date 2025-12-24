import { apiClient, uploadFile } from '../lib/apiClient';

const normalizeUploadsResponse = (response) => {
  const uploads = response?.files || response?.data?.files || [];
  return {
    uploads,
    nextCursor: response?.nextCursor ?? response?.data?.nextCursor ?? null,
  };
};

export const fetchUploads = async ({ limit = 50, cursor } = {}) => {
  const searchParams = new URLSearchParams();
  if (limit) searchParams.set('limit', limit);
  if (cursor) searchParams.set('cursor', cursor);
  const query = searchParams.toString();
  const response = await apiClient.get(`/api/uploads/list${query ? `?${query}` : ''}`);
  return normalizeUploadsResponse(response);
};

export const uploadMedia = async (file, fieldName = 'file') => uploadFile(file, fieldName);
