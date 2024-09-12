import {
  approveEmployee,
  rejectEmployee,
} from './../controllers/organization.admin.controller';
import express from 'express';

const router = express.Router();

router.patch('/approve-employee/:userId', approveEmployee);
router.patch('/reject-employee/:userId', rejectEmployee);

export default router;
