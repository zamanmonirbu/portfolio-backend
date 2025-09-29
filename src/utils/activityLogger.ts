// utils/activityLogger.ts
import { Request } from "express";
import { Activity, IActivity } from "../app/modules/activity/activity.model";

interface LogActivityParams {
  userId?: string;
  action: string;
  details?: string;
  req?: Request;
}

export async function logActivity({
  userId,
  action,
  details,
  req,
}: LogActivityParams): Promise<IActivity> {
  const activity = await Activity.create({
    userId,
    action,
    details,
    ipAddress: req?.ip,
    userAgent: req?.headers["user-agent"],
  });

  return activity;
}
