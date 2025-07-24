-- ========================================
-- SUPABASE CONFIGURATION VERIFICATION
-- ========================================
-- Run this script in your Supabase SQL editor to verify
-- that everything is configured correctly for the AI call system

-- 1. CHECK IF TABLES EXIST
-- ========================================
SELECT 
  table_name,
  table_type,
  'exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('call_results', 'profiles', 'favorites');

-- 2. VERIFY CALL_RESULTS TABLE STRUCTURE
-- ========================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'call_results' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. CHECK INDEXES FOR PERFORMANCE
-- ========================================
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'call_results'
  AND schemaname = 'public';

-- 4. VERIFY ROW LEVEL SECURITY (RLS)
-- ========================================
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  'call_results table RLS status' as description
FROM pg_tables 
WHERE tablename = 'call_results'
  AND schemaname = 'public';

-- 5. CHECK RLS POLICIES
-- ========================================
SELECT 
  policyname,
  cmd as command_type,
  qual as policy_expression,
  with_check
FROM pg_policies 
WHERE tablename = 'call_results'
  AND schemaname = 'public';

-- 6. VERIFY AUTHENTICATION SETUP
-- ========================================
-- Check if auth schema exists
SELECT 
  schema_name,
  'auth schema exists' as status
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- Check auth.users table
SELECT 
  table_name,
  'auth.users table exists' as status
FROM information_schema.tables 
WHERE table_schema = 'auth' 
  AND table_name = 'users';

-- 7. TEST SERVICE ROLE ACCESS
-- ========================================
-- This should work if service role is configured correctly
-- (This will show current user - should be 'service_role' when run via service key)
SELECT 
  current_user as current_role,
  session_user as session_user,
  'service role check' as description;

-- 8. CHECK TRIGGERS AND FUNCTIONS
-- ========================================
-- Verify updated_at trigger function exists
SELECT 
  routine_name,
  routine_type,
  'function exists' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'update_updated_at_column';

-- Check if trigger exists on call_results
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  'trigger exists' as status
FROM information_schema.triggers 
WHERE event_object_table = 'call_results'
  AND trigger_schema = 'public';

-- 9. SAMPLE DATA CHECK
-- ========================================
-- Check if there's any test data
SELECT 
  count(*) as total_call_results,
  count(DISTINCT user_id) as unique_users,
  count(CASE WHEN status = 'completed' THEN 1 END) as completed_calls,
  count(CASE WHEN status = 'pending' THEN 1 END) as pending_calls,
  'data summary' as description
FROM call_results;

-- Recent call results (last 10)
SELECT 
  call_id,
  provider_npi,
  status,
  availability_status,
  created_at,
  'recent calls' as description
FROM call_results 
ORDER BY created_at DESC 
LIMIT 10;

-- 10. ENVIRONMENT VALIDATION
-- ========================================
-- Check if we can insert a test record (will be rolled back)
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Try to find an existing user first
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    -- If no users exist, try the test user ID, or skip the test
    IF test_user_id IS NULL THEN
        -- Check if our test user exists
        SELECT id INTO test_user_id FROM auth.users 
        WHERE id = '00000000-0000-0000-0000-000000000000';
        
        IF test_user_id IS NULL THEN
            RAISE NOTICE 'No users found in auth.users - skipping insert test';
            RAISE NOTICE 'Run fix-call-results-issues.sql first to create a test user';
            RETURN;
        END IF;
    END IF;
    
    -- Perform the test insert
    BEGIN
        INSERT INTO call_results (
            call_id, 
            provider_npi, 
            status, 
            user_id
        ) VALUES (
            'test_config_check', 
            '1234567890', 
            'pending', 
            test_user_id
        );
        
        RAISE NOTICE 'Test insert successful - Database write permissions work';
        
        -- Clean up the test record
        DELETE FROM call_results WHERE call_id = 'test_config_check';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Test insert failed: %', SQLERRM;
    END;
END $$;

-- 11. WEBHOOK INTEGRATION CHECK
-- ========================================
-- Check for any webhook-related data patterns
SELECT 
  count(CASE WHEN call_id LIKE 'omnidim_%' THEN 1 END) as omnidim_calls,
  count(CASE WHEN call_id LIKE 'test_%' THEN 1 END) as test_calls,
  count(CASE WHEN call_id LIKE 'mock_%' THEN 1 END) as mock_calls,
  'call pattern analysis' as description
FROM call_results;

-- 12. CONFIGURATION SUMMARY
-- ========================================
-- Final summary of configuration status
SELECT 
  'CONFIGURATION SUMMARY' as section,
  '===================' as separator;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'call_results') 
    THEN '✅ call_results table exists'
    ELSE '❌ call_results table missing'
  END as table_check;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'call_results' AND rowsecurity = true)
    THEN '✅ RLS enabled on call_results'
    ELSE '❌ RLS not enabled on call_results'
  END as rls_check;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'call_results')
    THEN '✅ RLS policies configured'
    ELSE '❌ No RLS policies found'
  END as policy_check;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE event_object_table = 'call_results')
    THEN '✅ Triggers configured'
    ELSE '❌ No triggers found'
  END as trigger_check;

-- 13. TROUBLESHOOTING QUERIES
-- ========================================
-- If there are issues, these queries help debug

-- Check for permission errors
SELECT 
  grantee,
  privilege_type,
  'table permissions' as description
FROM information_schema.role_table_grants 
WHERE table_name = 'call_results'
  AND table_schema = 'public';

-- Check database version
SELECT version() as postgres_version;

-- Check if extensions are enabled
SELECT 
  extname as extension_name,
  'enabled extension' as status
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- ========================================
-- INSTRUCTIONS:
-- ========================================
-- 1. Copy this entire SQL script
-- 2. Go to your Supabase dashboard
-- 3. Navigate to SQL Editor
-- 4. Paste and run this script
-- 5. Review all output sections
-- 6. Look for any ❌ (failed) checks
-- 7. If everything shows ✅, your config is correct!
--
-- EXPECTED RESULTS:
-- - call_results table should exist with proper columns
-- - RLS should be enabled with proper policies
-- - Indexes should exist for performance
-- - Service role should have access
-- - Triggers should be working for updated_at
-- ========================================