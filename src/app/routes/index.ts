import { Router } from 'express';
import userRoutes from '../modules/user/user.routes';
import contactRoutes from '../modules/contact/contact.routes';
import projectRoutes from '../modules/projects/project.routes';
import blogRoutes from '../modules/blog/blog.routes';
import readerRoutes from '../modules/reader/reader.routes';
import activityRoutes from '../modules/activity/activity.routes';

export const router = Router();

router.use('/users', userRoutes);
router.use('/contact', contactRoutes);
router.use('/project', projectRoutes);
router.use('/blog',blogRoutes);
router.use('/readers',readerRoutes);
router.use('/activity',activityRoutes);
