import express from "express";
import {
  createTask,
  getAllTasks,
  getTask,
  updateTaskInProject,
  deleteTaskInProject,
} from "../controllers/task.controller";
import advancedResults from "../middlewares/advancedResults";

import { Task } from "../models/Task";
import { protect } from "../middlewares/auth";


const router = express.Router({ mergeParams: true });

router.route("/")
.get(advancedResults(Task), getAllTasks).post(protect, createTask);

router
  .route("/:id")
  .get(getTask)
  .put(protect,updateTaskInProject)
  .delete(protect,deleteTaskInProject);
  
export default router;