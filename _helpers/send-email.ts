// _helpers/send-email.ts
import nodemailer from 'nodemailer';

// Email configuration using environment variables
const smtpOptions = {
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};

const emailFrom = process.env.EMAIL_FROM || 'no-reply@example.com';

export default async function sendEmail({ to, subject, html, from = emailFrom }: any) {
  const transporter = nodemailer.createTransport(smtpOptions);
  await transporter.sendMail({ from, to, subject, html });
}