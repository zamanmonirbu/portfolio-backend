"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_status_1 = __importDefault(require("http-status"));
const index_1 = require("./app/routes/index");
const generateResponse_1 = require("./utils/generateResponse");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/', (_req, res) => {
    res.json((0, generateResponse_1.generateResponse)(true, { service: 'OK' }, 'Server is running'));
});
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.use('/api/v1', index_1.router);
// 404
app.use((req, res) => {
    res
        .status(http_status_1.default.NOT_FOUND)
        .json((0, generateResponse_1.generateResponse)(false, null, 'Route not found'));
});
// Global error handler
app.use((err, _req, res, _next) => {
    const status = typeof err.statusCode === 'number' ? err.statusCode : http_status_1.default.INTERNAL_SERVER_ERROR;
    const msg = err.message || 'Internal Server Error';
    res.status(status).json((0, generateResponse_1.generateResponse)(false, null, msg));
});
exports.default = app;
