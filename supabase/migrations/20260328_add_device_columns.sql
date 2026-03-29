-- Add device/browser info columns to page_views
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS device_type text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS browser text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS os text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS language text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS screen text;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS timezone text;
