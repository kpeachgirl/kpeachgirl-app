# Phase 2: Supabase Setup - Research

**Researched:** 2026-03-09
**Domain:** Supabase (PostgreSQL, Auth, Storage, RLS) + @supabase/ssr with Next.js 14 App Router
**Confidence:** HIGH

## Summary

Phase 2 sets up the entire Supabase backend: 6 database tables with RLS policies, 4 storage buckets with access policies, admin authentication with a Custom Access Token Hook for JWT claims, client library files using `@supabase/ssr`, and seed data from the prototype. The schema is fully defined in CLAUDE.md -- no design decisions remain.

The critical technical challenge is the Custom Access Token Hook (DB-13), which injects `is_admin: true` into the JWT so RLS policies can check `(auth.jwt() ->> 'is_admin')::boolean`. This is a SQL function registered as an Auth Hook in the Supabase Dashboard, not a traditional database trigger. All RLS write policies depend on this claim existing in the JWT.

**Primary recommendation:** Write all SQL as migration files in `supabase/migrations/` for version control and reproducibility. Use the Supabase Dashboard SQL Editor to run them against the live project. Do NOT use the Supabase CLI local dev stack (Docker) -- run migrations directly against the hosted project at `vdrbqgxdyebcncuyemvg`.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DB-01 | profiles table with all columns | Schema defined in CLAUDE.md; migration SQL in Architecture Patterns |
| DB-02 | gallery_images table with FK to profiles | Schema defined in CLAUDE.md; ON DELETE CASCADE |
| DB-03 | groups table with member_ids uuid[] | Schema defined in CLAUDE.md; array type for member references |
| DB-04 | group_gallery_images table with FK to groups | Schema defined in CLAUDE.md; ON DELETE CASCADE |
| DB-05 | submissions table | Schema defined in CLAUDE.md; status enum as text |
| DB-06 | site_config table | Schema defined in CLAUDE.md; text PK pattern |
| DB-07 | RLS: profiles/gallery/groups public SELECT, admin writes | RLS pattern with is_admin JWT claim documented below |
| DB-08 | RLS: submissions anon INSERT, admin full | Special anon INSERT + admin CRUD pattern |
| DB-09 | RLS: site_config public SELECT, admin UPDATE | Read-public, write-admin pattern |
| DB-10 | Storage: 4 buckets (3 public, 1 private) | Storage bucket creation + public flag documented |
| DB-11 | Storage RLS on storage.objects | Storage policy patterns on storage.objects table |
| DB-12 | Admin user creation | Supabase Auth Dashboard or SQL insert into auth.users |
| DB-13 | Custom Access Token Hook for is_admin JWT | Hook function + GRANT + Dashboard enablement documented |
| DB-14 | @supabase/ssr client files | client.ts, server.ts, middleware.ts patterns documented |
| DB-15 | 12 seed model profiles | All 12 models extracted from ModelDirectory.jsx prototype |
| DB-16 | Default site_config seed rows | 6 config rows: areas, categories, card_settings, pill_groups, hero, form_config |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.49.x | Supabase client SDK | Required peer dep for @supabase/ssr |
| @supabase/ssr | ^0.9.x | SSR cookie-based auth for Next.js | Official replacement for deprecated auth-helpers |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Supabase CLI | (not installed locally) | Migration file authoring reference | File naming convention only; SQL runs via Dashboard |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @supabase/ssr | @supabase/auth-helpers-nextjs | DEPRECATED -- broken cookie handling in App Router. Do NOT use. |
| Dashboard SQL Editor | Supabase CLI `db push` | CLI requires Docker; Dashboard is simpler for single-project setup |

**Installation:**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Architecture Patterns

### Recommended File Structure
```
supabase/
  migrations/
    20260309000001_create_tables.sql       # All 6 tables
    20260309000002_enable_rls.sql          # RLS policies for all tables
    20260309000003_storage_buckets.sql     # Bucket creation + storage policies
    20260309000004_custom_access_token_hook.sql  # Auth hook function + grants
  seed.sql                                 # 12 profiles + site_config rows

src/
  lib/
    supabase/
      client.ts       # Browser client (createBrowserClient)
      server.ts       # Server component client (createServerClient + cookies)
      middleware.ts   # Session refresh utility for middleware
  middleware.ts       # Root Next.js middleware (calls supabase middleware utility)
```

