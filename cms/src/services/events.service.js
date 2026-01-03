import { apiClient } from '../lib/apiClient';

const normalizeEventsResponse = (response) => {
  const events = response?.posts || response?.data?.posts || [];
  const totalEvents = response?.totalPosts ?? response?.data?.totalPosts ?? 0;
  return { events, totalEvents };
};

export const fetchEvents = async (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, value);
  });
  const query = searchParams.toString();
  const response = await apiClient.get(`/api/events${query ? `?${query}` : ''}`);
  return normalizeEventsResponse(response);
};
