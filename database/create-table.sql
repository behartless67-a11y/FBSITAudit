-- Create audit_responses table
CREATE TABLE IF NOT EXISTS audit_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  area_id TEXT NOT NULL,
  area_name TEXT NOT NULL,
  responses JSONB NOT NULL,
  month TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_responses_month ON audit_responses(month);
CREATE INDEX IF NOT EXISTS idx_audit_responses_area_id ON audit_responses(area_id);
CREATE INDEX IF NOT EXISTS idx_audit_responses_user_email ON audit_responses(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_responses_submitted_at ON audit_responses(submitted_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE audit_responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can restrict this later with proper auth)
CREATE POLICY "Allow all operations for audit_responses" ON audit_responses
  FOR ALL
  USING (true)
  WITH CHECK (true);
