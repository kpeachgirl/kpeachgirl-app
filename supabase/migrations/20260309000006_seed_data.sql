-- =============================================================================
-- KPEACHGIRL Seed Data
-- Extracted from ModelDirectory.jsx prototype
-- Idempotent: TRUNCATE + re-insert within transaction
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Section 1: Clear existing data for re-runnability
-- ---------------------------------------------------------------------------
TRUNCATE gallery_images, group_gallery_images, groups, profiles, submissions CASCADE;
DELETE FROM site_config;

-- ---------------------------------------------------------------------------
-- Section 2: Insert all 12 model profiles
-- ---------------------------------------------------------------------------

INSERT INTO profiles (name, slug, region, parent_region, bio, types, compensation, verified, vacation, experience, profile_image, cover_image, profile_image_crop, cover_image_crop, attributes, sort_order)
VALUES
  -- 1. Aria Novak
  (
    'Aria Novak',
    'aria-novak',
    'LA',
    'LA',
    'Six years in high fashion and editorial. Hollywood-based, available throughout LA. Vogue Italia, Harper''s Bazaar, Elle. I believe in the power of a single frame to tell an entire story — that''s what drives every shoot.',
    ARRAY['Fashion','Editorial','Portrait'],
    ARRAY['Paid Only'],
    true,
    false,
    'Professional',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&h=600&fit=crop',
    NULL,
    NULL,
    '{"age":"24","height":"5''9\"","weight":"125","bust":"34\"","waist":"24\"","hips":"35\"","hair":"Brunette","eyes":"Green","shoe":"8","dress":"4","tattoos":"Floral, left wrist","piercings":"Ears","instagram":"@arianovak"}'::jsonb,
    1
  ),
  -- 2. Jordan Reyes
  (
    'Jordan Reyes',
    'jordan-reyes',
    'West LA',
    'LA',
    'Santa Monica based. Former collegiate dancer. Athletic wear, lifestyle, and commercial campaigns are my forte. I bring energy and grace that translates through the lens.',
    ARRAY['Fitness','Commercial','Lifestyle'],
    ARRAY['Paid Only','Negotiable'],
    true,
    false,
    'Experienced',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1516641051054-9df6a1aad654?w=1400&h=600&fit=crop',
    NULL,
    NULL,
    '{"age":"28","height":"5''8\"","weight":"130","bust":"34\"","waist":"25\"","hips":"36\"","hair":"Auburn","eyes":"Hazel","shoe":"8","dress":"4","tattoos":"Delicate wrist","piercings":"None","instagram":"@jordanmiles"}'::jsonb,
    2
  ),
  -- 3. Luna Chen
  (
    'Luna Chen',
    'luna-chen',
    'OC',
    'OC',
    'Conceptual and artistic photography is my world. I bring characters to life — every shoot is a story waiting to unfold. Based in Orange County, always open to creative collaboration.',
    ARRAY['Portrait','Artistic','Cosplay'],
    ARRAY['TFP','Negotiable'],
    true,
    false,
    'Intermediate',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&h=600&fit=crop',
    NULL,
    NULL,
    '{"age":"22","height":"5''5\"","weight":"115","bust":"32\"","waist":"25\"","hips":"34\"","hair":"Black","eyes":"Dark Brown","shoe":"7","dress":"2","tattoos":"None","piercings":"Ears, nose","instagram":"@lunachen"}'::jsonb,
    3
  ),
  -- 4. Mia Rivera
  (
    'Mia Rivera',
    'mia-rivera',
    'OC',
    'OC',
    'New to modeling but not to hard work. Newport Beach energy, swimwear and beauty focus. Ready to build something real.',
    ARRAY['Swimwear','Fitness','Commercial'],
    ARRAY['TFP','Negotiable'],
    false,
    false,
    'Beginner',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1400&h=600&fit=crop',
    NULL,
    NULL,
    '{"age":"25","height":"5''7\"","weight":"125","bust":"33\"","waist":"25\"","hips":"35\"","hair":"Brown","eyes":"Hazel","shoe":"10.5","dress":"\u2014","tattoos":"Chest piece","piercings":"None","instagram":"@marcusrivera"}'::jsonb,
    4
  ),
  -- 5. Sasha Okonkwo (ON VACATION)
  (
    'Sasha Okonkwo',
    'sasha-okonkwo',
    'LA',
    'LA',
    'Runways in Paris, Milan, New York. South Bay based. Fashion that tells a story is the only kind worth making.',
    ARRAY['Fashion','Glamour','Editorial'],
    ARRAY['Paid Only'],
    true,
    true,
    'Professional',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1400&h=600&fit=crop',
    NULL,
    NULL,
    '{"age":"26","height":"5''10\"","weight":"130","bust":"34\"","waist":"25\"","hips":"36\"","hair":"Black","eyes":"Dark Brown","shoe":"9","dress":"6","tattoos":"None","piercings":"Ears","instagram":"@sashao"}'::jsonb,
    5
  ),
  -- 6. Kaia Tanaka
  (
    'Kaia Tanaka',
    'kaia-tanaka',
    'Mid-Wilshire',
    'LA',
    'DTLA Arts District. High-concept editorial and boundary-pushing art. Comfortable in any aesthetic. Let''s make something that matters.',
    ARRAY['Artistic','Editorial','Portrait'],
    ARRAY['Paid Only','Negotiable'],
    true,
    false,
    'Experienced',
    'https://images.unsplash.com/photo-1464863979621-258859e62245?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&h=600&fit=crop',
    NULL,
    NULL,
    '{"age":"27","height":"5''7\"","weight":"125","bust":"33\"","waist":"24\"","hips":"35\"","hair":"Honey Blonde","eyes":"Brown","shoe":"7.5","dress":"4","tattoos":"Small rib piece","piercings":"Ears","instagram":"@kaitanaka"}'::jsonb,
    6
  ),
  -- 7. Valentina Rossi
  (
    'Valentina Rossi',
    'valentina-rossi',
    'OC',
    'OC',
    'Laguna Beach. Swimwear and lifestyle in golden hour. Studio or location — I''m at home in front of any lens.',
    ARRAY['Swimwear','Lifestyle','Fashion'],
    ARRAY['Paid Only','Negotiable'],
    true,
    false,
    'Professional',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1400&h=600&fit=crop',
    NULL,
    NULL,
    '{"age":"23","height":"5''7\"","weight":"120","bust":"33\"","waist":"24\"","hips":"35\"","hair":"Auburn","eyes":"Blue","shoe":"7.5","dress":"4","tattoos":"Small ankle","piercings":"Ears","instagram":"@valrossi"}'::jsonb,
    7
  ),
  -- 8. Demi Moreno
  (
    'Demi Moreno',
    'demi-moreno',
    'Mid-Wilshire',
    'LA',
    'Mid-Wilshire. Acting background with improv chops. I take direction well and bring energy that''s hard to fake. Fashion-forward and fearless.',
    ARRAY['Commercial','Lifestyle','Fitness'],
    ARRAY['Negotiable','TFP'],
    false,
    false,
    'Intermediate',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=1400&h=600&fit=crop',
    NULL,
    NULL,
    '{"age":"30","height":"5''6\"","weight":"120","bust":"33\"","waist":"25\"","hips":"35\"","hair":"Dark Brown","eyes":"Brown","shoe":"7","dress":"2","tattoos":"Script behind ear","piercings":"None","instagram":"@dexmoreno"}'::jsonb,
    8
  ),
  -- 9. Priya Sharma
  (
    'Priya Sharma',
    'priya-sharma',
    'West LA',
    'LA',
    'West LA-based with roots in Mumbai. Bridging South Asian aesthetics with American commercial style. Campaign work for major beauty brands and fashion houses.',
    ARRAY['Fashion','Commercial','Editorial'],
    ARRAY['Paid Only'],
    true,
    false,
    'Professional',
    'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1400&h=600&fit=crop',
    NULL,
    NULL,
    '{"age":"25","height":"5''8\"","weight":"122","bust":"33\"","waist":"24\"","hips":"34\"","hair":"Dark Brown","eyes":"Brown","shoe":"7.5","dress":"4","tattoos":"None","piercings":"Ears","instagram":"@priyasharma"}'::jsonb,
    9
  ),
  -- 10. Elena Brooks
  (
    'Elena Brooks',
    'elena-brooks',
    'LA',
    'LA',
    'Hollywood Hills. Editorial and portrait work with a quiet intensity. I don''t just pose — I inhabit a moment. Dance and theater background informs everything I do in front of the camera.',
    ARRAY['Portrait','Editorial','Commercial'],
    ARRAY['Paid Only','Negotiable'],
    true,
    false,
    'Experienced',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1400&h=600&fit=crop',
    NULL,
    NULL,
    '{"age":"29","height":"5''9\"","weight":"128","bust":"34\"","waist":"25\"","hips":"36\"","hair":"Black","eyes":"Brown","shoe":"8","dress":"4","tattoos":"Minimal geometric","piercings":"None","instagram":"@elijahbrooks"}'::jsonb,
    10
  ),
  -- 11. Camille Dubois
  (
    'Camille Dubois',
    'camille-dubois',
    'Mid-Wilshire',
    'LA',
    'French-American. Mid-Wilshire studio regular. I bring European editorial sensibility to LA''s commercial scene. Comfortable in haute couture and streetwear alike.',
    ARRAY['Glamour','Fashion','Artistic'],
    ARRAY['Paid Only'],
    true,
    false,
    'Professional',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1516641051054-9df6a1aad654?w=1400&h=600&fit=crop',
    NULL,
    NULL,
    '{"age":"27","height":"5''10\"","weight":"128","bust":"34\"","waist":"25\"","hips":"36\"","hair":"Blonde","eyes":"Blue","shoe":"9","dress":"6","tattoos":"Behind ear","piercings":"Ears, helix","instagram":"@camilledubois"}'::jsonb,
    11
  ),
  -- 12. Naomi Vasquez
  (
    'Naomi Vasquez',
    'naomi-vasquez',
    'OC',
    'OC',
    'Orange County native. Lifestyle and beauty content creator turned model. Natural light, candid moments, and authentic energy are my signature. Let''s make content that feels real.',
    ARRAY['Lifestyle','Commercial','Fitness'],
    ARRAY['TFP','Negotiable'],
    false,
    false,
    'Beginner',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=600&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1400&h=600&fit=crop',
    NULL,
    NULL,
    '{"age":"23","height":"5''6\"","weight":"118","bust":"32\"","waist":"24\"","hips":"34\"","hair":"Curly Brown","eyes":"Green","shoe":"7","dress":"2","tattoos":"Shoulder florals","piercings":"Ear","instagram":"@nicovasquez"}'::jsonb,
    12
  );

