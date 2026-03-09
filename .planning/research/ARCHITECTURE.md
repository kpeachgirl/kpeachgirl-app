# Architecture Patterns

**Domain:** Editorial model directory — Next.js 14 App Router + Supabase
**Project:** Kpeachgirl
**Researched:** 2026-03-09
**Confidence:** HIGH (verified against official Next.js and Supabase docs, current as of 2026-03)

---

## Recommended Architecture

A hybrid rendering architecture with two distinct personas:

- **Public site** (/, /model/[slug], /group/[slug], /membership): Server Components rendering ISR/SSG pages. No auth required. SEO-optimized, fast cold starts, near-instant navigation.
- **Admin CMS** (/admin, /admin/login): Client Components in an auth-gated section. Full interactivity, no static generation needed.

These two personas share the same Next.js app but use route groups to give each its own layout tree and rendering defaults.

---

## File and Folder Structure

```
kpeachgirl-app/
├── app/
│   ├── layout.tsx                    # Minimal root layout (fonts, global CSS only)
│   ├── globals.css
│   │
│   ├── (public)/                     # Route group — public site, no URL impact
│   │   ├── layout.tsx                # Public shell: grain bg, age gate wrapper
│   │   ├── page.tsx                  # / — Homepage (ISR revalidate: 60)
│   │   ├── model/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # /model/[slug] — Profile (ISR revalidate: 60)
│   │   ├── group/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # /group/[slug] — Group profile (ISR revalidate: 60)
│   │   └── membership/
│   │       └── page.tsx              # /membership — Membership form (CSR, 'use client')
│   │
│   ├── admin/                        # Admin section — NOT a route group (auth guard in layout)
│   │   ├── layout.tsx                # Auth guard: redirect to /admin/login if no session
│   │   ├── page.tsx                  # /admin — CMS dashboard (CSR)
│   │   └── login/
│   │       └── page.tsx              # /admin/login — Login form (CSR)
│   │
│   └── api/
│       ├── contact/
│       │   └── route.ts              # POST /api/contact — Resend email
│       └── revalidate/
│           └── route.ts              # POST /api/revalidate — On-demand ISR trigger
│
├── components/
│   ├── public/                       # Server Components (no 'use client')
│   │   ├── ModelCard.tsx
│   │   ├── GroupCard.tsx
│   │   ├── HeroBanner.tsx
│   │   └── ProfileGallery.tsx        # Uses Suspense boundary for lightbox
│   ├── admin/                        # All 'use client'
│   │   ├── AdminNav.tsx
│   │   ├── ModelEditor.tsx           # Slide-out panel
│   │   ├── GroupEditor.tsx
│   │   ├── SubmissionsTab.tsx
│   │   ├── SiteConfigEditor.tsx
│   │   └── PhotoEditor.tsx           # Focal point + zoom crop
│   └── shared/                       # Used by both — keep minimal, no data fetching
│       ├── AgeGate.tsx               # 'use client' (localStorage)
│       ├── Lightbox.tsx              # 'use client' (keyboard/touch events)
│       ├── ImageUpload.tsx           # 'use client' (file input, progress)
│       └── LanguageToggle.tsx        # 'use client' (i18n state)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client (createBrowserClient)
│   │   ├── server.ts                 # Server client (createServerClient + cookies)
│   │   └── middleware.ts             # updateSession helper
│   ├── types.ts                      # All TypeScript interfaces
│   ├── constants.ts                  # Design tokens as JS, static config
│   ├── i18n.ts                       # EN/Korean translation map
│   └── utils.ts                      # Crop math, slug helpers, formatters
│
├── middleware.ts                     # Supabase session refresh (all non-static routes)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

**Route group note:** The `(public)` group is purely organizational — it gives public pages their own layout (with age gate logic) while keeping admin completely separate. Admin uses a plain `admin/` segment so its path is `/admin`.

---

## Supabase Client Pattern

Three files, each for a specific execution context. This is the current `@supabase/ssr` package pattern (replaces the deprecated `@supabase/auth-helpers-nextjs`).

### lib/supabase/client.ts — Browser client

Used only in Client Components (`'use client'`). Safe to call on every render because `createBrowserClient` returns a singleton.

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Used in:** Admin CMS components, membership form file upload, AgeGate (auth state listener).

### lib/supabase/server.ts — Server client

Used in Server Components, Route Handlers, and Server Actions. Must call `cookies()` from `next/headers` (marks the request as dynamic, opts out of caching for authenticated reads).

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

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
            // Server Component can't set cookies — middleware handles this
          }
        },
      },
    }
  )
}
```

