import { statusCode } from './../statusCodes';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';
import { app, server } from '../index';
import authenticate from '../middlewares/authentication';
import { User } from '../models/User';

const employeeEmail = 'employee@example.com';
const organizationEmail = 'organization@example.com';
const employeePassword = 'testpassword';
const organizationPassword = 'testpassword';
const registerRoute = '/api/v1/auth/register';
const loginRoute = '/api/v1/auth/login';
const logoutRoute = '/api/v1/auth/logout';

const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  level: 'CEO',
  userType: 'Employee',
};

const secretKey = process.env.SECRET_KEY || 'secret';
const mockToken = jwt.sign(mockUser, secretKey);

beforeAll(async () => {
  app.use(authenticate);
});

afterAll(async () => {
  await User.deleteMany();
  await server.close();
});

describe('Registeration Routes', () => {
  it('should register a new organization successfully', async () => {
    const response = await request(app)
      .post(`${registerRoute}/organization`)
      .send({
        name: 'Test Organization Admin',
        email: organizationEmail,
        password: organizationPassword,
        level: 'CEO',
        yearsOfWork: 5,
        organizationName: 'Test Organization',
      });

    expect(response.status).toBe(statusCode.created);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'Organization registered successfully'
    );
    expect(response.body.user.name).toBe(
      'Test Organization Admin'
    );
    expect(response.body.user.userType).toBe(
      'Organization'
    );
  }, 15000);

  it('should register a new employee successfully', async () => {
    const response = await request(app)
      .post(`${registerRoute}/employee`)
      .send({
        name: 'Test Employee',
        email: employeeEmail,
        password: employeePassword,
        level: 'Junior',
        yearsOfWork: 1,
        availability: {
          status: 'Available',
        },
        userType: 'Employee',
      });

    expect(response.status).toBe(statusCode.created);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'Employee registered successfully'
    );
    expect(response.body.user.name).toBe('Test Employee');
    expect(response.body.user.userType).toBe('Employee');
  });

  it('should return 400 for an existing email', async () => {
    const response = await request(app)
      .post(`${registerRoute}/employee`)
      .send({
        name: 'Another Employee',
        email: employeeEmail,
        password: employeePassword,
        level: 'Mid-level',
        yearsOfWork: 2,
        availability: {
          status: 'Available',
        },
        userType: 'Employee',
      });

    expect(response.status).toBe(statusCode.badRequest);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe(
      'User with this email already exists'
    );
  });
});

describe('Registration Validation Check', () => {
  it('should return 400 for invalid password', async () => {
    const response = await request(app)
      .post(`${registerRoute}/employee`)
      .send({
        name: 'User with Invalid password',
        email: 'invalidpassword@example.com',
        password: '1234',
        level: 'Senior',
        yearsOfWork: 10,
        availability: {
          status: 'Available',
        },
        userType: 'Employee',
      });

    expect(response.status).toBe(statusCode.badRequest);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe(
      'Password must be at least 6 characters long'
    );
  });

  it('should return 400 for invalid level', async () => {
    const response = await request(app)
      .post(`${registerRoute}/employee`)
      .send({
        name: 'User with Invalid level',
        email: 'invalidlevel@example.com',
        password: '12345678',
        level: 'invalid',
        yearsOfWork: 10,
        availability: {
          status: 'Available',
        },
        userType: 'Employee',
      });

    expect(response.status).toBe(statusCode.badRequest);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid level');
  });

  it('should return 400 for invalid yearsOfWork', async () => {
    const response = await request(app)
      .post(`${registerRoute}/employee`)
      .send({
        name: 'User with Invalid yearsOfWork',
        email: 'invalidyearsofwork@example.com',
        password: '12345678',
        level: 'Senior',
        yearsOfWork: statusCode.success,
        availability: {
          status: 'Available',
        },
        userType: 'Employee',
      });

    expect(response.status).toBe(statusCode.badRequest);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe(
      'Years of work must be between 0 and 99'
    );
  });

  it('should return 400 for invalid userType', async () => {
    const response = await request(app)
      .post(`${registerRoute}/employee`)
      .send({
        name: 'User with Invalid userType',
        email: 'invalidusertype@example.com',
        password: '12345678',
        level: 'CEO',
        yearsOfWork: 20,
        availability: {
          status: 'Available',
        },
        userType: 'invalid',
      });

    expect(response.status).toBe(statusCode.badRequest);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid userType');
  });

  it('should return 400 for invalid availability', async () => {
    const response = await request(app)
      .post(`${registerRoute}/employee`)
      .send({
        name: 'User with Invalid Availability',
        email: 'invalidemail@email.com',
        password: '12345678',
        level: 'Mid-level',
        yearsOfWork: 2,
        availability: {
          status: 'Not Available',
        },
        userType: 'Employee',
      });

    expect(response.status).toBe(statusCode.badRequest);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe(
      'Reason and next Available date are required for "Not Available" status'
    );
  });

  it('should register a new employee with valid reason', async () => {
    const response = await request(app)
      .post(`${registerRoute}/employee`)
      .send({
        name: 'User with Valid Availability',
        email: 'validemail@email.com',
        password: '12345678',
        level: 'Mid-level',
        yearsOfWork: 2,
        availability: {
          status: 'Not Available',
          reason: 'Vacation',
          nextAvailability: '2023-12-12',
        },
        userType: 'Employee',
      });

    expect(response.status).toBe(statusCode.created);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'Employee registered successfully'
    );
  });
});

