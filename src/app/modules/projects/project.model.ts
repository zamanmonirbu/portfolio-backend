// project.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectAttrs {
  name: string;
  description?: string;
  timelinePhoto?: string; // stored as file path
  liveLink: string;
  frontendCode: string;
  backendCode: string;
  cloudinaryId?: string;


}

export interface IProject extends IProjectAttrs, Document {
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  description: String,
  liveLink: { type: String, required: true },
  frontendCode: { type: String, required: true },
  backendCode: { type: String, required: true },
  timelinePhoto: { type: String },
  cloudinaryId: { type: String},
}, { timestamps: true });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
