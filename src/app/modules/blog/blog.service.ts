import { Blog, IBlogAttrs } from './blog.model';
import slugify from 'slugify';

export const BlogService = {
  create(payload: IBlogAttrs) {
    const dateTime = new Date().toISOString().slice(0, 19).replace(/T/g, '-').replace(/:/g, '');
    const slug = slugify(`${payload.title}-${dateTime}`, { lower: true, strict: true });
    return Blog.create({ ...payload, slug });
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
    if (payload.title) {
      payload.slug = slugify(payload.title, { lower: true, strict: true });
    }
    return Blog.findByIdAndUpdate(id, payload, { new: true }).lean();
  },

  async delete(id: string) {
    const result = await Blog.findByIdAndDelete(id).lean();
    return result !== null;
  },

  findByIdAndIncrement(id: string) {
    return Blog.findByIdAndUpdate(
      id,
      { $inc: { reader: 1 } },
      { new: true }
    ).lean();
  },
};
