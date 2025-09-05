// project.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectAttrs {
  name: string;
  description?: string;
  timelinePhoto: string; // stored as file path
  liveLink: string;
  frontendCode: string;
  backendCode: string;
}

export interface IProject extends IProjectAttrs, Document {
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  description: String,
  timelinePhoto: { type: String, required: true },
  liveLink: { type: String, required: true },
  frontendCode: { type: String, required: true },
  backendCode: { type: String, required: true },
}, { timestamps: true });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
