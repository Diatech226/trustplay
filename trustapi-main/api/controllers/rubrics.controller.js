import slugify from 'slugify';
import Rubric, { RUBRIC_SCOPES } from '../models/rubric.model.js';
import { errorHandler } from '../utils/error.js';

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeScope = (value) => {
  if (!value) return null;
  const scope = normalizeString(value);
  return RUBRIC_SCOPES.includes(scope) ? scope : null;
};

const normalizeSlug = (value) => {
  const trimmed = normalizeString(value).toLowerCase();
  if (!trimmed) return '';
  return slugify(trimmed, { lower: true, strict: true });
};

const buildRubricPayload = (payload = {}) => {
  const scope = normalizeScope(payload.scope);
  const label = normalizeString(payload.label);
  const slugSource = normalizeString(payload.slug) || label;
  const slug = normalizeSlug(slugSource);

  return {
    scope,
    label,
    slug,
    description: normalizeString(payload.description),
    order: Number.isFinite(Number(payload.order)) ? Number(payload.order) : 0,
    isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
  };
};

export const listRubrics = async (req, res, next) => {
  try {
    const scope = normalizeScope(req.query.scope);
    if (req.query.scope && !scope) {
      return next(errorHandler(400, 'Invalid scope provided'));
    }

    const includeInactive = req.query.includeInactive === 'true' || req.query.includeInactive === '1';
    const filter = {};
    if (scope) filter.scope = scope;
    if (!includeInactive) {
      filter.isActive = true;
      filter.deletedAt = null;
    }

    const rubrics = await Rubric.find(filter).sort({ order: 1, label: 1 });

    res.status(200).json({
      success: true,
      data: { rubrics },
    });
  } catch (error) {
    next(error);
  }
};

export const createRubric = async (req, res, next) => {
  const payload = buildRubricPayload(req.body);
  if (!payload.scope || !payload.label || !payload.slug) {
    return next(errorHandler(400, 'Scope, label and slug are required'));
  }

  try {
    const existing = await Rubric.findOne({ scope: payload.scope, slug: payload.slug });
    if (existing) {
      return next(errorHandler(409, 'Rubric slug already exists for this scope'));
    }

    const rubric = await Rubric.create(payload);
    res.status(201).json({
      success: true,
      data: { rubric },
    });
  } catch (error) {
    next(error);
  }
};

export const updateRubric = async (req, res, next) => {
  const updates = buildRubricPayload(req.body);
  if (req.body.scope !== undefined && !updates.scope) {
    return next(errorHandler(400, 'Invalid scope provided'));
  }
  if (req.body.label !== undefined && !updates.label) {
    return next(errorHandler(400, 'Label is required'));
  }
  if (req.body.slug !== undefined && !updates.slug) {
    return next(errorHandler(400, 'Slug is required'));
  }

  try {
    const rubric = await Rubric.findById(req.params.id);
    if (!rubric) {
      return next(errorHandler(404, 'Rubric not found'));
    }

    const nextScope = updates.scope || rubric.scope;
    const nextSlug = updates.slug || rubric.slug;
    if ((updates.scope || updates.slug) && nextScope && nextSlug) {
      const existing = await Rubric.findOne({
        _id: { $ne: rubric._id },
        scope: nextScope,
        slug: nextSlug,
      });
      if (existing) {
        return next(errorHandler(409, 'Rubric slug already exists for this scope'));
      }
    }

    Object.assign(rubric, updates);
    await rubric.save();

    res.status(200).json({
      success: true,
      data: { rubric },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRubric = async (req, res, next) => {
  try {
    const rubric = await Rubric.findById(req.params.id);
    if (!rubric) {
      return next(errorHandler(404, 'Rubric not found'));
    }

    rubric.isActive = false;
    rubric.deletedAt = new Date();
    await rubric.save();

    res.status(200).json({
      success: true,
      data: { rubric },
    });
  } catch (error) {
    next(error);
  }
};
