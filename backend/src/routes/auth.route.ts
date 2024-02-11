import {
  forgotPassword,
  resetPassword,
  verifyUser,
} from './../controllers/auth.controller';
import express, { Request, Response } from "express";
import {
  registerEmployee,
  registerOrganization,
  loginUser,
  logoutUser,
} from '../controllers/auth.controller';
import authenticate from '../middlewares/authentication';

const router = express.Router();

const routerVerifyUser = (async (req: Request, res: Response) => {
  // await verifyUser(req.params._id);
  const userId = req.params.id;
  await verifyUser(userId); 
  res.status(200).json({ message: "Verified Successfully " });
});


router.post('/register/employee', registerEmployee);
router.post('/register/organization', registerOrganization);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.post('/logout', authenticate, logoutUser);
router.get('/verify/:id/:verifyToken', routerVerifyUser);
// router.post('/verify/:id', authenticate, verifyUser);

export default router;       
