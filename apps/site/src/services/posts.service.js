import { apiRequest } from '../lib/apiClient';
import {
  MEDIA_CATEGORY,
  PRODUCTION_CATEGORY,
  normalizeSubCategory,
} from '../utils/categories';

const POSTS_ENDPOINT = '/api/posts';

const extractPostsResponse = (data) => ({
  posts: data?.posts || data?.data?.posts || [],
  totalPosts: data?.totalPosts || data?.data?.totalPosts || 0,
  raw: data,
});

const setParam = (params, key, value) => {
  if (value === undefined || value === null || value === '') return;
  params.set(key, value);
};

export const normalizePost = (post) => {
  const normalizedSubCategory = normalizeSubCategory(post.subCategory);
  return {
    ...post,
    subCategory: normalizedSubCategory,
  };
};

export const normalizePosts = (posts = []) => posts.map(normalizePost);

export const getPosts = async ({
  category,
  subCategory,
  slug,
  postId,
  searchTerm,
  startIndex,
  limit,
  order,
  userId,
  populateMedia = true,
} = {}) => {
  const params = new URLSearchParams();
  setParam(params, 'category', category);
  setParam(params, 'subCategory', subCategory);
  setParam(params, 'slug', slug);
  setParam(params, 'postId', postId);
  setParam(params, 'searchTerm', searchTerm);
  setParam(params, 'startIndex', startIndex);
  setParam(params, 'limit', limit);
  setParam(params, 'order', order);
  setParam(params, 'userId', userId);
  if (populateMedia) {
    setParam(params, 'populateMedia', '1');
  }

  const query = params.toString();
  const data = await apiRequest(`${POSTS_ENDPOINT}${query ? `?${query}` : ''}`, {
    auth: false,
  });

  return extractPostsResponse(data);
};

export const getMediaPosts = (params = {}) =>
  getPosts({ category: MEDIA_CATEGORY, ...params });

export const getProductionPosts = (params = {}) =>
  getPosts({ category: PRODUCTION_CATEGORY, ...params });

export const getPostBySlug = async (slug) => {
  if (!slug) {
    return { post: null, raw: null };
  }
  const { posts, raw } = await getPosts({ slug, limit: 1 });
  const post = posts[0] ? normalizePost(posts[0]) : null;
  return { post, raw };
};
