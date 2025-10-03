// project.controller.ts
import type { Request, Response } from "express";
import httpStatus from "http-status";
import { asyncHandler } from "../../../utils/asyncHandler";
import { generateResponse } from "../../../utils/generateResponse";
import { ProjectService } from "./project.service";
import { z } from "zod";
import { logActivity } from "../../../utils/activityLogger";

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  liveLink: z.string().url(),
  frontendCode: z.string().url(),
  backendCode: z.string().url(),
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const body = projectSchema.parse(req.body);

  if (!req.file) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(generateResponse(false, null, "Timeline photo is required"));
  }

  const project = await ProjectService.create({
    ...body,
    timelinePhoto: `/uploads/${req.file.filename}`,
  });

  // 🔥 Log activity
  await logActivity({
    userId: req.user?.id,
    action: "Created Project",
    details: `Project named "${project.name}" created`,
    req,
  });

  res
    .status(httpStatus.CREATED)
    .json(generateResponse(true, project, "Project created successfully"));
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

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = projectSchema.partial().parse(req.body);

  let timelinePhotoPath: string | undefined;
  if (req.file) {
    timelinePhotoPath = `/uploads/${req.file.filename}`;
  }

  const updatedProject = await ProjectService.update(id, {
    ...body,
    ...(timelinePhotoPath && { timelinePhoto: timelinePhotoPath }),
  });

  if (!updatedProject) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json(generateResponse(false, null, "Project not found"));
  }

  // 🔥 Log activity
  await logActivity({
    userId: req.user?.id,
    action: "Updated Project",
    details: `Project named "${updatedProject.name}" updated`,
    req,
  });

  res.json(generateResponse(true, updatedProject, "Project updated successfully"));
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await ProjectService.delete(id);

  if (!deleted) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json(generateResponse(false, null, "Project not found"));
  }

  // 🔥 Log activity
  await logActivity({
    userId: req.user?.id,
    action: "Deleted Project",
    details: `Project with id "${id}" deleted`,
    req,
  });

  res.json(generateResponse(true, null, "Project deleted successfully"));
});
