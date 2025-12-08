import { findSourceMap } from 'module';
import { User } from '../user/user.model';
import type { IUser } from '../user/user.model';


export const UserService = {
  create(payload: Pick<IUser, 'name' | 'email' | 'password'>) {
    return User.create(payload);
  },

  list() {
    return User.find().select('-password').lean();
  },

  findByEmail(email: string) {
    return User.findOne({ email }).select('+password');
  },

  findById(id: string) {
    return User.findById(id).select('-password');
  }


};