### Pattern 1: Table Creation with Timestamps
**What:** All tables use gen_random_uuid() for PKs and timestamptz DEFAULT now() for timestamps
**When to use:** Every table in this schema
**Example:**
```sql
-- Source: CLAUDE.md schema definitions
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  -- ... all columns per CLAUDE.md
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Pattern 2: RLS with JWT Admin Claim
**What:** RLS policies that check `(auth.jwt() ->> 'is_admin')::boolean` for write access
**When to use:** All admin-only write policies
**Example:**
```sql
-- Source: Supabase RBAC docs + CLAUDE.md RLS spec
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO anon, authenticated
  USING (true);

-- Admin-only write
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true)
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

CREATE POLICY "profiles_delete" ON profiles
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true);
```

### Pattern 3: Custom Access Token Hook
**What:** PL/pgSQL function that injects is_admin into JWT claims, registered as Auth Hook
**When to use:** Single admin pattern -- checks auth.users app_metadata for is_admin flag
**Example:**
```sql
-- Source: Supabase Custom Access Token Hook docs
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  is_admin boolean;
BEGIN
  claims := event->'claims';

  -- Check if the user has is_admin set in their app_metadata
  SELECT
    COALESCE((raw_app_meta_data->>'is_admin')::boolean, false)
  INTO is_admin
  FROM auth.users
  WHERE id = (event->>'user_id')::uuid;

  -- Set the claim
  claims := jsonb_set(claims, '{is_admin}', to_jsonb(is_admin));

  -- Update the event
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- Required grants for supabase_auth_admin
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Prevent non-admin roles from executing this function
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- Grant auth admin read access to auth.users for the lookup
GRANT SELECT ON TABLE auth.users TO supabase_auth_admin;
```

**Dashboard step:** After running the SQL, go to Authentication > Hooks (Beta) > Custom Access Token (JWT) and select the `public.custom_access_token_hook` function.

### Pattern 4: Storage Bucket Policies
**What:** RLS on storage.objects using bucket_id filter
**When to use:** Controlling upload/delete access per bucket
**Example:**
```sql
-- Public buckets: anyone can read (bucket handles this), admin uploads/deletes
-- The bucket's "public" flag handles anonymous reads of files via URL.
-- RLS on storage.objects controls upload/update/delete.

INSERT INTO storage.buckets (id, name, public) VALUES
  ('profile-images', 'profile-images', true),
  ('cover-images', 'cover-images', true),
  ('gallery-images', 'gallery-images', true),
  ('submissions', 'submissions', false);

-- Admin upload policy for public buckets
CREATE POLICY "admin_upload_profile_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('profile-images', 'cover-images', 'gallery-images')
    AND (auth.jwt() ->> 'is_admin')::boolean = true
  );

-- Admin update/delete for public buckets
CREATE POLICY "admin_manage_public_images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('profile-images', 'cover-images', 'gallery-images')
    AND (auth.jwt() ->> 'is_admin')::boolean = true
  );

-- Submissions bucket: admin full access, anon can upload (for membership form)
CREATE POLICY "anon_upload_submissions" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'submissions');

CREATE POLICY "admin_read_submissions" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'submissions'
    AND (auth.jwt() ->> 'is_admin')::boolean = true
  );

CREATE POLICY "admin_delete_submissions" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'submissions'
    AND (auth.jwt() ->> 'is_admin')::boolean = true
  );
```

### Pattern 5: @supabase/ssr Client Setup (Next.js 14 App Router)
**What:** Three client files for browser, server, and middleware contexts
**When to use:** All Supabase operations across the app

**Browser client (src/lib/supabase/client.ts):**
```typescript
// Source: Supabase SSR docs for Next.js
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Server client (src/lib/supabase/server.ts):**
```typescript
// Source: Supabase SSR docs for Next.js
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
```

**Middleware utility (src/lib/supabase/middleware.ts):**
```typescript
// Source: Supabase SSR docs for Next.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session -- important for Server Components
  await supabase.auth.getUser()

  return supabaseResponse
}
```

