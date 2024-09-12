import express from 'express';
import {
  registerEmployee,
  registerOrganization,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  searchOrganizations,
} from '../controllers/auth.controller';
import authenticate from '../middlewares/authentication';

const router = express.Router();

router.post('/register/employee', registerEmployee);
router.post('/register/organization', registerOrganization);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.post('/logout', authenticate, logoutUser);

router.get('/organizations', searchOrganizations);

export default router;
