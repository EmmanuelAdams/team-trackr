import express from 'express';
import {
  registerEmployee,
  registerOrganization,
  loginUser,
  logoutUser,
  deleteUser,
  getAllUsers,
} from '../controllers/auth.controller';
import authenticate from '../middlewares/authentication';

const router = express.Router();

router.get('/users', getAllUsers);
router.delete(
  '/users/:id/delete',
  authenticate,
  deleteUser
);

router.post('/auth/register/employee', registerEmployee);
router.post(
  '/auth/register/organization',
  registerOrganization
);
router.post('/auth/login', loginUser);
router.post('/auth/logout', logoutUser);

export default router;
