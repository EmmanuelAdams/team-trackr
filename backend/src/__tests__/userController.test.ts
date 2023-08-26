import request from 'supertest';
import { app, server } from '../index';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import authenticate from '../middlewares/authentication';
import { User } from '../models/User';

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
  await User.deleteMany();
  await server.close();
});

describe('Get All Users Route', () => {
  it('should get all users', async () => {
    const mockUsers = [
      {
        name: 'User 1',
        email: 'user1@example.com',
        password: 'password1',
        level: 'Senior',
        yearsOfWork: 2,
        organizationName: 'Org 1',
        userType: 'Organization',
      },
      {
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password2',
        level: 'Senior',
        yearsOfWork: 3,
        organizationName: 'Org 2',
        userType: 'Organization',
      },
    ];

    await User.create(mockUsers);

    const response = await request(app).get(
      '/api/v1/users'
    );

    const userNames = response.body.map(
      (user: { name: string }) => user.name
    );

    expect(userNames).toContain('User 1');
    expect(userNames).toContain('User 2');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  }, 20000);
});

describe('Get User Route', () => {
  it('should get a user', async () => {
    const newUser = new User({
      name: 'Test Employee',
      email: 'test@example.com',
      password: 'testpassword',
      level: 'Senior',
      yearsOfWork: 2,
      organizationName: 'Test Org',
      userType: 'Organization',
    });

    const savedUser = await newUser.save();

    const response = await request(app).get(
      `/api/v1/users/${savedUser._id}`
    );

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Test Employee');
  }, 10000);

  it('should handle user not found', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/v1/users/${nonExistentUserId}`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should handle errors when fetching a user', async () => {
    const invalidUserId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/v1/users/${invalidUserId}w`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe(
      'Failed to fetch user'
    );
  }, 10000);
});

describe('Delete User Route', () => {
  it('should delete a user successfully', async () => {
    const newUser = new User({
      name: 'Test Employee Admin',
      email: 'testemplo@email.com',
      password: 'testpassword',
      level: 'CEO',
      yearsOfWork: 5,
      organizationName: 'Test Organization LTD',
      userType: 'Organization',
    });
    const savedUser = await newUser.save();

    const response = await request(app)
      .delete(`/api/v1/users/${savedUser._id}/delete`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'User deleted successfully'
    );
  }, 15000);

  it('should handle user not found', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/v1/users/${nonExistentUserId}/delete`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should handle errors when deleting a user', async () => {
    const invalidUserId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/v1/users/${invalidUserId}q/delete`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe(
      'Failed to delete user'
    );
  });
});
