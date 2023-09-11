import { statusCode } from './../statusCodes';
import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../middlewares/async';
import { User } from '../models/User';
import ErrorResponse from '../utils/errorResponse';

export const getAllUsers = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const users = await User.find();
      res.status(statusCode.success).json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error) {
      console.error('Error fetching all users:', error);
      return next(
        new ErrorResponse(
          'Failed to fetch all users',
          statusCode.unprocessable
        )
      );
    }
  }
);

export const getUser = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const _id = req.params.id;

    try {
      const user = await User.findById({
        _id,
      });

      if (!user) {
        return next(
          new ErrorResponse(
            'User not found',
            statusCode.notFound
          )
        );
      }

      res
        .status(statusCode.success)
        .json({ success: true, user });
    } catch (error) {
      console.error('Error fetching user:', error);
      return next(
        new ErrorResponse(
          'Failed to fetch user',
          statusCode.unprocessable
        )
      );
    }
  }
);

export const getLoggedInUser = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const _id = req.user?._id;

    try {
      const user = await User.findById(_id);

      if (!user) {
        return next(
          new ErrorResponse(
            'User not found',
            statusCode.notFound
          )
        );
      }

      res
        .status(statusCode.success)
        .json({ success: true, user });
    } catch (error) {
      console.error('Error fetching user:', error);
      return next(
        new ErrorResponse(
          'Failed to fetch user',
          statusCode.unprocessable
        )
      );
    }
  }
);

export const deleteUser = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return next(
          new ErrorResponse(
            'User not found',
            statusCode.notFound
          )
        );
      }

      if (!(req.user?._id === user._id.toString())) {
        return next(
          new ErrorResponse(
            'You are not authorized to perform this action',
            statusCode.forbidden
          )
        );
      }

      await user.deleteOne();

      res.status(statusCode.success).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return next(
        new ErrorResponse(
          'Failed to delete user',
          statusCode.unprocessable
        )
      );
    }
  }
);
