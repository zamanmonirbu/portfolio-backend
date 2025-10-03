import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { asyncHandler } from '../../../utils/asyncHandler';
import { generateResponse } from '../../../utils/generateResponse';
import { getActivityService } from './activity.service';

export const getActivity = asyncHandler(async (req: Request, res: Response) => {
  const activity = await getActivityService();

  if (!activity) {
    return res.status(httpStatus.NOT_FOUND).json(generateResponse(false, null, 'Activity not found'));
  }

  res.json(generateResponse(true, activity, 'Activity fetched successfully'));
});

