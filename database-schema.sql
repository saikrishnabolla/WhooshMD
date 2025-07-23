-- Call Results Table for storing AI-generated call verification data
-- This table should be created in your Supabase database

CREATE TABLE IF NOT EXISTS call_results (
  id SERIAL,
  call_id VARCHAR(50) PRIMARY KEY,
  provider_npi VARCHAR(10) NOT NULL,
  phone_number VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  availability_status TEXT,
  availability_details TEXT,
  summary TEXT,
  sentiment VARCHAR(20),
  call_date TIMESTAMP WITH TIME ZONE,
  recording_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_call_results_call_id ON call_results(call_id);
CREATE INDEX IF NOT EXISTS idx_call_results_provider_npi ON call_results(provider_npi);
CREATE INDEX IF NOT EXISTS idx_call_results_user_id ON call_results(user_id);
CREATE INDEX IF NOT EXISTS idx_call_results_status ON call_results(status);
CREATE INDEX IF NOT EXISTS idx_call_results_created_at ON call_results(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE call_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own call results
CREATE POLICY "Users can view own call results" ON call_results
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own call results
CREATE POLICY "Users can insert own call results" ON call_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own call results
CREATE POLICY "Users can update own call results" ON call_results
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role to access all records (for webhook updates)
CREATE POLICY "Service role full access" ON call_results
  FOR ALL USING (auth.role() = 'service_role');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_call_results_updated_at
    BEFORE UPDATE ON call_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Example usage:
-- INSERT INTO call_results (provider_npi, phone_number, status, user_id) 
-- VALUES ('1234567890', '+15551234567', 'calling', auth.uid());