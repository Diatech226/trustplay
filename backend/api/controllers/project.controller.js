import Client from '../models/client.model.js';
import Project from '../models/project.model.js';
import Campaign from '../models/campaign.model.js';
import { errorHandler } from '../utils/error.js';

const normalizeAssets = (assets = []) => {
  if (!Array.isArray(assets)) return [];
  return assets
    .map((asset) => ({
      name: asset?.name?.trim() || asset?.title?.trim(),
      url: asset?.url?.trim(),
      type: asset?.type?.trim(),
      mime: asset?.mime?.trim(),
    }))
    .filter((asset) => asset.url);
};

export const createProject = async (req, res, next) => {
  try {
    const { clientId, title, brief, status, deadline, attachments, tags } = req.body;
    if (!clientId || !title) {
      return next(errorHandler(400, 'clientId and title are required'));
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return next(errorHandler(404, 'Client not found'));
    }

    const project = await Project.create({
      clientId,
      title: title.trim(),
      brief: brief?.trim(),
      status: status || undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      attachments: normalizeAssets(attachments),
      tags: Array.isArray(tags) ? tags : [],
    });

    return res.status(201).json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

export const listProjects = async (req, res, next) => {
  try {
    const { clientId, status, searchTerm, page = 1, limit = 20, sort = 'desc' } = req.query;
    const query = {};
    if (clientId) query.clientId = clientId;
    if (status) query.status = { $in: status.split(',').map((value) => value.trim()) };
    if (searchTerm) query.$text = { $search: searchTerm };

    const pageNumber = Number(page) || 1;
    const pageSize = Math.min(Number(limit) || 20, 100);
    const skip = (pageNumber - 1) * pageSize;

    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort({ updatedAt: sort === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('clientId', 'name status'),
      Project.countDocuments(query),
    ]);

    const items = projects.map((project) => ({
      ...project.toObject(),
      client: project.clientId,
    }));

    return res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize) || 1,
        limit: pageSize,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('clientId', 'name status contacts');
    if (!project) {
      return next(errorHandler(404, 'Project not found'));
    }

    const campaigns = await Campaign.find({ projectId: project._id }).sort({ updatedAt: -1 });
    return res.json({ success: true, data: { project, campaigns } });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { clientId, title, brief, status, deadline, attachments, tags } = req.body;
    const payload = {};
    if (clientId) {
      const exists = await Client.exists({ _id: clientId });
      if (!exists) {
        return next(errorHandler(404, 'Client not found'));
      }
      payload.clientId = clientId;
    }
    if (title) payload.title = title.trim();
    if (brief !== undefined) payload.brief = typeof brief === 'string' ? brief.trim() : '';
    if (status) payload.status = status;
    if (deadline !== undefined) payload.deadline = deadline ? new Date(deadline) : null;
    if (attachments !== undefined) payload.attachments = normalizeAssets(attachments);
    if (tags !== undefined) payload.tags = Array.isArray(tags) ? tags : [];

    const project = await Project.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true });
    if (!project) {
      return next(errorHandler(404, 'Project not found'));
    }

    return res.json({ success: true, data: { project } });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) {
      return next(errorHandler(404, 'Project not found'));
    }

    await Campaign.deleteMany({ projectId });
    await project.deleteOne();

    return res.json({ success: true, message: 'Project deleted', data: { projectId } });
  } catch (error) {
    next(error);
  }
};
