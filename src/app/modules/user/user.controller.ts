import type { Request, Response } from 'express';
import httpStatus from 'http-status';
import { asyncHandler } from '../../../utils/asyncHandler';
import { generateResponse } from '../../../utils/generateResponse';
import { UserService } from './user.service';
import cloudinary from '../../../utils/cloudinary';
import { z } from 'zod';
import { IUser } from './user.model';


const workExpSchema = z.object({
  title: z.string().optional(),
  designation: z.string().optional(),
  location: z.string().optional(),
  timePeriod: z.string().optional(),
  details: z.string().optional()
});

const educationSchema = z.object({
  institution: z.string().optional(),
  degree: z.string().optional(),
  timePeriod: z.string().optional()
});

const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
  icon: z.string().optional(),
});

// Full update schema
const updateProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  about: z.string().optional(),

  socialLinks: z.array(socialLinkSchema).optional(),
  workExperience: z.array(workExpSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(z.string()).optional(),
});


type UpdateUserType = {
  name?: string;
  email?: string;
  bio?: string;
  about?: string;
  location?: string;

  socialLinks?: Array<{
    platform: string;
    url: string;
    icon?: string;
  }>;

  workExperience?: Array<{
    title?: string;
    designation?: string;
    location?: string;
    timePeriod?: string;
    details?: string;
  }>;

  education?: Array<{
    institution?: string;
    degree?: string;
    timePeriod?: string;
  }>;

  skills?: string[];

  profilePicture?: string;
  cloudinaryId?: string;
};





export const myProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json(generateResponse(false, null, 'Unauthorized'));
  }

  const user = await UserService.findById(userId);
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json(generateResponse(false, null, 'User not found'));
  }

  const { password, ...safe } = user.toObject();
  res.json(generateResponse(true, safe, 'Profile fetched'));
});

export const getAdminProfile = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.params;
  if (!email) {
    return res.status(httpStatus.BAD_REQUEST).json(generateResponse(false, null, 'Email is required'));
  }

  const admin = await UserService.findByEmail(email);
  if (!admin) {
    return res.status(httpStatus.NOT_FOUND).json(generateResponse(false, null, 'Admin not found'));
  }

  const { password, ...safe } = admin.toObject();
  res.json(generateResponse(true, safe, 'Admin profile fetched'));
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json(
      generateResponse(false, null, 'Unauthorized')
    );
  }

  // Remove ALL manual JSON.parse() — Multer already did it!
  const parsedBody = {
    ...req.body,
    // These come as strings from frontend (FormData + JSON.stringify)
    // But Multer + express.json() auto-parses them if sent correctly
    socialLinks: req.body.socialLinks
      ? typeof req.body.socialLinks === 'string'
        ? JSON.parse(req.body.socialLinks)
        : req.body.socialLinks
      : undefined,

    workExperience: req.body.workExperience
      ? typeof req.body.workExperience === 'string'
        ? JSON.parse(req.body.workExperience)
        : req.body.workExperience
      : undefined,

    education: req.body.education
      ? typeof req.body.education === 'string'
        ? JSON.parse(req.body.education)
        : req.body.education
      : undefined,

    skills: req.body.skills
      ? typeof req.body.skills === 'string'
        ? JSON.parse(req.body.skills)
        : req.body.skills
      : undefined,
  };

  // Now Zod works perfectly
  const parseResult = updateProfileSchema.safeParse(parsedBody);

  if (!parseResult.success) {
    return res.status(400).json(
      generateResponse(false, null, parseResult.error.errors[0].message)
    );
  }

  const updates:UpdateUserType = parseResult.data;


  // Handle image upload
  if (req.file) {

    const currentUser = await UserService.findById(userId).select('cloudinaryId').lean();

    if (currentUser?.cloudinaryId) {
      await cloudinary.uploader.destroy(currentUser.cloudinaryId);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'profiles' },
      async (error, result) => {
        if (error || !result) {
          return res.status(500).json(generateResponse(false, null, 'Image upload failed'));
        }

        updates.profilePicture = result.secure_url;
        updates.cloudinaryId = result.public_id;

        const updatedUser = await UserService.findByIdAndUpdate(userId, updates as Partial<IUser>);
        return res.json(generateResponse(true, updatedUser, 'Profile updated successfully'));
      }
    );

    uploadStream.end(req.file.buffer);
    return;
  }

  // Text-only update
  const updatedUser = await UserService.findByIdAndUpdate(userId, updates as Partial<IUser>);
  res.json(generateResponse(true, updatedUser, 'Profile updated successfully'));
});