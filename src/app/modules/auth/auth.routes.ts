import { Router } from 'express';
import { createUser, loginUser } from './auth.controller';

const router = Router();

router.post('/register', createUser);
router.post('/login', loginUser); 


export default router;
