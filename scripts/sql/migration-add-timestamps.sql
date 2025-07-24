-- ========================================
-- MIGRATION: Add Timestamp Columns to call_results
-- ========================================
-- This migration adds created_at and updated_at columns
-- to existing call_results tables that might be missing them

-- Start transaction
BEGIN;

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_results' 
        AND column_name = 'created_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE call_results 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Added created_at column to call_results table';
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_results' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE call_results 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        RAISE NOTICE 'Added updated_at column to call_results table';
    END IF;
END $$;

-- Update existing records to have timestamps
UPDATE call_results 
SET 
    created_at = COALESCE(created_at, NOW()),
    updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_call_results_created_at ON call_results(created_at);
CREATE INDEX IF NOT EXISTS idx_call_results_updated_at ON call_results(updated_at);

-- Create or replace the trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS update_call_results_updated_at ON call_results;
CREATE TRIGGER update_call_results_updated_at
    BEFORE UPDATE ON call_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commit transaction
COMMIT;

-- Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'call_results' 
    AND table_schema = 'public'
    AND column_name IN ('created_at', 'updated_at')
ORDER BY column_name;