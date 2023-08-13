import { Request, Response } from 'express';
import { User } from '../models/User';

export const getAllUsers = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    return res
      .status(500)
      .json({ message: 'Failed to fetch all users' });
  }
};

export const getUser = async (
  req: Request,
  res: Response
) => {
  const _id = req.params.id;

  try {
    const user = await User.findById({
      _id,
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res
      .status(500)
      .json({ message: 'Failed to fetch user' });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
) => {
  const userId = req.params.id;
  try {
    const deletedUser = await User.findByIdAndDelete(
      userId
    );
    if (!deletedUser) {
      return res
        .status(404)
        .json({ message: 'User not found' });
    }
    res
      .status(200)
      .json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res
      .status(500)
      .json({ message: 'Failed to delete user' });
  }
};
