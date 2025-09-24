import mongoose from 'mongoose';
import env from './env';

export const connectDB = async () => {
   if (!env.mongoUri) {
      throw new Error('MongoDB URI is not defined in environment variables.');
    }
  await mongoose.connect(env.mongoUri);
  console.log('MongoDB connected');
};
