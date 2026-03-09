-- =============================================================================
-- Verification script for kpeachgirl Supabase schema
-- Run this in the Supabase SQL Editor after applying all 4 migrations.
-- Each query checks a specific aspect of the schema.
-- =============================================================================

-- 1. Check all table columns exist with correct types
-- Expected: All columns from profiles, gallery_images, groups,
--           group_gallery_images, submissions, site_config
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles', 'gallery_images', 'groups',
    'group_gallery_images', 'submissions', 'site_config'
  )
ORDER BY table_name, ordinal_position;

-- 2. Check RLS policies on public schema tables
-- Expected: 4 policies per content table (select/insert/update/delete),
--           5 for submissions, 4 for site_config
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Check storage buckets exist with correct public flags
-- Expected: profile-images (public), cover-images (public),
--           gallery-images (public), submissions (private)
SELECT id, name, public
FROM storage.buckets
ORDER BY id;

-- 4. Check storage.objects RLS policies
-- Expected: 7 policies for object-level access control
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- 5. Check custom_access_token_hook function exists
-- Expected: 1 row with proname = 'custom_access_token_hook'
SELECT proname, pronamespace::regnamespace AS schema
FROM pg_proc
WHERE proname = 'custom_access_token_hook';

-- 6. Check updated_at triggers exist
-- Expected: 3 triggers (profiles, groups, site_config)
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'set_updated_at%'
ORDER BY event_object_table;
