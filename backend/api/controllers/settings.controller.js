import Setting from '../models/settings.model.js';
import { errorHandler } from '../utils/error.js';

const DEFAULT_NAV_CATEGORIES = ['news', 'politique', 'science-tech', 'sport', 'cinema'];

const parseBoolean = (value, fallback) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
};

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : undefined);

const normalizeSocialLinks = (links = {}) => {
  if (!links || typeof links !== 'object') return undefined;
  return {
    facebook: normalizeString(links.facebook) || '',
    twitter: normalizeString(links.twitter) || '',
    youtube: normalizeString(links.youtube) || '',
    instagram: normalizeString(links.instagram) || '',
    linkedin: normalizeString(links.linkedin) || '',
  };
};

const normalizeEmailSettings = (value = {}) => {
  if (!value || typeof value !== 'object') return undefined;
  return {
    senderName: normalizeString(value.senderName) || '',
    senderEmail: normalizeString(value.senderEmail) || '',
    replyToEmail: normalizeString(value.replyToEmail) || '',
  };
};

const normalizeNavigationCategories = (value) => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return DEFAULT_NAV_CATEGORIES;
};

const buildSettingsPayload = (payload = {}) => {
  const updates = {};

  if (payload.siteName !== undefined) {
    const name = normalizeString(payload.siteName);
    if (!name) {
      throw errorHandler(400, 'siteName is required');
    }
    updates.siteName = name;
  }

  if (payload.siteDescription !== undefined) {
    updates.siteDescription = normalizeString(payload.siteDescription) || '';
  }

  if (payload.logoUrl !== undefined) {
    updates.logoUrl = normalizeString(payload.logoUrl) || '';
  }

  if (payload.primaryColor !== undefined) {
    updates.primaryColor = normalizeString(payload.primaryColor) || '#2563eb';
  }

  if (payload.socialLinks !== undefined) {
    updates.socialLinks = normalizeSocialLinks(payload.socialLinks);
  }

  if (payload.navigationCategories !== undefined) {
    updates.navigationCategories = normalizeNavigationCategories(payload.navigationCategories);
  }

  if (payload.commentsEnabled !== undefined) {
    updates.commentsEnabled = parseBoolean(payload.commentsEnabled, true);
  }

  if (payload.maintenanceMode !== undefined) {
    updates.maintenanceMode = parseBoolean(payload.maintenanceMode, false);
  }

  if (payload.emailSettings !== undefined) {
    updates.emailSettings = normalizeEmailSettings(payload.emailSettings);
  }

  return updates;
};

export const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }

    return res.json({ success: true, data: { settings }, settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const updates = buildSettingsPayload(req.body || {});

    const settings = await Setting.findOneAndUpdate(
      {},
      { $set: updates },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, data: { settings }, settings });
  } catch (error) {
    next(error);
  }
};
