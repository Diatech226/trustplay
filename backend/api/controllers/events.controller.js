import { getposts } from './post.controller.js';

export const getEvents = (req, res, next) => {
  req.query = {
    ...req.query,
    category: 'TrustEvent',
    status: req.query.status || 'draft,review,published,scheduled',
  };
  return getposts(req, res, next);
};