describe('Login Routes', () => {
  it('should login organization user successfully', async () => {
    await request(app)
      .post(`${registerRoute}/organization`)
      .send({
        name: 'Test Organization Admin',
        email: organizationEmail,
        password: organizationPassword,
        level: 'CEO',
        yearsOfWork: 5,
        organizationName: 'Test Organization',
      });

    const response = await request(app)
      .post(loginRoute)
      .send({
        email: organizationEmail,
        password: organizationPassword,
      });

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'User logged in successfully'
    );
    expect(response.header.authorization).toBeDefined();
  }, 10000);

  it('should login employee user successfully', async () => {
    await request(app)
      .post(`${registerRoute}/employee`)
      .send({
        name: 'Test Employee',
        email: employeeEmail,
        password: employeePassword,
        level: 'Mid-level',
        yearsOfWork: 2,
        availability: {
          status: 'Available',
        },
        userType: 'Employee',
      });

    const response = await request(app)
      .post(loginRoute)
      .send({
        email: employeeEmail,
        password: employeePassword,
      });

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'User logged in successfully'
    );
    expect(response.header.authorization).toBeDefined();
  }, 10000);

  it('should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post(loginRoute)
      .send({
        email: 'invalid@example.com',
        password: 'invalidpassword',
      });

    expect(response.status).toBe(statusCode.unauthorized);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid credentials');
  });
});

describe('forgotPassword', () => {
  it('should send a password reset email', async () => {
    const newUser = new User({
      id: mockUser._id,
      name: 'Test Employee Admin',
      email: 'reachemmanueladams@gmail.com',
      password: 'testpassword',
      level: mockUser.level,
      yearsOfWork: 5,
      organizationName: 'Test Organization LTD',
      userType: mockUser.userType,
    });
    const savedUser = await newUser.save();

    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: savedUser.email });

    expect(response.status).toBe(statusCode.success);
    expect(response.body.data).toBe('Email sent!');
  }, 15000);

  it('should reset the user password', async () => {
    let resetToken;

    const newUser = new User({
      name: 'Reset Employee Admin',
      email: 'resetemployeepassword@email.com',
      password: 'testpassword',
      level: 'CEO',
      yearsOfWork: 5,
      userType: 'Employee',
      organizationName: 'Test Organization LTD',
    });

    resetToken = newUser.getResetPasswordToken();

    await newUser.save();
    const newPassword = 'resetTestPassword';

    const response = await request(app)
      .put(`/api/v1/auth/reset-password/${resetToken}`)
      .send({ password: newPassword });

    console.log(response.body);

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBe(
      'Password reset successful'
    );

    const updatedUser = await User.findById(newUser._id);

    expect(updatedUser?.resetPasswordToken).toBe('');
    expect(updatedUser?.resetPasswordExpire).toBe(
      undefined
    );

    const loginResponse = await request(app)
      .post(loginRoute)
      .send({
        email: newUser.email,
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
});

describe('Logout Route', () => {
  it('should logout user successfully', async () => {
    await request(app)
      .post(`${registerRoute}/employee`)
      .send({
        name: 'Test Employee',
        email: employeeEmail,
        password: employeePassword,
        level: 'Mid-level',
        yearsOfWork: 2,
        availability: {
          status: 'Available',
        },
        userType: 'Employee',
      });

    const response = await request(app)
      .post(loginRoute)
      .send({
        email: employeeEmail,
        password: employeePassword,
      });

    const logoutResponse = await request(app)
      .post(logoutRoute)
      .set('Authorization', response.header.authorization);

    expect(response.status).toBe(statusCode.success);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'User logged in successfully'
    );
    expect(response.header.authorization).toBeDefined();
    expect(logoutResponse.status).toBe(statusCode.success);
    expect(logoutResponse.body.message).toBe(
      'User logged out successfully'
    );
    expect(logoutResponse.header).toHaveProperty(
      'authorization'
    );
    expect(logoutResponse.header.authorization).toBe('');
  });

  it('should handle a case where the user is not found', async () => {
    await User.deleteMany();

    const response = await request(app)
      .post(logoutRoute)
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(statusCode.notFound);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('User not found');
  });
});
