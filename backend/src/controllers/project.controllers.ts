import { Request, Response, NextFunction } from "express";
import { Project, ProjectDocument } from "../models/Project";
import ErrorResponse from "../utils/errorResponse";
import asyncHandler from "../middlewares/async";

//Get all projects
export const getAllProjects = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await Project.find();
      res.status(200).json(projects);
    } catch (error) {
      return next(new ErrorResponse(`Failed to fetch projects`, 404));
    }
  }
);

// Create a new project
export const createProject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, assignedTo, startDate, endDate } = req.body;
      const newProject = new Project({
        name,
        description,
        assignedTo,
        startDate,
        endDate,
      });
      const savedProject = await newProject.save();
      res.status(201).json(savedProject);
    } catch (error) {
      return next(new ErrorResponse(`Failed to create projects`, 500));
    }
  }
);

// Get details of a single project
export const getProject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const projectId = req.params.id;
    
      const project = await Project.findById(projectId);
      if (!project) {
        return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
      }
      res.status(200).json(project);
    
  }
);

// Update a project's details
export const updateProject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const projectId = req.params.id;
    try {
      const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        { $set: req.body },
        { new: true }
      );
      if (!updatedProject) {
        return next(new ErrorResponse(`Project not found`, 404));
      }
      res.status(200).json(updatedProject);
    } catch (error) {
      return next(new ErrorResponse(`Failed to update Project`, 500));
    }
  }
);

// Delete a project
export const deleteProject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const projectId = req.params.id;
    try {
      const deletedProject = await Project.findByIdAndDelete(projectId);
      if (!deletedProject) {
        return next(new ErrorResponse(`Project not found`, 404));
      }
      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      return next(new ErrorResponse(`Failed to delete project`, 500));
    }
  }
);
