import { Router } from 'express';
import { listBlogsReaders } from './reader.controller';

const router = Router();

router.get('/', listBlogsReaders);


export default router;
