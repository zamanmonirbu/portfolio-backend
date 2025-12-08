import { Router } from 'express';
import { getAdminProfile,myProfile, updateMyProfile } from './user.controller';
import { authenticateUser } from '../../../middleware/validateUser';
import { upload } from '../../../middleware/upload';

const router = Router();

router.get('/me', authenticateUser, myProfile);
router.put('/me', authenticateUser, upload.single('profile'), updateMyProfile);
router.get('/:email', getAdminProfile);

export default router;
