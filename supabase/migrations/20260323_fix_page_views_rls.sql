-- Fix RLS: allow public (anon) to insert page views
DROP POLICY IF EXISTS "anon_insert_pv" ON page_views;
CREATE POLICY "public_insert_pv" ON page_views
  FOR INSERT TO public WITH CHECK (true);
