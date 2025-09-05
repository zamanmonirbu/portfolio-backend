"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProject = exports.listProjects = exports.createProject = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = require("../../../utils/asyncHandler");
const generateResponse_1 = require("../../../utils/generateResponse");
const project_service_1 = require("./project.service");
const zod_1 = require("zod");
const projectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    liveLink: zod_1.z.string().url(),
    frontendCode: zod_1.z.string().url(),
    backendCode: zod_1.z.string().url(),
});
exports.createProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = projectSchema.parse(req.body);
    if (!req.file) {
        return res
            .status(http_status_1.default.BAD_REQUEST)
            .json((0, generateResponse_1.generateResponse)(false, null, 'Timeline photo is required'));
    }
    const project = await project_service_1.ProjectService.create({
        ...body,
        timelinePhoto: `/uploads/${req.file.filename}`, // store relative path
    });
    res
        .status(http_status_1.default.CREATED)
        .json((0, generateResponse_1.generateResponse)(true, project, 'Project created successfully'));
});
exports.listProjects = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const projects = await project_service_1.ProjectService.list();
    res.json((0, generateResponse_1.generateResponse)(true, projects, 'Projects fetched'));
});
exports.getProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const project = await project_service_1.ProjectService.findById(id);
    if (!project) {
        return res
            .status(http_status_1.default.NOT_FOUND)
            .json((0, generateResponse_1.generateResponse)(false, null, 'Project not found'));
    }
    res.json((0, generateResponse_1.generateResponse)(true, project, 'Project fetched'));
});