**Root middleware (src/middleware.ts):**
```typescript
import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Anti-Patterns to Avoid
- **Using @supabase/auth-helpers-nextjs:** Deprecated, broken cookie management with App Router. Use `@supabase/ssr` only.
- **Checking getSession() for auth:** Use `getUser()` instead -- `getSession()` reads from cookies without server validation, allowing spoofed sessions. `getUser()` makes a network call to verify the JWT.
- **Putting is_admin in user_metadata:** User metadata is writable by the client via `updateUser()`. Admin claims MUST go in `app_metadata` which is only writable server-side.
- **Using service_role key in client-side code:** The service role key bypasses all RLS. Only use it server-side (API routes, server actions) and never expose via NEXT_PUBLIC_ env vars.
- **Running seed data as schema migrations:** Keep seed INSERTs in `supabase/seed.sql`, separate from DDL migrations. Migrations should be idempotent schema changes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie-based auth in SSR | Custom cookie parsing/setting | @supabase/ssr createServerClient | Token refresh, cookie chunking for large JWTs, PKCE flow handling |
| Admin role checking | Custom auth middleware from scratch | Custom Access Token Hook + RLS | JWT claims checked at database level, not just app level |
| Storage access control | Custom file auth middleware | Supabase Storage bucket policies + RLS on storage.objects | Handles signed URLs, CDN caching, RLS at storage layer |
| UUID generation | Custom ID generation | gen_random_uuid() (Postgres built-in) | Collision-proof, index-optimized |
| Slug generation | Custom slugify in SQL | Generate slugs in application code before INSERT | SQL triggers add complexity; app-side slugify is simpler and testable |

**Key insight:** Supabase's RLS + JWT claim pattern means authorization is enforced at the database level. Even if application code has a bug, the database rejects unauthorized writes. This is the correct architecture for a single-admin app.

## Common Pitfalls

### Pitfall 1: Custom Access Token Hook Not Enabled in Dashboard
**What goes wrong:** The SQL function exists but Auth never calls it; JWT has no is_admin claim; all admin writes fail with RLS violations.
**Why it happens:** Creating the function via SQL is necessary but not sufficient. The hook must also be registered in the Supabase Dashboard.
**How to avoid:** After running the hook migration SQL, immediately navigate to Authentication > Hooks and enable the Custom Access Token hook pointing to `public.custom_access_token_hook`.
**Warning signs:** Admin login succeeds but all database writes return 403/permission denied.

### Pitfall 2: Missing GRANT to supabase_auth_admin
**What goes wrong:** The hook function exists and is registered, but Auth cannot execute it. Tokens fail to issue, breaking all authentication.
**Why it happens:** By default, `supabase_auth_admin` does not have EXECUTE permission on user-created functions or SELECT on auth.users.
**How to avoid:** Always include the GRANT statements (see Pattern 3 above). Also REVOKE from authenticated/anon/public to prevent direct invocation.
**Warning signs:** Auth errors on login; "permission denied for function" in Supabase logs.

### Pitfall 3: Storage Bucket "Public" Misunderstanding
**What goes wrong:** Developer thinks "public bucket" means no policies needed; uploads fail because RLS blocks INSERT by default.
**Why it happens:** A "public" bucket only means anonymous READ access to files via URL. All other operations (upload, delete, update) still require RLS policies on `storage.objects`.
**How to avoid:** Always create explicit INSERT/DELETE policies on storage.objects for every bucket, even public ones.
**Warning signs:** Reads work fine; uploads return "new row violates row-level security policy."

### Pitfall 4: Server Component Cookie setAll Errors
**What goes wrong:** Server Components cannot set cookies; the setAll callback throws.
**Why it happens:** Next.js Server Components are read-only for cookies. The @supabase/ssr server client calls setAll when refreshing tokens.
**How to avoid:** Wrap setAll in try/catch (as shown in Pattern 5 server.ts). The middleware handles the actual cookie refresh, so Server Components can safely ignore setAll failures.
**Warning signs:** Unhandled promise rejections in server component rendering.

### Pitfall 5: Seed Data with Hardcoded UUIDs
**What goes wrong:** Re-running seed causes primary key conflicts.
**Why it happens:** Using fixed UUIDs in seed INSERT statements.
**How to avoid:** Use `gen_random_uuid()` in seed data (omit id column) OR use `ON CONFLICT DO NOTHING` for idempotent seeding. For site_config, use `INSERT ... ON CONFLICT (id) DO UPDATE` since the PK is a known text string.
**Warning signs:** Seed script fails on second run.

### Pitfall 6: Anon Submissions INSERT Without Proper Policy
**What goes wrong:** The membership form cannot submit because anon users have no INSERT policy on submissions.
**Why it happens:** Default RLS blocks everything. submissions needs a special policy allowing anon INSERT.
**How to avoid:** Explicitly create `FOR INSERT TO anon WITH CHECK (true)` on submissions table.
**Warning signs:** Membership form returns 403 on submit.

## Code Examples

### Admin User Setup via Dashboard SQL Editor
```sql
-- Source: Supabase Auth docs
-- Step 1: Create admin user via Supabase Dashboard > Authentication > Users > Add User
-- Email: admin@kpeachgirl.com, set a password

