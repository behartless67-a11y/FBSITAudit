import { AzureFunction, Context } from "@azure/functions";
import * as sql from 'mssql';
import * as sgMail from '@sendgrid/mail';

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Database configuration
const dbConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

interface PendingAudit {
  user_id: string;
  user_name: string;
  user_email: string;
  area_name: string;
  current_month: string;
}

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
  context.log('Email reminder function triggered at:', new Date().toISOString());

  try {
    // Connect to database
    const pool = await sql.connect(dbConfig);

    // Query for pending submissions
    const result = await pool.request().query<PendingAudit>(`
      SELECT user_id, user_name, user_email, area_name, current_month
      FROM v_monthly_completion_status
      WHERE status = 'Pending'
    `);

    const pendingAudits = result.recordset;
    context.log(`Found ${pendingAudits.length} pending audits`);

    if (pendingAudits.length === 0) {
      context.log('No pending audits found. Exiting.');
      return;
    }

    // Send reminders
    const emailPromises = pendingAudits.map(async (audit) => {
      try {
        // Check if we already sent a reminder this month
        const reminderCheck = await pool.request()
          .input('userId', sql.NVarChar(100), audit.user_id)
          .input('areaId', sql.NVarChar(50), audit.area_name)
          .input('month', sql.NVarChar(7), audit.current_month)
          .input('reminderType', sql.NVarChar(20), 'monthly')
          .query(`
            SELECT COUNT(*) as count
            FROM email_reminders
            WHERE user_id = @userId
              AND area_id = @areaId
              AND month = @month
              AND reminder_type = @reminderType
          `);

        if (reminderCheck.recordset[0].count > 0) {
          context.log(`Already sent reminder to ${audit.user_email} for ${audit.area_name}`);
          return;
        }

        // Send email
        const msg = {
          to: audit.user_email,
          from: process.env.FROM_EMAIL || 'noreply@virginia.edu',
          subject: `Reminder: Monthly Audit Form - ${audit.area_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #232D4B; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Monthly Audit Reminder</h1>
              </div>

              <div style="padding: 30px; background-color: #fafafa;">
                <p>Hi ${audit.user_name},</p>

                <p>This is a friendly reminder to complete your monthly audit form for:</p>

                <div style="background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #E57200;">
                  <h2 style="color: #232D4B; margin-top: 0;">${audit.area_name}</h2>
                  <p style="color: #666; margin-bottom: 0;">Month: ${audit.current_month}</p>
                </div>

                <p>Please submit your responses by the end of the month.</p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.APP_URL || 'https://your-app.azurestaticapps.net'}"
                     style="background-color: #E57200; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Complete Audit Form
                  </a>
                </div>

                <p style="color: #666; font-size: 14px;">
                  If you have any questions or issues, please contact the Batten IT team.
                </p>
              </div>

              <div style="background-color: #232D4B; color: #ccc; padding: 20px; text-align: center; font-size: 12px;">
                <p style="margin: 0;">© ${new Date().getFullYear()} Frank Batten School of Leadership and Public Policy</p>
              </div>
            </div>
          `,
        };

        await sgMail.send(msg);
        context.log(`Sent reminder to ${audit.user_email} for ${audit.area_name}`);

        // Record that we sent the reminder
        await pool.request()
          .input('userId', sql.NVarChar(100), audit.user_id)
          .input('userEmail', sql.NVarChar(200), audit.user_email)
          .input('areaId', sql.NVarChar(50), audit.area_name)
          .input('month', sql.NVarChar(7), audit.current_month)
          .input('reminderType', sql.NVarChar(20), 'monthly')
          .query(`
            INSERT INTO email_reminders (user_id, user_email, area_id, month, reminder_type)
            VALUES (@userId, @userEmail, @areaId, @month, @reminderType)
          `);

      } catch (error) {
        context.log.error(`Error sending reminder to ${audit.user_email}:`, error);
      }
    });

    await Promise.all(emailPromises);

    context.log('Email reminder function completed successfully');

  } catch (error) {
    context.log.error('Error in email reminder function:', error);
    throw error;
  }
};

export default timerTrigger;
