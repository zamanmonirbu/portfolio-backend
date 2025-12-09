// project.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status";
import { asyncHandler } from "../../../utils/asyncHandler";
import { generateResponse } from "../../../utils/generateResponse";
import { ProjectService } from "./project.service";
import { z } from "zod";
import cloudinary from "../../../utils/cloudinary";

// --------------------
// ZOD VALIDATION
// --------------------
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  liveLink: z.string().url("Invalid live link URL"),
  frontendCode: z.string().url("Invalid frontend code URL"),
  backendCode: z.string().url("Invalid backend code URL"),
  videoLink: z.string().url().optional(),
  technologies: z.array(z.string()).optional(),
});

type UploadResult = {
  secure_url: string;
  public_id: string;
};

// --------------------
// CLOUDINARY UPLOAD HELPER
// --------------------
const uploadToCloudinary = (file: Express.Multer.File): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "projects" },
      (error, result) => {
        if (error || !result) reject(error || new Error("Upload failed"));
        else resolve(result as UploadResult);
      }
    );
    stream.end(file.buffer);
  });
};

// --------------------
// SAFE JSON PARSER
// --------------------
function safeParse(value: any): any {
  if (!value) return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

// --------------------
// CREATE PROJECT
// --------------------
export const createProject = asyncHandler(async (req: Request, res: Response) => {
  // Parse JSON fields first
  const rawData = {
    ...req.body,
    technologies: safeParse(req.body.technologies),
  };

  // Validate
  const parseResult = projectSchema.safeParse(rawData);
  if (!parseResult.success) {
    return res.status(400).json(
      generateResponse(false, null, parseResult.error.errors[0].message)
    );
  }

  const parsed = parseResult.data;

  // Extract files (multer.fields)
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const timelinePhotoFile = files?.timelinePhoto?.[0];
  const otherPhotosFiles = files?.otherPhotos || [];

  if (!timelinePhotoFile && otherPhotosFiles.length === 0) {
    return res
      .status(400)
      .json(generateResponse(false, null, "At least one image is required"));
  }

  // Upload timeline photo
  const timelinePhoto = timelinePhotoFile
    ? await uploadToCloudinary(timelinePhotoFile)
    : null;

  // Upload other photos
  const otherPhotos = await Promise.all(
    otherPhotosFiles.map((file: Express.Multer.File) =>
      uploadToCloudinary(file)
    )
  );

  const project = await ProjectService.create({
    ...parsed,

    timelinePhoto: timelinePhoto?.secure_url || undefined,
    timelinePhotoCloudinaryId: timelinePhoto?.public_id || undefined,

    otherPhotos: otherPhotos.map((p) => p.secure_url),
    otherPhotosCloudinaryIds: otherPhotos.map((p) => p.public_id),
  });

  res
    .status(201)
    .json(generateResponse(true, project, "Project created successfully"));
});

// --------------------
// UPDATE PROJECT
// --------------------
export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Parse JSON fields
  const rawData = {
    ...req.body,
    technologies: safeParse(req.body.technologies),
  };

  const parseResult = projectSchema.partial().safeParse(rawData);
  if (!parseResult.success) {
    return res.status(400).json(
      generateResponse(false, null, parseResult.error.errors[0].message)
    );
  }

  const existing = await ProjectService.findById(id);
  if (!existing) {
    return res.status(404).json(generateResponse(false, null, "Project not found"));
  }

  const updateData: any = { ...parseResult.data };
  // Replace timeline photo
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const timelinePhotoFile = files?.timelinePhoto?.[0];
  const otherPhotosFiles = files?.otherPhotos || [];

  if (timelinePhotoFile) {
    if (existing.timelinePhotoCloudinaryId) {
      await cloudinary.uploader.destroy(existing.timelinePhotoCloudinaryId);
    }
    const result = await uploadToCloudinary(timelinePhotoFile);
    updateData.timelinePhoto = result.secure_url;
    updateData.timelinePhotoCloudinaryId = result.public_id;
  }

  // Replace other photos
  if (otherPhotosFiles.length > 0) {
    if (existing.otherPhotosCloudinaryIds?.length) {
      await Promise.all(
        existing.otherPhotosCloudinaryIds.map((id) =>
          cloudinary.uploader.destroy(id)
        )
      );
    }

    const uploaded = await Promise.all(
      otherPhotosFiles.map((file: Express.Multer.File) =>
        uploadToCloudinary(file)
      )
    );

    updateData.otherPhotos = uploaded.map((p) => p.secure_url);
    updateData.otherPhotosCloudinaryIds = uploaded.map((p) => p.public_id);
  }

  const updated = await ProjectService.update(id, updateData);

  res.json(generateResponse(true, updated, "Project updated successfully"));
});

// --------------------
// DELETE PROJECT
// --------------------
export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await ProjectService.findById(id);
  if (!project) {
    return res.status(404).json(generateResponse(false, null, "Project not found"));
  }

  const idsToDelete = [
    project.timelinePhotoCloudinaryId,
    ...(project.otherPhotosCloudinaryIds || []),
  ].filter(Boolean) as string[];

  await Promise.all(idsToDelete.map((id) => cloudinary.uploader.destroy(id)));

  await ProjectService.delete(id);

  res.json(generateResponse(true, null, "Project deleted successfully"));
});

// --------------------
// LIST PROJECTS
// --------------------
export const listProjects = asyncHandler(async (_req: Request, res: Response) => {
  const projects = await ProjectService.list();
  res.json(generateResponse(true, projects, "Projects fetched"));
});

// --------------------
// GET PROJECT BY ID
// --------------------
export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await ProjectService.findById(id);

  if (!project) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json(generateResponse(false, null, "Project not found"));
  }

  res.json(generateResponse(true, project, "Project fetched"));
});
