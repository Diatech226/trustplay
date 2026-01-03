import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { requireRoles } from '../utils/roles.js';
import {
  createCampaign,
  deleteCampaign,
  getCampaign,
  listCampaigns,
  updateCampaign,
} from '../controllers/campaign.controller.js';

const router = express.Router();

router.use(verifyToken, requireRoles());

router
  .route('/')
  .get(listCampaigns)
  .post(createCampaign);

router
  .route('/:id')
  .get(getCampaign)
  .put(updateCampaign)
  .delete(deleteCampaign);

export default router;
