import { Request, Response } from 'express';
import request from 'supertest';
import { validateProjectInputsLength } from '../controllers/project.controller';
import { app, server } from '../index';
import { Task } from '../models/Task';
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
    await Task.deleteMany();
    await server.close();
  });

  describe('Task Routes', () => {
  it('should get all tasks', async () => {
    const task1 = new Task({
        title: 'Test Tasks 1',
        description: 'Task 1 description',
        status: 'New',
        priority: 'Low',
        createdBy: new mongoose.Types.ObjectId(),
        assignedTo: new mongoose.Types.ObjectId(),
        project: new mongoose.Types.ObjectId(),
        startDate: new Date(),
        dueDate: new Date(),
        endDate: new Date(),
      });
  
      const task2 = new Task({
        title: 'Test Tasks 2',
        description: 'Task 2 description',
        status: 'New',
        priority: 'Low',
        createdBy: new mongoose.Types.ObjectId(),
        assignedTo: new mongoose.Types.ObjectId(),
        project: new mongoose.Types.ObjectId(),
        startDate: new Date(),
        dueDate: new Date(),
        endDate: new Date(),
      });


      await task1.save();
      await task2.save();

      const response = await request(app).get(
        '/api/v1/tasks'
      );


      expect(response.body.length).toBe(2);

      const taskNames = response.body.map(
        (task: { title: string }) => task.title
      );
  
      expect(taskNames).toContain('Test Tasks 1');
      expect(taskNames).toContain('Test Tasks 2');
  
      expect(response.status).toBe(200);
  }, 15000)


  })
