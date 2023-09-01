import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import ErrorResponse from "../utils/errorResponse";
import asyncHandler from "../middlewares/async";


export const protect =  asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Define the JwtPayload interface
  interface JwtPayload {
    id: string;
  }

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
    // Set token from cookie
  }
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY || "qwert@4321"
    ) as JwtPayload;
    // const decoded = jwt.verify(token, 'your-secret-key') ;

    // req.user = await User.findById(decoded.id);
    (req as any).user = await User.findById(decoded.id);

    next(); 
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});
 