-- ---------------------------------------------------------------------------
-- Section 3: Insert gallery images for each model
-- ---------------------------------------------------------------------------

-- Aria Novak (8 images)
INSERT INTO gallery_images (profile_id, url, sort_order)
SELECT p.id, urls.url, urls.sort_order
FROM profiles p
CROSS JOIN (VALUES
  ('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=700&fit=crop', 1),
  ('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=750&fit=crop', 2),
  ('https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=650&fit=crop', 3),
  ('https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500&h=700&fit=crop', 4),
  ('https://images.unsplash.com/photo-1496440737103-cd596325d314?w=500&h=600&fit=crop', 5),
  ('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=700&fit=crop', 6),
  ('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=750&fit=crop', 7),
  ('https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=650&fit=crop', 8)
) AS urls(url, sort_order)
WHERE p.slug = 'aria-novak';

-- Jordan Reyes (6 images)
INSERT INTO gallery_images (profile_id, url, sort_order)
SELECT p.id, urls.url, urls.sort_order
FROM profiles p
CROSS JOIN (VALUES
  ('https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&h=700&fit=crop', 1),
  ('https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=500&h=650&fit=crop', 2),
  ('https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=500&h=750&fit=crop', 3),
  ('https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&h=700&fit=crop', 4),
  ('https://images.unsplash.com/photo-1464863979621-258859e62245?w=500&h=600&fit=crop', 5),
  ('https://images.unsplash.com/photo-1551292831-023188e78222?w=500&h=700&fit=crop', 6)
) AS urls(url, sort_order)
WHERE p.slug = 'jordan-reyes';

