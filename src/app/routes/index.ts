import { Router } from 'express';
import userRoutes from '../modules/user/user.routes';
import contactRoutes from '../modules/contact/contact.routes';
import projectRoutes from '../modules/projects/project.routes';

export const router = Router();

router.use('/users', userRoutes);
router.use('/contact', contactRoutes);
router.use('/project', projectRoutes);

