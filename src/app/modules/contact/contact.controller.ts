import type { Request, Response } from "express";
import httpStatus from "http-status";
import { z } from "zod";
import { asyncHandler } from "../../../utils/asyncHandler";
import { generateResponse } from "../../../utils/generateResponse";
import { ContactService } from "./contact.service";
import env from "../../../core/env";
import sendMailer from "../../../core/mail";
import { logActivity } from "../../../utils/activityLogger";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const data = contactSchema.parse(req.body);

  // Save to DB
  const saved = await ContactService.create(data);

  // 🔥 Log activity
  await logActivity({
    action: "New Contact Message",
    details: `Message from ${saved.name} <${saved.email}>`,
    req,
  });

  res
    .status(httpStatus.CREATED)
    .json(generateResponse(true, saved, "Contact message submitted"));
});

export const allContacts = asyncHandler(async (_req: Request, res: Response) => {
  const contacts = await ContactService.list();
  res.json(generateResponse(true, contacts, "Contacts fetched"));
});

export const getContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const contact = await ContactService.findById(id);

  if (!contact) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json(generateResponse(false, null, "Contact not found"));
  }

  res.json(generateResponse(true, contact, "Contact fetched"));
});

export const replyContact = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { replyMessage } = req.body;

  if (!replyMessage || typeof replyMessage !== "string" || replyMessage.trim().length === 0) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(generateResponse(false, null, "Reply message is required"));
  }

  const contact = await ContactService.findById(id);

  if (!contact) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json(generateResponse(false, null, "Contact not found"));
  }

  // Send email
  await sendMailer(contact.email, `Re: ${contact.subject}`, replyMessage);

  // 🔥 Log activity
  await logActivity({
    userId: req.user?.id, // whoever replied
    action: "Replied to Contact",
    details: `Replied to ${contact.name} <${contact.email}>`,
    req,
  });

  res.json(generateResponse(true, null, "Reply sent successfully"));
});