-- Luna Chen (6 images)
INSERT INTO gallery_images (profile_id, url, sort_order)
SELECT p.id, urls.url, urls.sort_order
FROM profiles p
CROSS JOIN (VALUES
  ('https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=700&fit=crop', 1),
  ('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=750&fit=crop', 2),
  ('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=650&fit=crop', 3),
  ('https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=500&h=700&fit=crop', 4),
  ('https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=600&fit=crop', 5),
  ('https://images.unsplash.com/photo-1496440737103-cd596325d314?w=500&h=700&fit=crop', 6)
) AS urls(url, sort_order)
WHERE p.slug = 'luna-chen';

-- Mia Rivera (5 images)
INSERT INTO gallery_images (profile_id, url, sort_order)
SELECT p.id, urls.url, urls.sort_order
FROM profiles p
CROSS JOIN (VALUES
  ('https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500&h=700&fit=crop', 1),
  ('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=650&fit=crop', 2),
  ('https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=750&fit=crop', 3),
  ('https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=500&h=700&fit=crop', 4),
  ('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=600&fit=crop', 5)
) AS urls(url, sort_order)
WHERE p.slug = 'mia-rivera';

-- Sasha Okonkwo (6 images)
INSERT INTO gallery_images (profile_id, url, sort_order)
SELECT p.id, urls.url, urls.sort_order
FROM profiles p
CROSS JOIN (VALUES
  ('https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=500&h=700&fit=crop', 1),
  ('https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=500&h=750&fit=crop', 2),
  ('https://images.unsplash.com/photo-1484399172022-72a90b12e3c1?w=500&h=650&fit=crop', 3),
  ('https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=500&h=700&fit=crop', 4),
  ('https://images.unsplash.com/photo-1523264653568-d3d4032d1476?w=500&h=600&fit=crop', 5),
  ('https://images.unsplash.com/photo-1513379733131-47fc74b45fc7?w=500&h=700&fit=crop', 6)
) AS urls(url, sort_order)
WHERE p.slug = 'sasha-okonkwo';

