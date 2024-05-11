import request from 'supertest';
import { app, server } from '../index';
import { Task } from '../models/Task';
import { Comment } from '../models/Comment';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import authenticate from '../middlewares/authentication';
import { statusCode } from '../statusCodes';

const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  level: 'Junior',
  userType: 'Employee',
};

const secretKey = process.env.SECRET_KEY || 'secret';
const mockToken = jwt.sign(mockUser, secretKey);

const taskRoute = '/api/v1/tasks';
const commentRoute = '/api/v1/comments';

beforeAll(() => {
  app.use(authenticate);
});

beforeEach(async () => {
  await Task.deleteMany();
});


afterAll(async () => {
  await Comment.deleteMany();
  await server.close();
});

describe('Comment Routes', () => {
  it('should get all comment routes', async () => {
    const comment1 = new Comment({
      text: 'Test1',
      createdAt: new Date(),
      task: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
    });

    const comment2 = new Comment({
      text: 'Test2',
      createdAt: new Date(),
      task: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
    });

    await comment1.save();
    await comment2.save();

    const response = await request(app).get(commentRoute);

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].text).toBe(
      'Test1'
    );
    expect(response.body.data[1].text).toBe(
      'Test2'
    );
    expect(response.body.count).toBe(2);
  }, 15000);

  it('should create a new comment under a task', async () => {
    const mockTask = new Task({
      title: 'Test Tasks',
      description: 'Task description',
      dueDate: new Date(),
      createdBy: new mongoose.Types.ObjectId(),
      assignedTo: new mongoose.Types.ObjectId(),
      project: new mongoose.Types.ObjectId(),
      startDate: new Date(),
    });
    await mockTask.save();

    const response = await request(app)
      .post(`${taskRoute}/${mockTask._id}/new-comment`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        text: 'Test Comment',
        createdAt: new Date(),
        task: mockTask._id,
        createdBy: mockUser._id,
      });

    expect(response.status).toBe(statusCode.created);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'Comment created successfully'
    );
    expect(response.body.data.text).toBe('Test Comment');
  }, 15000);

  it('should get a comment by ID', async () => {
    const mockComment = new Comment({
      text: 'Test Comment',
      createdAt: new Date(),
      task: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
    });

    const savedComment = await mockComment.save();

    const response = await request(app)
      .get(`${commentRoute}/${savedComment._id}`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.data.text).toBe('Test Comment');
  });

  it('should return 404 if comment not found', async () => {
    const nonExistentCommentId =
      new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`${commentRoute}/${nonExistentCommentId}`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Comment not found');
  });

  it('should update an existing comment', async () => {
    const mockTask = new Task({
      title: 'Test Tasks',
      description: 'Task description',
      dueDate: new Date(),
      createdBy: new mongoose.Types.ObjectId(),
      assignedTo: new mongoose.Types.ObjectId(),
      project: new mongoose.Types.ObjectId(),
      startDate: new Date(),
    });
    await mockTask.save();

    const newComment = new Comment({
      text: 'Test Comment',
      createdAt: new Date(),
      task: mockTask._id,
      createdBy: mockUser._id,
    });

    const savedComment = await newComment.save();

    const response = await request(app)
      .patch(`${commentRoute}/${savedComment._id}/update`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        text: 'Updated comment text',
      });

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'Comment updated successfully'
    );
    expect(response.body.comment.text).toBe(
      'Updated comment text'
    );
    expect(response.status).toBe(statusCode.success);
    const updatedComment = await Comment.findById(
      newComment._id
    );
    expect(updatedComment?.text).toBe(
      'Updated comment text'
    );
  }, 15000);

  it('should handle unauthorized user updating comment', async () => {
    const newTask = new Task({
      title: 'Test Tasks',
      description: 'Task description',
      dueDate: new Date(),
      createdBy: new mongoose.Types.ObjectId(),
      assignedTo: new mongoose.Types.ObjectId(),
      project: new mongoose.Types.ObjectId(),
      startDate: new Date(),
    });

    const savedTask = await newTask.save();

    const commentData = new Comment({
      text: 'Test Comment',
      createdAt: new Date(),
      task: newTask._id,
      createdBy: new mongoose.Types.ObjectId(),
    });

    const newCommentData = await commentData.save();

    const response = await request(app)
      .patch(`${commentRoute}/${newCommentData._id}/update`)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        text: 'Updated comment text',
      });

    expect(response.status).toBe(statusCode.forbidden);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe(
      'Not authorized to perform this action'
    );
  });

  it('should delete an existing comment', async () => {
    const newTask = new Task({
      title: 'Test Tasks',
      description: 'Task description',
      dueDate: new Date(),
      createdBy: new mongoose.Types.ObjectId(),
      assignedTo: new mongoose.Types.ObjectId(),
      project: new mongoose.Types.ObjectId(),
      startDate: new Date(),
    });
    const savedTask = await newTask.save();

    const existingCommentData = new Comment({
      text: 'Test Comment',
      createdAt: new Date(),
      task: newTask._id,
      createdBy: mockUser._id,
    });

    const existingComment =
      await existingCommentData.save();

    const response = await request(app)
      .delete(
        `${commentRoute}/${existingComment._id}/delete`
      )
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.success);
    expect(response.body.message).toBe(
      'Comment deleted successfully'
    );
    const deletedComment = await Comment.findById(
      existingComment._id
    );
    expect(deletedComment).toBeNull();
  });

  it('should handle deleting non-existent comment', async () => {
    const newTask = new Task({
      title: 'Test Tasks',
      description: 'Task description',
      dueDate: new Date(),
      createdBy: new mongoose.Types.ObjectId(),
      assignedTo: new mongoose.Types.ObjectId(),
      project: new mongoose.Types.ObjectId(),
      startDate: new Date(),
    });
    const savedTask = await newTask.save();

    const existingCommentData = new Comment({
      text: 'Test Comment',
      createdAt: new Date(),
      task: newTask._id,
      createdBy: new mongoose.Types.ObjectId(),
    });

    const existingComment =
      await existingCommentData.save();

    const nonExistingCommentId =
      new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(
        `${commentRoute}/${nonExistingCommentId}/delete`
      )
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.notFound);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Comment not found');
  });

  it('should handle unauthorized user deleting comment', async () => {
    const newTask = new Task({
      title: 'Test Tasks',
      description: 'Task description',
      dueDate: new Date(),
      createdBy: new mongoose.Types.ObjectId(),
      assignedTo: new mongoose.Types.ObjectId(),
      project: new mongoose.Types.ObjectId(),
      startDate: new Date(),
    });

    const savedTask = await newTask.save();

    const commentData = new Comment({
      text: 'Test Comment',
      createdAt: new Date(),
      task: newTask._id,
      createdBy: new mongoose.Types.ObjectId(),
    });

    const newCommentData = await commentData.save();

    const response = await request(app)
      .delete(
        `${commentRoute}/${newCommentData._id}/delete`
      )
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.forbidden);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe(
      'Not authorized to perform this action'
    );
  });
});
