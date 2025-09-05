import { Router } from 'express';
import { submitContact, allContacts, getContact, replyContact } from './contact.controller';

const router = Router();

router.post('/', submitContact);
router.get('/', allContacts);
router.post('/reply/:id', replyContact); 
router.get('/:id', getContact);

export default router;
