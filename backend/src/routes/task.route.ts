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


// Get all tasks (across all projects)
router.get('/tasks', getAllTasks);
// // Create a new task within a project
// router.post('/:projectId/tasks', createTask);

// Get all tasks within a project
router.get('/:projectId/tasks', getAllTasksInProject);

// // Get details of a specific task within a project
// router.get('/:projectId/tasks/:taskId', getTaskInProjectById);

// // Update a task within a project
// router.put('/:projectId/tasks/:taskId', updateTaskInProject);

// // Delete a task within a project
// router.delete('/:projectId/tasks/:taskId', deleteTaskInProject);

export default router;
