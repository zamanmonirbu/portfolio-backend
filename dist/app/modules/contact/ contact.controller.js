import httpStatus from 'http-status';
import { z } from 'zod';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { generateResponse } from '../../../utils/generateResponse.js';
import { ContactService } from './contact.service.js';
import { mailer } from '../../../core/mail.js';
import { env } from '../../../core/env.js';
const contactSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    subject: z.string().min(1),
    message: z.string().min(1),
});
export const submitContact = asyncHandler(async (req, res) => {
    const data = contactSchema.parse(req.body);
    // Save to DB
    const saved = await ContactService.create(data);
    // Send email
    await mailer.sendMail({
        from: env.MAIL_FROM,
        to: env.MAIL_TO,
        replyTo: data.email,
        subject: `New Contact: ${data.subject}`,
        text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
        html: `
      <p><strong>From:</strong> ${data.name} &lt;${data.email}&gt;</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message.replace(/\n/g, '<br/>')}</p>
    `,
    });
    res
        .status(httpStatus.CREATED)
        .json(generateResponse(true, { id: saved._id }, 'Contact message submitted'));
});
