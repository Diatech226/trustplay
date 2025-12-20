import Client from '../models/client.model.js';
import Project from '../models/project.model.js';
import Campaign from '../models/campaign.model.js';
import { errorHandler } from '../utils/error.js';

const normalizeContacts = (value = []) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((contact) => ({
      name: contact?.name?.trim(),
      email: contact?.email?.trim(),
      phone: contact?.phone?.trim(),
      role: contact?.role?.trim(),
    }))
    .filter((contact) => contact.name || contact.email || contact.phone);
};

export const createClient = async (req, res, next) => {
  try {
    const { name, contacts, notes, status, tags } = req.body;
    if (!name) {
      return next(errorHandler(400, 'Client name is required'));
    }

    const client = await Client.create({
      name: name.trim(),
      contacts: normalizeContacts(contacts),
      notes: notes?.trim(),
      status: status || undefined,
      tags: Array.isArray(tags) ? tags : [],
    });

    return res.status(201).json({ success: true, data: { client } });
  } catch (error) {
    next(error);
  }
};

export const listClients = async (req, res, next) => {
  try {
    const { searchTerm, status, page = 1, limit = 20, sort = 'desc' } = req.query;
    const query = {};

    if (status) {
      query.status = { $in: status.split(',').map((value) => value.trim()) };
    }

    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }

    const pageNumber = Number(page) || 1;
    const pageSize = Math.min(Number(limit) || 20, 100);
    const skip = (pageNumber - 1) * pageSize;

    const [clients, total, projectStats] = await Promise.all([
      Client.find(query)
        .sort({ updatedAt: sort === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(pageSize),
      Client.countDocuments(query),
      Project.aggregate([
        { $group: { _id: '$clientId', projects: { $sum: 1 } } },
      ]),
    ]);

    const projectCountByClient = projectStats.reduce((acc, stat) => {
      acc[stat._id?.toString()] = stat.projects;
      return acc;
    }, {});

    const items = clients.map((client) => ({
      ...client.toObject(),
      projectCount: projectCountByClient[client._id.toString()] || 0,
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

export const getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return next(errorHandler(404, 'Client not found'));
    }

    const projects = await Project.find({ clientId: client._id }).sort({ updatedAt: -1 });
    const projectIds = projects.map((p) => p._id);
    const campaignCountByProject = await Campaign.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: '$projectId', campaigns: { $sum: 1 } } },
    ]);

    const campaignIndex = campaignCountByProject.reduce((acc, row) => {
      acc[row._id?.toString()] = row.campaigns;
      return acc;
    }, {});

    const enrichedProjects = projects.map((project) => ({
      ...project.toObject(),
      campaignCount: campaignIndex[project._id.toString()] || 0,
    }));

    return res.json({ success: true, data: { client, projects: enrichedProjects } });
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const { name, contacts, notes, status, tags } = req.body;
    const payload = {};
    if (name) payload.name = name.trim();
    if (notes !== undefined) payload.notes = typeof notes === 'string' ? notes.trim() : '';
    if (status) payload.status = status;
    if (contacts !== undefined) payload.contacts = normalizeContacts(contacts);
    if (tags !== undefined) payload.tags = Array.isArray(tags) ? tags : [];

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true }
    );

    if (!client) {
      return next(errorHandler(404, 'Client not found'));
    }

    return res.json({ success: true, data: { client } });
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const clientId = req.params.id;
    const client = await Client.findById(clientId);
    if (!client) {
      return next(errorHandler(404, 'Client not found'));
    }

    const projects = await Project.find({ clientId }).select('_id');
    const projectIds = projects.map((p) => p._id);

    if (projectIds.length) {
      await Campaign.deleteMany({ projectId: { $in: projectIds } });
      await Project.deleteMany({ _id: { $in: projectIds } });
    }

    await client.deleteOne();

    return res.json({ success: true, message: 'Client deleted', data: { clientId } });
  } catch (error) {
    next(error);
  }
};
