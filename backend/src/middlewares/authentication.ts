import { statusCode } from './../statusCodes';
import { Response, Request, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import ErrorResponse from '../utils/errorResponse';

declare module 'express' {
  export interface Request {
    user?: {
      level: string;
      userType: string;
      _id: string;
    };
  }
}

const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return next(
      new ErrorResponse(
        'Authorization token missing',
        statusCode.unauthorized
      )
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const secretKey = process.env.SECRET_KEY as string;
    const decodedToken = jwt.verify(
      token,
      secretKey
    ) as JwtPayload;

    req.user = {
      _id: decodedToken.userId || decodedToken._id,
      level: decodedToken.level,
      userType: decodedToken.userType,
    };

    if (
      req.body.createdBy &&
      req.user._id !== req.body.createdBy
    ) {
      return next(
        new ErrorResponse(
          'You are not authorized to perform this action',
          statusCode.forbidden
        )
      );
    }

    if (
      decodedToken.exp &&
      decodedToken.exp < Math.floor(Date.now() / 1000)
    ) {
      return next(
        new ErrorResponse(
          'Token has expired',
          statusCode.unauthorized
        )
      );
    }

    next();
  } catch (error) {
    console.error('Error authenticating token: ', error);
    return next(
      new ErrorResponse(
        'Invalid token',
        statusCode.unauthorized
      )
    );
  }
};

export = authenticate;
