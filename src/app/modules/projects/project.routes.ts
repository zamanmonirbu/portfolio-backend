// routes/project.routes.ts
import { Router } from 'express';
import { createProject, listProjects, getProject, updateProject, deleteProject } from './project.controller';
import { upload } from '../../../middleware/upload';
import { authenticateUser } from '../../../middleware/validateUser';

const router = Router();

// Single timeline photo + multiple additional photos
router.post(
  '/',
  authenticateUser,
  upload.fields([
    { name: 'timelinePhoto', maxCount: 1 },
    { name: 'otherPhotos', maxCount: 10 },
  ]),
  createProject
);

router.put(
  '/:id',
  authenticateUser,
  upload.fields([
    { name: 'timelinePhoto', maxCount: 1 },
    { name: 'otherPhotos', maxCount: 10 },
  ]),
  updateProject
);

router.get('/', listProjects);
router.get('/:id', getProject);
router.delete('/:id', authenticateUser, deleteProject);

export default router;