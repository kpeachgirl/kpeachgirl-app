# Domain Pitfalls: Next.js 14 App Router + Supabase + Vercel

**Domain:** Editorial model directory (admin CMS + public directory + image-heavy)
**Stack:** Next.js 14 App Router, TypeScript strict, Supabase (Auth + DB + Storage), Vercel
**Researched:** 2026-03-09

---

## Critical Pitfalls

Mistakes that cause data leaks, security holes, broken auth, or full rewrites.

---

### Pitfall 1: Using the Wrong Supabase Client in Server Code

**What goes wrong:** Calling `createBrowserClient` in a Server Component, Route Handler, or
middleware. The browser client cannot read or set cookies in a server context, so auth state is
always null server-side. The user appears logged out even after a successful sign-in.

**Why it happens:** Both clients have the same surface-area API. Importing the wrong one silently
fails — no type error, no runtime crash.

**Consequences:** Admin guard middleware lets unauthenticated users through. Server Components
that fetch with the admin's identity fetch as anon instead, returning empty or public-only data.

**Prevention:**
- `lib/supabase/server.ts` — exports `createServerClient` (from `@supabase/ssr`) for use in
  Server Components, Route Handlers, and middleware.
- `lib/supabase/client.ts` — exports `createBrowserClient` (from `@supabase/ssr`) for use in
  Client Components only.
- Never import from the wrong file. Add a comment at the top of each: `// SERVER ONLY` /
  `// CLIENT ONLY`.

**Detection:** If `supabase.auth.getUser()` returns `null` in a Server Component right after
login, the wrong client is being used.

**Phase:** Session 2 (Supabase setup) — get client separation right before writing any pages.

---

### Pitfall 2: Skipping or Incorrectly Implementing the Auth Middleware

**What goes wrong:** Auth middleware is omitted, or it calls `getSession()` instead of
`getClaims()` / `getUser()`. Session cookies silently expire and are never refreshed. Server
Components receive stale or missing tokens. Admin routes become intermittently accessible after
token expiry.

**Why it happens:** `getSession()` reads the cookie without revalidating with the Supabase Auth
server. It appears to work during development when tokens are fresh but breaks in production
after the token TTL (1 hour by default).

**Consequences:** Admin is locked out after token expiry with a confusing redirect loop. Or
worse: expired tokens are trusted and admin access persists longer than it should.

**Prevention:**
The middleware must:
1. Call `supabase.auth.getClaims()` (not `getSession()`) — this validates the JWT signature
   against Supabase's published public keys.
2. Pass the refreshed token to Server Components via `request.cookies.set`.
3. Pass the refreshed token back to the browser via `response.cookies.set`.
4. Include a `matcher` that excludes `/_next/static`, `/_next/image`, and `/favicon.ico`.

