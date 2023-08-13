import { Request, Response } from 'express';
import request from 'supertest';
import { validateProjectInputsLength } from '../controllers/project.controller';
import { app, server } from '../index';
import { Project } from '../models/Project';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import authenticate from '../middlewares/authentication';

const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  level: 'CEO',
  userType: 'Employee',
};

const secretKey = 'qwerty@123';
const mockToken = jwt.sign(mockUser, secretKey);

beforeAll(() => {
  app.use(authenticate);
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
      endDate: new Date(),
    });

    const project2 = new Project({
      name: 'Test Projects 2',
      description: 'Project 2 description',
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      endDate: new Date(),
    });

    await project1.save();
    await project2.save();

    const response = await request(app).get(
      '/api/v1/projects'
    );

    expect(response.body.length).toBe(2);

    const projectNames = response.body.map(
      (project: { name: string }) => project.name
    );

    expect(projectNames).toContain('Test Projects 1');
    expect(projectNames).toContain('Test Projects 2');

    expect(response.status).toBe(200);
  }, 15000);

  it('should handle project failure errors', async () => {
    const originalFind = Project.find;
    Project.find = jest.fn(() => {
      throw new Error('Test error');
    });

    const response = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${mockToken}`)
      .send();

    expect(response.status).toBe(500);
    expect(response.body.message).toBe(
      'Failed to fetch all projects'
    );

    Project.find = originalFind;
  });

  it('should create a new project for authorized CEO user', async () => {
    const response = await request(app)
      .post('/api/v1/projects/new')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        name: 'Test Project',
        description: 'Test Description',
        createdBy: mockUser._id,
        startDate: new Date(),
        endDate: new Date(),
      });

    expect(response.status).toBe(201);
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

    const secretKey = 'qwerty@123';
    const mockToken = jwt.sign(mockUser, secretKey);

    const response = await request(app)
      .post('/api/v1/projects/new')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        name: 'Unauthorized Test Project',
        description: 'Test Description',
        createdBy: mockUser._id,
        startDate: new Date(),
        endDate: new Date(),
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      'You are not authorized to create a project'
    );
  });

  it('should not create a new project for invalid user type', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      level: 'CEO',
      userType: 'InvalidType',
    };

    const secretKey = 'qwerty@123';
    const mockToken = jwt.sign(mockUser, secretKey);

    const response = await request(app)
      .post('/api/v1/projects/new')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        name: 'Test Project',
        description: 'Test Description',
        createdBy: mockUser._id,
        startDate: new Date(),
        endDate: new Date(),
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      'You are not authorized to create a project'
    );
  });

  it('should return 403 when creating a project with insufficient authorization', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      level: 'Senior',
      userType: 'Organization',
    };

    const secretKey = 'qwerty@123';
    const mockToken = jwt.sign(mockUser, secretKey);

    const response = await request(app)
      .post('/api/v1/projects/new')
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        name: 'Unauthorized Project',
        description: 'Unauthorized Project Description',
        createdBy: new mongoose.Types.ObjectId(),
        startDate: new Date(),
        endDate: new Date(),
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      'You are not authorized to perform this action'
    );
  });

  it('should get a project by ID', async () => {
    const testProject = new Project({
      name: 'Test Project',
      description: 'Test Description',
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      endDate: new Date(),
    });
    const savedProject = await testProject.save();

    const response = await request(app)
      .get(`/api/v1/projects/${savedProject._id}`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Test Project');
  });

  it('should return 404 if project not found', async () => {
    const nonExistentProjectId =
      new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/v1/projects/${nonExistentProjectId}`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Project not found');
  });

  it('should handle invalid project ID', async () => {
    const invalidProjectId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/v1/projects/${invalidProjectId}dza1`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Invalid project ID'
    );
  });

  it('should update an existing project', async () => {
    const newProject = new Project({
      name: 'Test Project',
      description: 'Test Description',
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      endDate: new Date(),
    });
    const savedProject = await newProject.save();

    const response = await request(app)
      .patch(`/api/v1/projects/${savedProject._id}/update`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        name: 'Updated Project Name',
        description: 'Test Descriptions',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'Project updated successfully'
    );
    expect(response.body.project.name).toBe(
      'Updated Project Name'
    );
  });

  it('should handle organization project failure errors', async () => {
    const originalFind = Project.find;
    Project.find = jest.fn(() => {
      throw new Error('Test error');
    });

    const response = await request(app)
      .get('/api/v1/projects/organization')
      .set('Authorization', `Bearer ${mockToken}`)
      .send();

    expect(response.status).toBe(500);
    expect(response.body.message).toBe(
      'Failed to fetch all organization projects'
    );

    Project.find = originalFind;
  });

  it('should delete an existing project', async () => {
    const newProject = new Project({
      name: 'Test Project',
      description: 'Test Description',
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      endDate: new Date(),
    });
    const savedProject = await newProject.save();

    const response = await request(app)
      .delete(`/api/v1/projects/${savedProject._id}/delete`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
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
        `/api/v1/projects/${nonExistentProjectId}/delete`
      )
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Project not found');
  });
});

describe('Project Validation Middleware', () => {
  it('should return 400 if project name length is not between 3 and 50 characters', () => {
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
    const next = jest.fn();

    validateProjectInputsLength(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'Project name length must be between 3 and 50 characters',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 if project description length is not between 3 and 300 characters', () => {
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
    const next = jest.fn();

    validateProjectInputsLength(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'Project description length must be between 3 and 300 characters',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if project name and description lengths are within limits', () => {
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

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
