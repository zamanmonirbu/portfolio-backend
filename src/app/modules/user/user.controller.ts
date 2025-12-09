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

const skillsSchema = z.array(
  z.object({
    skillTile: z.string().min(1, "Skill category is required"),
    skillName: z.array(z.string().min(1, "Skill name cannot be empty")).min(1, "At least one skill required"),
  })
);

// Full update schema
const updateProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  bio: z.string().optional(),
  about: z.string().optional(),

  socialLinks: z.array(socialLinkSchema).optional(),
  workExperience: z.array(workExpSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: skillsSchema.optional(),
logo: z.string().url().optional().or(z.literal("")),
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

  skills?: Array<{
    skillTile: string;
    skillName: string[];
  }>;
  logo?: string;

  profilePicture?: string;
  cloudinaryId?: string;
  logoCloudinaryId?: string; 
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

// user.controller.ts
export const updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json(
      generateResponse(false, null, 'Unauthorized')
    );
  }

  const rawBody = {
    ...req.body,
    socialLinks: safeParse(req.body.socialLinks),
    workExperience: safeParse(req.body.workExperience),
    education: safeParse(req.body.education),
    skills: safeParse(req.body.skills),
    logo: req.body.logo || undefined,
  };

  const parseResult = updateProfileSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return res.status(400).json(
      generateResponse(false, null, parseResult.error.errors[0].message)
    );
  }

  const updates: UpdateUserType = parseResult.data;

  // Handle profile picture
  if (req.files && (req.files as any)['profile']?.[0]) { // ← Type assertion fix
    const file = (req.files as any)['profile'][0];
    const current = await UserService.findById(userId).select('cloudinaryId').lean();

    if (current?.cloudinaryId) {
      await cloudinary.uploader.destroy(current.cloudinaryId);
    }

    const result = await uploadToCloudinary(file, 'profiles');
    updates.profilePicture = result.secure_url;
    updates.cloudinaryId = result.public_id;
  }

  // Handle logo
  if (req.files && (req.files as any)['logo']?.[0]) { // ← Type assertion fix
    const file = (req.files as any)['logo'][0];
    const current = await UserService.findById(userId).select('logoCloudinaryId').lean();

    if (current?.logoCloudinaryId) {
      await cloudinary.uploader.destroy(current.logoCloudinaryId);
    }

    const result = await uploadToCloudinary(file, 'logos');
    updates.logo = result.secure_url;
    updates.logoCloudinaryId = result.public_id;
  }

  const updatedUser = await UserService.findByIdAndUpdate(userId, updates as Partial<IUser>);
  res.json(generateResponse(true, updatedUser, 'Profile updated successfully'));
});
// Helper: Safe JSON parse
function safeParse(value: any) {
  if (!value) return undefined;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
}

// Helper: Upload to Cloudinary
function uploadToCloudinary(file: Express.Multer.File, folder: string) {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error || !result) reject(error || new Error("Upload failed"));
        else resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(file.buffer);
  });
}