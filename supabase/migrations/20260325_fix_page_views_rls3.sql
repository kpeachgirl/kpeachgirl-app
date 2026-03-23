-- Drop all existing policies on page_views
DROP POLICY IF EXISTS "anon_insert_pv" ON page_views;
DROP POLICY IF EXISTS "auth_read_pv" ON page_views;
DROP POLICY IF EXISTS "service_read_pv" ON page_views;
DROP POLICY IF EXISTS "public_insert_pv" ON page_views;
DROP POLICY IF EXISTS "allow_anon_insert" ON page_views;

-- Disable and re-enable RLS to reset
ALTER TABLE page_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow all inserts (tracking is anonymous)
CREATE POLICY "page_views_insert" ON page_views
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

-- Allow admin reads
CREATE POLICY "page_views_select" ON page_views
  FOR SELECT
  TO authenticated, service_role
  USING (true);
