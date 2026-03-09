-- Migration: Create all 6 tables for kpeachgirl model directory
-- Run order: 1 of 4

-- =============================================================================
-- 1. profiles
-- =============================================================================
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  region text,
  parent_region text,
  bio text,
  types text[],
  compensation text[],
  verified boolean DEFAULT false,
  vacation boolean DEFAULT false,
  experience text,
  profile_image text,
  profile_image_crop jsonb,
  cover_image text,
  cover_image_crop jsonb,
  attributes jsonb,
  sort_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================================
-- 2. gallery_images
-- =============================================================================
CREATE TABLE gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  crop jsonb,
  sort_order integer,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- 3. groups
-- =============================================================================
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  bio text,
  badge_label text,
  image text,
  member_ids uuid[],
  types text[],
  compensation text[],
  attributes jsonb,
  sort_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================================
-- 4. group_gallery_images
-- =============================================================================
CREATE TABLE group_gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order integer,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- 5. submissions
-- =============================================================================
CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_data jsonb NOT NULL,
  status text DEFAULT 'new',
  id_photo_url text,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- 6. site_config
-- =============================================================================
CREATE TABLE site_config (
  id text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- =============================================================================
-- updated_at trigger function
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_groups
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_site_config
  BEFORE UPDATE ON site_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
