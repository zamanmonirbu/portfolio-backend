import { User } from './user.model';
import type { IUser } from './user.model';


export const UserService = {
  create(payload: Pick<IUser, 'name' | 'email' | 'password'>) {
    return User.create(payload);
  },

  list() {
    return User.find().select('-password').lean();
  },

  findByEmail(email: string) {
    return User.findOne({ email }).select('+password');
  }
};
