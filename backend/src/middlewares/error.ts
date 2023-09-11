import { statusCode } from './../statusCodes';
import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/errorResponse';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: any = { ...err };

  error.message = err.message;

  console.log(err);

  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new ErrorResponse(message, statusCode.notFound);
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(
      message,
      statusCode.badRequest
    );
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(
      (val: any) => val.message
    );
    const message = messages.join(', ');
    error = new ErrorResponse(
      message,
      statusCode.badRequest
    );
  }

  res
    .status(error.statusCode || statusCode.unprocessable)
    .json({
      success: false,
      error: error.message || 'Unprocessable entity',
    });
};

export default errorHandler;
