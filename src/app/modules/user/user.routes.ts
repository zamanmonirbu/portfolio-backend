// routes/user.routes.ts
import { Router } from 'express';
import { getAdminProfile, myProfile, updateMyProfile } from './user.controller';
import { authenticateUser } from '../../../middleware/validateUser';
import { upload } from '../../../middleware/upload';

const router = Router();

router.get('/me', authenticateUser, myProfile);
router.get('/:email', getAdminProfile);

// One endpoint handles: profile picture, logo, or both
router.put(
  '/me',
  authenticateUser,
  upload.fields([
    { name: 'profile', maxCount: 1 },   // profile picture
    { name: 'logo', maxCount: 1 },      // logo
  ]),
  updateMyProfile
);

export default router;