-- Kaia Tanaka (6 images)
INSERT INTO gallery_images (profile_id, url, sort_order)
SELECT p.id, urls.url, urls.sort_order
FROM profiles p
CROSS JOIN (VALUES
  ('https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&h=700&fit=crop', 1),
  ('https://images.unsplash.com/photo-1551292831-023188e78222?w=500&h=750&fit=crop', 2),
  ('https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=500&h=650&fit=crop', 3),
  ('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=700&fit=crop', 4),
  ('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=600&fit=crop', 5),
  ('https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=700&fit=crop', 6)
) AS urls(url, sort_order)
WHERE p.slug = 'kaia-tanaka';

-- Valentina Rossi (7 images)
INSERT INTO gallery_images (profile_id, url, sort_order)
SELECT p.id, urls.url, urls.sort_order
FROM profiles p
CROSS JOIN (VALUES
  ('https://images.unsplash.com/photo-1496440737103-cd596325d314?w=500&h=700&fit=crop', 1),
  ('https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500&h=750&fit=crop', 2),
  ('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=650&fit=crop', 3),
  ('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=700&fit=crop', 4),
  ('https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=600&fit=crop', 5),
  ('https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=500&h=700&fit=crop', 6),
  ('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=750&fit=crop', 7)
) AS urls(url, sort_order)
WHERE p.slug = 'valentina-rossi';

-- Demi Moreno (5 images)
INSERT INTO gallery_images (profile_id, url, sort_order)
SELECT p.id, urls.url, urls.sort_order
FROM profiles p
CROSS JOIN (VALUES
  ('https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=500&h=700&fit=crop', 1),
  ('https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=500&h=650&fit=crop', 2),
  ('https://images.unsplash.com/photo-1464863979621-258859e62245?w=500&h=750&fit=crop', 3),
  ('https://images.unsplash.com/photo-1551292831-023188e78222?w=500&h=700&fit=crop', 4),
  ('https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&h=600&fit=crop', 5)
) AS urls(url, sort_order)
WHERE p.slug = 'demi-moreno';

-- Priya Sharma (6 images)
INSERT INTO gallery_images (profile_id, url, sort_order)
SELECT p.id, urls.url, urls.sort_order
FROM profiles p
CROSS JOIN (VALUES
  ('https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=700&fit=crop', 1),
  ('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=750&fit=crop', 2),
  ('https://images.unsplash.com/photo-1496440737103-cd596325d314?w=500&h=650&fit=crop', 3),
  ('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=700&fit=crop', 4),
  ('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=600&fit=crop', 5),
  ('https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500&h=700&fit=crop', 6)
) AS urls(url, sort_order)
WHERE p.slug = 'priya-sharma';

-- Elena Brooks (6 images)
INSERT INTO gallery_images (profile_id, url, sort_order)
SELECT p.id, urls.url, urls.sort_order
FROM profiles p
CROSS JOIN (VALUES
  ('https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=500&h=700&fit=crop', 1),
  ('https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=750&fit=crop', 2),
  ('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=650&fit=crop', 3),
  ('https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=500&h=700&fit=crop', 4),
  ('https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&h=600&fit=crop', 5),
  ('https://images.unsplash.com/photo-1551292831-023188e78222?w=500&h=700&fit=crop', 6)
) AS urls(url, sort_order)
WHERE p.slug = 'elena-brooks';

-- Camille Dubois (6 images)
INSERT INTO gallery_images (profile_id, url, sort_order)
SELECT p.id, urls.url, urls.sort_order
FROM profiles p
CROSS JOIN (VALUES
  ('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=700&fit=crop', 1),
  ('https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=750&fit=crop', 2),
  ('https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=650&fit=crop', 3),
  ('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=700&fit=crop', 4),
  ('https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&h=600&fit=crop', 5),
  ('https://images.unsplash.com/photo-1464863979621-258859e62245?w=500&h=700&fit=crop', 6)
) AS urls(url, sort_order)
WHERE p.slug = 'camille-dubois';

