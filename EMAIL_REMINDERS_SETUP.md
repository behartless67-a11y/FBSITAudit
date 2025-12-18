# Email Reminder System Setup Guide

This guide explains how to set up and use the automated email reminder system for monthly audits.

## Overview

The system sends three types of reminders each month:
- **First Reminder** (Day 1): Monthly audit is now open
- **Mid-Month Reminder** (Day 15): Half month remaining to complete
- **Final Reminder** (Day 25): 5 days remaining to complete

## Prerequisites

1. **Resend Account** (recommended free tier)
2. **Supabase Database** (already configured)
3. **User Assignments** configured in the database

---

## Step 1: Set Up Resend

### 1.1 Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 1.2 Get API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys**
3. Click **Create API Key**
4. Give it a name (e.g., "Audit Form Reminders")
5. Copy the API key

### 1.3 Configure Domain (Optional but Recommended)

For production, you should verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records provided by Resend to your domain
5. Wait for verification (usually takes a few minutes)

For development/testing, you can use Resend's test domain.

---

## Step 2: Configure Environment Variables

### 2.1 Update `.env.local`

Add the following to your `.env.local` file:

```env
# Resend Email Configuration
RESEND_API_KEY=re_your_actual_api_key_here
FROM_EMAIL=noreply@yourdomain.com
APP_URL=http://localhost:3000

# Optional: Cron job secret for security
CRON_SECRET=your_random_secret_here
```

### 2.2 For Production (Vercel)

Add these environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - `RESEND_API_KEY`: Your Resend API key
   - `FROM_EMAIL`: Your verified sender email (e.g., `noreply@yourdomain.com`)
   - `APP_URL`: Your production URL (e.g., `https://yourapp.vercel.app`)
   - `CRON_SECRET`: A random secret string for security

---

## Step 3: Set Up Database Tables

### 3.1 Run SQL in Supabase

1. Log in to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the contents of `database/user-assignments.sql`

This creates two tables:
- `user_area_assignments`: Stores which users are responsible for which areas
- `email_reminders`: Tracks which reminders have been sent

---

## Step 4: Add User Assignments

You need to assign users to areas so they receive reminders.

### 4.1 Option A: Using the API

Make a POST request to `/api/assignments`:

```bash
curl -X POST http://localhost:3000/api/assignments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user1",
    "userName": "John Doe",
    "userEmail": "john.doe@example.com",
    "areaId": "desktop-client-user",
    "areaName": "Desktop/Client/User"
  }'
```

### 4.2 Option B: Direct Database Insert

In Supabase SQL Editor:

```sql
INSERT INTO user_area_assignments (user_id, user_name, user_email, area_id, area_name)
VALUES
  ('user1', 'John Doe', 'john.doe@example.com', 'desktop-client-user', 'Desktop/Client/User'),
  ('user2', 'Jane Smith', 'jane.smith@example.com', 'data-analytics', 'Data and Analytics'),
  ('user3', 'Bob Johnson', 'bob.johnson@example.com', 'school-systems', 'School Systems');
```

### 4.3 Available Area IDs

- `desktop-client-user` - Desktop/Client/User
- `data-analytics` - Data and Analytics
- `school-systems` - School Systems

---

## Step 5: Test Email Sending

### 5.1 Manual Test

You can manually trigger reminders for testing:

```bash
# Send first reminder
curl -X POST http://localhost:3000/api/reminders/send \
  -H "Content-Type: application/json" \
  -d '{
    "reminderType": "first",
    "month": "2025-01"
  }'

# Send mid-month reminder
curl -X POST http://localhost:3000/api/reminders/send \
  -H "Content-Type: application/json" \
  -d '{
    "reminderType": "mid_month",
    "month": "2025-01"
  }'

# Send final reminder
curl -X POST http://localhost:3000/api/reminders/send \
  -H "Content-Type: application/json" \
  -d '{
    "reminderType": "final",
    "month": "2025-01"
  }'
```

---

## Step 6: Configure Automated Scheduling

### 6.1 For Vercel Deployment

The `vercel.json` file is already configured with cron jobs:

