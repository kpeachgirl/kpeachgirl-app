/**
 * Import Wix data into Supabase
 *
 * Usage:
 *   node scripts/import-wix-data.js
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const https = require('https');
const { URL } = require('url');

// ─── Supabase config (from .env.local) ───────────────────────
const fs = require('fs');
const envPath = require('path').join(__dirname, '..', '.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) env[key.trim()] = rest.join('=').trim();
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// ─── Wix image URL converter ─────────────────────────────────
function wixImageToUrl(wixSrc) {
  if (!wixSrc) return null;
  // wix:image://v1/{slug}/{filename}#originWidth=X&originHeight=Y
  const match = wixSrc.match(/wix:image:\/\/v1\/([^/]+)\//);
  if (match) {
    return `https://static.wixstatic.com/media/${match[1]}`;
  }
  return null;
}

// ─── Area ID → Name mapping ──────────────────────────────────
const AREA_MAP = {
  '84931ca9-2e3d-47b0-af71-8634cd6055bf': { name: 'LA', parent: 'LA' },
  '3842f077-3f6b-450c-ac76-d9855499e91b': { name: 'Mid-Wilshire', parent: 'LA' },
  '0d39b789-1d9e-4e25-aeba-cda6390b68c9': { name: 'Orange County', parent: 'OC' },
  'daef9aeb-7822-486e-89cd-260958363f1c': { name: 'West LA', parent: 'LA' },
};

// ─── Wix talent data (pulled from API) ───────────────────────
const WIX_TALENTS = [
  {
    name: 'Lexus',
    slug: 'lexus',
    area: '0d39b789-1d9e-4e25-aeba-cda6390b68c9',
    height: '5\' 4"',
    weight: '102 lbs',
    bust: '32DD natural',
    services: 'GFE, SHOWER, DFK, 69, BBBJ, DATY, CIM, RIM, MSOG, BBFS, CIP',
    hours: '10:00AM - 9:00PM',
    rates: 'GFE & BB Special \n350 for 1h\n300 for 30min',
    ter: '#406985',
    vacation: false,
    headshot: 'wix:image://v1/8cc6fa_3dd92d1dd1b744adb1d789d2933c1a8b~mv2.jpg/IMG_1418_edited.jpg#originWidth=960&originHeight=1440',
    gallery: [
      'wix:image://v1/8cc6fa_3dd92d1dd1b744adb1d789d2933c1a8b~mv2.jpg/IMG_1418_edited.jpg#originWidth=960&originHeight=1440',
      'wix:image://v1/8cc6fa_07349a5aae9c4d81a60dd4152d94fcff~mv2.jpg/IMG_1649.JPG#originWidth=3808&originHeight=5712',
      'wix:image://v1/8cc6fa_20f7bfa35a844c39a697231e53b50f78~mv2.jpg/IMG_1992.JPG#originWidth=1045&originHeight=1567',
      'wix:image://v1/8cc6fa_052f24a69e024e54baf340e5900bb81d~mv2.jpeg/IMG_1416.jpeg#originWidth=960&originHeight=1440',
    ],
    sort_order: 1,
  },
  {
    name: 'Sienna',
    slug: 'sienna',
    area: 'daef9aeb-7822-486e-89cd-260958363f1c',
    height: '5\' 2"',
    weight: '102 lbs',
    bust: '32C natural',
    services: 'GFE, SHOWER, DFK, 69, BBBJ, DATY, CIM, RIM, MSOG, BBFS, CIP',
    hours: '10:00AM - 10:00PM',
    rates: 'GFE & BB Special \n350 for 1hr\n300 for 30min',
    ter: '#403783',
    vacation: true,
    headshot: 'wix:image://v1/8cc6fa_795b223fdda84d1b8bdcbf83dd1f5bc3~mv2.jpeg/IMG_1421.jpeg#originWidth=2688&originHeight=4032',
    gallery: [
      'wix:image://v1/8cc6fa_262b5e337e064a46835af0913b683597~mv2.jpg/IMG_1422_edited.jpg#originWidth=2000&originHeight=3000',
      'wix:image://v1/8cc6fa_e838cbce9945465d81c0ebd7cfc5ee71~mv2.jpg/IMG_1421_edited.jpg#originWidth=2000&originHeight=3000',
      'wix:image://v1/8cc6fa_6fb23c0e801f4a9496cb0460e40224fe~mv2.jpg/IMG_1423_edited.jpg#originWidth=2000&originHeight=3000',
      'wix:image://v1/8cc6fa_d0139f271bf24550b6b31e68f31c6c35~mv2.jpg/IMG_1420_edited.jpg#originWidth=2000&originHeight=3000',
      'wix:image://v1/8cc6fa_700a7b54c451401790b1c23278369f55~mv2.jpg/IMG_1419_edited.jpg#originWidth=3000&originHeight=2000',
    ],
    sort_order: 2,
  },
  {
    name: 'Isla',
    slug: 'isla',
    area: 'daef9aeb-7822-486e-89cd-260958363f1c',
    height: '5\' 2"',
    weight: '100lbs',
    bust: '34C',
    services: 'GFE, SHOWER, DFK, 69, BBBJ, DATY, CIM, RIM, MSOG, BBFS, CIP',
    hours: '10:00AM - 10:00PM',
    rates: 'GFE & BB Special \n350 for 1h\n300 for 30min',
    ter: '#404275',
    vacation: false,
    headshot: 'wix:image://v1/8cc6fa_b0bf16e70fdf43d184823f2dfe6b6a41~mv2.jpg/IMG_2325.JPG#originWidth=806&originHeight=1210',
    gallery: [
      'wix:image://v1/8cc6fa_b0bf16e70fdf43d184823f2dfe6b6a41~mv2.jpg/IMG_2325.JPG#originWidth=806&originHeight=1210',
      'wix:image://v1/8cc6fa_5f390293b455460aa07cb190ec5e22e6~mv2.jpg/IMG_2328.JPG#originWidth=806&originHeight=1210',
      'wix:image://v1/8cc6fa_5cdb00a72f0f4769a63e6ed366c07eff~mv2.jpg/IMG_2329.JPG#originWidth=806&originHeight=1210',
      'wix:image://v1/8cc6fa_0c29f512e9bc48938122d0b1860e5cf7~mv2.jpg/IMG_2326.JPG#originWidth=806&originHeight=1210',
      'wix:image://v1/8cc6fa_70f58ad075d8478d95a33b41abe39eb6~mv2.jpg/IMG_2327.JPG#originWidth=641&originHeight=960',
    ],
    sort_order: 3,
  },
  {
    name: 'Aria',
    slug: 'aria',
    area: '0d39b789-1d9e-4e25-aeba-cda6390b68c9',
    height: '5\' 2"',
    weight: '99Ibs',
    bust: '32C natural',
    services: 'GFE, DFK, BBBJ, DATY, CIM, RIM, MSOG, BBFS, CIP, NURU',
    hours: '10:00AM -10:00PM',
    rates: '350 for 1h, 300 for 30min, video +200',
    ter: '#394397',
    vacation: false,
    headshot: 'wix:image://v1/8cc6fa_32ca95d115d84801ae9f11d5196fb677~mv2.jpg/IMG_2365.JPG#originWidth=1131&originHeight=1440',
    gallery: [
      'wix:image://v1/8cc6fa_32ca95d115d84801ae9f11d5196fb677~mv2.jpg/IMG_2365.JPG#originWidth=1131&originHeight=1440',
      'wix:image://v1/8cc6fa_be85b1c674b4460ca4d7c8732111f825~mv2.jpg/IMG_2364.JPG#originWidth=1171&originHeight=852',
      'wix:image://v1/8cc6fa_a0f0d1d30c5e438eaa18d715a10fd246~mv2.jpg/IMG_2362.JPG#originWidth=1179&originHeight=1437',
      'wix:image://v1/8cc6fa_c29a12c6c1b244a4a033382119f79ea3~mv2.jpg/IMG_2363.JPG#originWidth=1167&originHeight=1440',
    ],
    sort_order: 4,
  },
  {
    name: 'Mari',
    slug: 'mari',
    area: '0d39b789-1d9e-4e25-aeba-cda6390b68c9',
    height: '5\' 0"',
    weight: '110Ibs',
    bust: '34D',
    services: 'GFE, DFK, BBBJ, DATY, CIM, RIM, MSOG, BBFS, CIP',
    hours: '10:00AM - 9:00PM',
    rates: '350 for 1h, 300 for 30min',
    ter: '#410828',
    vacation: false,
    headshot: 'wix:image://v1/8cc6fa_b5dfe609817b4b29b3134f0906afe437~mv2.jpg/IMG_2358.JPG#originWidth=922&originHeight=1293',
    gallery: [
      'wix:image://v1/8cc6fa_b5dfe609817b4b29b3134f0906afe437~mv2.jpg/IMG_2358.JPG#originWidth=922&originHeight=1293',
      'wix:image://v1/8cc6fa_061ef33a1db14a9b8759c7660d2c17a0~mv2.png/IMG_2366.PNG#originWidth=832&originHeight=1248',
      'wix:image://v1/8cc6fa_44392ba8227b47d1833703b9f47f73fc~mv2.jpg/IMG_2369.JPG#originWidth=860&originHeight=1316',
      'wix:image://v1/8cc6fa_f003b1e276654da79850126afe8a3b70~mv2.jpg/IMG_2357.JPG#originWidth=700&originHeight=1048',
    ],
    sort_order: 5,
  },
];

// AR. Mari (Duo) - this maps to a Group, not a profile
const WIX_GROUPS = [
  {
    name: 'AR. Mari (Duo)',
    slug: 'ar-mari-duo',
    area: '0d39b789-1d9e-4e25-aeba-cda6390b68c9',
    height: '5\' 2"',
    weight: '99Ibs',
    bust: '34D',
    services: 'GFE, DFK, BBBJ, DATY, CIM, RIM, MSOG, BBFS, CIP, NURU',
    hours: '10:00AM - 9:00PM',
    rates: '800for 1h, 400 for 30min Special',
    badge_label: 'DUO',
    headshot: 'wix:image://v1/8cc6fa_c29a12c6c1b244a4a033382119f79ea3~mv2.jpg/IMG_2363.JPG#originWidth=1167&originHeight=1440',
    gallery: [
      'wix:image://v1/8cc6fa_c29a12c6c1b244a4a033382119f79ea3~mv2.jpg/IMG_2363.JPG#originWidth=1167&originHeight=1440',
      'wix:image://v1/8cc6fa_32ca95d115d84801ae9f11d5196fb677~mv2.jpg/IMG_2365.JPG#originWidth=1131&originHeight=1440',
      'wix:image://v1/8cc6fa_a0f0d1d30c5e438eaa18d715a10fd246~mv2.jpg/IMG_2362.JPG#originWidth=1179&originHeight=1437',
      'wix:image://v1/8cc6fa_b5dfe609817b4b29b3134f0906afe437~mv2.jpg/IMG_2358.JPG#originWidth=922&originHeight=1293',
      'wix:image://v1/8cc6fa_44392ba8227b47d1833703b9f47f73fc~mv2.jpg/IMG_2369.JPG#originWidth=860&originHeight=1316',
    ],
    // Members: Aria + Mari (will resolve IDs after insert)
    member_slugs: ['aria', 'mari'],
    sort_order: 1,
  },
];

// ─── Updated site_config values ──────────────────────────────
const UPDATED_CATEGORIES = [
  {
    id: 'stats',
    title: 'Vitals',
    fields: [
      { key: 'height', label: 'Height' },
      { key: 'weight', label: 'Weight' },
      { key: 'bust', label: 'Bust' },
    ],
  },
  {
    id: 'booking',
    title: 'Booking',
    fields: [
      { key: 'hours', label: 'Hours' },
      { key: 'rates', label: 'Rates' },
    ],
  },
  {
    id: 'links',
    title: 'Links',
    fields: [
      { key: 'ter', label: 'TER' },
    ],
  },
];

const UPDATED_PILL_GROUPS = [
  {
    id: 'types',
    title: 'Services',
    color: 'var(--charcoal)',
    dataKey: 'types',
    options: ['GFE', 'DFK', 'BBBJ', 'DATY', 'CIM', 'RIM', 'MSOG', 'BBFS', 'CIP', 'NURU', 'SHOWER', '69'],
  },
];

// ─── Supabase REST helper ────────────────────────────────────
function supabaseRequest(method, path, body) {
  const url = new URL(path, SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : 'return=representation',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`${method} ${path} → ${res.statusCode}: ${data}`));
        } else {
          try { resolve(JSON.parse(data)); }
          catch { resolve(data); }
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function upsertConfig(id, value) {
  try {
    // Try update first
    const result = await supabaseRequest('PATCH',
      `/rest/v1/site_config?id=eq.${id}`,
      { value, updated_at: new Date().toISOString() }
    );
    if (Array.isArray(result) && result.length === 0) {
      // Row doesn't exist, insert
      await supabaseRequest('POST', '/rest/v1/site_config', {
        id, value, updated_at: new Date().toISOString(),
      });
    }
    console.log(`  ✓ site_config.${id} updated`);
  } catch (err) {
    console.error(`  ✗ site_config.${id} failed:`, err.message);
  }
}

// ─── Main import ─────────────────────────────────────────────
async function main() {
  console.log('═══ Importing Wix data into Supabase ═══\n');

  // 1. Update site_config
  console.log('1. Updating site_config...');
  await upsertConfig('categories', UPDATED_CATEGORIES);
  await upsertConfig('pill_groups', UPDATED_PILL_GROUPS);
  console.log();

  // 2. Clear existing demo data
  console.log('2. Clearing existing profiles and groups...');
  try {
    await supabaseRequest('DELETE', '/rest/v1/gallery_images?id=not.is.null');
    console.log('  ✓ gallery_images cleared');
  } catch (e) { console.log('  (no gallery_images to clear)'); }

  try {
    await supabaseRequest('DELETE', '/rest/v1/group_gallery_images?id=not.is.null');
    console.log('  ✓ group_gallery_images cleared');
  } catch (e) { console.log('  (no group_gallery_images to clear)'); }

  try {
    await supabaseRequest('DELETE', '/rest/v1/groups?id=not.is.null');
    console.log('  ✓ groups cleared');
  } catch (e) { console.log('  (no groups to clear)'); }

  try {
    await supabaseRequest('DELETE', '/rest/v1/profiles?id=not.is.null');
    console.log('  ✓ profiles cleared');
  } catch (e) { console.log('  (no profiles to clear)'); }
  console.log();

  // 3. Insert profiles
  console.log('3. Inserting profiles...');
  const profileIdMap = {}; // slug → id

  for (const talent of WIX_TALENTS) {
    const area = AREA_MAP[talent.area];
    const serviceTypes = talent.services.split(',').map(s => s.trim()).filter(Boolean);
    const profileImageUrl = wixImageToUrl(talent.headshot);

    const profileData = {
      name: talent.name,
      slug: talent.slug,
      region: area ? area.name : null,
      parent_region: area ? area.parent : 'LA',
      bio: null,
      types: serviceTypes,
      compensation: [],
      verified: true,
      vacation: talent.vacation,
      experience: null,
      profile_image: profileImageUrl,
      profile_image_crop: { x: 50, y: 50, zoom: 100 },
      cover_image: null,
      cover_image_crop: null,
      attributes: {
        height: talent.height,
        weight: talent.weight,
        bust: talent.bust,
        hours: talent.hours,
        rates: talent.rates,
        ter: talent.ter,
      },
      sort_order: talent.sort_order,
    };

    try {
      const result = await supabaseRequest('POST', '/rest/v1/profiles', profileData);
      const profile = Array.isArray(result) ? result[0] : result;
      profileIdMap[talent.slug] = profile.id;
      console.log(`  ✓ ${talent.name} → ${profile.id}`);

      // Insert gallery images
      for (let i = 0; i < talent.gallery.length; i++) {
        const galleryUrl = wixImageToUrl(talent.gallery[i]);
        if (galleryUrl) {
          await supabaseRequest('POST', '/rest/v1/gallery_images', {
            profile_id: profile.id,
            url: galleryUrl,
            sort_order: i,
          });
        }
      }
      console.log(`    + ${talent.gallery.length} gallery images`);
    } catch (err) {
      console.error(`  ✗ ${talent.name} failed:`, err.message);
    }
  }
  console.log();

  // 4. Insert groups
  console.log('4. Inserting groups...');
  for (const group of WIX_GROUPS) {
    const area = AREA_MAP[group.area];
    const memberIds = group.member_slugs
      .map(slug => profileIdMap[slug])
      .filter(Boolean);
    const serviceTypes = group.services.split(',').map(s => s.trim()).filter(Boolean);
    const imageUrl = wixImageToUrl(group.headshot);

    const groupData = {
      name: group.name,
      slug: group.slug,
      bio: null,
      badge_label: group.badge_label,
      image: imageUrl,
      member_ids: memberIds,
      types: serviceTypes,
      compensation: [],
      attributes: {
        height: group.height,
        weight: group.weight,
        bust: group.bust,
        hours: group.hours,
        rates: group.rates,
      },
      sort_order: group.sort_order,
    };

    try {
      const result = await supabaseRequest('POST', '/rest/v1/groups', groupData);
      const grp = Array.isArray(result) ? result[0] : result;
      console.log(`  ✓ ${group.name} → ${grp.id} (members: ${memberIds.length})`);

      // Insert group gallery images
      for (let i = 0; i < group.gallery.length; i++) {
        const galleryUrl = wixImageToUrl(group.gallery[i]);
        if (galleryUrl) {
          await supabaseRequest('POST', '/rest/v1/group_gallery_images', {
            group_id: grp.id,
            url: galleryUrl,
            sort_order: i,
          });
        }
      }
      console.log(`    + ${group.gallery.length} gallery images`);
    } catch (err) {
      console.error(`  ✗ ${group.name} failed:`, err.message);
    }
  }

  console.log('\n═══ Import complete ═══');
  console.log(`\nProfiles: ${Object.keys(profileIdMap).length}`);
  console.log(`Groups: ${WIX_GROUPS.length}`);
  console.log('\nNote: Images are linked to Wix static CDN URLs.');
  console.log('They will display directly from wixstatic.com.');
}

main().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
