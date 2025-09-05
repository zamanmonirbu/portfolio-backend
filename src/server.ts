import app from './app';
import { env } from './core/env';
import { connectDB } from './core/db';


const server = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Server: http://localhost:${env.PORT}`);
  });
};

server();
