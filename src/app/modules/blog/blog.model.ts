import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface IBlogAttrs {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  published: boolean;
  author?: string;
  tags?: string[];
  featuredImage?: string;
  reader?: number;
}

export interface IBlog extends IBlogAttrs, Document {
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    excerpt: String,
    slug: { type: String, required: true, unique: true },
    published: { type: Boolean, default: false },
    author: String,
    tags: [String],
    featuredImage: String,
    reader: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema);
