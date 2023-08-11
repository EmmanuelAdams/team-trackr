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
  const token = req.header('Authorization');

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Authorization token missing' });
  }

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
      _id: decodedToken.userId,
      level: decodedToken.level,
      userType: decodedToken.userType,
    };

    next();
  } catch (error) {
    console.error('Error authenticating token: ', error);
    return res
      .status(401)
      .json({ message: 'Invalid token' });
  }
};

export = authenticate;
