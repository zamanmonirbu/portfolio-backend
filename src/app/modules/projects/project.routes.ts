import { Router } from 'express';
import { createProject, listProjects,getProject, updateProject, deleteProject } from './project.controller';
import { upload } from '../../../middleware/upload';
import { authenticateUser } from '../../../middleware/validateUser';

const router = Router();

router.post('/',authenticateUser, upload.single('timelinePhoto'), createProject);
router.get('/', listProjects);
router.get('/:id', getProject);
router.put('/:id',authenticateUser, updateProject);
router.delete('/:id',authenticateUser, deleteProject);

export default router;
