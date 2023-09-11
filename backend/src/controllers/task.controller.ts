import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middlewares/async';
import { title } from 'process';

export const validateTaskInputsLength = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, description } = req.body;

  if (title?.length < 3 || title?.length > 50) {
    return res.status(400).json({
      message:
        'Task title length must be between 3 and 50 characters',
    });
  }

  if (description?.length < 3 || description?.length > 50) {
    return res.status(400).json({
      message:
        'Task description length must be between 3 and 300 characters',
    });
  }

  next();
};

export const getAllTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const tasks = await Task.find();

    res
      .status(200)
      .json({ count: tasks.length, data: tasks });
  }
);

export const getProjectTasks = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = req.params.projectId;

    const projectTasks = await Task.find({
      project: projectId,
    });

    return res.status(200).json({
      success: true,
      count: projectTasks.length,
      data: projectTasks,
    });
  }
);

export const createTask = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (
        (req.user?.userType !== 'Organization' &&
          req.user?.userType !== 'Employee') ||
        (req.user?.level !== 'CEO' &&
          req.user?.level !== 'Senior')
      ) {
        return res.status(403).json({
          message:
            'You are not authorized to create a task',
        });
      }

      const projectId = req.params.projectId;

      const project = await Project.findById(projectId);

      if (!project) {
        return next(
          new ErrorResponse('Project not found', 404)
        );
      }

      const createdBy = req.user?._id;

      const {
        title,
        description,
        assignedTo,
        startDate,
        dueDate,
      } = req.body;
      const newTask = new Task({
        title,
        description,
        assignedTo,
        project,
        createdBy,
        startDate,
        dueDate,
      });

      validateTaskInputsLength(req, res, async () => {
        const existingTask = await Task.findOne({
          title,
        });
        if (existingTask) {
          return next(
            new ErrorResponse(
              'Task with this title already exists',
              400
            )
          );
        }

        const savedTask = await newTask.save();

        res.status(201).json({
          success: true,
          data: savedTask,
          message: 'Task created successfully',
        });
      });
    } catch (error) {
      console.error('Error creating task:', error);
      return next(
        new ErrorResponse('Failed to create task', 422)
      );
    }
  }
);

export const getTask = asyncHandler( 
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const task = await Task.findById(
      req.params.id
    ).populate({
      path: 'project',
      select: 'name description createdBy',
    });

    if (!task) {
      return next(new ErrorResponse('Task not found', 404));
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  }
);

export const updateTaskInProject = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const taskId = req.params.id;

    try {
      const existingTaskWithSameTitle = await Task.findOne({
        title: req.body.title,
        _id: { $ne: taskId },
      });

      if (existingTaskWithSameTitle) {
        return next(
          new ErrorResponse(
            'Task with the same name already exists',
            400
          )
        );
      }

      const existingTask = await Task.findById(taskId);

      if (!existingTask) {
        return next(
          new ErrorResponse('Task not found', 404)
        );
      }

      const project = await Project.findById(
        existingTask.project
      );

      if (!project) {
        return next(
          new ErrorResponse('Project not found', 404)
        );
      }

      if (
        !(
          req.user?._id === existingTask.createdBy ||
          (Array.isArray(existingTask.assignedTo) &&
            existingTask.assignedTo.includes(
              req.user?._id
            )) ||
          (project &&
            project.createdBy.toString() === req.user?._id)
        )
      ) {
        return next(
          new ErrorResponse(
            'You are not authorized to perform this action',
            403
          )
        );
      }

      validateTaskInputsLength(req, res, async () => {
        const savedUpdatedTask =
          await Task.findByIdAndUpdate(
            taskId,
            { $set: req.body },
            { new: true }
          );

        return res.status(200).json({
          success: true,
          task: savedUpdatedTask,
          message: 'Task updated successfully',
        });
      });
    } catch (error) {
      console.error('Error updating task:', error);
      return next(
        new ErrorResponse('Failed to update task', 422)
      );
    }
  }
);

export const deleteTaskInProject = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const task = await Task.findById(req.params.id);

      if (!task) {
        return next(
          new ErrorResponse('Task not found', 404)
        );
      }

      if (
        !(
          req.user?._id === task.createdBy.toString() ||
          (Array.isArray(task.assignedTo) &&
            task.assignedTo.includes(req.user?._id))
        )
      ) {
        return next(
          new ErrorResponse(
            'You are not authorized to perform this action',
            403
          )
        );
      }

      await task.deleteOne();

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      return next(
        new ErrorResponse('Failed to delete task', 422)
      );
    }
  }
);
