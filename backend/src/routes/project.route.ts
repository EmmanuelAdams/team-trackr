import express from 'express';
import {
  getAllProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getAllOrganizationProjects,
} from '../controllers/project.controller';

const router = express.Router();
import authenticate from '../middlewares/authentication';

router.get('/', getAllProjects);
router.get(
  '/organization',
  authenticate,
  getAllOrganizationProjects
);
router.get('/:id', authenticate, getProject);
router.patch('/:id/update', authenticate, updateProject);
router.post('/new', authenticate, createProject);
router.delete('/:id/delete', authenticate, deleteProject);

export default router;
