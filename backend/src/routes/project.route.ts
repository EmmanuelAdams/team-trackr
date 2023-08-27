import express from "express";
import {
  getAllProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controllers";
import taskRouter from "./task.route";
import { protect } from "../middlewares/auth";
import advancedResults from "../middlewares/advancedResults";
import { Project, ProjectDocument } from "../models/Project";

const router = express.Router();

// Re-route into other resource routers
router.use("/:projectId/tasks", taskRouter);

router.route("/")
// .get(getAllProjects)
.get(advancedResults(Project, 'tasks'), getAllProjects)
.post(protect, createProject);

router
  .route("/:id")
  .get(getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

export default router;
