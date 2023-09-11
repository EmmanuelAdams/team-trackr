import {
  forgotPassword,
  resetPassword,
  updatePassword,
} from './../controllers/auth.controller';
import express from 'express';
import {
  registerEmployee,
  registerOrganization,
  loginUser,
  logoutUser,
} from '../controllers/auth.controller';
import authenticate from '../middlewares/authentication';

const router = express.Router();

router.post('/register/employee', registerEmployee);
router.post('/register/organization', registerOrganization);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.post('/logout', authenticate, logoutUser);
router.put('/updatepassword', authenticate, updatePassword);

export default router;
