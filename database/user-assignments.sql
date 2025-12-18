-- Create user_area_assignments table for Supabase (PostgreSQL)
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

-- Create index for faster queries by active status
CREATE INDEX IF NOT EXISTS idx_user_area_active ON user_area_assignments(is_active);

-- Create index for faster queries by area_id
CREATE INDEX IF NOT EXISTS idx_user_area_area_id ON user_area_assignments(area_id);

-- Create index for faster queries by user_email
CREATE INDEX IF NOT EXISTS idx_user_area_email ON user_area_assignments(user_email);

-- Enable Row Level Security (RLS)
ALTER TABLE user_area_assignments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later with proper auth)
CREATE POLICY "Allow all operations for user_area_assignments" ON user_area_assignments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create email_reminders table to track sent reminders
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

-- Create index for faster queries by month
CREATE INDEX IF NOT EXISTS idx_email_reminders_month ON email_reminders(month);

-- Create index for faster queries by reminder_type
CREATE INDEX IF NOT EXISTS idx_email_reminders_type ON email_reminders(reminder_type);

-- Enable Row Level Security (RLS)
ALTER TABLE email_reminders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations for email_reminders" ON email_reminders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert sample data (you can modify this for your actual users)
-- Example:
-- INSERT INTO user_area_assignments (user_id, user_name, user_email, area_id, area_name)
-- VALUES
--   ('user1', 'John Doe', 'john.doe@example.com', 'desktop-client-user', 'Desktop/Client/User'),
--   ('user2', 'Jane Smith', 'jane.smith@example.com', 'data-analytics', 'Data and Analytics'),
--   ('user3', 'Bob Johnson', 'bob.johnson@example.com', 'school-systems', 'School Systems');