```typescript
// middleware.ts — correct pattern (simplified)
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
  // getClaims() validates JWT signature — do not use getSession() here
  await supabase.auth.getClaims()
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

**Detection:** Admin routes become accessible after an hour without a page reload, or admin is
redirect-looped after token expiry.

**Phase:** Session 2 (Supabase setup) — must be correct before admin pages are built.

---

### Pitfall 3: Storing Admin JWT Claims in user_metadata Instead of app_metadata

**What goes wrong:** The admin JWT claim (e.g., `is_admin: true`) is written to
`raw_user_meta_data`. Any authenticated user can update their own `user_metadata` via the
client SDK, giving themselves admin access.

**Why it happens:** `updateUser({ data: { is_admin: true } })` works from the client and writes
to `user_metadata`. It's the obvious API for attaching data to users, but it's user-writable.

**Consequences:** Any model or visitor who learns the pattern can escalate to admin. All RLS
write policies built on `auth.jwt() ->> 'is_admin'` become bypassed.

**Prevention:**
- Use the **service role key** (server-only) and `admin.auth.admin.updateUserById()` to write
  to `app_metadata`:
  ```sql
  -- Or directly via SQL migration for the single admin user:
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
  WHERE email = 'admin@kpeachgirl.com';
  ```
- RLS policies must read from `app_metadata`:
  ```sql
  -- Correct: reads from app_metadata (user cannot modify)
  (auth.jwt() -> 'app_metadata' ->> 'is_admin') = 'true'

  -- Wrong: reads from user_metadata (user can modify)
  auth.jwt() ->> 'is_admin' = 'true'
  ```
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code.

**Detection:** Test by calling `supabase.auth.updateUser({ data: { is_admin: true } })` from a
non-admin browser session. If this grants write access to profiles, the claim is in the wrong
place.

**Phase:** Session 2 (Supabase setup) — must be done before any RLS policy is written.

---

### Pitfall 4: Forgetting to Enable RLS or Writing Incomplete Policies

**What goes wrong:** Tables are created without `ENABLE ROW LEVEL SECURITY`. Or RLS is enabled
but policies are missing for some operations (e.g., UPDATE exists but no WITH CHECK clause).
Or the SQL editor is used to test policies — it runs as the `postgres` superuser, which bypasses
all RLS, making every query succeed even with broken policies.

**Why it happens:** RLS is opt-in. The dashboard default creates tables with RLS off. The SQL
editor runs as superuser, giving false confidence.

**Consequences for this project:**
- `submissions` table (ID verification photos, personal data) readable by anyone.
- `site_config` writable by anon users — attackers can replace the hero banner.
- `profiles` and `gallery_images` deletable by anyone.

**Prevention:**
- Every `CREATE TABLE` migration must end with `ALTER TABLE [table] ENABLE ROW LEVEL SECURITY`.
- Policy pattern for this project:
  ```sql
  -- Public tables (profiles, gallery_images, groups, group_gallery_images, site_config)
  CREATE POLICY "public_select" ON profiles FOR SELECT USING (true);
  CREATE POLICY "admin_insert" ON profiles FOR INSERT
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'is_admin') = 'true');
  CREATE POLICY "admin_update" ON profiles FOR UPDATE
    USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin') = 'true')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'is_admin') = 'true');
  CREATE POLICY "admin_delete" ON profiles FOR DELETE
    USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin') = 'true');

  -- submissions: anon INSERT, admin all
  CREATE POLICY "anon_insert" ON submissions FOR INSERT WITH CHECK (true);
  CREATE POLICY "admin_all" ON submissions FOR ALL
    USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin') = 'true');
  ```
- Test policies via the Supabase client SDK with an actual anon session, not the SQL editor.

**Detection:** After enabling RLS, query a table from the API using the anon key without auth.
If you get data back from `submissions`, RLS is broken.

**Phase:** Session 2 (Supabase setup).

---

### Pitfall 5: Routing Image Uploads Through Next.js API Routes (Hitting Vercel's 4.5MB Limit)

**What goes wrong:** Image uploads are sent to a Next.js Route Handler (`/api/upload`), which
then forwards to Supabase Storage. Vercel serverless functions have a hard 4.5MB request body
limit. Next.js Server Actions default to 1MB. Gallery photos and ID verification photos routinely
exceed both limits. Large uploads silently fail or return a generic 413 error.

**Why it happens:** Proxying uploads through API routes feels natural for adding auth checks.
The limit is not obvious until production.

**Consequences:** Gallery image uploads fail for anything above 4.5MB. ID verification photo
uploads (which need to be high quality) fail. The admin photo editor becomes unreliable.

**Prevention:**
Upload directly from the browser to Supabase Storage using signed upload URLs:
1. Server Action creates a signed upload URL (auth check happens here, server-side).
2. Client uses the signed URL to PUT the file directly to Supabase — bypasses Vercel entirely.
3. Server Action records the resulting storage path in the database.

```typescript
// Server Action — creates signed URL (runs on server, safe)
async function getSignedUploadUrl(bucket: string, path: string) {
  const supabase = createServerClient(...)
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path)
  return data?.signedUrl
}
```

Supabase Storage accepts files up to 5GB. The 4.5MB limit only applies to the Vercel function
receiving the request — never let it receive the file body.

**Detection:** Upload a 6MB test image through the admin CMS. If it fails, uploads are routing
through Vercel.

**Phase:** Session 4 (Admin image uploads).

---

## Moderate Pitfalls

Mistakes that cause debugging time, stale data, or subtle breakage.

---

### Pitfall 6: next/image Without remotePatterns Configuration

**What goes wrong:** The `<Image>` component from `next/image` refuses to load Supabase Storage
URLs with an `Invalid src` error in development, or an `INVALID_IMAGE_OPTIMIZE_REQUEST` error
in production. Old `domains` config (deprecated since Next.js 14) does not work correctly.

**Prevention:**
Add `remotePatterns` to `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'vdrbqgxdyebcncuyemvg.supabase.co',
      port: '',
      pathname: '/storage/v1/object/public/**',
    },
    // Also add the render/image path if using Supabase image transformations:
    {
      protocol: 'https',
      hostname: 'vdrbqgxdyebcncuyemvg.supabase.co',
      port: '',
      pathname: '/storage/v1/render/image/**',
    },
  ],
},
```

Note: Supabase's image transformation endpoint (`/render/image/`) can serve as a custom loader
for `next/image`, enabling on-the-fly resizing. This requires Pro plan on Supabase but avoids
double-optimization (Vercel + Supabase both resizing).

**Detection:** Any `<Image src="https://vdrbqgxdyebcncuyemvg.supabase.co/...">` throws a
console error on first render.

**Phase:** Session 1 (Foundation — configure `next.config.ts` before building any image-heavy
components).

---

### Pitfall 7: ISR Cache Not Updating After Admin CMS Edits

**What goes wrong:** Admin updates a model profile (name, bio, photos). The public profile
page at `/model/[slug]` still shows the old data. The `revalidate: 60` ISR means visitors
see stale data for up to 60 seconds, but there is an additional problem: Next.js also has a
client-side router cache that cannot be invalidated programmatically. Even after the server
cache clears, users who navigated to the page earlier may still see old data until they hard
refresh.

**Additional issue:** The `fetch` cache in Next.js App Router caches Supabase query results
by URL. After an RLS change or data update, the page may serve stale data even after
`revalidatePath` is called, because the cached URL hash matches a previous query.

**Prevention:**
1. Implement the on-demand revalidation API route at `/api/revalidate` and call it from Server
   Actions after every profile/group update.
2. Use `revalidatePath('/model/[slug]', 'page')` and `revalidatePath('/')` — revalidate both
   the list page and the individual profile page.
3. For the admin CMS itself (CSR), do not rely on ISR — always fetch fresh data with
   `cache: 'no-store'` in admin Supabase queries.
4. Protect the revalidation endpoint with a secret: `REVALIDATION_SECRET` env var checked
   against the request header.
5. For debugging stale data during development: change `.select('*')` to
   `.select('column_name')` — if this reveals fresh data, URL caching is the cause.

**Detection:** Edit a model name in the admin CMS. Immediately visit the public profile URL
in a new incognito window. If the old name appears, revalidation is broken.

**Phase:** Session 3 (Public pages) for ISR setup; Session 4 (Admin) for CMS-triggered
revalidation.

---

### Pitfall 8: Supabase Storage RLS Policies Missing on storage.objects

**What goes wrong:** Creating buckets in the Supabase dashboard (even marking them "public")
does not automatically create RLS policies on `storage.objects`. Uploads from the admin return
a 403 even with a valid admin JWT. Anonymous visitors cannot view images even from public
buckets (when using the `/object/` endpoint rather than `/object/public/`).

**Why it happens:** "Public bucket" means unauthenticated users can read via the
`/object/public/` URL. It does not mean write operations are permitted. Separate RLS policies
on `storage.objects` control who can INSERT, UPDATE, and DELETE.

**Prevention:**
```sql
-- Allow public read from public buckets (profile-images, cover-images, gallery-images)
CREATE POLICY "public_read"
ON storage.objects FOR SELECT
USING (bucket_id IN ('profile-images', 'cover-images', 'gallery-images'));

