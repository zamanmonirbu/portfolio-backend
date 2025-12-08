"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyProfile = exports.getAdminProfile = exports.myProfile = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = require("../../../utils/asyncHandler");
const generateResponse_1 = require("../../../utils/generateResponse");
const user_service_1 = require("./user.service");
const cloudinary_1 = __importDefault(require("../../../utils/cloudinary"));
const zod_1 = require("zod");
const workExpSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    designation: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    timePeriod: zod_1.z.string().optional(),
    details: zod_1.z.string().optional()
});
const educationSchema = zod_1.z.object({
    institution: zod_1.z.string().optional(),
    degree: zod_1.z.string().optional(),
    timePeriod: zod_1.z.string().optional()
});
const socialLinkSchema = zod_1.z.object({
    platform: zod_1.z.string().min(1),
    url: zod_1.z.string().url(),
    icon: zod_1.z.string().optional(),
});
// Full update schema
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    bio: zod_1.z.string().optional(),
    about: zod_1.z.string().optional(),
    socialLinks: zod_1.z.array(socialLinkSchema).optional(),
    workExperience: zod_1.z.array(workExpSchema).optional(),
    education: zod_1.z.array(educationSchema).optional(),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.myProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(http_status_1.default.UNAUTHORIZED).json((0, generateResponse_1.generateResponse)(false, null, 'Unauthorized'));
    }
    const user = await user_service_1.UserService.findById(userId);
    if (!user) {
        return res.status(http_status_1.default.NOT_FOUND).json((0, generateResponse_1.generateResponse)(false, null, 'User not found'));
    }
    const { password, ...safe } = user.toObject();
    res.json((0, generateResponse_1.generateResponse)(true, safe, 'Profile fetched'));
});
exports.getAdminProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(http_status_1.default.BAD_REQUEST).json((0, generateResponse_1.generateResponse)(false, null, 'Email is required'));
    }
    const admin = await user_service_1.UserService.findByEmail(email);
    if (!admin) {
        return res.status(http_status_1.default.NOT_FOUND).json((0, generateResponse_1.generateResponse)(false, null, 'Admin not found'));
    }
    const { password, ...safe } = admin.toObject();
    res.json((0, generateResponse_1.generateResponse)(true, safe, 'Admin profile fetched'));
});
exports.updateMyProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(http_status_1.default.UNAUTHORIZED).json((0, generateResponse_1.generateResponse)(false, null, 'Unauthorized'));
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
        return res.status(400).json((0, generateResponse_1.generateResponse)(false, null, parseResult.error.errors[0].message));
    }
    const updates = parseResult.data;
    // Handle image upload
    if (req.file) {
        const currentUser = await user_service_1.UserService.findById(userId).select('cloudinaryId').lean();
        if (currentUser?.cloudinaryId) {
            await cloudinary_1.default.uploader.destroy(currentUser.cloudinaryId);
        }
        const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: 'profiles' }, async (error, result) => {
            if (error || !result) {
                return res.status(500).json((0, generateResponse_1.generateResponse)(false, null, 'Image upload failed'));
            }
            updates.profilePicture = result.secure_url;
            updates.cloudinaryId = result.public_id;
            const updatedUser = await user_service_1.UserService.findByIdAndUpdate(userId, updates);
            return res.json((0, generateResponse_1.generateResponse)(true, updatedUser, 'Profile updated successfully'));
        });
        uploadStream.end(req.file.buffer);
        return;
    }
    // Text-only update
    const updatedUser = await user_service_1.UserService.findByIdAndUpdate(userId, updates);
    res.json((0, generateResponse_1.generateResponse)(true, updatedUser, 'Profile updated successfully'));
});
