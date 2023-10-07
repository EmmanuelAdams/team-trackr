import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import ErrorResponse from '../utils/errorResponse';
import { statusCode } from '../statusCodes';

export const validateObjectId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(
      new ErrorResponse(
        'Invalid ID',
        statusCode.unprocessable
      )
    );
  }

  next();
};
