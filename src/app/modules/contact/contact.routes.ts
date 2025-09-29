import { Router } from 'express';
import { submitContact, allContacts, getContact, replyContact } from './contact.controller';
import { authenticateUser } from '../../../middleware/validateUser';

const router = Router();

router.post('/', submitContact);
router.get('/',authenticateUser, allContacts);
router.post('/reply/:id',authenticateUser, replyContact); 
router.get('/:id', getContact);

export default router;
