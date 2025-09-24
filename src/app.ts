import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import httpStatus from 'http-status';
import { router } from './app/routes/index';
import { generateResponse } from './utils/generateResponse';
import path from 'path';


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json(generateResponse(true, { service: 'OK' }, 'Server is running'));
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/v1', router);

// 404
app.use((req, res) => {
  res
    .status(httpStatus.NOT_FOUND)
    .json(generateResponse(false, null, 'Route not found'));
});

// Global error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const status =
      typeof err.statusCode === 'number' ? err.statusCode : httpStatus.INTERNAL_SERVER_ERROR;
    const msg = err.message || 'Internal Server Error';
    res.status(status).json(generateResponse(false, null, msg));
  }
);

export default app;
