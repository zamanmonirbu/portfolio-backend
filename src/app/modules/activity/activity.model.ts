// models/activity.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IActivity extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  details: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Activity = mongoose.model<IActivity>("Activity", activitySchema);
