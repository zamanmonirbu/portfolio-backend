"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_routes_1 = __importDefault(require("../modules/user/user.routes"));
const contact_routes_1 = __importDefault(require("../modules/contact/contact.routes"));
const project_routes_1 = __importDefault(require("../modules/projects/project.routes"));
exports.router = (0, express_1.Router)();
exports.router.use('/users', user_routes_1.default);
exports.router.use('/contact', contact_routes_1.default);
exports.router.use('/project', project_routes_1.default);
