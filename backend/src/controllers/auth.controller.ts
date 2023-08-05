import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User, UserDocument } from '../models/User';

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
