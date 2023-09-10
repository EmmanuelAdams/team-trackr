import { getLoggedInUser } from './../controllers/user.controller';
import express from 'express';
import {
  getAllUsers,
  getUser,
  deleteUser,
} from '../controllers/user.controller';
import authenticate from '../middlewares/authentication';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/me', authenticate, getLoggedInUser);
router.get('/:id', getUser);
router.delete('/:id/delete', authenticate, deleteUser);

export default router;