import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { Project } from '../models/Project';

export const getAllTasks = async (
  req: Request,
  res: Response
) => {
  try {
    const tasks = await Task.find().populate('project');

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    return res
      .status(500)
      .json({ message: 'Failed to fetch all tasks' });
  }
};

export const createTask = async (
  req: Request,
  res: Response
) => {
  try {
    const { projectId } = req.params;
    const { title, description, dueDate, assignedTo } =
      req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found' });
    }

    const newTask = new Task({
      title,
      description,
      dueDate,
      assignedTo,
      project: projectId,
    });

    const savedTask = await newTask.save();

    // Add the task to the project's tasks array
    project.tasks.push(savedTask._id);
    await project.save();

    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating project tasks:', error);
    return res
      .status(500)
      .json({ message: 'Failed to create tasks' });
  }
};

export const getAllTasksInProject = async (
  req: Request,
  res: Response
) => {
  try {
    const { projectId } = req.params;

    const tasks = await Task.find({
      project: projectId,
    }).populate('project');

    res.status(200).json(tasks);
  } catch (error) {
    console.error(
      'Error fetching all project tasks:',
      error
    );
    res.status(500).json({
      message: 'Failed to fetch all project tasks',
    });
  }
};

export const getTaskInProjectById = async (
  req: Request,
  res: Response
) => {
  const { projectId, taskId } = req.params;
  try {
    const task = await Task.findOne({
      _id: taskId,
      project: projectId,
    });

    if (!task) {
      return res
        .status(404)
        .json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res
      .status(500)
      .json({ message: 'Failed to fetch task' });
  }
};

export const updateTaskInProject = async (
  req: Request,
  res: Response
) => {
  const { projectId, taskId } = req.params;
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, project: projectId },
      { $set: req.body },
      { new: true }
    );

    if (!updatedTask) {
      return res
        .status(404)
        .json({ message: 'Task not found' });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res
      .status(500)
      .json({ message: 'Failed to update task' });
  }
};

export const deleteTaskInProject = async (
  req: Request,
  res: Response
) => {
  const { projectId, taskId } = req.params;
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      project: projectId,
    });

    if (!deletedTask) {
      return res
        .status(404)
        .json({ message: 'Task not found' });
    }

    await Project.findByIdAndUpdate(projectId, {
      $pull: { tasks: deletedTask._id },
    });

    res
      .status(200)
      .json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res
      .status(500)
      .json({ message: 'Failed to delete task' });
  }
};
