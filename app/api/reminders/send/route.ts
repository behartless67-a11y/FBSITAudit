import { NextResponse } from 'next/server';
import { getPool } from '@/lib/azure-sql';
import { resend, FROM_EMAIL } from '@/lib/email/resend-client';
import {
  getFirstReminderEmail,
  getMidMonthReminderEmail,
  getFinalReminderEmail,
} from '@/lib/email/templates';

type ReminderType = 'first' | 'mid_month' | 'final';

interface UserAssignment {
  user_id: string;
  user_name: string;
  user_email: string;
  area_id: string;
  area_name: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reminderType, month } = body as { reminderType?: ReminderType; month?: string };

    // Validate inputs
    if (!reminderType || !['first', 'mid_month', 'final'].includes(reminderType)) {
      return NextResponse.json(
        { error: 'Invalid reminder type. Must be: first, mid_month, or final' },
        { status: 400 }
      );
    }

    const targetMonth = month || new Date().toISOString().slice(0, 7); // Format: YYYY-MM

    const pool = await getPool();

    // Get all active user assignments
    const assignmentsResult = await pool.request().query(`
      SELECT user_id, user_name, user_email, area_id, area_name
      FROM user_area_assignments
      WHERE is_active = 1
    `);

    const assignments = assignmentsResult.recordset as UserAssignment[];

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({
        message: 'No active user assignments found',
        sent: 0,
      });
    }

    const emailsSent: string[] = [];
    const emailsFailed: string[] = [];

    // Process each assignment
    for (const assignment of assignments) {
      try {
        // Check if reminder was already sent
        const reminderCheck = await pool.request()
          .input('user_id', assignment.user_id)
          .input('area_id', assignment.area_id)
          .input('month', targetMonth)
          .input('reminder_type', reminderType)
          .query(`
            SELECT id FROM email_reminders
            WHERE user_id = @user_id AND area_id = @area_id AND month = @month AND reminder_type = @reminder_type
          `);

        if (reminderCheck.recordset.length > 0) {
          console.log(
            `Reminder already sent to ${assignment.user_email} for ${assignment.area_name} (${reminderType})`
          );
          continue;
        }

        // Check if audit was already submitted for this month
        const responseCheck = await pool.request()
          .input('user_id', assignment.user_id)
          .input('area_id', assignment.area_id)
          .input('month', targetMonth)
          .query(`
            SELECT id FROM audit_responses
            WHERE user_id = @user_id AND area_id = @area_id AND month = @month
          `);

        if (responseCheck.recordset.length > 0) {
          console.log(
            `Audit already submitted by ${assignment.user_email} for ${assignment.area_name}`
          );
          continue;
        }

        // Generate email content based on reminder type
        let emailContent;
        switch (reminderType) {
          case 'first':
            emailContent = getFirstReminderEmail({
              userName: assignment.user_name,
              areaName: assignment.area_name,
              month: targetMonth,
            });
            break;
          case 'mid_month':
            emailContent = getMidMonthReminderEmail({
              userName: assignment.user_name,
              areaName: assignment.area_name,
              month: targetMonth,
            });
            break;
          case 'final':
            emailContent = getFinalReminderEmail({
              userName: assignment.user_name,
              areaName: assignment.area_name,
              month: targetMonth,
              daysRemaining: 5,
            });
            break;
        }

        // Send email using Resend
        const { error: emailError } = await resend.emails.send({
          from: FROM_EMAIL,
          to: assignment.user_email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        if (emailError) {
          console.error(`Failed to send email to ${assignment.user_email}:`, emailError);
          emailsFailed.push(assignment.user_email);
          continue;
        }

        // Record that reminder was sent
        await pool.request()
          .input('user_id', assignment.user_id)
          .input('user_email', assignment.user_email)
          .input('area_id', assignment.area_id)
          .input('month', targetMonth)
          .input('reminder_type', reminderType)
          .query(`
            INSERT INTO email_reminders (user_id, user_email, area_id, month, reminder_type)
            VALUES (@user_id, @user_email, @area_id, @month, @reminder_type)
          `);

        emailsSent.push(assignment.user_email);
        console.log(`Reminder sent to ${assignment.user_email} for ${assignment.area_name}`);
      } catch (error) {
        console.error(`Error processing assignment for ${assignment.user_email}:`, error);
        emailsFailed.push(assignment.user_email);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${emailsSent.length} ${reminderType} reminders for ${targetMonth}`,
      sent: emailsSent.length,
      failed: emailsFailed.length,
      emailsSent,
      emailsFailed,
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
