import { Blog } from '../blog/blog.model';

export const listBlogsReadersService = {
  async list() {
    // Sum readCount of all blogs
    const result = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalReaders: { $sum: '$readCount' },
        },
      },
    ]);

    return {
      totalReaders: result[0]?.totalReaders || 0, // if no blogs, return 0
    };
  },
};
