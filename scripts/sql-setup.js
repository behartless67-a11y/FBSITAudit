const https = require('https');

const supabaseUrl = 'rzqvkwallkbymarqowzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6cXZrd2FsbGtieW1hcnFvd3piIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUzMzIwNSwiZXhwIjoyMDc4MTA5MjA1fQ.Xtn7BgoiggAcxiI26HYMjXXXW3a6iAqGjEunLal2hTE';

const sql = `
-- Create user_area_assignments table
CREATE TABLE IF NOT EXISTS user_area_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  area_id TEXT NOT NULL,
  area_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_user_area UNIQUE (user_id, area_id)
);

CREATE INDEX IF NOT EXISTS idx_user_area_active ON user_area_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_user_area_area_id ON user_area_assignments(area_id);
CREATE INDEX IF NOT EXISTS idx_user_area_email ON user_area_assignments(user_email);

ALTER TABLE user_area_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations for user_area_assignments" ON user_area_assignments;
CREATE POLICY "Allow all operations for user_area_assignments" ON user_area_assignments FOR ALL USING (true) WITH CHECK (true);

-- Create email_reminders table
CREATE TABLE IF NOT EXISTS email_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  area_id TEXT NOT NULL,
  month TEXT NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('first', 'mid_month', 'final')),
  reminder_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_reminder UNIQUE (user_id, area_id, month, reminder_type)
);

CREATE INDEX IF NOT EXISTS idx_email_reminders_month ON email_reminders(month);
CREATE INDEX IF NOT EXISTS idx_email_reminders_type ON email_reminders(reminder_type);

ALTER TABLE email_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations for email_reminders" ON email_reminders;
CREATE POLICY "Allow all operations for email_reminders" ON email_reminders FOR ALL USING (true) WITH CHECK (true);
`;

console.log('═══════════════════════════════════════════════════');
console.log('📋 MANUAL DATABASE SETUP REQUIRED');
console.log('═══════════════════════════════════════════════════\n');
console.log('Automated table creation via API is not available.');
console.log('Please follow these steps to create the tables:\n');
console.log('STEP 1: Open Supabase SQL Editor');
console.log('────────────────────────────────────────────────────');
console.log(`https://supabase.com/dashboard/project/rzqvkwallkbymarqowzb/sql/new\n`);
console.log('STEP 2: Copy the SQL below');
console.log('────────────────────────────────────────────────────');
console.log(sql);
console.log('────────────────────────────────────────────────────\n');
console.log('STEP 3: Paste into SQL Editor and click "Run"\n');
console.log('═══════════════════════════════════════════════════\n');
console.log('Alternatively, you can copy from:');
console.log('  database/user-assignments.sql\n');
