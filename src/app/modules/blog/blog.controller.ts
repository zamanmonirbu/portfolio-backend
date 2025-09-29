import type { Request, Response } from "express";
import httpStatus from "http-status";
import { z } from "zod";
import { asyncHandler } from "../../../utils/asyncHandler";
import { generateResponse } from "../../../utils/generateResponse";
import { BlogService } from "./blog.service";
import { logActivity } from "../../../utils/activityLogger";

const createBlogSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  slug: z.string().min(1),
  published: z.boolean(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().optional(),
  reader: z.number().optional(),
});

export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  const body = createBlogSchema.parse(req.body);
  const blog = await BlogService.create(body);

  // 🔥 Log activity
  await logActivity({
    userId: req.user?.id, // make sure `req.user` exists (e.g. from auth middleware)
    action: "Created Blog",
    details: `Blog titled "${blog.title}" created`,
    req,
  });

  res
    .status(httpStatus.CREATED)
    .json(generateResponse(true, blog, "Blog created successfully"));
});

export const listBlogs = asyncHandler(async (_req: Request, res: Response) => {
  const blogs = await BlogService.list();
  res.json(generateResponse(true, blogs, "Blogs fetched successfully"));
});

export const getBlog = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const blog = await BlogService.findByIdAndIncrement(id);

  if (!blog) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json(generateResponse(false, null, "Blog not found"));
  }

  res.json(generateResponse(true, blog, "Blog fetched successfully"));
});

export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = createBlogSchema.partial().parse(req.body);

  const updated = await BlogService.update(id, body);
  if (!updated) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json(generateResponse(false, null, "Blog not found"));
  }

  // 🔥 Log activity
  await logActivity({
    userId: req.user?.id,
    action: "Updated Blog",
    details: `Blog titled "${updated.title}" updated`,
    req,
  });

  res.json(generateResponse(true, updated, "Blog updated successfully"));
});

export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await BlogService.delete(id);

  if (!deleted) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json(generateResponse(false, null, "Blog not found"));
  }

  // 🔥 Log activity
  await logActivity({
    userId: req.user?.id,
    action: "Deleted Blog",
    details: `Blog with id "${id}" deleted`,
    req,
  });

  res.json(generateResponse(true, null, "Blog deleted successfully"));
});
