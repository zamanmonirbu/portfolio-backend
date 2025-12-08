import nodemailer from 'nodemailer';
import config from './env';

const sendMailer = async (
  email: string,
  subject?: string,
  html?: string,
) => {
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: Number(config.email.port),
    secure: false, 
    auth: {
      user: config.email.address,
      pass: config.email.pass,
    },
  });
  const info = await transporter.sendMail({
    from: `"your company name" ${config.email.from}`,
    to: email,
    subject,
    html,
  });

};

export default sendMailer;
