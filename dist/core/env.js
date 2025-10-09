"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI,
    bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS,
    jwt: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpire: process.env.JWT_EXPIRE,
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
        accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES,
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
        refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES,
    },
    cloudinary: {
        name: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    email: {
        expires: process.env.EMAIL_EXPIRES,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        address: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        admin: process.env.ADMIN_EMAIL,
    },
    rateLimit: {
        window: process.env.RATE_LIMIT_WINDOW,
        max: process.env.RATE_LIMIT_MAX,
        delay: process.env.RATE_LIMIT_DELAY,
    },
};
