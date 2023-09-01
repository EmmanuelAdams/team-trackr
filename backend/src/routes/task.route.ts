import express from 'express';
import {
  createTask,
  getAllTasks,
  getTask,
  updateTaskInProject,
  deleteTaskInProject,
  getProjectTasks,
} from '../controllers/task.controller';
import advancedResults from '../middlewares/advancedResults';
import authenticate from '../middlewares/authentication';

import { Task } from '../models/Task';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(advancedResults(Task), getAllTasks)
  .post(authenticate, createTask);

router.get(
  '/project/:projectId',
  advancedResults(Task),
  getProjectTasks
);

router.route('/:id').get(authenticate, getTask);

router.patch(
  '/:id/update',
  authenticate,
  updateTaskInProject
);

router.delete(
  '/:id/delete',
  authenticate,
  deleteTaskInProject
);

export default router;