-- Allow admin to upload/delete from all buckets
CREATE POLICY "admin_write"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('profile-images', 'cover-images', 'gallery-images', 'submissions')
  AND (auth.jwt() -> 'app_metadata' ->> 'is_admin') = 'true'
);

CREATE POLICY "admin_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('profile-images', 'cover-images', 'gallery-images', 'submissions')
  AND (auth.jwt() -> 'app_metadata' ->> 'is_admin') = 'true'
);

-- Allow anon to INSERT into submissions bucket (ID verification)
CREATE POLICY "anon_submission_upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'submissions');
```

**Detection:** Log in as admin, attempt a test upload to `profile-images`. If you receive
`new row violates row-level security policy`, storage RLS policies are missing.

**Phase:** Session 2 (Supabase setup).

---

### Pitfall 9: TypeScript Generated Types Becoming Stale After Schema Migrations

**What goes wrong:** `database.types.ts` is generated once at project start and never
regenerated. After adding columns (e.g., adding `parent_region` to `profiles`), TypeScript
believes the old schema is current. Inserts succeed at runtime but TypeScript does not complain
about missing required fields. With `strictNullChecks: true`, accessing columns that are now
nullable causes type errors only after regeneration — making them easy to miss.

**Prevention:**
1. Regenerate types after every migration:
   ```bash
   npx supabase gen types typescript --project-id vdrbqgxdyebcncuyemvg > src/lib/database.types.ts
   ```
2. Add this command to `package.json` scripts:
   ```json
   "db:types": "supabase gen types typescript --project-id vdrbqgxdyebcncuyemvg > src/lib/database.types.ts"
   ```
3. The `attributes jsonb` column on `profiles` and `groups` will type as `Json | null`. Create
   explicit TypeScript interfaces for the shape of `attributes` — do not let it stay as `Json`
   throughout the codebase.
4. `tsconfig.json` must have `"strictNullChecks": true` for generated types to surface nullable
   column issues correctly.

**Detection:** After running a migration, run `npm run build`. Type errors will surface in
components that reference changed columns.

**Phase:** Session 2 (Supabase setup) for initial generation; ongoing after every migration.

---

### Pitfall 10: Service Role Key Leaking to the Client Bundle

**What goes wrong:** `SUPABASE_SERVICE_ROLE_KEY` is referenced in a Server Component, then
that Server Component passes data to a Client Component. Or the key is accidentally prefixed
with `NEXT_PUBLIC_`. The service role key bypasses all RLS — exposure means anyone can read
submissions (ID photos, personal data), delete models, or modify site_config.

**Prevention:**
- Never prefix with `NEXT_PUBLIC_`. It must remain `SUPABASE_SERVICE_ROLE_KEY`.
- Only use the service role key in Route Handlers (not Server Components that render UI) or
  in the `lib/supabase/admin.ts` utility specifically for admin-only server operations.
- Add a lint rule or comment: `// This file is SERVER ONLY — never import in client components`.
- After `npm run build`, check the output: the service role key string must not appear in
  `.next/static/chunks/`.

