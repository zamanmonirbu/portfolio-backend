import { Activity, IActivity } from "./activity.model";

export const getActivityService = async (): Promise<IActivity[]> => {
  const activity = await Activity.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "name") 
    .lean();

  return activity;
};
