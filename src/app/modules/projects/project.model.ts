// project.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectAttrs {
  name: string;
  description?: string;
  liveLink: string;
  frontendCode: string;
  backendCode: string;
  timelinePhoto?: string;
  timelinePhotoCloudinaryId?: string;
  otherPhotos?: string[];           // URLs
  otherPhotosCloudinaryIds?: string[]; // public_ids for cleanup
  videoLink?: string;
  technologies?: string[];
}

export interface IProject extends IProjectAttrs, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  description: String,
  liveLink: { type: String, required: true },
  frontendCode: { type: String, required: true },
  backendCode: { type: String, required: true },
  timelinePhoto: String,
  timelinePhotoCloudinaryId: String,
  otherPhotos: [String],
  otherPhotosCloudinaryIds: [String],
  videoLink: String,
  technologies: [String],
}, { timestamps: true });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);

