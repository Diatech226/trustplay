import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { requireRoles } from '../utils/roles.js';
import { createClient, deleteClient, getClient, listClients, updateClient } from '../controllers/client.controller.js';

const router = express.Router();

router.use(verifyToken, requireRoles());

router
  .route('/')
  .get(listClients)
  .post(createClient);

router
  .route('/:id')
  .get(getClient)
  .put(updateClient)
  .delete(deleteClient);

export default router;
