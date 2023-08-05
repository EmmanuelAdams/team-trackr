import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserDocument } from '../models/User';

export const loginUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const secretKey =
      process.env.SECRET_KEY || 'qwert@4321';
    const token = jwt.sign(
      { userId: existingUser._id },
      secretKey,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'User logged in successfully',
      user: existingUser,
      token: token,
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error' });
  }
};

export const registerUser = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      password,
      level,
      yearsOfWork,
      availability,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (availability && availability.nextAvailability) {
      availability.nextAvailability = new Date(
        availability.nextAvailability
      );
    }

    const newUser: Partial<UserDocument> = {
      name,
      email,
      password: hashedPassword,
      level: level as
        | 'Junior'
        | 'Mid-level'
        | 'Senior'
        | 'CEO',
      yearsOfWork,
      availability,
    };

    const createdUser = await User.create(
      newUser as UserDocument
    );

    return res.status(201).json({
      message: 'User registered successfully',
      user: createdUser,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error' });
  }
};
