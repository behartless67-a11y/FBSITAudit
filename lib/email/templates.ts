import { APP_URL } from './resend-client';

interface EmailTemplateProps {
  userName: string;
  areaName: string;
  month: string;
  daysRemaining?: number;
}

export const getFirstReminderEmail = ({ userName, areaName, month }: EmailTemplateProps) => {
  const formUrl = `${APP_URL}?area=${encodeURIComponent(areaName)}`;

  return {
    subject: `Monthly Audit Now Open - ${areaName} (${month})`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Monthly Audit Form - ${month}</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>This is a reminder that the monthly audit form for <strong>${areaName}</strong> is now open for ${month}.</p>
              <p>Please complete your audit responses by the end of the month.</p>
              <p style="text-align: center;">
                <a href="${formUrl}" class="button">Complete Audit Form</a>
              </p>
              <p>If you have any questions or concerns, please contact your administrator.</p>
            </div>
            <div class="footer">
              <p>This is an automated reminder. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hello ${userName},

This is a reminder that the monthly audit form for ${areaName} is now open for ${month}.

Please complete your audit responses by the end of the month.

Complete the form here: ${formUrl}

If you have any questions or concerns, please contact your administrator.

This is an automated reminder. Please do not reply to this email.
    `
  };
};

export const getMidMonthReminderEmail = ({ userName, areaName, month }: EmailTemplateProps) => {
  const formUrl = `${APP_URL}?area=${encodeURIComponent(areaName)}`;

  return {
    subject: `Reminder: Monthly Audit - ${areaName} (${month})`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background-color: #ff9800; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Half Month Remaining - ${month}</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>This is a friendly reminder that you have approximately <strong>15 days remaining</strong> to complete your monthly audit form for <strong>${areaName}</strong>.</p>
              <p>If you haven't completed it yet, please take a few minutes to do so now.</p>
              <p style="text-align: center;">
                <a href="${formUrl}" class="button">Complete Audit Form</a>
              </p>
              <p>Thank you for your attention to this important task.</p>
            </div>
            <div class="footer">
              <p>This is an automated reminder. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hello ${userName},

This is a friendly reminder that you have approximately 15 days remaining to complete your monthly audit form for ${areaName}.

If you haven't completed it yet, please take a few minutes to do so now.

Complete the form here: ${formUrl}

Thank you for your attention to this important task.

This is an automated reminder. Please do not reply to this email.
    `
  };
};

export const getFinalReminderEmail = ({ userName, areaName, month, daysRemaining = 5 }: EmailTemplateProps) => {
  const formUrl = `${APP_URL}?area=${encodeURIComponent(areaName)}`;

  return {
    subject: `FINAL REMINDER: Monthly Audit Due Soon - ${areaName} (${month})`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #d32f2f; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .urgent { background-color: #fff3cd; border-left: 4px solid #d32f2f; padding: 15px; margin: 15px 0; }
            .button { display: inline-block; padding: 12px 24px; background-color: #d32f2f; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ FINAL REMINDER - ${month}</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <div class="urgent">
                <strong>URGENT:</strong> You have only <strong>${daysRemaining} days remaining</strong> to complete your monthly audit form for <strong>${areaName}</strong>.
              </div>
              <p>Please complete this form as soon as possible to ensure compliance with audit requirements.</p>
              <p style="text-align: center;">
                <a href="${formUrl}" class="button">Complete Audit Form NOW</a>
              </p>
              <p>If you are unable to complete this audit or have any questions, please contact your administrator immediately.</p>
            </div>
            <div class="footer">
              <p>This is an automated reminder. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
⚠️ FINAL REMINDER - ${month}

Hello ${userName},

URGENT: You have only ${daysRemaining} days remaining to complete your monthly audit form for ${areaName}.

Please complete this form as soon as possible to ensure compliance with audit requirements.

Complete the form here: ${formUrl}

If you are unable to complete this audit or have any questions, please contact your administrator immediately.

This is an automated reminder. Please do not reply to this email.
    `
  };
};
