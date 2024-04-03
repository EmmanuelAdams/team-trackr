import { Request, Response } from 'express';
import request from 'supertest';
import { validateProjectInputsLength } from '../controllers/project.controller';
import { app, server } from '../index';
import { Project } from '../models/Project';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import authenticate from '../middlewares/authentication';
import { statusCode } from '../statusCodes';
import ErrorResponse from '../utils/errorResponse';

const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  level: 'CEO',
  userType: 'Employee',
};

const secretKey = process.env.SECRET_KEY || 'secret';
const mockToken = jwt.sign(mockUser, secretKey);

const projectRoute = '/api/v1/projects';

beforeAll(async () => {
  app.use(authenticate);
  await Project.deleteMany();
});

afterAll(async () => {
  await Project.deleteMany();
  await server.close();
});

describe('Project Routes', () => {
  it('should get all projects', async () => {
    const project1 = new Project({
      name: 'Test Projects 1',
      description: 'Project 1 description',
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      dueDate: new Date(),
    });

    const project2 = new Project({
      name: 'Test Projects 2',
      description: 'Project 2 description',
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      dueDate: new Date(),
    });

    await project1.save();
    await project2.save();

    const response = await request(app).get(projectRoute);

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].name).toBe(
      'Test Projects 1'
    );
    expect(response.body.data[1].name).toBe(
      'Test Projects 2'
    );
    expect(response.body.count).toBe(2);
  }, 15000);

  it('should create a new project for authorized CEO user', async () => {
    const response = await request(app)
      .post(`${projectRoute}/new-project`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        name: 'Test Project',
        description: 'Test Description',
        createdBy: mockUser._id,
        startDate: new Date(),
        dueDate: new Date(),
      });

    expect(response.status).toBe(statusCode.created);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'Project created successfully'
    );
    expect(response.body.project.name).toBe('Test Project');
  });

  it('should not create a new project for unauthorized employee user', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      level: 'Junior',
      userType: 'Employee',
    };

    const secretKey = process.env.SECRET_KEY || 'secret';
    const mockToken = jwt.sign(mockUser, secretKey);

    const response = await request(app)
      .post(`${projectRoute}/new-project`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        name: 'Unauthorized Test Project',
        description: 'Test Description',
        createdBy: mockUser._id,
        startDate: new Date(),
        dueDate: new Date(),
      });

    expect(response.status).toBe(statusCode.forbidden);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe(
      'You are not authorized to create a project'
    );
  });

  it('should not create a new project for invalid user type', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      level: 'CEO',
      userType: 'InvalidType',
    };

    const secretKey = process.env.SECRET_KEY || 'secret';
    const mockToken = jwt.sign(mockUser, secretKey);

    const response = await request(app)
      .post(`${projectRoute}/new-project`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        name: 'Test Project',
        description: 'Test Description',
        createdBy: mockUser._id,
        startDate: new Date(),
        dueDate: new Date(),
      });

    expect(response.status).toBe(statusCode.forbidden);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe(
      'You are not authorized to create a project'
    );
  });

  it('should return 403 when creating a project with insufficient authorization', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      level: 'Senior',
      userType: 'Organization',
    };

    const secretKey = process.env.SECRET_KEY || 'secret';
    const mockToken = jwt.sign(mockUser, secretKey);

    const response = await request(app)
      .post(`${projectRoute}/new-project`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        name: 'Unauthorized Project',
        description: 'Unauthorized Project Description',
        createdBy: new mongoose.Types.ObjectId(),
        startDate: new Date(),
        dueDate: new Date(),
      });

    expect(response.status).toBe(statusCode.forbidden);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe(
      'You are not authorized to perform this action'
    );
  });

  it('should get a project by ID', async () => {
    const testProject = new Project({
      name: 'Test Project',
      description: 'Test Description',
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      dueDate: new Date(),
    });
    const savedProject = await testProject.save();

    const response = await request(app)
      .get(`${projectRoute}/${savedProject._id}`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.project.name).toBe('Test Project');
  });

  it('should return 404 if project not found', async () => {
    const nonExistentProjectId =
      new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`${projectRoute}/${nonExistentProjectId}`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Project not found');
  });

  it('should handle invalid project ID', async () => {
    const invalidProjectId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`${projectRoute}/${invalidProjectId}dza1`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.unprocessable);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid ID');
  });

  it('should update an existing project', async () => {
    const newProject = new Project({
      name: 'Test Project',
      description: 'Test Description',
      createdBy: mockUser._id,
      startDate: new Date(),
      dueDate: new Date(),
    });

    const savedProject = await newProject.save();

    const response = await request(app)
      .patch(`${projectRoute}/${savedProject.id}/update`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        name: 'Updated Project Name',
        description: 'Updated Test Description',
      });

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'Project updated successfully'
    );
    expect(response.body.project.name).toBe(
      'Updated Project Name'
    );
    expect(response.status).toBe(statusCode.success);
    const updatedProject = await Project.findById(
      newProject._id
    );
    expect(updatedProject?.name).toBe(
      'Updated Project Name'
    );
  });

  it('should handle updating a project with the same name', async () => {
    const existingProjectData = new Project({
      name: 'Updated Project Name',
      description: 'Test Description',
      createdBy: mockUser._id,
      startDate: new Date(),
      dueDate: new Date(),
    });

    const existingProject =
      await existingProjectData.save();

    const response = await request(app)
      .patch(`${projectRoute}/${existingProject.id}/update`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        name: 'Updated Project Name',
        description: 'Updated Test Description',
      });

    expect(response.status).toBe(statusCode.badRequest);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe(
      'Project with the same name already exists'
    );
  });

  it('should get all organization projects', async () => {
    const mockOrganizationUser = {
      _id: new mongoose.Types.ObjectId(),
      level: 'CEO',
      userType: 'Organization',
    };

    const mockOrganizationToken = jwt.sign(
      mockOrganizationUser,
      secretKey
    );

    const project1 = new Project({
      name: 'Test Projects 1',
      description: 'Project 1 description',
      createdBy: mockOrganizationUser._id,
      startDate: new Date(),
      dueDate: new Date(),
    });

    const project2 = new Project({
      name: 'Test Projects 2',
      description: 'Project 2 description',
      createdBy: mockOrganizationUser._id,
      startDate: new Date(),
      dueDate: new Date(),
    });

    await project1.save();
    await project2.save();

    const response = await request(app)
      .get(`${projectRoute}/organization`)
      .set(
        'Authorization',
        `Bearer ${mockOrganizationToken}`
      );

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.projects).toBeInstanceOf(Array);
    expect(response.body.count).toBe(2);
    expect(response.body.projects[0].createdBy).toBe(
      mockOrganizationUser._id.toString()
    );
    expect(response.body.projects[1].createdBy).toBe(
      mockOrganizationUser._id.toString()
    );
    expect(response.body.projects[0].name).toBe(
      'Test Projects 1'
    );
    expect(response.body.projects[1].name).toBe(
      'Test Projects 2'
    );
  });

  it('should delete an existing project', async () => {
    const newProject = new Project({
      name: 'Test Project',
      description: 'Test Description',
      createdBy: mockUser._id,
      startDate: new Date(),
      dueDate: new Date(),
    });
    const savedProject = await newProject.save();

    const response = await request(app)
      .delete(`${projectRoute}/${savedProject._id}/delete`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.success);
    expect(response.body.message).toBe(
      'Project deleted successfully'
    );
    const deletedProject = await Project.findById(
      savedProject._id
    );
    expect(deletedProject).toBeNull();
  });

  it('should handle deleting non-existent project', async () => {
    const nonExistentProjectId =
      new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(
        `${projectRoute}/${nonExistentProjectId}/delete`
      )
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.notFound);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Project not found');
  });

  it('should handle deleting invalid project', async () => {
    const invalidProjectId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(
        `${projectRoute}/${invalidProjectId}dza1/delete`
      )
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.unprocessable);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid ID');
  });
});

describe('validateProjectInputsLength middleware', () => {
  it('should pass valid inputs without errors', () => {
    const req = {
      body: {
        name: 'Valid Name',
        description: 'Valid Description',
      },
    } as Request;
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    validateProjectInputsLength(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return a 400 error for invalid name length', () => {
    const req = {
      body: {
        name: 'ab',
        description: 'Valid Description',
      },
    } as Request;
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as unknown as Response;

    validateProjectInputsLength(req, res, (error) => {
      expect(error).toBeInstanceOf(ErrorResponse);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(
        'Project name length must be between 3 and 50 characters'
      );
    });
  });

  it('should return a 400 error for invalid description length', () => {
    const req = {
      body: {
        name: 'Valid Name',
        description: 'ab',
      },
    } as Request;
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    } as unknown as Response;

    validateProjectInputsLength(req, res, (error) => {
      expect(error).toBeInstanceOf(ErrorResponse);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe(
        'Project description length must be between 3 and 300 characters'
      );
    });
  });
});
