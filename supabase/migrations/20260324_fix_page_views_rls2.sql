-- Fix: grant anon role insert access
DROP POLICY IF EXISTS "public_insert_pv" ON page_views;

-- Supabase anon role needs explicit policy
CREATE POLICY "allow_anon_insert" ON page_views
  FOR INSERT WITH CHECK (true);
