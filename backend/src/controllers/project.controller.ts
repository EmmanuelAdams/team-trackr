import { NextFunction, Request, Response } from 'express';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import asyncHandler from '../middlewares/async';
import ErrorResponse from '../utils/errorResponse';
import { statusCode } from '../statusCodes';

export const validateProjectInputsLength = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, description } = req.body;

  if (name?.length < 3 || name?.length > 50) {
    return next(
      new ErrorResponse(
        'Project name length must be between 3 and 50 characters',
        statusCode.badRequest
      )
    );
  }

  if (description?.length < 3 || description?.length > 50) {
    return next(
      new ErrorResponse(
        'Project description length must be between 3 and 300 characters',
        statusCode.badRequest
      )
    );
  }

  next();
};

export const getAllProjects = asyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    res
      .status(statusCode.success)
      .json(res.advancedResults);
  }
);

export const getAllOrganizationProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const organizationId = req.user?._id;

    const projects = await Project.find({
      createdBy: organizationId,
    });

    return res.status(statusCode.success).json({
      success: true,
      count: projects.length,
      projects,
    });
  }
);

export const createProject = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (
      (req.user?.userType !== 'Organization' &&
        req.user?.userType !== 'Employee') ||
      (req.user?.level !== 'CEO' &&
        req.user?.level !== 'Senior')
    ) {
      return next(
        new ErrorResponse(
          'You are not authorized to create a project',
          statusCode.forbidden
        )
      );
    }

    const createdBy = req.user?._id;

    const { name, description, startDate, dueDate } =
      req.body;
    const newProject = new Project({
      name,
      description,
      createdBy,
      startDate,
      dueDate,
    });

    validateProjectInputsLength(req, res, async () => {
      const existingProject = await Project.findOne({
        name,
      });
      if (existingProject) {
        return next(
          new ErrorResponse(
            'Project with this name already exists',
            statusCode.badRequest
          )
        );
      }

      const savedProject = await newProject.save();
      res.status(statusCode.created).json({
        success: true,
        project: savedProject,
        message: 'Project created successfully',
      });
    });
  }
);

export const getProject = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const projectId = req.params.id;

    const project = await Project.findById(projectId).populate({
      path: 'tasks',
      select: 'title description createdBy',
    });;

    if (!project) {
      return next(
        new ErrorResponse(
          'Project not found',
          statusCode.notFound
        )
      );
    }
    res
      .status(statusCode.success)
      .json({ success: true, project });
  }
);

export const updateProject = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const projectId = req.params.id;

    const existingProjectWithSameTitle =
      await Project.findOne({
        name: req.body.name,
        _id: { $ne: projectId },
      });

    if (existingProjectWithSameTitle) {
      return next(
        new ErrorResponse(
          'Project with the same name already exists',
          statusCode.badRequest
        )
      );
    }

    const existingProject = await Project.findById(
      projectId
    );

    if (!existingProject) {
      return next(
        new ErrorResponse(
          'Project not found',
          statusCode.notFound
        )
      );
    }

    if (
      !(
        req.user?._id ===
        existingProject.createdBy.toString()
      )
    ) {
      return next(
        new ErrorResponse(
          'You are not authorized to perform this action',
          statusCode.forbidden
        )
      );
    }

    validateProjectInputsLength(req, res, async () => {
      const updatedProject =
        await Project.findByIdAndUpdate(
          projectId,
          { $set: req.body },
          { new: true }
        );
      if (!updatedProject) {
        return next(
          new ErrorResponse(
            'Project not found',
            statusCode.notFound
          )
        );
      }

      return res.status(statusCode.success).json({
        success: true,
        project: updatedProject,
        message: 'Project updated successfully',
      });
    });
  }
);

export const deleteProject = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(
        new ErrorResponse(
          'Project not found',
          statusCode.notFound
        )
      );
    }

    if (!(req.user?._id === project.createdBy.toString())) {
      return next(
        new ErrorResponse(
          'You are not authorized to perform this action',
          statusCode.forbidden
        )
      );
    }

    
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.status(statusCode.success).json({
      success: true,
      message: 'Project deleted successfully',
    });
  }
);
