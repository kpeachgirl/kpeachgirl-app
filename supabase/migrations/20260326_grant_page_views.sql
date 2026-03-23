-- Grant table-level permissions (RLS policies alone aren't enough)
GRANT INSERT ON page_views TO anon;
GRANT SELECT ON page_views TO authenticated;
GRANT ALL ON page_views TO service_role;
