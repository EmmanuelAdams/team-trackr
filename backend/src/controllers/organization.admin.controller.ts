import { statusCode } from './../statusCodes';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from '../middlewares/async';
import { Organization } from '../models/Organization';
import { User } from '../models/User';

export const approveEmployee = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(statusCode.notFound).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.status === 'approved') {
      return res.status(statusCode.badRequest).json({
        success: false,
        message: 'User already approved',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: 'approved' },
      { new: true }
    );

    await Organization.findByIdAndUpdate(
      user.organization,
      { $push: { employees: user._id } },
      { new: true }
    );

    res.status(statusCode.success).json({
      success: true,
      message: 'Employee approved successfully',
      user: updatedUser,
    });
  }
);

export const rejectEmployee = asyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.params.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'rejected' },
      { new: true }
    );

    if (!user) {
      return res.status(statusCode.notFound).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(statusCode.success).json({
      success: true,
      message: 'Employee rejected successfully',
      user,
    });
  }
);
