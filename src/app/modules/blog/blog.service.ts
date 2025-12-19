import { Blog, IBlogAttrs } from "./blog.model";
import slugify from "slugify";

export const BlogService = {
  create(payload: IBlogAttrs) {
    const date = new Date().toISOString().replace(/[:.]/g, "");
    const slug = slugify(`${payload.title}-${date}`, { lower: true, strict: true });
    return Blog.create({ ...payload, slug });
  },

  // Updated list method with pagination
  async list(page: number = 1, limit: number = 5) {
    const skip = (page - 1) * limit;
    const totalBlogs = await Blog.countDocuments();
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalBlogs / limit);

    return {
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  findById(id: string) {
    return Blog.findById(id).lean();
  },

  findByIdAndIncrement(id: string) {
    return Blog.findByIdAndUpdate(id, { $inc: { reader: 1 } }, { new: true }).lean();
  },

  update(id: string, payload: Partial<IBlogAttrs>) {
    if (payload.title) {
      payload.slug = slugify(payload.title, { lower: true, strict: true });
    }
    return Blog.findByIdAndUpdate(id, payload, { new: true }).lean();
  },

  async delete(id: string) {
    const result = await Blog.findByIdAndDelete(id).lean();
    return result !== null;
  },
};