-- Naomi Vasquez (5 images)
INSERT INTO gallery_images (profile_id, url, sort_order)
SELECT p.id, urls.url, urls.sort_order
FROM profiles p
CROSS JOIN (VALUES
  ('https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=500&h=700&fit=crop', 1),
  ('https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500&h=750&fit=crop', 2),
  ('https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&h=650&fit=crop', 3),
  ('https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=500&h=700&fit=crop', 4),
  ('https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=500&h=600&fit=crop', 5)
) AS urls(url, sort_order)
WHERE p.slug = 'naomi-vasquez';

-- ---------------------------------------------------------------------------
-- Section 4: Insert site_config rows (ON CONFLICT for idempotency)
-- ---------------------------------------------------------------------------

-- 4a. Areas
INSERT INTO site_config (id, value)
VALUES ('areas', '["LA","West LA","Mid-Wilshire","OC"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- 4b. Categories
INSERT INTO site_config (id, value)
VALUES ('categories', '[
  {"id":"stats","title":"Vitals","fields":[
    {"key":"age","label":"Age"},{"key":"height","label":"Height"},{"key":"weight","label":"Weight"},
    {"key":"bust","label":"Bust"},{"key":"waist","label":"Waist"},{"key":"hips","label":"Hips"}
  ]},
  {"id":"appearance","title":"Look","fields":[
    {"key":"hair","label":"Hair"},{"key":"eyes","label":"Eyes"},{"key":"shoe","label":"Shoe"},
    {"key":"dress","label":"Dress"},{"key":"tattoos","label":"Tattoos"},{"key":"piercings","label":"Piercings"}
  ]},
  {"id":"professional","title":"Work","fields":[
    {"key":"exp","label":"Experience"},{"key":"region","label":"Region"}
  ]}
]'::jsonb)
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- 4c. Card Settings
INSERT INTO site_config (id, value)
VALUES ('card_settings', '{
  "subtitleFields": ["region","types"],
  "showVerifiedBadge": true,
  "showAwayBadge": true,
  "verifiedLabel": "Verified",
  "awayLabel": "Away",
  "overlayColor": "#1a1a1a",
  "overlayOpacity": 70
}'::jsonb)
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- 4d. Pill Groups
INSERT INTO site_config (id, value)
VALUES ('pill_groups', '[
  {"id":"types","title":"Shoot Types","color":"var(--charcoal)","dataKey":"types",
   "options":["Portrait","Fashion","Commercial","Glamour","Fitness","Editorial","Artistic","Swimwear","Lingerie","Cosplay","Lifestyle","Event"]},
  {"id":"compensation","title":"Compensation","color":"var(--sage)","dataKey":"compensation",
   "options":["Paid Only","TFP","Negotiable"]}
]'::jsonb)
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- 4e. Hero
INSERT INTO site_config (id, value)
VALUES ('hero', '{
  "img": "",
  "imgCrop": null,
  "subtitle": "Los Angeles \u00b7 Orange County",
  "titleLine1": "Find Your",
  "titleLine2": "Perfect",
  "titleAccent": "Model",
  "searchPlaceholder": "Search by name or area..."
}'::jsonb)
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- 4f. Form Config
INSERT INTO site_config (id, value)
VALUES ('form_config', '{
  "title": "Model Membership Form",
  "subtitle": "You have been invited to submit your information for consideration. Please fill out the form below with accurate details.",
  "successTitle": "Submission Received!",
  "successMsg": "Thank you for your interest! We will review your submission and reach out if there is a fit.",
  "submitLabel": "Submit Membership Form",
  "fields": [
    {"id":"name","label":"Full Name","type":"text","required":true,"width":"half","placeholder":"Jane Doe"},
    {"id":"email","label":"Email","type":"email","required":true,"width":"half"},
    {"id":"phone","label":"Phone","type":"text","width":"third"},
    {"id":"age","label":"Age","type":"text","width":"third"},
    {"id":"height","label":"Height","type":"text","width":"third"},
    {"id":"region","label":"Preferred Area","type":"area_select","width":"half"},
    {"id":"exp","label":"Experience Level","type":"exp_select","width":"half"},
    {"id":"types","label":"Shoot Types","type":"type_pills","width":"full"},
    {"id":"bio","label":"Tell us about yourself","type":"textarea","width":"full"},
    {"id":"social","label":"Instagram / Social","type":"text","width":"full"},
    {"id":"id_photo","label":"ID Verification","type":"file_upload","required":true,"width":"full",
     "helperText":"Upload a photo holding your ID next to your face. You may cover all other information — we only need to verify your name matches."}
  ]
}'::jsonb)
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
