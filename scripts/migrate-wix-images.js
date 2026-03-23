/**
 * Migrate all Wix-hosted images to Supabase Storage
 * Downloads from static.wixstatic.com → uploads to Supabase Storage → updates DB URLs
 *
 * Usage: node scripts/migrate-wix-images.js
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─── Load env ────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local');
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
  console.error('Missing SUPABASE env vars in .env.local');
  process.exit(1);
}

// ─── HTTP helpers ────────────────────────────────────────────
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({
        buffer: Buffer.concat(chunks),
        contentType: res.headers['content-type'] || 'image/jpeg',
      }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function supabaseRequest(method, urlPath, body, extraHeaders = {}) {
  const url = new URL(urlPath, SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...extraHeaders,
    };

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`${method} ${urlPath} → ${res.statusCode}: ${data}`));
        } else {
          try { resolve(JSON.parse(data)); }
          catch { resolve(data); }
        }
      });
    });
    req.on('error', reject);
    if (body) {
      if (Buffer.isBuffer(body)) {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

function uploadToStorage(bucket, filePath, buffer, contentType) {
  const url = new URL(`/storage/v1/object/${bucket}/${filePath}`, SUPABASE_URL);
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': contentType,
        'x-upsert': 'true',
        'Content-Length': buffer.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`Upload ${filePath} → ${res.statusCode}: ${data}`));
        } else {
          // Build public URL
          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
          resolve(publicUrl);
        }
      });
    });
    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

// ─── Image migration ─────────────────────────────────────────
const migrated = new Map(); // old URL → new URL (dedup)

async function migrateImage(oldUrl, bucket, folder) {
  if (!oldUrl || !oldUrl.includes('wixstatic.com')) {
    return oldUrl; // Not a Wix URL, skip
  }

  // Check if already migrated (same image used in multiple places)
  if (migrated.has(oldUrl)) {
    return migrated.get(oldUrl);
  }

  try {
    // Download from Wix
    const { buffer, contentType } = await downloadFile(oldUrl);

    // Determine extension
    const extMap = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
    const ext = extMap[contentType] || '.jpg';

    // Generate a clean filename (Supabase rejects ~ in keys)
    const uid = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    const storagePath = `${folder}/${uid}${ext}`;

    // Upload to Supabase Storage
    const newUrl = await uploadToStorage(bucket, storagePath, buffer, contentType);

    migrated.set(oldUrl, newUrl);
    return newUrl;
  } catch (err) {
    console.error(`    ✗ Failed to migrate ${oldUrl}: ${err.message}`);
    return oldUrl; // Keep old URL as fallback
  }
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log('═══ Migrating Wix images to Supabase Storage ═══\n');

  // 1. Fetch all profiles
  console.log('1. Fetching profiles...');
  const profiles = await supabaseRequest('GET', '/rest/v1/profiles?select=*&order=sort_order');
  console.log(`   Found ${profiles.length} profiles\n`);

  // 2. Migrate profile images
  console.log('2. Migrating profile images...');
  for (const profile of profiles) {
    console.log(`\n  → ${profile.name}`);

    let updates = {};
    let changed = false;

    // Profile image
    if (profile.profile_image && profile.profile_image.includes('wixstatic.com')) {
      const newUrl = await migrateImage(profile.profile_image, 'profile-images', profile.id);
      if (newUrl !== profile.profile_image) {
        updates.profile_image = newUrl;
        changed = true;
        console.log(`    ✓ Profile image migrated`);
      }
    }

    // Cover image
    if (profile.cover_image && profile.cover_image.includes('wixstatic.com')) {
      const newUrl = await migrateImage(profile.cover_image, 'cover-images', profile.id);
      if (newUrl !== profile.cover_image) {
        updates.cover_image = newUrl;
        changed = true;
        console.log(`    ✓ Cover image migrated`);
      }
    }

    // Update profile record
    if (changed) {
      await supabaseRequest('PATCH', `/rest/v1/profiles?id=eq.${profile.id}`, updates);
    }

    // Gallery images
    const gallery = await supabaseRequest('GET',
      `/rest/v1/gallery_images?profile_id=eq.${profile.id}&select=*&order=sort_order`
    );

    for (const img of gallery) {
      if (img.url && img.url.includes('wixstatic.com')) {
        const newUrl = await migrateImage(img.url, 'gallery-images', profile.id);
        if (newUrl !== img.url) {
          await supabaseRequest('PATCH', `/rest/v1/gallery_images?id=eq.${img.id}`, { url: newUrl });
          console.log(`    ✓ Gallery image ${img.sort_order + 1} migrated`);
        }
      }
    }
  }

  // 3. Fetch and migrate group images
  console.log('\n\n3. Migrating group images...');
  const groups = await supabaseRequest('GET', '/rest/v1/groups?select=*&order=sort_order');
  console.log(`   Found ${groups.length} groups\n`);

  for (const group of groups) {
    console.log(`\n  → ${group.name}`);

    // Group main image
    if (group.image && group.image.includes('wixstatic.com')) {
      const newUrl = await migrateImage(group.image, 'profile-images', `group-${group.id}`);
      if (newUrl !== group.image) {
        await supabaseRequest('PATCH', `/rest/v1/groups?id=eq.${group.id}`, { image: newUrl });
        console.log(`    ✓ Group image migrated`);
      }
    }

    // Group gallery images
    const gallery = await supabaseRequest('GET',
      `/rest/v1/group_gallery_images?group_id=eq.${group.id}&select=*&order=sort_order`
    );

    for (const img of gallery) {
      if (img.url && img.url.includes('wixstatic.com')) {
        const newUrl = await migrateImage(img.url, 'gallery-images', `group-${group.id}`);
        if (newUrl !== img.url) {
          await supabaseRequest('PATCH', `/rest/v1/group_gallery_images?id=eq.${img.id}`, { url: newUrl });
          console.log(`    ✓ Gallery image ${img.sort_order + 1} migrated`);
        }
      }
    }
  }

  // Summary
  console.log('\n\n═══ Migration complete ═══');
  console.log(`Total unique images migrated: ${migrated.size}`);
  console.log('\nAll images now served from Supabase Storage.');
  console.log('You can safely disconnect from Wix.');
}

main().catch(err => {
  console.error('\nMigration failed:', err);
  process.exit(1);
});
