import express from "express";
import {
  createTask,
  getAllTasks,
  getTask,
  // getTaskInProjectById,
  updateTaskInProject,
  deleteTaskInProject,
} from "../controllers/task.controller";
import advancedResults from "../middlewares/advancedResults";

import { Task } from "../models/Task";

const router = express.Router({ mergeParams: true });

router.route("/").get(advancedResults(Task), getAllTasks).post(createTask);

router
  .route("/:id")
  .get(getTask)
  .put(updateTaskInProject)
  .delete(deleteTaskInProject);

export default router;
