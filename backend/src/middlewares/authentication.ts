import { Response, Request, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

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
    return res
      .status(401)
      .json({ message: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secretKey =
      process.env.SECRET_KEY || 'qwert@4321';
    const decodedToken = jwt.verify(
      token,
      secretKey
    ) as JwtPayload;

    if (
      decodedToken.exp &&
      decodedToken.exp < Date.now() / 1000
    ) {
      return res
        .status(401)
        .json({ message: 'Token has expired' });
    }

    req.user = {
      _id: decodedToken.userId || decodedToken._id,
      level: decodedToken.level,
      userType: decodedToken.userType,
    };

    if (
      req.body.createdBy &&
      req.user._id !== req.body.createdBy
    ) {
      return res.status(403).json({
        message:
          'You are not authorized to perform this action',
      });
    }

    next();
  } catch (error) {
    console.error('Error authenticating token: ', error);
    return res
      .status(401)
      .json({ message: 'Invalid token' });
  }
};

export = authenticate;
