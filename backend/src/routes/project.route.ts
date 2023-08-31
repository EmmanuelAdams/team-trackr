import express from 'express';
import {
  getAllProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getAllOrganizationProjects,
} from '../controllers/project.controller';
import taskRouter from "./task.route";
import { protect } from "../middlewares/auth";
import advancedResults from "../middlewares/advancedResults";
import { Project, ProjectDocument } from "../models/Project";
import authenticate from '../middlewares/authentication';
const router = express.Router();


// Re-route into other resource routers
router.use("/:projectId/tasks", taskRouter);

router.route("/")
.get(advancedResults(Project, 'tasks'), getAllProjects)

router.get(
  '/organization',
  authenticate,
  getAllOrganizationProjects  
);
router.get('/:id', protect, authenticate, getProject);
router.patch('/:id/update', protect, authenticate, updateProject);
router.post('/new',  authenticate, createProject);
router.delete('/:id/delete', protect, authenticate, deleteProject);

export default router;
