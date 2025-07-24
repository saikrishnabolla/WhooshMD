-- ========================================
-- FIX CALL_RESULTS TABLE ISSUES
-- ========================================
-- This script addresses:
-- 1. Missing created_at column error
-- 2. Foreign key constraint violation in validation script

-- 1. ADD MISSING COLUMNS IF THEY DON'T EXIST
-- ========================================

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
        
        -- Update existing records to have created_at timestamp
        UPDATE call_results 
        SET created_at = NOW() 
        WHERE created_at IS NULL;
        
        RAISE NOTICE 'Added created_at column to call_results table';
    ELSE
        RAISE NOTICE 'created_at column already exists in call_results table';
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
        
        -- Update existing records to have updated_at timestamp
        UPDATE call_results 
        SET updated_at = NOW() 
        WHERE updated_at IS NULL;
        
        RAISE NOTICE 'Added updated_at column to call_results table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in call_results table';
    END IF;
END $$;

-- 2. CREATE INDEX FOR created_at IF IT DOESN'T EXIST
-- ========================================
CREATE INDEX IF NOT EXISTS idx_call_results_created_at ON call_results(created_at);

-- 3. VERIFY TABLE STRUCTURE
-- ========================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  'current column structure' as description
FROM information_schema.columns 
WHERE table_name = 'call_results' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. CREATE A TEST USER FOR VALIDATION (OPTIONAL)
-- ========================================
-- This creates a test user that can be used for validation scripts
-- Only run this if you need a test user for validation purposes

DO $$ 
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Check if we're in a Supabase environment with auth.users table
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' 
        AND table_name = 'users'
    ) THEN
        -- Insert test user if it doesn't exist
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data
        ) 
        SELECT 
            test_user_id,
            'test-validation@example.com',
            crypt('test-password', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{}'
        WHERE NOT EXISTS (
            SELECT 1 FROM auth.users WHERE id = test_user_id
        );
        
        RAISE NOTICE 'Test user setup completed for validation purposes';
    ELSE
        RAISE NOTICE 'auth.users table not found - skipping test user creation';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not create test user (this is normal in some environments): %', SQLERRM;
END $$;

-- 5. TEST THE FIXED QUERY
-- ========================================
-- This should now work without errors

SELECT 
  call_id,
  provider_npi,
  status,
  availability_status,
  created_at,
  'recent calls test' as description
FROM call_results 
ORDER BY created_at DESC 
LIMIT 10;

-- 6. SUMMARY
-- ========================================
SELECT 
  'FIXES APPLIED:' as summary,
  '- Added created_at column if missing' as fix_1,
  '- Added updated_at column if missing' as fix_2,
  '- Created test user for validation if possible' as fix_3,
  '- Query should now work without errors' as fix_4;