import { apiRequest } from '../lib/apiClient';

export const getPostComments = async (postId) => {
  if (!postId) {
    const error = new Error('postId manquant pour récupérer les commentaires.');
    error.status = 400;
    throw error;
  }
  return apiRequest(`/api/comment/getPostComments/${postId}`, { auth: false });
};
