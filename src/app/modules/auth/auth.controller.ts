import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { asyncHandler } from '../../../utils/asyncHandler';
import { generateResponse } from '../../../utils/generateResponse';
import { UserService } from './auth.service';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import env from '../../../core/env';

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

  const result = {
    id: user._id!.toString(),
    email: user.email,
  };

  res
    .status(httpStatus.CREATED)
    .json(generateResponse(true, result, 'User created'));
});



export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(generateResponse(false, null, 'Email and password are required'));
  }

  const user = await UserService.findByEmail(email);
  if (!user) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json(generateResponse(false, null, 'Invalid email or password'));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json(generateResponse(false, null, 'Invalid email or password'));
  }

  const token = jwt.sign(
    { id: user._id!.toString(), email: user.email },
    env.jwt.accessTokenSecret as string,
    { expiresIn: '1h' }
  );

  const result = {
    id: user._id!.toString(),
    email: user.email,
    token,
  };

  res.json(generateResponse(true, result, 'Login successful'));
});


