-- Migration: Create 4 storage buckets and storage.objects RLS policies
-- Run order: 3 of 4

-- =============================================================================
-- Create storage buckets
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('profile-images', 'profile-images', true),
  ('cover-images', 'cover-images', true),
  ('gallery-images', 'gallery-images', true),
  ('submissions', 'submissions', false);

-- =============================================================================
-- Storage policies on storage.objects
-- =============================================================================

-- 1. Public bucket reads (anon + authenticated can SELECT from public buckets)
CREATE POLICY storage_public_bucket_select ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('profile-images', 'cover-images', 'gallery-images'));

-- 2. Admin upload to public buckets
CREATE POLICY storage_admin_insert_public ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('profile-images', 'cover-images', 'gallery-images')
    AND (auth.jwt() ->> 'is_admin')::boolean = true
  );

-- 3. Admin update objects in public buckets
CREATE POLICY storage_admin_update_public ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('profile-images', 'cover-images', 'gallery-images')
    AND (auth.jwt() ->> 'is_admin')::boolean = true
  )
  WITH CHECK (
    bucket_id IN ('profile-images', 'cover-images', 'gallery-images')
    AND (auth.jwt() ->> 'is_admin')::boolean = true
  );

-- 4. Admin delete from public buckets
CREATE POLICY storage_admin_delete_public ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('profile-images', 'cover-images', 'gallery-images')
    AND (auth.jwt() ->> 'is_admin')::boolean = true
  );

-- 5. Submissions: anon upload (for membership form ID photo)
CREATE POLICY storage_submissions_anon_insert ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'submissions');

-- 6. Submissions: admin read
CREATE POLICY storage_submissions_admin_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'submissions'
    AND (auth.jwt() ->> 'is_admin')::boolean = true
  );

-- 7. Submissions: admin delete
CREATE POLICY storage_submissions_admin_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'submissions'
    AND (auth.jwt() ->> 'is_admin')::boolean = true
  );
