import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project';

export const validateProjectInputsLength = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, description } = req.body;

  if (name.length < 3 || name.length > 50) {
    return res.status(400).json({
      message:
        'Project name length must be between 3 and 50 characters',
    });
  }

  if (description.length < 3 || description.length > 50) {
    return res.status(400).json({
      message:
        'Project description length must be between 3 and 300 characters',
    });
  }

  next();
};

export const getAllProjects = async (
  req: Request,
  res: Response
) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching all projects:', error);
    return res
      .status(500)
      .json({ message: 'Failed to fetch all projects' });
  }
};

export const getAllOrganizationProjects = async (
  req: Request,
  res: Response
) => {
  try {
    const organizationId = req.user?._id;

    const projects = await Project.find({
      createdBy: organizationId,
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error(
      'Error fetching all organization projects:',
      error
    );
    return res.status(500).json({
      message: 'Failed to fetch all organization projects',
    });
  }
};

export const createProject = async (
  req: Request,
  res: Response
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
          'You are not authorized to create a project',
      });
    }

    const createdBy = req.user?._id;

    const { name, description, startDate, endDate } =
      req.body;
    const newProject = new Project({
      name,
      description,
      createdBy,
      startDate,
      endDate,
    });

    validateProjectInputsLength(req, res, async () => {
      const existingProject = await Project.findOne({
        name,
      });
      if (existingProject) {
        return res.status(400).json({
          message: 'Project with this name already exists',
        });
      }

      const savedProject = await newProject.save();
      res.status(201).json({
        project: savedProject,
        message: 'Project created successfully',
      });
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return res
      .status(500)
      .json({ message: 'Failed to create project' });
  }
};

export const getProject = async (
  req: Request,
  res: Response
) => {
  const projectId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res
        .status(400)
        .json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res
        .status(404)
        .json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return res
      .status(500)
      .json({ message: 'Failed to fetch project' });
  }
};

export const updateProject = async (
  req: Request,
  res: Response
) => {
  const projectId = req.params.id;
  try {
    validateProjectInputsLength(req, res, async () => {
      const updatedProject =
        await Project.findByIdAndUpdate(
          projectId,
          { $set: req.body },
          { new: true }
        );
      if (!updatedProject) {
        return res
          .status(404)
          .json({ message: 'Project not found' });
      }
      return res.status(200).json({
        project: updatedProject,
        message: 'Project updated successfully',
      });
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return res
      .status(500)
      .json({ message: 'Failed to update project' });
  }
};

export const deleteProject = async (
  req: Request,
  res: Response
) => {
  const projectId = req.params.id;
  try {
    const deletedProject = await Project.findByIdAndDelete(
      projectId
    );
    if (!deletedProject) {
      return res
        .status(404)
        .json({ message: 'Project not found' });
    }
    res
      .status(200)
      .json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res
      .status(500)
      .json({ message: 'Failed to delete project' });
  }
};
