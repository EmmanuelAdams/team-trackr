import express from 'express';
import {
  getAllProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getAllOrganizationProjects,
} from '../controllers/project.controller';
import taskRouter from './task.route';
import advancedResults from '../middlewares/advancedResults';
import { Project } from '../models/Project';
import authenticate from '../middlewares/authentication';
import { validateObjectId } from '../middlewares/objectIdValidator';
const router = express.Router();

router.use(
  '/:projectId/new-task',
  validateObjectId,
  authenticate,
  taskRouter
);

router
  .route('/')
  .get(advancedResults(Project, 'tasks'), getAllProjects);

router.post('/new-project', authenticate, createProject);

router.get(
  '/organization',
  authenticate,
  getAllOrganizationProjects
);
router.get(
  '/:id',
  validateObjectId,
  authenticate,
  getProject
);
router.patch(
  '/:id/update',
  validateObjectId,
  authenticate,
  updateProject
);
router.delete(
  '/:id/delete',
  validateObjectId,
  authenticate,
  deleteProject
);

export default router;
