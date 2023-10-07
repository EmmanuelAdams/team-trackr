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
    const users = await User.find();
    res.status(statusCode.success).json({
      success: true,
      count: users.length,
      users,
    });
  }
);

export const getUser = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const _id = req.params.id;

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
  }
);

export const getLoggedInUser = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const _id = req.user?._id;

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
  }
);

export const deleteUser = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
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
  }
);
