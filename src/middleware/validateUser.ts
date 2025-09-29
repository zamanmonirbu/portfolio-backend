import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import httpStatus from "http-status";
import { generateResponse } from "../utils/generateResponse";
import { IUser } from "../app/modules/user/user.model";
import jwt, {type Secret, type SignOptions } from "jsonwebtoken";
import env from "../core/env";


export const authenticateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || '';
  if (!token) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json(generateResponse(false, null, 'Unauthorized'));
  }

  try {
    const decoded = jwt.verify(token, env.jwt.accessTokenSecret as string);

    req.user = decoded as IUser;
    next();
  } catch (error) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json(generateResponse(false, null, 'Invalid token'));
  }
});