- **Day 1 at 9:00 AM**: First reminder
- **Day 15 at 9:00 AM**: Mid-month reminder
- **Day 25 at 9:00 AM**: Final reminder

Deploy to Vercel and the cron jobs will automatically run.

### 6.2 For Other Platforms

If not using Vercel, you can use:

#### GitHub Actions (recommended for Azure/AWS)

Create `.github/workflows/monthly-reminders.yml`:

```yaml
name: Monthly Audit Reminders

on:
  schedule:
    # First reminder - 1st day of month at 9:00 AM UTC
    - cron: '0 9 1 * *'
    # Mid-month reminder - 15th day at 9:00 AM UTC
    - cron: '0 9 15 * *'
    # Final reminder - 25th day at 9:00 AM UTC
    - cron: '0 9 25 * *'

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Determine reminder type
        id: type
        run: |
          DAY=$(date +%d)
          if [ "$DAY" = "01" ]; then
            echo "type=first" >> $GITHUB_OUTPUT
          elif [ "$DAY" = "15" ]; then
            echo "type=mid_month" >> $GITHUB_OUTPUT
          else
            echo "type=final" >> $GITHUB_OUTPUT
          fi

      - name: Send reminders
        run: |
          curl -X GET "${{ secrets.APP_URL }}/api/cron/monthly-reminders?type=${{ steps.type.outputs.type }}" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Add secrets in GitHub repository settings:
- `APP_URL`: Your production URL
- `CRON_SECRET`: Same secret as in environment variables

---

## How It Works

### Reminder Logic

1. **Checks User Assignments**: Fetches all active user-area assignments
2. **Checks for Duplicates**: Skips if reminder was already sent this month
3. **Checks Completion**: Skips if user already submitted audit for the month
4. **Sends Email**: Uses Resend to send personalized email
5. **Records Reminder**: Saves to `email_reminders` table to prevent duplicates

### Email Content

Each reminder type has a different template:

- **First Reminder**: Friendly notification that audit is open (blue theme)
- **Mid-Month Reminder**: Gentle reminder with days remaining (orange theme)
- **Final Reminder**: Urgent reminder to complete soon (red theme)

All emails include:
- Personalized greeting with user's name
- Area name they're responsible for
- Direct link to the audit form
- Professional HTML and plain text versions

---

## Managing User Assignments

### View All Assignments

```bash
curl http://localhost:3000/api/assignments
```

### Deactivate Assignment

```bash
curl -X DELETE "http://localhost:3000/api/assignments?id=ASSIGNMENT_ID"
```

---

## Troubleshooting

### Emails Not Sending

1. **Check Resend API Key**: Ensure it's correct in environment variables
2. **Check Domain**: If using custom domain, ensure it's verified in Resend
3. **Check Logs**: Look at application logs for error messages
4. **Test Resend**: Try sending a test email from Resend dashboard

### Duplicate Emails

- The system prevents duplicates by checking the `email_reminders` table
- If you need to resend, delete the record from `email_reminders` table

### No Reminders Received

1. **Check User Assignments**: Ensure users are assigned to areas
2. **Check Email Address**: Verify email addresses are correct
3. **Check Spam Folder**: Emails might be filtered as spam
4. **Check Audit Completion**: System skips users who already completed audit

### Cron Jobs Not Running

- **Vercel**: Check cron logs in Vercel dashboard
- **GitHub Actions**: Check workflow runs in GitHub Actions tab
- **Manual Trigger**: Test manually using the API endpoints

---

## Security Best Practices

1. **Use CRON_SECRET**: Add authorization to cron endpoints
2. **Verify Domain**: Use verified domain in production
3. **Rate Limiting**: Consider adding rate limiting to API endpoints
4. **Monitor Logs**: Regularly check logs for suspicious activity
5. **Rotate Keys**: Periodically rotate your Resend API key

---

## Next Steps

1. Set up Resend account and get API key
2. Configure environment variables
3. Run database migrations
4. Add user assignments
5. Test email sending manually
6. Deploy to production
7. Verify cron jobs are running

For questions or issues, refer to:
- [Resend Documentation](https://resend.com/docs)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Supabase Documentation](https://supabase.com/docs)
