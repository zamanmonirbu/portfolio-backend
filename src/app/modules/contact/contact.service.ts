import { Contact } from './contact.model';
import type { IContact } from './contact.model';

export const ContactService = {
  create(payload: Pick<IContact, 'name' | 'email' | 'subject' | 'message'>) {
    return Contact.create(payload);
  },
  list() {
    return Contact.find().lean();
  },
  findById(id: string) {
    return Contact.findById(id).lean();
  } 
};

