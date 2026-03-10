-- =============================================================================
-- KPEACHGIRL Demo Group Profiles (Duo + Trio)
-- References existing seeded model profiles by slug
-- =============================================================================

-- Duo: Aria & Luna
INSERT INTO groups (name, slug, bio, badge_label, image, member_ids, types, compensation, attributes, sort_order)
SELECT
  'Aria & Luna',
  'aria-luna',
  'High fashion duo based in LA. Aria and Luna have been shooting together for two years, bringing complementary editorial styles that photographers love. Available for paired fashion, beauty, and editorial shoots.',
  NULL,  -- auto DUO badge
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=600&fit=crop',
  ARRAY[
    (SELECT id FROM profiles WHERE slug = 'aria-novak'),
    (SELECT id FROM profiles WHERE slug = 'luna-chen')
  ],
  ARRAY['Fashion','Editorial','Portrait'],
  ARRAY['Paid Only'],
  '{"hair":"Brunette & Black","eyes":"Green & Brown"}'::jsonb,
  1;

-- Trio: Mia, Jordan & Demi
INSERT INTO groups (name, slug, bio, badge_label, image, member_ids, types, compensation, attributes, sort_order)
SELECT
  'MJD Collective',
  'mjd-collective',
  'Three LA-based models who specialize in lifestyle, fitness, and commercial group campaigns. Their chemistry on set is unmatched — casting directors frequently book all three for athletic and activewear brands.',
  NULL,  -- auto TRIO badge
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=600&fit=crop',
  ARRAY[
    (SELECT id FROM profiles WHERE slug = 'mia-rivera'),
    (SELECT id FROM profiles WHERE slug = 'jordan-reyes'),
    (SELECT id FROM profiles WHERE slug = 'demi-moreno')
  ],
  ARRAY['Fitness','Commercial','Lifestyle'],
  ARRAY['Paid Only','Negotiable'],
  '{"hair":"Mixed","eyes":"Mixed"}'::jsonb,
  2;

-- Duo: Sasha & Valentina
INSERT INTO groups (name, slug, bio, badge_label, image, member_ids, types, compensation, attributes, sort_order)
SELECT
  'Sasha & Val',
  'sasha-val',
  'Editorial powerhouse duo. Sasha and Valentina bring a European editorial sensibility to every shoot. Specializing in high-fashion, artistic, and glamour paired work throughout LA and OC.',
  NULL,  -- auto DUO badge
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=600&fit=crop',
  ARRAY[
    (SELECT id FROM profiles WHERE slug = 'sasha-okonkwo'),
    (SELECT id FROM profiles WHERE slug = 'valentina-rossi')
  ],
  ARRAY['Fashion','Editorial','Glamour','Artistic'],
  ARRAY['Paid Only'],
  '{"hair":"Black & Auburn","eyes":"Brown & Hazel"}'::jsonb,
  3;
