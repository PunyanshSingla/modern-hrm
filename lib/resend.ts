
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("RESEND_API_KEY is not defined in the environment variables. Email sending will fail.");
}

export const resend = new Resend(resendApiKey || 're_123'); // Default to a fake key to prevent crash on init, but warn.
