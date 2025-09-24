// project.controller.ts
import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { asyncHandler } from '../../../utils/asyncHandler';
import { generateResponse } from '../../../utils/generateResponse';
import { ProjectService } from './project.service';
import { z } from 'zod';

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
      .json(generateResponse(false, null, 'Timeline photo is required'));
  }

  const project = await ProjectService.create({
    ...body,
    timelinePhoto: `/uploads/${req.file.filename}`, // store relative path
  });

  console.log(project);

  res
    .status(httpStatus.CREATED)
    .json(generateResponse(true, project, 'Project created successfully'));
});

export const listProjects = asyncHandler(async (_req: Request, res: Response) => {
  const projects = await ProjectService.list();
  res.json(generateResponse(true, projects, 'Projects fetched'));
});


export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const project = await ProjectService.findById(id);

  if (!project) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json(generateResponse(false, null, 'Project not found'));
  }

  res.json(generateResponse(true, project, 'Project fetched'));
});