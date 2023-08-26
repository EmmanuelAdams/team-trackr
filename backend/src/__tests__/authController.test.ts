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

describe('Registeration Routes', () => {
  it('should register a new organization successfully', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register/organization')
      .send({
        name: 'Test Organization Admin',
        email: organizationEmail,
        password: organizationPassword,
        level: 'CEO',
        yearsOfWork: 5,
        organizationName: 'Test Organization',
      });

    expect(response.status).toBe(201);
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
      .post('/api/v1/auth/register/employee')
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

    expect(response.status).toBe(201);
    expect(response.body.message).toBe(
      'Employee registered successfully'
    );
    expect(response.body.user.name).toBe('Test Employee');
    expect(response.body.user.userType).toBe('Employee');
  });

  it('should return 400 for an existing email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register/employee')
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

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'User with this email already exists'
    );
  });
});

describe('Registration Validation Check', () => {
  it('should return 400 for invalid password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register/employee')
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

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Password must be at least 6 characters long'
    );
  });

  it('should return 400 for invalid level', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register/employee')
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

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid level');
  });

  it('should return 400 for invalid yearsOfWork', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register/employee')
      .send({
        name: 'User with Invalid yearsOfWork',
        email: 'invalidyearsofwork@example.com',
        password: '12345678',
        level: 'Senior',
        yearsOfWork: 200,
        availability: {
          status: 'Available',
        },
        userType: 'Employee',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Years of work must be between 0 and 99'
    );
  });

  it('should return 400 for invalid userType', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register/employee')
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

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid userType');
  });

  it('should return 400 for invalid availability', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register/employee')
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

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Reason and next Available date are required for "Not Available" status'
    );
  });

  it('should register a new employee with valid reason', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register/employee')
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

    expect(response.status).toBe(201);
    expect(response.body.message).toBe(
      'Employee registered successfully'
    );
  });
});

describe('Login Routes', () => {
  it('should login organization user successfully', async () => {
    await request(app)
      .post('/api/v1/auth/register/organization')
      .send({
        name: 'Test Organization Admin',
        email: organizationEmail,
        password: organizationPassword,
        level: 'CEO',
        yearsOfWork: 5,
        organizationName: 'Test Organization',
      });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: organizationEmail,
        password: organizationPassword,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'User logged in successfully'
    );
    expect(response.header.authorization).toBeDefined();
  }, 10000);

  it('should login employee user successfully', async () => {
    await request(app)
      .post('/api/v1/auth/register/employee')
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
      .post('/api/v1/auth/login')
      .send({
        email: employeeEmail,
        password: employeePassword,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'User logged in successfully'
    );
    expect(response.header.authorization).toBeDefined();
  }, 10000);

  it('should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'invalidpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      'Invalid credentials'
    );
  });

  describe('Logout Route', () => {
    it('should logout user successfully', async () => {
      await request(app)
        .post('/api/v1/auth/register/employee')
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
        .post('/api/v1/auth/login')
        .send({
          email: employeeEmail,
          password: employeePassword,
        });

      const logoutResponse = await request(app)
        .post('/api/v1/auth/logout')
        .set(
          'Authorization',
          response.header.authorization
        );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        'User logged in successfully'
      );
      expect(response.header.authorization).toBeDefined();
      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.message).toBe(
        'User logged out successfully'
      );
      expect(logoutResponse.header).toHaveProperty(
        'authorization'
      );
      expect(logoutResponse.header.authorization).toBe('');
    });
  });
});

describe('Logout Route', () => {
  it('should log out a logged in user successfully', async () => {
    const newUser = new User({
      _id: mockUser._id,
      name: 'Test Logout',
      email: 'logout@email.com',
      password: organizationPassword,
      level: mockUser.level,
      userType: mockUser.userType,
      yearsOfWork: 5,
      organizationName: 'Test Logout Organization',
    });

    await newUser.save();

    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'User logged out successfully'
    );
  });

  it('should handle a case where the user is not found', async () => {
    await User.deleteMany();

    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should handle errors during logging out', async () => {
    jest
      .spyOn(User, 'findById')
      .mockRejectedValue(new Error('Test error'));

    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${mockToken}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe(
      'Failed to log out user'
    );
  });
});
