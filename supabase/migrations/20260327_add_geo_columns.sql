-- Add geolocation columns to page_views
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS country text;
CREATE INDEX IF NOT EXISTS idx_pv_city ON page_views (city);
CREATE INDEX IF NOT EXISTS idx_pv_region ON page_views (region);
CREATE INDEX IF NOT EXISTS idx_pv_country ON page_views (country);
