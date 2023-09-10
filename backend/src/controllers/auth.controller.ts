import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserDocument } from '../models/User';
import ErrorResponse from '../utils/errorResponse';
import asyncHandler from '../middlewares/async';

export const logoutUser = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user?._id;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return next(
          new ErrorResponse('User not found', 404)
        );
      }

      res.setHeader('Authorization', '');

      return res.status(200).json({
        success: true,
        message: 'User logged out successfully',
      });
    } catch (error) {
      console.error('Error logging out user:', error);
      return next(
        new ErrorResponse('Failed to logout user', 422)
      );
    }
  }
);

export const loginUser = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return next(
          new ErrorResponse('Invalid credentials', 401)
        );
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!isPasswordValid) {
        return next(
          new ErrorResponse('Invalid credentials', 401)
        );
      }

      const secretKey =
        process.env.SECRET_KEY || 'qwert@4321';

      const tokenPayload = {
        userId: existingUser._id,
        userType: existingUser.userType,
        level: existingUser.level,
      };

      const token = jwt.sign(tokenPayload, secretKey, {
        expiresIn: '7d',
      });

      return res
        .status(200)
        .header('Authorization', `Bearer ${token}`)
        .json({
          success: true,
          message: 'User logged in successfully',
          user: existingUser,
          token: token,
        });
    } catch (error) {
      console.error('Error logging in user:', error);
      return next(
        new ErrorResponse('Failed to login user', 422)
      );
    }
  }
);

export const registerEmployee = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        name,
        email,
        password,
        level,
        yearsOfWork,
        availability,
        userType,
      } = req.body;

      if (password.length < 6) {
        return next(
          new ErrorResponse(
            'Password must be at least 6 characters long',
            400
          )
        );
      }

      if (
        !['Junior', 'Mid-level', 'Senior', 'CEO'].includes(
          level
        )
      ) {
        return next(
          new ErrorResponse('Invalid level', 400)
        );
      }

      if (yearsOfWork < 0 || yearsOfWork > 99) {
        return next(
          new ErrorResponse(
            'Years of work must be between 0 and 99',
            400
          )
        );
      }

      if (
        !['Employee', 'Organization'].includes(userType)
      ) {
        return next(
          new ErrorResponse('Invalid userType', 400)
        );
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(
          new ErrorResponse(
            'User with this email already exists',
            400
          )
        );
      }

      const hashedPassword = await bcrypt.hash(
        password,
        10
      );

      if (availability) {
        if (
          availability.status === 'Not Available' &&
          (!availability.reason ||
            !availability.nextAvailability)
        ) {
          return next(
            new ErrorResponse(
              'Reason and next Available date are required for "Not Available" status',
              400
            )
          );
        }
        if (availability.nextAvailability) {
          availability.nextAvailability = new Date(
            availability.nextAvailability
          );
        }
      }

      const newUser: Partial<UserDocument> = {
        name,
        email,
        password: hashedPassword,
        level: level as
          | 'Junior'
          | 'Mid-level'
          | 'Senior'
          | 'CEO',
        yearsOfWork,
        availability,
        userType: 'Employee',
      };

      const createdUser = await User.create(
        newUser as UserDocument
      );

      return res.status(201).json({
        success: true,
        message: 'Employee registered successfully',
        user: createdUser,
      });
    } catch (error) {
      console.error('Error registering employee:', error);
      return next(
        new ErrorResponse(
          'Failed to register employee',
          422
        )
      );
    }
  }
);

export const registerOrganization = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        name,
        email,
        password,
        level,
        yearsOfWork,
        organizationName,
      } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(
          new ErrorResponse(
            'User with this email already exists',
            400
          )
        );
      }

      const hashedPassword = await bcrypt.hash(
        password,
        10
      );

      const newUser: Partial<UserDocument> = {
        name,
        email,
        password: hashedPassword,
        level: level as
          | 'Junior'
          | 'Mid-level'
          | 'Senior'
          | 'CEO',
        yearsOfWork,
        organizationName,
        userType: 'Organization',
      };

      const createdUser = await User.create(
        newUser as UserDocument
      );

      return res.status(201).json({
        success: true,
        message: 'Organization registered successfully',
        user: createdUser,
      });
    } catch (error) {
      console.error(
        'Error registering organization:',
        error
      );
      return next(
        new ErrorResponse(
          'Failed to register organization',
          422
        )
      );
    }
  }
);

export const updatePassword = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { password, newPassword } = req.body;

      const user = await User.findById(
        req.user?._id
      ).select('+password');

      if (!user) {
        return next(
          new ErrorResponse('User not found', 404)
        );
      }

      const isOldPasswordValid = await bcrypt.compare(
        password,
        user.password
      );

      if (!isOldPasswordValid) {
        return next(
          new ErrorResponse('Password is incorrect', 401)
        );
      }

      if (newPassword.length < 6) {
        return next(
          new ErrorResponse(
            'Password must be at least 6 characters long',
            400
          )
        );
      }

      if (password === newPassword) {
        return next(
          new ErrorResponse(
            'Password can not be the same as old password',
            400
          )
        );
      }

      const hashedNewPassword = await bcrypt.hash(
        newPassword,
        10
      );
      user.password = hashedNewPassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      console.error('Error updating user password:', error);
      return next(
        new ErrorResponse('Failed to update password', 422)
      );
    }
  }
);
