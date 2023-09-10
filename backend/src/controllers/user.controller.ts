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
      res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error) {
      console.error('Error fetching all users:', error);
      return next(
        new ErrorResponse('Failed to fetch all users', 422)
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
          new ErrorResponse('User not found', 404)
        );
      }

      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error('Error fetching user:', error);
      return next(
        new ErrorResponse('Failed to fetch user', 422)
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
          new ErrorResponse('User not found', 404)
        );
      }

      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error('Error fetching user:', error);
      return next(
        new ErrorResponse('Failed to fetch user', 422)
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
          new ErrorResponse('User not found', 404)
        );
      }

      if (!(req.user?._id === user._id.toString())) {
        return next(
          new ErrorResponse(
            'You are not authorized to perform this action',
            403
          )
        );
      }

      await user.deleteOne();

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return next(
        new ErrorResponse('Failed to delete user', 422)
      );
    }
  }
);