-- Step 2: Set app_metadata with is_admin claim
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'admin@kpeachgirl.com';
```

### Seed Data Pattern for Profiles
```sql
-- Generate slugs from names in the INSERT
INSERT INTO profiles (name, slug, region, parent_region, bio, types, compensation, verified, vacation, experience, profile_image, attributes, sort_order)
VALUES
  ('Aria Novak', 'aria-novak', 'LA', 'LA',
   'Six years in high fashion and editorial...',
   ARRAY['Fashion','Editorial','Portrait'],
   ARRAY['Paid Only'],
   true, false, 'Professional',
   'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face',
   '{"age":"24","height":"5''9\"","weight":"125","bust":"34\"","waist":"24\"","hips":"35\"","hair":"Brunette","eyes":"Green","shoe":"8","dress":"4","tattoos":"Floral, left wrist","piercings":"Ears","instagram":"@arianovak"}'::jsonb,
   1
  ),
  -- ... 11 more models
;
```

### Seed Data Pattern for site_config
```sql
INSERT INTO site_config (id, value) VALUES
  ('areas', '["LA","West LA","Mid-Wilshire","OC"]'::jsonb),
  ('categories', '[{"id":"stats","title":"Vitals","fields":[...]},...]'::jsonb),
  ('card_settings', '{"subtitleFields":["region","types"],...}'::jsonb),
  ('pill_groups', '[{"id":"types","title":"Shoot Types",...},...]'::jsonb),
  ('hero', '{"img":"","imgCrop":null,"subtitle":"Los Angeles...","titleLine1":"Find Your","titleLine2":"Perfect","titleAccent":"Model","searchPlaceholder":"Search by name or area..."}'::jsonb),
  ('form_config', '{"title":"Model Membership Form",...}'::jsonb)
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
```

### Environment Variables (.env.local)
```bash
# Supabase project: vdrbqgxdyebcncuyemvg
NEXT_PUBLIC_SUPABASE_URL=https://vdrbqgxdyebcncuyemvg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase Dashboard > Settings > API>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Dashboard > Settings > API>
ADMIN_EMAIL=admin@kpeachgirl.com
REVALIDATION_SECRET=<generate a random string>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @supabase/auth-helpers-nextjs | @supabase/ssr | 2024 | Must use ssr package; auth-helpers is deprecated |
| getSession() for auth | getUser() for verification | 2024 | getSession reads JWT from cookie without validation; getUser validates server-side |
| user_metadata for roles | app_metadata + Custom Access Token Hook | 2024 | user_metadata is client-writable; app_metadata is server-only |
| createClient() singleton | createClient() per-request | Current | SSR requires per-request clients for cookie isolation |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Fully deprecated. Do not install.
- `createClientComponentClient` / `createServerComponentClient`: Old API from auth-helpers. Use `createBrowserClient` / `createServerClient` from `@supabase/ssr`.

## Open Questions

1. **Supabase project credentials**
   - What we know: Project ref is `vdrbqgxdyebcncuyemvg`
   - What's unclear: The anon key and service role key need to be retrieved from the Dashboard
   - Recommendation: Implementer must get keys from Dashboard > Settings > API and create `.env.local`

2. **Admin user password**
   - What we know: Email is admin@kpeachgirl.com per CLAUDE.md
   - What's unclear: Whether the user already exists in this Supabase project
   - Recommendation: Check Dashboard > Authentication > Users first; create if not present

3. **Gallery image seed data approach**
   - What we know: Prototype uses Unsplash URLs for gallery images
   - What's unclear: Whether to insert into gallery_images table or just reference in profiles
   - Recommendation: Insert Unsplash URLs into gallery_images table with sort_order, matching the prototype. These are external URLs, not Storage uploads.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual verification via Supabase Dashboard + SQL queries |
