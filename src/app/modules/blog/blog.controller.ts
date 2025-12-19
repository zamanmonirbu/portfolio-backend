import type { Request, Response } from "express";
import httpStatus from "http-status";
import { asyncHandler } from "../../../utils/asyncHandler";
import { generateResponse } from "../../../utils/generateResponse";
import { BlogService } from "./blog.service";
import { z } from "zod";
import cloudinary from "../../../utils/cloudinary";

const blogSchema = z.object({
  title: z.string(),
  content: z.string(),
  excerpt: z.string().optional(),
  published: z.coerce.boolean(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  const parsed = blogSchema.parse({
    ...req.body,
    tags: req.body.tags ? req.body.tags.split(",") : [],
  });

  if (!req.file) {
    return res.status(400).json(generateResponse(false, null, "Image required"));
  }

  const stream = cloudinary.uploader.upload_stream(
    { folder: "blogs" },
    async (error, result) => {
      if (error) throw new Error("Cloudinary upload failed");

      const blog = await BlogService.create({
        ...parsed,
        featuredImage: result!.secure_url,
        cloudinaryId: result!.public_id,
      });

      res
        .status(httpStatus.CREATED)
        .json(generateResponse(true, blog, "Blog created successfully"));
    }
  );

  stream.end(req.file.buffer);
});

export const listBlogs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;

  const blogsData = await BlogService.list(page, limit);
  res.json(generateResponse(true, blogsData, "Blogs fetched"));
});


export const getBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await BlogService.findByIdAndIncrement(req.params.id);

  if (!blog) {
    return res.status(404).json(generateResponse(false, null, "Blog not found"));
  }

  res.json(generateResponse(true, blog, "Blog fetched"));
});

export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await BlogService.findById(id);
  if (!existing) {
    return res.status(404).json(generateResponse(false, null, "Blog not found"));
  }

  const body = blogSchema.partial().parse({
    ...req.body,
    tags: req.body.tags ? req.body.tags.split(",") : undefined,
  });

  let updateData: any = { ...body };

  if (req.file) {
    if (existing.cloudinaryId) {
      await cloudinary.uploader.destroy(existing.cloudinaryId);
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: "blogs" },
      async (error, result) => {
        if (error) throw new Error("Cloudinary upload failed");

        updateData.featuredImage = result!.secure_url;
        updateData.cloudinaryId = result!.public_id;

        const updated = await BlogService.update(id, updateData);
        res.json(generateResponse(true, updated, "Blog updated successfully"));
      }
    );

    stream.end(req.file.buffer);
    return;
  }

  const updated = await BlogService.update(id, updateData);
  res.json(generateResponse(true, updated, "Blog updated successfully"));
});

export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const blog = await BlogService.findById(id);
  if (!blog) {
    return res.status(404).json(generateResponse(false, null, "Blog not found"));
  }

  if (blog.cloudinaryId) {
    await cloudinary.uploader.destroy(blog.cloudinaryId);
  }

  await BlogService.delete(id);

  res.json(generateResponse(true, null, "Blog deleted successfully"));
});
