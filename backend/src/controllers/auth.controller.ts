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

    // Check if the user with the provided email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists',
      });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert the nextAvailability string to a Date object
    if (availability && availability.nextAvailability) {
      availability.nextAvailability = new Date(
        availability.nextAvailability
      );
    }

    // Create the user document with the hashed password
    const newUser: Partial<UserDocument> = {
      // Use Partial<> to allow missing properties
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

    // Save the new user to the database
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
