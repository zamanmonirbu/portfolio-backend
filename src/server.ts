import app from './app';
import {connectDB} from './core/db';
import env from './core/env';

const server = async () => {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Server: http://localhost:${env.port}`);
  });
};

server();
