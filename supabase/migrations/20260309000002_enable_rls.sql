-- Migration: Enable RLS and create policies for all 6 tables
-- Run order: 2 of 4

-- =============================================================================
-- Enable RLS on all tables
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- profiles policies
-- Public read, admin-only writes
-- =============================================================================
CREATE POLICY profiles_public_select ON profiles
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY profiles_admin_insert ON profiles
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

CREATE POLICY profiles_admin_update ON profiles
  FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true)
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

CREATE POLICY profiles_admin_delete ON profiles
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true);

-- =============================================================================
-- gallery_images policies
-- Public read, admin-only writes
-- =============================================================================
CREATE POLICY gallery_images_public_select ON gallery_images
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY gallery_images_admin_insert ON gallery_images
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

CREATE POLICY gallery_images_admin_update ON gallery_images
  FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true)
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

CREATE POLICY gallery_images_admin_delete ON gallery_images
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true);

-- =============================================================================
-- groups policies
-- Public read, admin-only writes
-- =============================================================================
CREATE POLICY groups_public_select ON groups
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY groups_admin_insert ON groups
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

CREATE POLICY groups_admin_update ON groups
  FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true)
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

CREATE POLICY groups_admin_delete ON groups
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true);

-- =============================================================================
-- group_gallery_images policies
-- Public read, admin-only writes
-- =============================================================================
CREATE POLICY group_gallery_images_public_select ON group_gallery_images
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY group_gallery_images_admin_insert ON group_gallery_images
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

CREATE POLICY group_gallery_images_admin_update ON group_gallery_images
  FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true)
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

CREATE POLICY group_gallery_images_admin_delete ON group_gallery_images
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true);

-- =============================================================================
-- submissions policies
-- Admin full access, anon INSERT only (for membership form)
-- =============================================================================
CREATE POLICY submissions_admin_select ON submissions
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true);

CREATE POLICY submissions_anon_insert ON submissions
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY submissions_authenticated_insert ON submissions
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY submissions_admin_update ON submissions
  FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true)
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

CREATE POLICY submissions_admin_delete ON submissions
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true);

-- =============================================================================
-- site_config policies
-- Public read, admin-only writes
-- =============================================================================
CREATE POLICY site_config_public_select ON site_config
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY site_config_admin_insert ON site_config
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

CREATE POLICY site_config_admin_update ON site_config
  FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true)
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

CREATE POLICY site_config_admin_delete ON site_config
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true);
