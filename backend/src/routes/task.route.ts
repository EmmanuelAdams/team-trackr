import express from 'express';
import {
  createTask,
  getAllTasks,
  getAllTasksInProject,
  getTaskInProjectById,
  updateTaskInProject,
  deleteTaskInProject,
} from '../controllers/task.controller';

const router = express.Router();

router.get('/tasks', getAllTasks);
router.post('/:projectId/tasks', createTask);
router.get('/:projectId/tasks', getAllTasksInProject);
router.get(
  '/:projectId/tasks/:taskId',
  getTaskInProjectById
);
router.put(
  '/:projectId/tasks/:taskId',
  updateTaskInProject
);
router.delete(
  '/:projectId/tasks/:taskId',
  deleteTaskInProject
);

export default router;
