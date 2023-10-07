import {
  getLoggedInUser,
  updatePassword,
} from './../controllers/user.controller';
import express from 'express';
import {
  getAllUsers,
  getUser,
  deleteUser,
} from '../controllers/user.controller';
import authenticate from '../middlewares/authentication';
import { validateObjectId } from '../middlewares/objectIdValidator';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/me', authenticate, getLoggedInUser);
router.put(
  '/update-password',
  authenticate,
  updatePassword
);
router.get('/:id', validateObjectId, getUser);
router.delete(
  '/:id/delete',
  validateObjectId,
  authenticate,
  deleteUser
);

export default router;
