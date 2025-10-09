"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = __importDefault(require("./env"));
const sendMailer = async (email, subject, html) => {
    const transporter = nodemailer_1.default.createTransport({
        host: env_1.default.email.host,
        port: Number(env_1.default.email.port),
        secure: false,
        auth: {
            user: env_1.default.email.address,
            pass: env_1.default.email.pass,
        },
    });
    const info = await transporter.sendMail({
        from: `"your company name" ${env_1.default.email.from}`,
        to: email,
        subject,
        html,
    });
    console.log('Message sent:', info.messageId);
};
exports.default = sendMailer;
