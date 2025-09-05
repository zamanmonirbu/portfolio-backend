import { Router } from 'express';
import { createUser, listUsers } from './user.controller';

const router = Router();

router.post('/', createUser);
router.get('/', listUsers);

export default router;
