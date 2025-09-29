import { Router } from 'express';
import { createUser, listUsers, loginUser,myProfile } from './user.controller';
import { authenticateUser } from '../../../middleware/validateUser';

const router = Router();

router.post('/register', createUser);
router.get('/', listUsers);
router.get('/me',authenticateUser, myProfile);
router.post('/login', loginUser); 

export default router;
