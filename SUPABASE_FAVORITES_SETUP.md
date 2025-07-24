# Supabase Favorites Setup Guide

This guide will help you migrate user favorites from localStorage to Supabase database.

## Prerequisites

- Supabase project already set up (which you have)
- Environment variables configured in `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```

## Setup Steps

### 1. Execute the SQL Schema

Run the SQL file in your Supabase SQL Editor:

```bash
# Open your Supabase dashboard
# Go to SQL Editor
# Copy and paste the content from favorites-schema.sql
# Click "Run"
```

Or directly execute the `favorites-schema.sql` file in your Supabase dashboard.

### 2. Verify Table Creation

After running the SQL, verify the table was created:

```sql
-- Check if the table exists
SELECT * FROM favorites LIMIT 1;

-- Check table structure
\d favorites;
```

### 3. Test the Migration

The application will automatically:
- Detect existing localStorage favorites when users visit the favorites page
- Migrate them to Supabase database
- Clear localStorage after successful migration

### 4. Verify Migration

1. Open browser dev tools → Application → Local Storage
2. Look for keys like `whoosh_md_favorites_[user_id]`
3. Visit the favorites page while logged in
4. Check that localStorage keys are cleared
5. Verify data appears in Supabase dashboard

## What Changed

### Database Schema
- **Table**: `favorites`
- **Columns**:
  - `id`: UUID primary key
  - `user_id`: References auth.users(id)
  - `provider_npi`: Provider NPI number
  - `provider_data`: JSONB containing full favorite data
  - `created_at`, `updated_at`: Timestamps

### Code Changes
- **New service**: `services/favorites.ts` - Handles all Supabase operations
- **Updated components**:
  - `pages/Favorites.tsx` - Now loads from Supabase with loading states
  - `components/ProviderCard.tsx` - Uses async favorites operations
  - `components/ProviderDetail.tsx` - Uses async favorites operations

### Security Features
- **Row Level Security (RLS)**: Users can only access their own favorites
- **Unique constraints**: Prevents duplicate favorites
- **Auto-migration**: Seamlessly migrates existing localStorage data

## Benefits

1. **Persistent across devices**: Favorites sync across all user devices
2. **No data loss**: Favorites persist even if browser data is cleared
3. **Better performance**: Database queries vs localStorage parsing
4. **User experience**: Loading states and error handling
5. **Scalable**: Can handle unlimited favorites per user

## Troubleshooting

### Common Issues

1. **Migration not working**:
   - Check browser console for errors
   - Verify Supabase environment variables
   - Ensure user is authenticated

2. **Favorites not loading**:
   - Check Supabase RLS policies
   - Verify table exists and has correct structure
   - Check network tab for API errors

3. **Duplicate favorites**:
   - The unique constraint should prevent this
   - If it occurs, check the constraint was created properly

### Rollback Plan

If you need to rollback to localStorage:

1. Comment out the new imports in the components
2. Uncomment the old storage service imports
3. The localStorage data should still be there (unless migration completed)

## Production Deployment

1. Run the SQL schema in your production Supabase instance
2. Deploy the updated code
3. Monitor for any migration issues
4. Users will automatically migrate on their next visit

## Notes

- Migration happens automatically on first visit to favorites page
- Each user's data migrates independently
- No downtime required for existing users
- LocalStorage data is only cleared after successful Supabase migration