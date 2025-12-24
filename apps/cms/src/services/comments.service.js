import { apiClient } from '../lib/apiClient';

const normalizeCommentsResponse = (response) => {
  const comments = response?.comments || response?.data?.comments || [];
  return {
    comments,
    totalComments: response?.totalComments ?? response?.data?.totalComments ?? comments.length,
    lastMonthComments: response?.lastMonthComments ?? response?.data?.lastMonthComments ?? 0,
  };
};

export const fetchComments = async (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, value);
  });
  const query = searchParams.toString();
  const response = await apiClient.get(`/api/comment/getcomments${query ? `?${query}` : ''}`);
  return normalizeCommentsResponse(response);
};

export const deleteComment = async (commentId) => apiClient.del(`/api/comment/deleteComment/${commentId}`);
