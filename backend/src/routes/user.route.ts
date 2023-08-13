import express from 'express';
import {
  getAllUsers,
  getUser,
  deleteUser,
} from '../controllers/user.controller';
import authenticate from '../middlewares/authentication';

const router = express.Router();

router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.delete(
  '/users/:id/delete',
  authenticate,
  deleteUser
);

export default router;
