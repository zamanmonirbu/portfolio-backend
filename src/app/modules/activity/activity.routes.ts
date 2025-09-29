import { Router } from 'express';
import { createBlog, listBlogs, getBlog, updateBlog, deleteBlog } from './activity.controller';

const router = Router();

router.post('/', createBlog);
router.get('/', listBlogs);
router.get('/:id', getBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

export default router;
