"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = exports.createUser = void 0;
const http_status_1 = __importDefault(require("http-status"));
const asyncHandler_1 = require("../../../utils/asyncHandler");
const generateResponse_1 = require("../../../utils/generateResponse");
const user_service_1 = require("./user.service");
const zod_1 = require("zod");
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.createUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = createUserSchema.parse(req.body);
    const exists = await user_service_1.UserService.findByEmail(body.email);
    if (exists) {
        return res
            .status(http_status_1.default.CONFLICT)
            .json((0, generateResponse_1.generateResponse)(false, null, 'Email already exists'));
    }
    const user = await user_service_1.UserService.create(body);
    // hide password
    const { password, ...safe } = user.toObject();
    res
        .status(http_status_1.default.CREATED)
        .json((0, generateResponse_1.generateResponse)(true, safe, 'User created'));
});
exports.listUsers = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const users = await user_service_1.UserService.list();
    res.json((0, generateResponse_1.generateResponse)(true, users, 'Users fetched'));
});
