import { Request, Response } from 'express';
import request from 'supertest';
import { validateProjectInputsLength } from '../controllers/project.controller';
import { app, server } from '../index';
import { Task } from '../models/Task';
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

const taskRoute = '/api/v1/tasks';
const projectRoute = '/api/v1/projects';

beforeAll(() => {
  app.use(authenticate);
});

afterAll(async () => {
  await Task.deleteMany();
  await server.close();
});


describe('Task Routes', () => {
 it('should get all task routes', async () => {

    const task1 = new Task({
        title: 'Test Tasks 1',
        description: 'Task 1 description',
        dueDate: new Date(),
        createdBy: new mongoose.Types.ObjectId(),
        assignedTo: new mongoose.Types.ObjectId(),
        project: new mongoose.Types.ObjectId(),
        startDate: new Date(),
      });
  
      const task2 = new Task({
        title: 'Test Tasks 2',
        description: 'Task 2 description',
        dueDate: new Date(),
        createdBy: new mongoose.Types.ObjectId(),
        assignedTo: new mongoose.Types.ObjectId(),
        project: new mongoose.Types.ObjectId(),
        startDate: new Date(),
      });
  
      await task1.save();
      await task2.save();
  

      const response = await request(app).get(taskRoute);

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].title).toBe(
      'Test Tasks 1'
    );
    expect(response.body.data[1].title).toBe(
      'Test Tasks 2'
    );
    expect(response.body.count).toBe(2)

 }, 15000)

 it('should create a new task for authorized CEO under a project', async () => {
    const mockProject = new Project({
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Project',
      description: 'Test Project Description',
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      dueDate: new Date(),
    });
    await mockProject.save();

    
    
    const response = await request(app)
      .post(`${projectRoute}/${mockProject._id}/new-task`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        title: 'Test Tasks',
        description: 'Task description',
        dueDate: new Date(),
        createdBy: mockUser._id,
        assignedTo: new mongoose.Types.ObjectId(),
        project: mockProject._id,
        startDate: new Date(),
      });

    expect(response.status).toBe(statusCode.created);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'Task created successfully'
    );
    expect(response.body.data.title).toBe('Test Tasks');
  }, 15000);


  it('should not create a new task for unauthorized employee user', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      level: 'Junior',
      userType: 'Employee',
    };

    const secretKey = process.env.SECRET_KEY || 'secret';
    const mockToken = jwt.sign(mockUser, secretKey);


    const mockProject = new Project({
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Project',
      description: 'Test Project Description',
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      dueDate: new Date(),
    });
    await mockProject.save();


    const response = await request(app)
      .post(`${projectRoute}/${mockProject._id}/new-task`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        title: 'Unauthorized Test Tasks',
        description: 'Task description',
        dueDate: new Date(),
        createdBy: mockUser._id,
        assignedTo: new mongoose.Types.ObjectId(),
        project: mockProject._id,
        startDate: new Date(),
      });

    expect(response.status).toBe(statusCode.forbidden);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      'You are not authorized to create a task'
    );
  });



  it('should not create a new task for invalid user type', async () => {
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      level: 'CEO',
      userType: 'InvalidType',
    };

    const secretKey = process.env.SECRET_KEY || 'secret';
    const mockToken = jwt.sign(mockUser, secretKey);


    const mockProject = new Project({
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Project',
      description: 'Test Project Description',
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      dueDate: new Date(),
    });
    await mockProject.save();


    const response = await request(app)
      .post(`${projectRoute}/${mockProject._id}/new-task`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        title: 'Unauthorized Test Tasks',
        description: 'Task description',
        dueDate: new Date(),
        createdBy: mockUser._id,
        assignedTo: new mongoose.Types.ObjectId(),
        project: mockProject._id,
        startDate: new Date(),
      });

    expect(response.status).toBe(statusCode.forbidden);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      'You are not authorized to create a task'
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

    const mockProject = new Project({
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Project',
      description: 'Test Project Description',
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      dueDate: new Date(),
    });
    await mockProject.save();


    const response = await request(app)
      .post(`${projectRoute}/${mockProject._id}/new-task`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        title: 'Unauthorized Test Tasks',
        description: 'Task description',
        dueDate: new Date(),
        createdBy: new mongoose.Types.ObjectId(),
        assignedTo: new mongoose.Types.ObjectId(),
        project: mockProject._id,
        startDate: new Date(),
      });

    expect(response.status).toBe(statusCode.forbidden);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe(
      'You are not authorized to perform this action'
    );
  });




  it('should get a task under a project by ID', async () => {

     const mockProject = new Project({
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Project',
      description: 'Test Project Description',
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      dueDate: new Date(),
    });
    await mockProject.save();

     const mockTask = new Task({
      title: 'Test Tasks',
      description: 'Task description',
      dueDate: new Date(),
      createdBy: new mongoose.Types.ObjectId(),
      assignedTo: new mongoose.Types.ObjectId(),
      project: mockProject._id,
      startDate: new Date(),
    });

    const savedTask = await mockTask.save()

    const response = await request(app)
      .get(`${taskRoute}/project/${savedTask.project}`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe(
      'Test Tasks'
    );
  });



  it('should get a task by ID', async () => {

    const mockTask = new Task({
     title: 'Test Tasks',
     description: 'Task description',
     dueDate: new Date(),
     createdBy: new mongoose.Types.ObjectId(),
     assignedTo: new mongoose.Types.ObjectId(),
     project: new mongoose.Types.ObjectId(),
     startDate: new Date(),
   });

   const savedTask = await mockTask.save()

   const response = await request(app)
     .get(`${taskRoute}/${savedTask._id}`)
     .set('Authorization', `Bearer ${mockToken}`);

   expect(response.status).toBe(statusCode.success);
   expect(response.body.success).toBe(true);
   expect(response.body.data.title).toBe(
     'Test Tasks'
   );
 });


 it('should return 404 if task not found', async () => {
  const nonExistentTaskId =
    new mongoose.Types.ObjectId();

  const response = await request(app)
    .get(`${taskRoute}/${nonExistentTaskId}`)
    .set('Authorization', `Bearer ${mockToken}`);

  expect(response.status).toBe(404);
  expect(response.body.success).toBe(false);
  expect(response.body.error).toBe('Task not found');
});


it('should handle invalid task ID', async () => {
  const invalidTaskId = new mongoose.Types.ObjectId();

  const response = await request(app)
    .get(`${taskRoute}/${invalidTaskId}dza1`)
    .set('Authorization', `Bearer ${mockToken}`);

  expect(response.status).toBe(statusCode.notFound);
  expect(response.body.success).toBe(false);
  expect(response.body.error).toBe('Resource not found');
});



it('should update an existing task', async () => {

  const mockProject = new Project({
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Project',
    description: 'Test Project Description',
    createdBy: mockUser._id,
    startDate: new Date(),
    dueDate: new Date(),
  });
  await mockProject.save();

  const newTask = new Task({
    title: 'Test Tasks',
    description: 'Task description',
    dueDate: new Date(),
    createdBy: mockUser._id,
    assignedTo: new mongoose.Types.ObjectId(),
    project: mockProject._id,
    startDate: new Date(),
  });

  const savedTask = await newTask.save();

  const response = await request(app)
    .patch(`${taskRoute}/${savedTask._id}/update`)
    .set('Authorization', `Bearer ${mockToken}`)
    .send({
      title: 'Updated Task title',
      description: 'Updated Test Description',
    });

  expect(response.status).toBe(statusCode.success);
  expect(response.body.success).toBe(true);
  expect(response.body.message).toBe(
    'Task updated successfully'
  );
  expect(response.body.task.title).toBe(
    'Updated Task title'
  );
  expect(response.status).toBe(statusCode.success);
  const updatedTask = await Task.findById(
    newTask._id
  );
  expect(updatedTask?.title).toBe(
    'Updated Task title'
  );
}, 15000);



 it('should handle updating a task with the same title', async () => {
  const mockProject = new Project({
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Project',
    description: 'Test Project Description',
    createdBy: mockUser._id,
    startDate: new Date(),
    dueDate: new Date(),
  });
  await mockProject.save();

    const existingTaskData = new Task({
      title: 'Updated Task Title',
    description: 'Test Description',
    dueDate: new Date(),
    createdBy: mockUser._id,
    assignedTo: new mongoose.Types.ObjectId(),
    project: mockProject._id,
    startDate: new Date(),
    });

    const existingTask =
      await existingTaskData.save();

      const existingTaskData1 = new Task({
      title: 'Updated Title',
    description: 'Test Description',
    dueDate: new Date(),
    createdBy: mockUser._id,
    assignedTo: new mongoose.Types.ObjectId(),
    project: mockProject._id,
    startDate: new Date(),
    });

    const existingTask1 =
      await existingTaskData1.save();

    const response = await request(app)
      .patch(`${taskRoute}/${existingTask1._id}/update`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        title: 'Updated Task Title',
        description: 'Updated Test Description',
      });

    expect(response.status).toBe(statusCode.badRequest);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe(
      'Task with the same name already exists'
    );
  });

  it('should delete an existing task', async () => {
    const newProject = new Project({
      name: 'Test Project',
      description: 'Test Description',
      createdBy: mockUser._id,
      startDate: new Date(),
      dueDate: new Date(),
    });
    const savedProject = await newProject.save();

    const existingTaskData = new Task({
      title: 'Updated Task Title',
    description: 'Test Description',
    dueDate: new Date(),
    createdBy: mockUser._id,
    assignedTo: new mongoose.Types.ObjectId(),
    project: savedProject._id,
    startDate: new Date(),
    });

    const existingTask =
      await existingTaskData.save();

    const response = await request(app)
      .delete(`${taskRoute}/${existingTask._id}/delete`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.success);
    expect(response.body.message).toBe(
      'Task deleted successfully'
    );
    const deletedTask = await Task.findById(
      existingTask._id
    );
    expect(deletedTask).toBeNull();
  });

  it('should handle deleting non-existent task', async () => {

    const newProject = new Project({
      name: 'Test Project',
      description: 'Test Description',
      createdBy: mockUser._id,
      startDate: new Date(),
      dueDate: new Date(),
    });
    const savedProject = await newProject.save();

    const existingTaskData = new Task({
      title: 'Updated Task Title',
    description: 'Test Description',
    dueDate: new Date(),
    createdBy: mockUser._id,
    assignedTo: new mongoose.Types.ObjectId(),
    project: savedProject._id,
    startDate: new Date(),
    });

    const existingTask =
      await existingTaskData.save();
  
    const nonExistingTaskId = 
    new mongoose.Types.ObjectId()

    const response = await request(app)
      .delete(
        `${taskRoute}/${nonExistingTaskId}/delete`
      )
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.notFound);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Task not found');
  });


  it('should handle unauthorized user deleting task', async () => {


    const newProject = new Project({
      name: 'Test Project',
      description: 'Test Description',
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      dueDate: new Date(),
    });
    const savedProject = await newProject.save();

    const TaskData = new Task({
      title: 'Task Title',
    description: 'Test Description',
    dueDate: new Date(),
    createdBy:  new mongoose.Types.ObjectId(),
    assignedTo: new mongoose.Types.ObjectId(),
    project:  savedProject._id,
    startDate: new Date(),
    });

    const newTaskData =
    await TaskData.save();

    const response = await request(app)
      .delete(
        `${taskRoute}/${newTaskData._id}/delete`
      )
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.forbidden);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('You are not authorized to perform this action');
  });


})