import Campaign from '../models/campaign.model.js';
import Project from '../models/project.model.js';
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

const normalizeKpis = (kpis = []) => {
  if (!Array.isArray(kpis)) return [];
  return kpis
    .map((kpi) => ({
      name: kpi?.name?.trim(),
      target: kpi?.target?.toString().trim(),
      current: kpi?.current?.toString().trim(),
    }))
    .filter((kpi) => kpi.name || kpi.target || kpi.current);
};

const normalizeSchedule = (schedule) => {
  if (!schedule) return {};
  return {
    start: schedule.start ? new Date(schedule.start) : undefined,
    end: schedule.end ? new Date(schedule.end) : undefined,
    cadence: schedule.cadence?.trim(),
  };
};

export const createCampaign = async (req, res, next) => {
  try {
    const { projectId, title, channel, goal, budget, kpis, assets, schedule, status } = req.body;
    if (!projectId || !channel) {
      return next(errorHandler(400, 'projectId and channel are required'));
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return next(errorHandler(404, 'Project not found'));
    }

    const campaign = await Campaign.create({
      projectId,
      title: title?.trim(),
      channel: channel.trim(),
      goal: goal?.trim(),
      budget: budget !== undefined ? Number(budget) : undefined,
      kpis: normalizeKpis(kpis),
      assets: normalizeAssets(assets),
      schedule: normalizeSchedule(schedule),
      status: status || undefined,
    });

    return res.status(201).json({ success: true, data: { campaign } });
  } catch (error) {
    next(error);
  }
};

export const listCampaigns = async (req, res, next) => {
  try {
    const { projectId, status, searchTerm, channel, page = 1, limit = 20, sort = 'desc' } = req.query;
    const query = {};
    if (projectId) query.projectId = projectId;
    if (status) query.status = { $in: status.split(',').map((value) => value.trim()) };
    if (channel) query.channel = { $in: channel.split(',').map((value) => value.trim()) };
    if (searchTerm) query.$text = { $search: searchTerm };

    const pageNumber = Number(page) || 1;
    const pageSize = Math.min(Number(limit) || 20, 100);
    const skip = (pageNumber - 1) * pageSize;

    const [campaigns, total] = await Promise.all([
      Campaign.find(query)
        .sort({ updatedAt: sort === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(pageSize)
        .populate({
          path: 'projectId',
          select: 'title clientId',
          populate: { path: 'clientId', select: 'name status' },
        }),
      Campaign.countDocuments(query),
    ]);

    const items = campaigns.map((campaign) => ({
      ...campaign.toObject(),
      project: campaign.projectId,
      client: campaign.projectId?.clientId,
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

export const getCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate({
      path: 'projectId',
      select: 'title status clientId',
      populate: { path: 'clientId', select: 'name status contacts' },
    });

    if (!campaign) {
      return next(errorHandler(404, 'Campaign not found'));
    }

    return res.json({ success: true, data: { campaign } });
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (req, res, next) => {
  try {
    const { projectId, title, channel, goal, budget, kpis, assets, schedule, status } = req.body;
    const payload = {};
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return next(errorHandler(404, 'Project not found'));
      }
      payload.projectId = projectId;
    }
    if (title !== undefined) payload.title = title?.trim();
    if (channel) payload.channel = channel.trim();
    if (goal !== undefined) payload.goal = goal?.trim();
    if (budget !== undefined) payload.budget = Number(budget);
    if (kpis !== undefined) payload.kpis = normalizeKpis(kpis);
    if (assets !== undefined) payload.assets = normalizeAssets(assets);
    if (schedule !== undefined) payload.schedule = normalizeSchedule(schedule);
    if (status) payload.status = status;

    const campaign = await Campaign.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true });
    if (!campaign) {
      return next(errorHandler(404, 'Campaign not found'));
    }

    return res.json({ success: true, data: { campaign } });
  } catch (error) {
    next(error);
  }
};

export const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return next(errorHandler(404, 'Campaign not found'));
    }

    await campaign.deleteOne();
    return res.json({ success: true, message: 'Campaign deleted', data: { campaignId: campaign._id } });
  } catch (error) {
    next(error);
  }
};
