import express from 'express';
import { registerUser } from '../controllers/auth.controller';
import { loginUser } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
