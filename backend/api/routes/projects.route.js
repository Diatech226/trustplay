import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { requireRoles } from '../utils/roles.js';
import { createProject, deleteProject, getProject, listProjects, updateProject } from '../controllers/project.controller.js';

const router = express.Router();

router.use(verifyToken, requireRoles());

router
  .route('/')
  .get(listProjects)
  .post(createProject);

router
  .route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

export default router;
