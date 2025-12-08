"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProject = exports.listProjects = exports.createProject = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = require("../../../utils/asyncHandler");
const generateResponse_1 = require("../../../utils/generateResponse");
const project_service_1 = require("./project.service");
const zod_1 = require("zod");
const activityLogger_1 = require("../../../utils/activityLogger");
const cloudinary_1 = __importDefault(require("../../../utils/cloudinary"));
const projectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    liveLink: zod_1.z.string().url(),
    frontendCode: zod_1.z.string().url(),
    backendCode: zod_1.z.string().url(),
    timelinePhoto: zod_1.z.string().optional(),
    cloudinaryId: zod_1.z.string().optional(),
});
exports.createProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = projectSchema.parse(req.body);
    if (!req.file) {
        return res.status(400).json((0, generateResponse_1.generateResponse)(false, null, "Timeline photo is required"));
    }
    const stream = cloudinary_1.default.uploader.upload_stream({ folder: "projects" }, async (error, result) => {
        if (error)
            throw new Error(error.message);
        if (!result)
            throw new Error("Cloudinary returned empty result");
        const project = await project_service_1.ProjectService.create({
            ...body,
            timelinePhoto: result.secure_url,
            cloudinaryId: result.public_id,
        });
        res.status(201).json((0, generateResponse_1.generateResponse)(true, project, "Project created successfully"));
    });
    stream.end(req.file.buffer);
});
exports.listProjects = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const projects = await project_service_1.ProjectService.list();
    res.json((0, generateResponse_1.generateResponse)(true, projects, "Projects fetched"));
});
exports.getProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const project = await project_service_1.ProjectService.findById(id);
    if (!project) {
        return res
            .status(http_status_1.default.NOT_FOUND)
            .json((0, generateResponse_1.generateResponse)(false, null, "Project not found"));
    }
    // 🔥 Optional: Log activity for viewing a project
    await (0, activityLogger_1.logActivity)({
        userId: req.user?.id,
        action: "Viewed Project",
        details: `Project named "${project.name}" viewed`,
        req,
    });
    res.json((0, generateResponse_1.generateResponse)(true, project, "Project fetched"));
});
exports.updateProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const body = projectSchema.partial().parse(req.body);
    const existing = await project_service_1.ProjectService.findById(id);
    if (!existing) {
        return res.status(404).json((0, generateResponse_1.generateResponse)(false, null, "Project not found"));
    }
    let updateData = { ...body };
    if (req.file) {
        // delete old image
        if (existing.cloudinaryId) {
            await cloudinary_1.default.uploader.destroy(existing.cloudinaryId);
        }
        // upload new
        const stream = cloudinary_1.default.uploader.upload_stream({ folder: "projects" }, async (error, result) => {
            if (error)
                throw new Error(error.message);
            if (!result)
                throw new Error("Cloudinary returned empty result");
            updateData.timelinePhoto = result.secure_url;
            updateData.cloudinaryId = result.public_id;
            const updatedProject = await project_service_1.ProjectService.update(id, updateData);
            res.json((0, generateResponse_1.generateResponse)(true, updatedProject, "Project updated successfully"));
        });
        stream.end(req.file.buffer);
        return;
    }
    const updated = await project_service_1.ProjectService.update(id, updateData);
    res.json((0, generateResponse_1.generateResponse)(true, updated, "Project updated"));
});
exports.deleteProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const project = await project_service_1.ProjectService.findById(id);
    if (!project) {
        return res.status(404).json((0, generateResponse_1.generateResponse)(false, null, "Project not found"));
    }
    // delete cloudinary image
    if (project.cloudinaryId) {
        await cloudinary_1.default.uploader.destroy(project.cloudinaryId);
    }
    // delete db record
    await project_service_1.ProjectService.delete(id);
    await (0, activityLogger_1.logActivity)({
        userId: req.user?.id,
        action: "Deleted Project",
        details: `Project "${project.name}" deleted`,
        req,
    });
    res.json((0, generateResponse_1.generateResponse)(true, null, "Project deleted successfully"));
});
