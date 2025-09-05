"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const get = (key, fallback) => {
    const v = process.env[key];
    if (v === undefined || v === '') {
        if (fallback !== undefined)
            return fallback;
        throw new Error(`Missing required env: ${key}`);
    }
    return v;
};
exports.env = {
    NODE_ENV: get('NODE_ENV', 'development'),
    PORT: Number(get('PORT', '5000')),
    MONGO_URI: get('MONGO_URI'),
    SMTP_HOST: get('SMTP_HOST'),
    SMTP_PORT: Number(get('SMTP_PORT', '587')),
    SMTP_USER: get('SMTP_USER'),
    SMTP_PASS: get('SMTP_PASS'),
    MAIL_FROM: get('MAIL_FROM'),
    MAIL_TO: get('MAIL_TO'),
};
