import express from 'express';
import { registerEmployee } from '../controllers/auth.controller';
import { registerOrganization } from '../controllers/auth.controller';
import { loginUser } from '../controllers/auth.controller';
import { logoutUser } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register/employee', registerEmployee);
router.post('/register/organization', registerOrganization);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

export default router;
