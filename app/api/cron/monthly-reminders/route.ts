import { NextResponse } from 'next/server';

/**
 * Cron job endpoint for sending monthly audit reminders
 *
 * This endpoint should be called by a scheduler (e.g., Vercel Cron, GitHub Actions, etc.)
 * at specific times of the month:
 *
 * - Day 1: First reminder (monthly audit is open)
 * - Day 15: Mid-month reminder (half month remaining)
 * - Day 25: Final reminder (5 days remaining)
 *
 * Usage with Vercel Cron (add to vercel.json):
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/monthly-reminders?type=first",
 *       "schedule": "0 9 1 * *"
 *     },
 *     {
 *       "path": "/api/cron/monthly-reminders?type=mid_month",
 *       "schedule": "0 9 15 * *"
 *     },
 *     {
 *       "path": "/api/cron/monthly-reminders?type=final",
 *       "schedule": "0 9 25 * *"
 *     }
 *   ]
 * }
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reminderType = searchParams.get('type') || 'first';

    // Verify authorization (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate reminder type
    if (!['first', 'mid_month', 'final'].includes(reminderType)) {
      return NextResponse.json(
        { error: 'Invalid reminder type. Must be: first, mid_month, or final' },
        { status: 400 }
      );
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    // Call the send reminders API
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/reminders/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reminderType,
        month: currentMonth,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Failed to send reminders:', result);
      return NextResponse.json(
        { error: 'Failed to send reminders', details: result },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reminderType,
      month: currentMonth,
      result,
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
