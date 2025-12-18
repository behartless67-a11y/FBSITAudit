import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not defined in environment variables');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export const resend = {
  emails: {
    send: async (params: Parameters<Resend['emails']['send']>[0]) => {
      const client = getResendClient();
      return client.emails.send(params);
    }
  }
};

export const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';
export const APP_URL = process.env.APP_URL || 'http://localhost:3000';
