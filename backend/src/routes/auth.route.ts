import express, { Request, Response, NextFunction } from "express";
import {
  forgotPassword,
  resetPassword,
  verifyUser,
  registerEmployee,
  registerOrganization,
  loginUser,
  logoutUser,
} from '../controllers/auth.controller';
import authenticate from '../middlewares/authentication';

const router = express.Router();

const routerVerifyUser = (async (req: Request, res: Response, next: NextFunction) => {
  
  try {
  const userId = req.params.id;
  await verifyUser(userId); 
  res.status(200).json({ message: "Verified Successfully " });
  next();
  } catch (error) {
    next(error);
  }
});


router.post('/register/employee', registerEmployee);
router.post('/register/organization', registerOrganization);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.post('/logout', authenticate, logoutUser);
router.get('/verify/:id/:verifyToken', routerVerifyUser);

export default router;       
