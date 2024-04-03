import { statusCode } from '../statusCodes';
import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../middlewares/async';
import bcrypt from 'bcrypt';
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

export const updatePassword = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { password, newPassword } = req.body;

    const user = await User.findById(req.user?._id).select(
      '+password'
    );

    if (!user) {
      return next(
        new ErrorResponse(
          'User not found',
          statusCode.notFound
        )
      );
    }

    const isOldPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isOldPasswordValid) {
      return next(
        new ErrorResponse(
          'Password is incorrect',
          statusCode.unauthorized
        )
      );
    }

    if (newPassword.length < 6) {
      return next(
        new ErrorResponse(
          'Password must be at least 6 characters long',
          statusCode.badRequest
        )
      );
    }

    if (password === newPassword) {
      return next(
        new ErrorResponse(
          'Password can not be the same as old password',
          statusCode.badRequest
        )
      );
    }

    const hashedNewPassword = await bcrypt.hash(
      newPassword,
      10
    );
    user.password = hashedNewPassword;
    await user.save();

    return res.status(statusCode.success).json({
      success: true,
      message: 'Password updated successfully',
    });
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
