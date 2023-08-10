import express from 'express';
import { getAllProjects, createProject, getProject, updateProject, deleteProject } from '../controllers/project.controllers';



const router = express.Router();

router
.route('/')
.get(getAllProjects)
.post(createProject);

router
  .route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);  


export default router; 