| Config file | none -- database operations verified via SQL |
| Quick run command | `npx supabase db diff` (if CLI installed) or Dashboard SQL Editor |
| Full suite command | Run verification SQL script in Dashboard SQL Editor |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DB-01 | profiles table exists with all columns | smoke | `SELECT column_name FROM information_schema.columns WHERE table_name='profiles';` | N/A (SQL) |
| DB-02 | gallery_images table with FK | smoke | `SELECT * FROM information_schema.table_constraints WHERE table_name='gallery_images';` | N/A |
| DB-03 | groups table exists | smoke | `SELECT column_name FROM information_schema.columns WHERE table_name='groups';` | N/A |
| DB-04 | group_gallery_images with FK | smoke | `SELECT * FROM information_schema.table_constraints WHERE table_name='group_gallery_images';` | N/A |
| DB-05 | submissions table exists | smoke | `SELECT column_name FROM information_schema.columns WHERE table_name='submissions';` | N/A |
| DB-06 | site_config table exists | smoke | `SELECT * FROM site_config;` | N/A |
| DB-07 | RLS blocks anon writes to profiles | integration | Attempt anon INSERT via client -- expect 403 | Wave 0 |
| DB-08 | submissions allows anon INSERT | integration | Attempt anon INSERT to submissions -- expect success | Wave 0 |
| DB-09 | site_config public SELECT works | smoke | `SELECT * FROM site_config;` via anon client | Wave 0 |
| DB-10 | 4 storage buckets exist | smoke | `SELECT id, public FROM storage.buckets;` | N/A |
| DB-11 | Storage RLS correct | integration | Attempt anon upload to submissions -- check behavior | Wave 0 |
| DB-12 | Admin user exists | smoke | Check Dashboard > Auth > Users | Manual |
| DB-13 | JWT contains is_admin | integration | Login as admin, decode JWT, verify claim | Wave 0 |
| DB-14 | Client files created | unit | TypeScript compilation succeeds (`npm run build`) | Wave 0 |
| DB-15 | 12 seed profiles exist | smoke | `SELECT count(*) FROM profiles;` -- expect 12 | N/A |
| DB-16 | site_config rows exist | smoke | `SELECT id FROM site_config;` -- expect 6 rows | N/A |

### Sampling Rate
- **Per task commit:** Run verification SQL queries in Dashboard
- **Per wave merge:** Full `npm run build` to verify TypeScript compilation
- **Phase gate:** All verification SQL passes + build succeeds

### Wave 0 Gaps
- [ ] `supabase/verify.sql` -- verification script combining all smoke test queries
- [ ] `.env.local` -- Supabase credentials (must be created by implementer from Dashboard)
- [ ] Admin user must be created in Dashboard before running hook migration

## Sources

### Primary (HIGH confidence)
- [Supabase SSR Creating a Client](https://supabase.com/docs/guides/auth/server-side/creating-a-client) -- client.ts, server.ts, middleware.ts patterns
- [Supabase Custom Access Token Hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook) -- Hook function, GRANT requirements
- [Supabase Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) -- authorize() pattern, RLS with JWT claims
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) -- storage.objects policies, bucket_id filter
- [Supabase Storage Buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals) -- public vs private bucket semantics
- CLAUDE.md -- Complete schema definitions, config objects, env vars

### Secondary (MEDIUM confidence)
- [@supabase/ssr npm](https://www.npmjs.com/package/@supabase/ssr) -- Latest version 0.9.x confirmed
- [Supabase SSR Next.js Guide](https://supabase.com/docs/guides/auth/server-side/nextjs) -- Next.js-specific setup patterns

### Tertiary (LOW confidence)
- None -- all findings verified against official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- @supabase/ssr is the official current package, versions confirmed via npm
- Architecture: HIGH -- Schema is 100% defined in CLAUDE.md, no design decisions needed
- Auth patterns: HIGH -- Custom Access Token Hook is well-documented with official examples
- Storage patterns: HIGH -- Official docs clearly document public/private bucket + storage.objects RLS
- Pitfalls: HIGH -- Based on official docs warnings and common community issues

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (30 days -- Supabase is stable, schema is locked)
