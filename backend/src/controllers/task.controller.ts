import { Request, Response } from 'express';
import {Task} from '../models/Task';
import {Project} from '../models/Project';





// Get all tasks (across all projects)
export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find().populate('project'); // Populate project details

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Create a new task within a project
export const createTask = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { title, description, dueDate, assignedTo } = req.body;

    // Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
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
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Get all tasks within a project
export const getAllTasksInProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const tasks = await Task.find({ project: projectId }).populate('project');

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get details of a specific task within a project
export const getTaskInProjectById = async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  try {
    const task = await Task.findOne({ _id: taskId, project: projectId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

// Update a task within a project
export const updateTaskInProject = async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, project: projectId },
      { $set: req.body },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Delete a task within a project
export const deleteTaskInProject = async (req: Request, res: Response) => {
  const { projectId, taskId } = req.params;
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      project: projectId,
    });

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Remove the task ID from the project's tasks array
    await Project.findByIdAndUpdate(projectId, {
      $pull: { tasks: deletedTask._id },
    });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
