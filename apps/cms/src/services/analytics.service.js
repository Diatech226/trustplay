import { apiClient } from '../lib/apiClient';

export const fetchAnalyticsSummary = async () => {
  const response = await apiClient.get('/api/analytics/summary');
  return response?.data || response;
};
