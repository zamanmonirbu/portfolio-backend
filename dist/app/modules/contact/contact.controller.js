"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyContact = exports.getContact = exports.allContacts = exports.submitContact = void 0;
const http_status_1 = __importDefault(require("http-status"));
const zod_1 = require("zod");
const asyncHandler_1 = require("../../../utils/asyncHandler");
const generateResponse_1 = require("../../../utils/generateResponse");
const contact_service_1 = require("./contact.service");
const mail_1 = __importDefault(require("../../../core/mail"));
const activityLogger_1 = require("../../../utils/activityLogger");
const contactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    subject: zod_1.z.string().min(1),
    message: zod_1.z.string().min(1),
});
exports.submitContact = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = contactSchema.parse(req.body);
    // Save to DB
    const saved = await contact_service_1.ContactService.create(data);
    // 🔥 Log activity
    await (0, activityLogger_1.logActivity)({
        action: "New Contact Message",
        details: `Message from ${saved.name} <${saved.email}>`,
        req,
    });
    res
        .status(http_status_1.default.CREATED)
        .json((0, generateResponse_1.generateResponse)(true, saved, "Contact message submitted"));
});
exports.allContacts = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const contacts = await contact_service_1.ContactService.list();
    res.json((0, generateResponse_1.generateResponse)(true, contacts, "Contacts fetched"));
});
exports.getContact = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const contact = await contact_service_1.ContactService.findById(id);
    if (!contact) {
        return res
            .status(http_status_1.default.NOT_FOUND)
            .json((0, generateResponse_1.generateResponse)(false, null, "Contact not found"));
    }
    res.json((0, generateResponse_1.generateResponse)(true, contact, "Contact fetched"));
});
exports.replyContact = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { replyMessage } = req.body;
    if (!replyMessage || typeof replyMessage !== "string" || replyMessage.trim().length === 0) {
        return res
            .status(http_status_1.default.BAD_REQUEST)
            .json((0, generateResponse_1.generateResponse)(false, null, "Reply message is required"));
    }
    const contact = await contact_service_1.ContactService.findById(id);
    if (!contact) {
        return res
            .status(http_status_1.default.NOT_FOUND)
            .json((0, generateResponse_1.generateResponse)(false, null, "Contact not found"));
    }
    // Send email
    await (0, mail_1.default)(contact.email, `Re: ${contact.subject}`, replyMessage);
    // 🔥 Log activity
    await (0, activityLogger_1.logActivity)({
        userId: req.user?.id, // whoever replied
        action: "Replied to Contact",
        details: `Replied to ${contact.name} <${contact.email}>`,
        req,
    });
    res.json((0, generateResponse_1.generateResponse)(true, null, "Reply sent successfully"));
});
