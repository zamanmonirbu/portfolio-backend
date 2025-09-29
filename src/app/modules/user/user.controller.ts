import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { asyncHandler } from '../../../utils/asyncHandler';
import { generateResponse } from '../../../utils/generateResponse';
import { UserService } from './user.service';
import { z } from 'zod';
import mongoose from 'mongoose';

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

import jwt from 'jsonwebtoken';
import env from '../../../core/env';

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

  // Compare password using bcrypt
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json(generateResponse(false, null, 'Invalid email or password'));
  }

  const { password: pwd, ...safe } = user.toObject();

  // Fix _id unknown
  const userId = (user._id as mongoose.Types.ObjectId).toString();

  // Generate JWT token
  const token = jwt.sign(
    { id: userId, email: user.email }, // payload
    env.jwt.accessTokenSecret as string,  // secret key
    { expiresIn: '1h' }                // expiry
  );

  res.json(generateResponse(true, { user: safe, token }, 'Login successful'));
});


export const myProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json(generateResponse(false, null, 'Unauthorized'));
  }

  const user = await UserService.findById(userId);
  if (!user) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json(generateResponse(false, null, 'User not found'));
  }

  const { password, ...safe } = user.toObject();
  res.json(generateResponse(true, safe, 'Profile fetched'));
});

