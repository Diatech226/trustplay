import EventLog from '../models/eventLog.model.js';
import Post from '../models/post.model.js';
import Media from '../models/media.model.js';
import User from '../models/user.model.js';
import Comment from '../models/comment.model.js';
import { errorHandler } from '../utils/error.js';

const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection?.remoteAddress || req.ip;

export const logEvent = async (req, res, next) => {
  try {
    const { type, page, slug, label, metadata } = req.body || {};
    if (!type) {
      return next(errorHandler(400, 'type is required'));
    }

    const entry = await EventLog.create({
      type,
      page,
      slug,
      label,
      metadata,
      userId: req.user?.id,
      userAgent: req.headers['user-agent'],
      ip: getClientIp(req),
    });

    return res.status(201).json({ success: true, data: entry });
  } catch (error) {
    return next(error);
  }
};

const aggregateTopArticles = async (since) => {
  const topBySlug = await EventLog.aggregate([
    { $match: { type: 'page_view', createdAt: { $gte: since } } },
    { $group: { _id: '$slug', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const slugs = topBySlug.filter((item) => item._id).map((item) => item._id);
  const posts = await Post.find({ slug: { $in: slugs } })
    .select('slug title subCategory updatedAt')
    .lean();
  return topBySlug.map((item) => ({
    slug: item._id,
    count: item.count,
    title: posts.find((post) => post.slug === item._id)?.title,
  }));
};

const aggregateDailyViews = async (since) => {
  const days = await EventLog.aggregate([
    { $match: { type: 'page_view', createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return days.map((day) => ({ date: day._id, count: day.count }));
};

export const getAnalyticsSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      pageViews,
      shares,
      eventSignups,
      uniquePages,
      topArticles,
      dailyViews,
      totalPosts,
      draftPosts,
      reviewPosts,
      publishedPosts,
      scheduledPosts,
      totalMedia,
      totalUsers,
      totalComments,
      totalEvents,
    ] = await Promise.all([
      EventLog.countDocuments({ type: 'page_view', createdAt: { $gte: last30Days } }),
      EventLog.countDocuments({ type: 'share', createdAt: { $gte: last30Days } }),
      EventLog.countDocuments({ type: 'event_signup', createdAt: { $gte: last30Days } }),
      EventLog.distinct('slug', { type: 'page_view', createdAt: { $gte: last30Days } }),
      aggregateTopArticles(last30Days),
      aggregateDailyViews(last7Days),
      Post.countDocuments({}),
      Post.countDocuments({ status: 'draft' }),
      Post.countDocuments({ status: 'review' }),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'scheduled' }),
      Media.countDocuments({}),
      User.countDocuments({}),
      Comment.countDocuments({}),
      Post.countDocuments({ category: 'TrustEvent' }),
    ]);

    const latestEvents = await EventLog.find({ createdAt: { $gte: last30Days } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('type page slug label createdAt metadata')
      .lean();

    return res.json({
      success: true,
      data: {
        pageViews,
        shares,
        eventSignups,
        uniquePages: uniquePages.length,
        topArticles,
        dailyViews,
        latestEvents,
        posts: {
          total: totalPosts,
          draft: draftPosts,
          review: reviewPosts,
          published: publishedPosts,
          scheduled: scheduledPosts,
        },
        events: { total: totalEvents },
        media: { total: totalMedia },
        users: { total: totalUsers },
        comments: { total: totalComments },
      },
    });
  } catch (error) {
    return next(error);
  }
};
