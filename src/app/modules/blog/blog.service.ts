import { Blog, IBlog, IBlogAttrs } from './blog.model';

export const BlogService = {
  create(payload: IBlogAttrs) {
    return Blog.create(payload);
  },

  list() {
    return Blog.find().lean();
  },

  findById(id: string) {
    return Blog.findById(id).lean();
  },

  findBySlug(slug: string) {
    return Blog.findOne({ slug }).lean();
  },

  update(id: string, payload: Partial<IBlogAttrs>) {
    return Blog.findByIdAndUpdate(id, payload, { new: true }).lean();
  },

  async delete(id: string) {
    const result = await Blog.findByIdAndDelete(id).lean();
    return result !== null;
  },
  findByIdAndIncrement(id: string) {
  return Blog.findByIdAndUpdate(
    id,
    { $inc: { readCount: 1 } }, // 👈 Increment reader count
    { new: true }
  ).lean();
}

};
