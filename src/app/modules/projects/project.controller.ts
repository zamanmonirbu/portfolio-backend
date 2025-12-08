// project.controller.ts
import type { Request, Response } from "express";
import httpStatus from "http-status";
import { asyncHandler } from "../../../utils/asyncHandler";
import { generateResponse } from "../../../utils/generateResponse";
import { ProjectService } from "./project.service";
import { z } from "zod";
import { logActivity } from "../../../utils/activityLogger";
import cloudinary from "../../../utils/cloudinary";
import { IProject } from "./project.model";

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  liveLink: z.string().url(),
  frontendCode: z.string().url(),
  backendCode: z.string().url(),
  timelinePhoto: z.string().optional(),
  cloudinaryId: z.string().optional(),
});



export const createProject = asyncHandler(async (req, res) => {
  const body = projectSchema.parse(req.body);

  if (!req.file) {
    return res.status(400).json(generateResponse(false, null, "Timeline photo is required"));
  }

  const stream = cloudinary.uploader.upload_stream(
    { folder: "projects" },
    async (error, result) => {
      if (error) throw new Error(error.message);
      if (!result) throw new Error("Cloudinary returned empty result");

      const project = await ProjectService.create({
        ...body,
        timelinePhoto: result.secure_url,
        cloudinaryId: result.public_id,
      });

      res.status(201).json(generateResponse(true, project, "Project created successfully"));
    }
  );

  stream.end(req.file.buffer);
});



export const listProjects = asyncHandler(async (_req: Request, res: Response) => {
  const projects = await ProjectService.list();
  res.json(generateResponse(true, projects, "Projects fetched"));
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await ProjectService.findById(id);

  if (!project) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json(generateResponse(false, null, "Project not found"));
  }

  // 🔥 Optional: Log activity for viewing a project
  await logActivity({
    userId: req.user?.id,
    action: "Viewed Project",
    details: `Project named "${project.name}" viewed`,
    req,
  });

  res.json(generateResponse(true, project, "Project fetched"));
});

export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const body = projectSchema.partial().parse(req.body);

  const existing = await ProjectService.findById(id) as IProject | null;

  if (!existing) {
    return res.status(404).json(generateResponse(false, null, "Project not found"));
  }

  let updateData: any = { ...body };

  if (req.file) {
    // delete old image
    if (existing.cloudinaryId) {
      await cloudinary.uploader.destroy(existing.cloudinaryId);
    }

    // upload new
    const stream = cloudinary.uploader.upload_stream(
      { folder: "projects" },
      async (error, result) => {
        if (error) throw new Error(error.message);
        if (!result) throw new Error("Cloudinary returned empty result");

        updateData.timelinePhoto = result.secure_url;
        updateData.cloudinaryId = result.public_id;

        const updatedProject = await ProjectService.update(id, updateData);

        res.json(generateResponse(true, updatedProject, "Project updated successfully"));
      }
    );

    stream.end(req.file.buffer);
    return;
  }

  const updated = await ProjectService.update(id, updateData);
  res.json(generateResponse(true, updated, "Project updated"));
});



export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await ProjectService.findById(id);
  if (!project) {
    return res.status(404).json(generateResponse(false, null, "Project not found"));
  }

  // delete cloudinary image
  if (project.cloudinaryId) {
    await cloudinary.uploader.destroy(project.cloudinaryId);
  }


  // delete db record
  await ProjectService.delete(id);

  await logActivity({
    userId: req.user?.id,
    action: "Deleted Project",
    details: `Project "${project.name}" deleted`,
    req,
  });

  res.json(generateResponse(true, null, "Project deleted successfully"));
});
