import { statusCode } from '../statusCodes';
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

const userRoute = '/api/v1/users';
const loginRoute = '/api/v1/auth/login';
const registerRoute = '/api/v1/auth/register';

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

    await User.insertMany(mockUsers);

    const response = await request(app).get(userRoute);

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.users).toBeInstanceOf(Array);
    expect(response.body.users).toHaveLength(2);
    expect(response.body.users[0].name).toBe('User 1');
    expect(response.body.users[1].name).toBe('User 2');
  }, 15000);
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
      `${userRoute}/${savedUser._id}`
    );

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.user.name).toBe('Test Employee');
  });

  it('should handle user not found', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();

    const response = await request(app).get(
      `${userRoute}/${nonExistentUserId}`
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('User not found');
  });

  it('should handle fetching invalid user by ID', async () => {
    const invalidUserId = new mongoose.Types.ObjectId();

    const response = await request(app).get(
      `${userRoute}/${invalidUserId}w`
    );

    expect(response.status).toBe(statusCode.unprocessable);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid ID');
  });
});

describe('Get Logged-In User Route', () => {
  it('should get the logged-in user', async () => {
    const email = 'testemployee@email.com';
    const password = 'testpassword';

    await request(app)
      .post(`${registerRoute}/organization`)
      .send({
        id: mockUser._id,
        name: 'Test Employee Admin',
        email: email,
        password: password,
        level: mockUser.level,
        yearsOfWork: 5,
        organizationName: 'Test Organization LTD',
        userType: mockUser.userType,
      });

    const authResponse = await request(app)
      .post(loginRoute)
      .send({
        email: email,
        password: password,
      });

    const authToken = authResponse.body.token;

    const response = await request(app)
      .get(`${userRoute}/me`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.name).toBe(
      'Test Employee Admin'
    );
  });
});

describe('Update password', () => {
  it('should update the user password', async () => {
    const newPassword = 'newPassword456';
    const email = 'updateepassword@email.com';
    const password = 'oldPassword123';

    await request(app)
      .post(`${registerRoute}/organization`)
      .send({
        name: 'Test Employee Admin',
        email: email,
        password: password,
        level: mockUser.level,
        yearsOfWork: 5,
        organizationName: 'Test Organization LTD',
        userType: mockUser.userType,
      });

    const authResponse = await request(app)
      .post(loginRoute)
      .send({
        email: email,
        password: password,
      });

    const authToken = authResponse.body.token;

    const response = await request(app)
      .put(`${userRoute}/update-password`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ password: 'oldPassword123', newPassword });

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'Password updated successfully'
    );

    const loginResponse = await request(app)
      .post(loginRoute)
      .send({
        email: email,
        password: newPassword,
      });

    expect(loginResponse.status).toBe(statusCode.success);
    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.message).toBe(
      'User logged in successfully'
    );
    expect(
      loginResponse.header.authorization
    ).toBeDefined();
  });

  it('should return an error for incorrect old password', async () => {
    const newPassword = 'newPassword456';
    const email = 'updatepassword@email.com';
    const password = 'oldPassword123';

    await request(app)
      .post(`${registerRoute}/organization`)
      .send({
        name: 'Test Employee Admin',
        email: email,
        password: password,
        level: mockUser.level,
        yearsOfWork: 5,
        organizationName: 'Test Organization LTD',
        userType: mockUser.userType,
      });

    const authResponse = await request(app)
      .post(loginRoute)
      .send({
        email: email,
        password: password,
      });

    const authToken = authResponse.body.token;

    const response = await request(app)
      .put(`${userRoute}/update-password`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ password: 'wrongPassword', newPassword });

    expect(response.status).toBe(statusCode.unauthorized);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe(
      'Password is incorrect'
    );
  });
});

describe('Delete User Route', () => {
  it('should delete a user successfully', async () => {
    const newUser = new User({
      id: mockUser._id,
      name: 'Test Employee Admin',
      email: 'testemplo@email.com',
      password: 'testpassword',
      level: mockUser.level,
      yearsOfWork: 5,
      organizationName: 'Test Organization LTD',
      userType: mockUser.userType,
    });
    const savedUser = await newUser.save();

    const response = await request(app)
      .delete(`${userRoute}/${savedUser._id}/delete`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'User deleted successfully'
    );
  }, 15000);

  it('should handle user not found', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`${userRoute}/${nonExistentUserId}/delete`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('User not found');
  });

  it('should handle deleting invalid user by ID', async () => {
    const invalidUserId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`${userRoute}/${invalidUserId}q/delete`)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.unprocessable);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid ID');
  });
});
