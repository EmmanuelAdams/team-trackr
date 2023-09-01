import { Request, Response, NextFunction } from "express";
import { Task } from "../models/Task";
import { Project } from "../models/Project";
import ErrorResponse from "../utils/errorResponse";
import asyncHandler from "../middlewares/async";

// @desc      Get tasks
// @route     GET /api/v1/tasks
// @route     GET /api/v1/projects/:projectId/tasks
// @access    Public
// Get all tasks (across all projects)
export const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.find();

  if (req.params.projectId) {
    const tasks = await Task.find({ project: req.params.projectId });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } else {
    res.status(200).json({ data: task });
  }
});

// @desc      Add Task
// @route     POST /api/v1/projects/:projectId/tasks
// @access    Private
export const createTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    req.body.project = req.params.projectId;
    // req.body.user = req.user.id;

    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return next(
        new ErrorResponse(
          `No project with the id of ${req.params.projectId}`,
          404
        )
      );
    }

    const task = await Task.create(req.body);

    res.status(200).json({
      success: true,
      data: task,
    });
  }
);

// Get all tasks within a project
// @desc      Get single task
// @route     GET /api/v1/tasks/:id
// @access    Public
export const getTask = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const task = await Task.findById(req.params.id).populate({
      path: "project",
      select: "name description",
    });

    if (!task) {
      return next(
        new ErrorResponse(`No task with the id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  }
);

// Update a task within a project
export const updateTaskInProject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return next(
        new ErrorResponse(`No task with the id of ${req.params.id}`, 404)
      );
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      // Task.findByIdAndUpdate might return null if the task was not found
      return next(
        new ErrorResponse(`No task with the id of ${req.params.id}`, 404)
      );
    }

    await task.save();

    res.status(200).json({
      success: true,
      data: task,
    });
  }
);


// Delete a task within a project
export const deleteTaskInProject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(
        new ErrorResponse(`No task with the id of ${req.params.id}`, 404)
      );
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

