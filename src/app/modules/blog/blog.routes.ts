import { Router } from 'express';
import { createBlog, listBlogs, getBlog, updateBlog, deleteBlog } from './blog.controller';
import { authenticateUser } from '../../../middleware/validateUser';

const router = Router();

router.post('/',authenticateUser, createBlog);
router.get('/', listBlogs);
router.get('/:id', getBlog);
router.put('/:id', authenticateUser, updateBlog);
router.delete('/:id',authenticateUser, deleteBlog);

export default router;
