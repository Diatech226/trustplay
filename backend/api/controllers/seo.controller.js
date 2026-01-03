import Post from '../models/post.model.js';

const getBaseUrl = (req) => {
  const envUrl = process.env.PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  return `${protocol}://${req.get('host')}`;
};

export const getSitemap = async (req, res, next) => {
  try {
    const baseUrl = getBaseUrl(req);
    const staticPaths = [
      '/',
      '/about',
      '/news',
      '/politique',
      '/science-tech',
      '/sport',
      '/cinema',
      '/projects',
      '/event',
      '/production',
    ];

    const posts = await Post.find({ status: 'published' })
      .select('slug updatedAt')
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();

    const urls = [
      ...staticPaths.map(
        (path) =>
          `<url><loc>${baseUrl}${path}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
      ),
      ...posts.map(
        (post) =>
          `<url><loc>${baseUrl}/post/${post.slug}</loc><lastmod>${
            post.updatedAt?.toISOString?.() || new Date().toISOString()
          }</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`
      ),
    ].join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

    res.header('Content-Type', 'application/xml');
    return res.send(xml);
  } catch (error) {
    return next(error);
  }
};

export const getRobots = (req, res, next) => {
  try {
    const baseUrl = getBaseUrl(req);
    const robots = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml`;
    res.header('Content-Type', 'text/plain');
    return res.send(robots);
  } catch (error) {
    return next(error);
  }
};
