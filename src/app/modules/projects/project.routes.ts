import { Router } from 'express';
import { createProject, listProjects,getProject } from './project.controller';
import { upload } from '../../../middleware/upload';

const router = Router();

router.post('/', upload.single('timelinePhoto'), createProject);
router.get('/', listProjects);
router.get('/:id', getProject);

export default router;
