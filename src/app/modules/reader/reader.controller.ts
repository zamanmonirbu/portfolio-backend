import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { z } from 'zod';
import { asyncHandler } from '../../../utils/asyncHandler';
import { generateResponse } from '../../../utils/generateResponse';
import { listBlogsReadersService } from './reader.service';



export const listBlogsReaders = asyncHandler(async (_req: Request, res: Response) => {
  const blogs = await listBlogsReadersService.list();
  res.json(generateResponse(true, blogs, 'Blogs fetched successfully'));
});

