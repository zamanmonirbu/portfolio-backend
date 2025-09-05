import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { asyncHandler } from '../../../utils/asyncHandler';
import { generateResponse } from '../../../utils/generateResponse';
import { UserService } from './user.service';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const body = createUserSchema.parse(req.body);
  const exists = await UserService.findByEmail(body.email);
  if (exists) {
    return res
      .status(httpStatus.CONFLICT)
      .json(generateResponse(false, null, 'Email already exists'));
  }
  const user = await UserService.create(body);
  // hide password
  const { password, ...safe } = user.toObject();
  res
    .status(httpStatus.CREATED)
    .json(generateResponse(true, safe, 'User created'));
});

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await UserService.list();
  res.json(generateResponse(true, users, 'Users fetched'));
});