**Detection:** Run `grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" .next/static/` after a
production build. If the JWT appears (service role keys start with that base64 header), it has
leaked.

**Phase:** Session 2 (Supabase setup) — establish the admin client file boundary before any
code uses the service role key.

---

## Minor Pitfalls

Issues that cause confusion or wasted debugging time but are easily fixed.

---

### Pitfall 11: Vercel Preview Deployments Connect to Production Supabase

**What goes wrong:** Every Vercel preview deployment (from pull requests or branch pushes) uses
the same `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as production. Seed data
tests or admin CMS tests on preview URLs modify or delete production model profiles.

**Prevention:**
- Be explicit in team/solo workflow: only test data operations on `localhost`, never on Vercel
  preview URLs.
- For this solo-admin project, this risk is lower, but note: any preview URL shared with a
  client or photographer gives them a live connection to the production database.
- Consider setting preview-specific env vars in Vercel dashboard to point to a test Supabase
  project (free tier works for this purpose).

**Phase:** Session 3 (Deploy to Vercel).

---

### Pitfall 12: generateStaticParams Does Not Pre-Render All Slugs for ISR

**What goes wrong:** `generateStaticParams` is expected to pre-build all model and group profile
pages at deploy time. But after seeding 12 models, if `generateStaticParams` calls Supabase
and the service is slow, the build times out or generates zero pages. Pages are then
rendered on first request (ISR fallback), meaning the first visitor hits a cold render.

**Why it happens:** `generateStaticParams` makes a live Supabase query during `next build`. This
is correct behavior, but cold Supabase connections during build add latency.

**Prevention:**
- Use `dynamicParams = true` (default) so ungenerated slugs render on first request and are
  then cached. This is acceptable for 12 models.
- Keep `generateStaticParams` simple — only select `slug`:
  ```typescript
  export async function generateStaticParams() {
    const supabase = createServerClient(...)
    const { data } = await supabase.from('profiles').select('slug')
    return (data ?? []).map(({ slug }) => ({ slug }))
  }
  ```
- Do not call `generateStaticParams` for admin routes — they are CSR and should never be
  statically generated.

**Phase:** Session 3 (Public pages).

---

### Pitfall 13: Age Gate Bypassed by Direct URL Navigation

**What goes wrong:** The age gate is implemented as a client-side state or a cookie checked
in a Client Component. Users can navigate directly to `/model/[slug]` and bypass it. This is
a minor legal/compliance issue for the adult content implied by some shoot types (lingerie,
artistic).

**Prevention:**
- Store age gate confirmation in a cookie (not just React state).
- Check the cookie in middleware and redirect ungated users to `/?gate=true` if they attempt
  to access any `/model/*` or `/group/*` route directly.
- This is low-priority for v1 but should be addressed before public launch.

**Phase:** Session 3 (Public pages).

---

### Pitfall 14: Korean i18n Breaks If Translation Keys Are Missing

**What goes wrong:** A new UI label is added in English but not added to the Korean translation
map in `lib/i18n.ts`. In Korean mode, the label renders as `undefined` or the raw key string.
With `strict` TypeScript, accessing a non-existent key on a typed object throws a compile error
— but only if the i18n object is fully typed.

**Prevention:**
- Type the translation object explicitly with `Record<string, string>` or a union of string
  literals.
- Add a helper: `t(key: keyof typeof translations)` that TypeScript enforces at call sites.
- Every time a UI string is added, add both `en` and `ko` entries before committing.

**Phase:** Session 3 (Public pages) and Session 4 (Admin).

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|----------------|------------|
| Session 2 | Supabase client setup | Wrong client (browser vs server) | Create `lib/supabase/server.ts` and `lib/supabase/client.ts` as separate files from day one |
| Session 2 | Auth middleware | Using `getSession()` instead of `getClaims()` | Follow current `@supabase/ssr` docs exactly; the API changed in 2024 |
| Session 2 | JWT admin claim | Writing to user_metadata (user-writable) | Write via SQL migration to `raw_app_meta_data` |
| Session 2 | RLS | No policies on `storage.objects` | Run storage policies as part of migration, not as a separate afterthought |
| Session 2 | TypeScript types | Generated types not yet generated | Run `db:types` immediately after first migration |
| Session 3 | next/image | Missing `remotePatterns` | Add Supabase hostname to `next.config.ts` in Session 1 |
| Session 3 | ISR | On-demand revalidation endpoint not secured | Require `REVALIDATION_SECRET` header check from day one |
| Session 4 | Image uploads | Routing through Vercel (4.5MB limit) | Use signed upload URLs from the start; retrofit is painful |
| Session 4 | Service role key | Used in a Client Component path | Keep `lib/supabase/admin.ts` server-only; add comment |

---

## Sources

- [Setting up Server-Side Auth for Next.js — Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Creating a Supabase client for SSR — Supabase Docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [AuthSessionMissingError in Next.js 14.2+ — GitHub Issue #107](https://github.com/supabase/ssr/issues/107)
- [Troubleshooting Next.js + Supabase Auth — Supabase Docs](https://supabase.com/docs/guides/troubleshooting/how-do-you-troubleshoot-nextjs---supabase-auth-issues-riMCZV)
- [Custom Claims & RBAC — Supabase Docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [RLS Performance and Best Practices — Supabase Docs](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv)
- [Fixing RLS Misconfigurations in Supabase — ProsperaSoft](https://prosperasoft.com/blog/database/supabase/supabase-rls-issues/)
- [Next.js 13/14 Stale Data with RLS — Supabase Discussion #19084](https://github.com/orgs/supabase/discussions/19084)
- [Stale Data Troubleshooting — Supabase Docs](https://supabase.com/docs/guides/troubleshooting/nextjs-1314-stale-data-when-changing-rls-or-table-data-85b8oQ)
- [Storage Access Control — Supabase Docs](https://supabase.com/docs/guides/storage/security/access-control)
- [Storage Image Transformations — Supabase Docs](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [Storage does not work with Next.js image optimization — GitHub Issue #3821](https://github.com/supabase/supabase/issues/3821)
- [Images from Supabase storage result in INVALID_IMAGE_OPTIMIZE_REQUEST — Vercel Community](https://community.vercel.com/t/images-from-supabase-storage-result-in-invalid-image-optimize-request/6009)
- [How to Bypass Vercel's 4.5MB Body Size Limit Using Supabase — Medium](https://medium.com/@jpnreddy25/how-to-bypass-vercels-4-5mb-body-size-limit-for-serverless-functions-using-supabase-09610d8ca387)
- [Signed URL file uploads with Next.js and Supabase — Medium](https://medium.com/@olliedoesdev/signed-url-file-uploads-with-nextjs-and-supabase-74ba91b65fe0)
- [Why is my service role key client getting RLS errors? — Supabase Docs](https://supabase.com/docs/guides/troubleshooting/why-is-my-service-role-key-client-getting-rls-errors-or-not-returning-data-7_1K9z)
- [Generating TypeScript Types — Supabase Docs](https://supabase.com/docs/guides/api/rest/generating-types)
- [How to Think About Security in Next.js — Next.js Blog](https://nextjs.org/blog/security-nextjs-server-components-actions)
- [next.config.js images remotePatterns — Next.js Docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/images)
