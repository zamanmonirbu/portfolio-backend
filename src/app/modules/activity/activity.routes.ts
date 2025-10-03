import { Router } from 'express';
import { getActivity } from './activity.controller';
import { authenticateUser } from '../../../middleware/validateUser';

const router = Router();

router.get('/',authenticateUser, getActivity);

export default router;

