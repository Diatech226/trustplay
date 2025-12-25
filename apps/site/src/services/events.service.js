import { EVENT_CATEGORY } from '../utils/categories';
import { getPosts, normalizePosts } from './posts.service';

export const getEvents = async (params = {}) => {
  const { posts, totalPosts, raw } = await getPosts({ category: EVENT_CATEGORY, ...params });
  return { events: normalizePosts(posts), totalEvents: totalPosts, raw };
};
