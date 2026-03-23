-- Page views tracking for analytics dashboard
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  visitor_id text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pv_created ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pv_visitor ON page_views (visitor_id);
CREATE INDEX IF NOT EXISTS idx_pv_path ON page_views (path);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (tracking pixel)
CREATE POLICY "anon_insert_pv" ON page_views
  FOR INSERT TO anon WITH CHECK (true);

-- Authenticated (admin) can read
CREATE POLICY "auth_read_pv" ON page_views
  FOR SELECT TO authenticated USING (true);

-- Service role can read (API routes)
CREATE POLICY "service_read_pv" ON page_views
  FOR SELECT TO service_role USING (true);
