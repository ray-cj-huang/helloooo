import sgMail from '@sendgrid/mail';
import type { Mail } from '@/types/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not defined');
}

if (!process.env.SENDGRID_FROM_EMAIL) {
  throw new Error('SENDGRID_FROM_EMAIL is not defined');
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail(to: string, subject: string, text: string) {
  try {
    const msg = {
      to,
      from: FROM_EMAIL,
      subject,
      text,
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error sending email via SendGrid:', error);
    return false;
  }
} 