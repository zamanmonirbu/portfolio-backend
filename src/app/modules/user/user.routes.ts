import { Router } from 'express';
import { createUser, listUsers, loginUser } from './user.controller';

const router = Router();

router.post('/register', createUser);
router.get('/', listUsers);
router.post('/login', loginUser); 

export default router;