**Used in:** `app/(public)/page.tsx`, `app/(public)/model/[slug]/page.tsx`, `app/(public)/group/[slug]/page.tsx`, `app/api/revalidate/route.ts`.

**Important:** For public ISR pages that only do `SELECT`, use the **service role key** to bypass RLS, OR use the anon key with correct public-read RLS. Using the server client with anon key on an ISR page is fine — it reads as the anon user and RLS allows public SELECT.

### lib/supabase/middleware.ts — Session refresh helper

```typescript
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
          cookiesToSet.forEach(({ name, value }) =>
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

  // IMPORTANT: use getClaims() not getSession() — getSession() doesn't revalidate the JWT
  await supabase.auth.getClaims()

  return supabaseResponse
}
```

### middleware.ts — Root middleware

```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Why middleware is required:** Next.js Server Components cannot write cookies. When a Supabase auth token expires, the middleware intercepts the request, refreshes the token, writes the updated cookie to both the request (for Server Components to read) and the response (for the browser to store). Without this, authenticated server-side reads silently fail.

---

## Auth Guard Pattern — Admin Layout

The admin layout reads the session server-side and redirects unauthenticated users. This happens at the layout level, protecting all `/admin/*` routes automatically.

```typescript
// app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return <>{children}</>
}
```

**Do not use `getSession()` in server code.** Use `getUser()` which makes a network call to validate the JWT. `getSession()` only reads the cookie without validation — a security hole in admin guard contexts.

The admin `page.tsx` itself is a Server Component that passes initial data as props to Client Components:

```typescript
// app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import AdminDashboard from '@/components/admin/AdminDashboard' // 'use client'

export default async function AdminPage() {
  const supabase = await createClient()
  const [profiles, groups, submissions, siteConfig] = await Promise.all([
    supabase.from('profiles').select('*').order('sort_order'),
    supabase.from('groups').select('*').order('sort_order'),
    supabase.from('submissions').select('*').order('created_at', { ascending: false }),
    supabase.from('site_config').select('*'),
  ])

  return (
    <AdminDashboard
      initialProfiles={profiles.data}
      initialGroups={groups.data}
      initialSubmissions={submissions.data}
      initialSiteConfig={siteConfig.data}
    />
  )
}
```

The Client Component (`AdminDashboard`) takes over from there for all interactivity, mutations, and image uploads.

---

## Public Pages — ISR Pattern

```typescript
// app/(public)/model/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

// ISR: revalidate every 60 seconds
export const revalidate = 60

// Pre-build known slugs at deploy time
export async function generateStaticParams() {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('slug')
  return (data ?? []).map(({ slug }) => ({ slug }))
}

export default async function ModelProfilePage({ params }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, gallery_images(*)')
    .eq('slug', slug)
    .single()

  if (!profile) notFound()

  // Server Component renders — no 'use client' needed
  // Lightbox is a Client Component island within this Server Component
  return <ProfileLayout profile={profile} />
}
```

**ISR behavior:** Next.js builds the page at deploy time (via `generateStaticParams`), serves it from CDN, and regenerates in the background after 60s when a new request arrives post-stale. On-demand revalidation via `/api/revalidate` bypasses the 60s wait immediately after admin saves.

---

## On-Demand Revalidation API Route

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { slug, type } = await request.json()

  if (type === 'profile') {
    revalidatePath(`/model/${slug}`)
    revalidatePath('/') // homepage grid updates too
  } else if (type === 'group') {
    revalidatePath(`/group/${slug}`)
    revalidatePath('/')
  } else if (type === 'site_config') {
    revalidatePath('/', 'layout') // revalidates all pages using root data
  }

  return NextResponse.json({ revalidated: true })
}
```

The admin CMS calls this endpoint after every save operation. The admin layout fetches fresh data on next server render automatically.

---

## RLS Policy Pattern

### Philosophy

One admin user. Single email. No multi-tenant complexity. Admin claim injected into JWT via Supabase Auth Hook.

### JWT Admin Claim (Custom Access Token Hook)

Set up in Supabase Dashboard → Authentication → Hooks. Create a PL/pgSQL function that adds `is_admin: true` to the JWT for the admin user:

```sql
CREATE OR REPLACE FUNCTION public.add_admin_claim(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
BEGIN
  claims := event->'claims';

  -- Inject admin claim for the known admin email
  IF (event->>'email') = 'admin@kpeachgirl.com' THEN
    claims := jsonb_set(claims, '{is_admin}', 'true');
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;
```

Grant execute to `supabase_auth_admin` and register as the "Custom Access Token" hook.

### Helper Function (used in all RLS policies)

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'is_admin')::boolean,
    false
  )
$$;
```

### RLS Policies

```sql
-- profiles: public read, admin write
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "profiles_admin_insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "profiles_admin_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "profiles_admin_delete"
  ON profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Same pattern for: gallery_images, groups, group_gallery_images, site_config

-- submissions: anon can INSERT (form submissions), admin has full access
CREATE POLICY "submissions_anon_insert"
  ON submissions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "submissions_admin_all"
  ON submissions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- site_config: public read, admin update
CREATE POLICY "site_config_public_read"
  ON site_config FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "site_config_admin_update"
  ON site_config FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

### Storage Bucket Policies

```sql
-- Public buckets (profile-images, cover-images, gallery-images): anon read, admin write
CREATE POLICY "public_images_read"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id IN ('profile-images', 'cover-images', 'gallery-images'));

CREATE POLICY "admin_images_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('profile-images', 'cover-images', 'gallery-images')
    AND public.is_admin()
  );

CREATE POLICY "admin_images_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('profile-images', 'cover-images', 'gallery-images')
    AND public.is_admin()
  );

-- submissions bucket: anon can upload, admin can read/delete
CREATE POLICY "anon_submission_upload"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'submissions');

CREATE POLICY "admin_submission_read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'submissions' AND public.is_admin());
```

---

## Image Upload Flow

### Pattern: Client-Direct Upload (Recommended over API Route)

Uploading via an API Route has a 4MB body limit in Vercel's default config and adds latency. The recommended pattern for Supabase Storage is a client-direct upload from the browser using the browser client, with the admin JWT providing auth.

```
[Admin Client Component]
    |
    | 1. User selects file in PhotoEditor / ImageUpload
    |
    | 2. createClient() — browser client (authenticated as admin)
    |
    | 3. supabase.storage.from('profile-images').upload(path, file)
    |    — Supabase Storage RLS validates JWT admin claim
    |    — Returns publicUrl
    |
    | 4. Store publicUrl in profiles.profile_image (DB update)
    |
    | 5. Call /api/revalidate?secret=... to bust ISR cache
```

**File path convention:**
```
profile-images/{profileId}/profile.{ext}
profile-images/{profileId}/cover.{ext}
gallery-images/{profileId}/{timestamp}.{ext}
cover-images/hero.{ext}
submissions/{timestamp}-{random}.{ext}
```

**For the membership form (anon upload to submissions bucket):**

```typescript
// Client Component — membership form
const supabase = createClient() // browser client, unauthenticated
const { data, error } = await supabase.storage
  .from('submissions')
  .upload(`${Date.now()}-${file.name}`, file)
```

The `submissions` bucket RLS allows anon INSERT, so this works without auth.

---

## Component Boundaries

### Server Components (default in App Router)

No `'use client'` directive. Can be async. Cannot use hooks, browser APIs, or event handlers.

| Component | Why Server | Notes |
|-----------|-----------|-------|
| `app/(public)/page.tsx` | ISR data fetch | Renders model grid, hero |
| `app/(public)/model/[slug]/page.tsx` | ISR data fetch | Profile data |
| `app/(public)/group/[slug]/page.tsx` | ISR data fetch | Group data |
| `app/admin/page.tsx` | Initial data prefetch | Passes to client dashboard |
| `app/admin/layout.tsx` | Auth guard redirect | Server-only action |
| `components/public/ModelCard.tsx` | Pure display, no events | Receives props from page |
| `components/public/HeroBanner.tsx` | Pure display | CMS content as props |
| `components/public/ProfileGallery.tsx` | Images layout | Contains Lightbox island |

### Client Components (`'use client'` required)

| Component | Why Client | Notes |
|-----------|-----------|-------|
| `components/shared/AgeGate.tsx` | localStorage read/write | Wraps public layout |
| `components/shared/Lightbox.tsx` | Keyboard/touch events | Portalled overlay |
| `components/shared/ImageUpload.tsx` | File input, upload progress | Browser File API |
| `components/admin/AdminDashboard.tsx` | All interactivity | Top-level admin client |
| `components/admin/ModelEditor.tsx` | Forms, mutations, upload | Slide-out panel |
| `components/admin/PhotoEditor.tsx` | Mouse events, canvas | Focal point + zoom |
| `components/admin/LanguageToggle.tsx` | State (EN/KO), localStorage | i18n switch |
| `app/(public)/membership/page.tsx` | Dynamic form, file upload | `'use client'` at page level |

### The "Server Shell / Client Island" Pattern

Public pages use Server Components as the outer shell (fetches data, renders static HTML), with Client Component islands dropped in only where interactivity is needed:

```
app/(public)/model/[slug]/page.tsx   ← Server Component
  └── ProfileLayout.tsx              ← Server Component (receives props)
        ├── ProfileHero.tsx          ← Server Component
        ├── MeasurementsGrid.tsx     ← Server Component
        ├── TagPills.tsx             ← Server Component
        └── GalleryGrid.tsx          ← Server Component
              └── <Lightbox />       ← Client Component island (event-driven)
```

This maximizes HTML sent to the browser pre-rendered, minimizes JS bundle, and preserves SEO.

---

## Data Flow

### Public Page Data Flow (ISR)

```
Build time (or stale revalidation):
  Server Component → createClient() (server) → Supabase DB (anon, RLS SELECT) → props → render → HTML cached

Request time (fresh within revalidate window):
  CDN serves cached HTML → no DB hit

On-demand revalidation:
  Admin saves → POST /api/revalidate → revalidatePath('/model/[slug]') → Next.js clears cache → next request re-fetches
```

### Admin CMS Data Flow

```
Page load:
  Server Component (page.tsx) → createClient() (server) → Supabase DB (authenticated) → initialData props

User interaction (CRUD):
  Client Component → createClient() (browser) → Supabase DB mutation (RLS admin check) → optimistic UI update

Image upload:
  Client Component → createClient() (browser) → supabase.storage.upload() → publicUrl → DB update → revalidate API call

After save:
  Client Component → fetch('/api/revalidate', { secret, slug, type }) → revalidatePath → ISR cache cleared
```

---

## Build Order (Phase Sequencing)

Based on dependencies between layers:

### Phase 1: Foundation
Next.js 14 project scaffolding, Tailwind with design tokens, fonts, globals.css, `lib/types.ts`, `lib/constants.ts`, `lib/i18n.ts`. No Supabase yet — static shell.

**Why first:** Everything else imports from `lib/`. Tailwind tokens and TypeScript types must exist before components.

### Phase 2: Supabase Setup
Migrations (all 5 tables), storage buckets + RLS, Auth hook for admin claim, `lib/supabase/client.ts` + `server.ts` + `middleware.ts`, seed data (12 models + default site_config).

**Why second:** Public pages and admin both depend on live DB. Can't build real components without data contracts.

### Phase 3: Public Pages
AgeGate, ModelCard, HeroBanner, homepage, model profile, group profile, membership form. Deploy to Vercel with ISR.

**Why third:** These are the product's core value. Vercel deploy validates ISR works before admin complexity.

### Phase 4: Admin CMS
Login, auth guard layout, all admin tabs, image upload + PhotoEditor, on-demand revalidation hookup, Resend contact form.

**Why fourth:** Admin depends on public DB schema existing and ISR being deployed (admin triggers revalidation of public pages).

---

## Scalability Considerations

| Concern | Current approach | At scale |
|---------|-----------------|----------|
| Profile pages | ISR 60s | Reduce revalidate, add on-demand |
| DB reads (public) | Server Component per request (on miss) | CDN cache absorbs load |
| Image delivery | Supabase Storage public CDN | Already CDN-backed |
| Admin concurrency | Single admin, no contention | N/A by design |
| DB connections | Supabase connection pooler (PgBouncer) | Already included |

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Using `getSession()` in Server Code
**What:** `supabase.auth.getSession()` in middleware, server components, or API routes.
**Why bad:** It reads the session from the cookie without revalidating the JWT against Supabase's public keys. An expired or tampered token can pass the check.
**Instead:** Use `supabase.auth.getUser()` in server components for auth guard. Use `supabase.auth.getClaims()` in middleware for session refresh.

### Anti-Pattern 2: Calling the Server Client from Client Components
**What:** Importing `@/lib/supabase/server` inside a file with `'use client'`.
**Why bad:** `cookies()` from `next/headers` is not available in the browser. Will throw a runtime error.
**Instead:** Client Components always use `@/lib/supabase/client` (createBrowserClient).

### Anti-Pattern 3: Fetching Data in Client Components for Public Pages
**What:** Public pages using `useEffect` + fetch instead of Server Component data fetching.
**Why bad:** Eliminates ISR. Every user gets a loading state, then a fetch. SEO sees an empty page. Slow.
**Instead:** Fetch in the Server Component, pass as props to any child Client Components that need it.

### Anti-Pattern 4: Single Supabase Client File with Environment Check
**What:** One `supabase.ts` that uses `typeof window` to pick server vs browser client.
**Why bad:** Fragile — Next.js can run the same module in multiple contexts. Leads to subtle cookie-handling bugs.
**Instead:** Three separate files (`client.ts`, `server.ts`, `middleware.ts`) with explicit import paths.

### Anti-Pattern 5: Uploading Images via API Route Body
**What:** Sending the file as FormData to a Next.js API route which then uploads to Supabase.
**Why bad:** Vercel's default body size limit is 4.5MB. Doubles bandwidth (client → server → Supabase).
**Instead:** Client-direct upload to Supabase Storage using the browser client. The admin JWT carries the auth claim.

### Anti-Pattern 6: Admin Dashboard as a Server Component
**What:** Trying to render the admin CMS as a Server Component to avoid `'use client'`.
**Why bad:** The admin is a highly interactive SPA-like interface (tabs, slide-outs, real-time form state). Server Components have no event handlers, no state, no forms without Server Actions.
**Instead:** Admin dashboard root is a Client Component. Use Server Component for the initial data prefetch in `page.tsx`, pass data as props.

---

## Sources

- [Supabase: Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) — HIGH confidence, official docs
- [Supabase: Creating a Supabase client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client) — HIGH confidence, official docs
- [Supabase: Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) — HIGH confidence, official docs
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — HIGH confidence, official docs
- [Next.js: Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) — HIGH confidence, official docs (last updated 2026-02-27)
- [Next.js: revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) — HIGH confidence, official docs
- [Supabase: Migrating to SSR from Auth Helpers](https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers) — HIGH confidence, migration guide confirming @supabase/ssr is the current package
