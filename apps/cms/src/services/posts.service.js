import { apiClient } from '../lib/apiClient';

const normalizePostsResponse = (response) => {
  const posts = response?.posts || response?.data?.posts || [];
  const totalPosts = response?.totalPosts ?? response?.data?.totalPosts ?? 0;
  return { posts, totalPosts };
};

export const fetchPosts = async (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, value);
  });
  const query = searchParams.toString();
  const response = await apiClient.get(`/api/posts${query ? `?${query}` : ''}`);
  return normalizePostsResponse(response);
};

export const fetchPostById = async (postId) => {
  if (!postId) return null;
  const response = await apiClient.get(`/api/posts?postId=${postId}`);
  const posts = response?.posts || response?.data?.posts || [];
  return posts[0] || response?.post || response?.data?.post || null;
};

export const createPost = async (payload) => apiClient.post('/api/posts', { body: payload });

export const updatePost = async (postId, payload) => apiClient.put(`/api/posts/${postId}`, { body: payload });

export const deletePost = async (postId) => apiClient.del(`/api/posts/${postId}`);
