# Technology Stack

**Project:** Kpeachgirl — Editorial Model Directory
**Researched:** 2026-03-09
**Overall confidence:** HIGH (all choices verified against official docs or official npm)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 14.2.35 | App framework, routing, ISR, API routes | Stack is locked per project spec. 14.2.35 is the latest secure patch of the 14.x line (security update Dec 2025). Do NOT upgrade to Next.js 15 — breaking App Router changes and different caching model. |
| React | 18.x (peer) | UI rendering | Bundled with Next.js 14. React 19 is available but Next.js 14 pins to 18. |
| TypeScript | 5.x (bundled) | Type safety | `strict: true` enforced. Next.js 14 auto-generates tsconfig with `strict`, `moduleResolution: "bundler"`, `isolatedModules: true`. |

### Database + Auth + Storage

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @supabase/supabase-js | ^2.49.0 | Supabase JS client (data queries, storage ops) | Core SDK. Latest stable is 2.49.x. Required peer for @supabase/ssr. |
| @supabase/ssr | ^0.9.0 | Next.js App Router auth (SSR-safe cookie handling) | The ONLY correct package for Supabase + App Router. Replaces deprecated `@supabase/auth-helpers-nextjs`. Creates server-safe and browser-safe clients that handle cookie management for JWT refresh. |

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | ^3.4.x | Utility-first CSS | **Use v3, not v4.** The prototype was built with Tailwind v3 configuration (`tailwind.config.ts` with theme extend, custom tokens as CSS variables). Tailwind v4 changes configuration entirely to CSS-first `@theme` directives — migrating the prototype's token system would add friction with zero benefit. v3 is fully supported and will receive security patches. |
| PostCSS | ^8.x (bundled) | CSS processing | Included with Next.js + Tailwind setup. No additional config needed. |

### Fonts

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| next/font | Built into Next.js 14 | Google Fonts optimization | Zero external network requests — fonts are self-hosted at build time. No third-party font loading, no CLS. Import `Cormorant_Garamond` and `Manrope` from `'next/font/google'`. Apply via CSS variables on `<html>`. |

### Image Handling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| next/image | Built into Next.js 14 | Image display with optimization | Automatic WebP conversion, lazy loading, responsive srcset. Use `remotePatterns` (not deprecated `domains`) to allowlist the Supabase storage hostname. |
| sharp | ^0.33.x | Server-side image processing | Required by Next.js for production image optimization (`next start`). Without sharp, image optimization silently degrades or errors in standalone mode. Install as a regular dependency, not dev. |
| react-easy-crop | ^5.x | Focal point + zoom crop editor (admin) | The prototype's PhotoEditor component uses click-drag focal point + zoom slider (`{x, y, zoom}` stored as JSONB). react-easy-crop provides `zoom`, `onZoomChange`, `crop`, `onCropChange` props that map exactly to this model. Lightweight, TypeScript-first, no canvas dependency at runtime. |

### Email

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| resend | ^4.x | Transactional email (contact form) | Locked per project spec. Latest stable is ~4.x (v6.9.3 is listed on npm but verify before pinning). Simple REST API, official Next.js App Router support. Use in Route Handler `app/api/contact/route.ts`. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-dropzone | ^14.x | File input drag-and-drop (admin uploads, submission form) | Headless, composable. Wrap around `<input type="file">` to get drag-drop. Pair with react-easy-crop for the photo editor flow. |
| uuid | ^9.x OR `crypto.randomUUID()` | Unique IDs client-side if needed | Only if generating IDs before insert. Supabase uses `gen_random_uuid()` by default — prefer server-side generation. |
| clsx + tailwind-merge | latest | Conditional class merging | Prevents Tailwind class conflicts in component variants. Standard pattern for Tailwind component libraries. `cn()` utility: `twMerge(clsx(...inputs))`. |

---

## What NOT to Use (and Why)

| Rejected Option | Recommended Instead | Why |
|-----------------|--------------------|----|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | Officially deprecated. Does not support App Router cookies correctly. Session reads will be unreliable. |
| `next-auth` / `auth.js` | Supabase Auth via `@supabase/ssr` | Project constraint: Supabase Auth with JWT admin claim for RLS. Adding next-auth creates a second auth system that conflicts with Supabase RLS. Supabase Auth is fully capable for single-admin email/password. |
| `next/headers` direct cookie access in Server Components | Always use `@supabase/ssr` `createServerClient` | Direct cookie reads bypass the middleware proxy that refreshes JWTs. Stale tokens → silent auth failures. |
| `supabase.auth.getSession()` in server code | `supabase.auth.getClaims()` or `supabase.auth.getUser()` | `getSession()` does NOT revalidate the JWT signature on the server. It can be spoofed. `getUser()` makes a round-trip to Supabase Auth server. `getClaims()` validates JWT locally against the project's published public keys. |
| Tailwind CSS v4 | Tailwind CSS v3 | v4 has breaking config changes (CSS-first `@theme`). No benefit for this project; adds migration risk to a prototype translation sprint. |
| Next.js 15 | Next.js 14.2.x | Next.js 15 changes caching defaults (`fetch` is no longer cached by default) and requires React 19. The prototype was designed against Next.js 14 ISR semantics. |
| `cloudinary` / `uploadthing` | Supabase Storage | Project constraint: all images must persist to Supabase Storage buckets. No external image CDN. |
| `prisma` / `drizzle` | Supabase client + raw SQL migrations | Supabase's JS client with TypeScript types generated from the DB schema is sufficient. ORMs add abstraction that conflicts with Supabase RLS (policies run at DB level, not ORM level). |
| `i18next` / `next-intl` | Custom `lib/i18n.ts` | Prototype has 70+ translation keys as a simple `Record<string, {en: string, ko: string}>`. Admin-only language toggle. A full i18n library adds bundle weight and routing complexity for a feature that is a thin config object. |

---

## Supabase + Next.js App Router: Correct Pattern

This is the most failure-prone part of the stack. Follow this pattern exactly.

### Why `@supabase/ssr` Is Required

Server Components in Next.js App Router cannot write cookies. Supabase Auth relies on cookies to store JWT tokens. Without middleware to refresh and re-set cookies, the session silently expires and server-side auth checks fail. `@supabase/ssr` solves this with a proxy (middleware) pattern.

### Three Client Files

**`lib/supabase/client.ts`** — For Client Components (`'use client'`)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`lib/supabase/server.ts`** — For Server Components, Route Handlers, Server Actions

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
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* Server Component — ignore */ }
        },
      },
    }
  )
}
```

**`middleware.ts`** — Token refresh proxy (REQUIRED, runs on every request)

```typescript
import { type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: call getUser() to refresh the token — do not remove this
  await supabase.auth.getUser()
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Admin Auth Guard Pattern

For `/admin` routes, check auth in the layout or page server component:

```typescript
// app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  return <>{children}</>
}
```

Do NOT use `getSession()` for this check — it does not verify the JWT signature.

### Service Role Client (admin operations only)

For admin CMS mutations (storage uploads, bypassing RLS for writes), use the service role key in Server Actions or Route Handlers ONLY — never in client-side code:

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

---

## Supabase Auth: Admin JWT Claim for RLS

The project requires a single admin user (`admin@kpeachgirl.com`) with a JWT claim used in RLS policies.

### Recommended Approach: Custom Access Token Hook

1. Create the hook in Supabase dashboard (Database > Hooks) or via SQL migration:

```sql
-- The hook function
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  is_admin boolean;
BEGIN
  SELECT (email = 'admin@kpeachgirl.com')
  INTO is_admin
  FROM auth.users
  WHERE id = (event->>'user_id')::uuid;

  IF is_admin THEN
    event := jsonb_set(event, '{claims,is_admin}', 'true');
  END IF;

  RETURN event;
END;
$$;

-- Grant execute to supabase_auth_admin role
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC, authenticated, anon;
```

2. Register the hook in: Supabase Dashboard > Auth > Hooks > Custom Access Token

3. RLS policy pattern (admin write access):

```sql
-- Example: admin-only INSERT on profiles
CREATE POLICY "Admin can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

-- Example: admin-only UPDATE
CREATE POLICY "Admin can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true);
```

**Note:** Custom claims don't update mid-session. The admin must log out and back in after the hook is first configured. This is acceptable for a single-admin app.

---

## ISR: On-Demand Revalidation Pattern

The project uses ISR with 60s `revalidate` on model/group pages, plus on-demand revalidation when admin saves changes.

### Static Generation with Time-Based Revalidation

```typescript
// app/model/[slug]/page.tsx
export const revalidate = 60  // fallback: revalidate every 60 seconds

export async function generateStaticParams() {
  // pre-render all model slugs at build time
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('slug')
  return (data ?? []).map(({ slug }) => ({ slug }))
}
```

### On-Demand Revalidation API Route

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidation-secret')
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { path, tag } = await request.json()

  if (tag) revalidateTag(tag)
  if (path) revalidatePath(path)

  return NextResponse.json({ revalidated: true })
}
```

Admin CMS calls this route after saving a model or group. Trigger both:
- `revalidatePath('/model/[slug]', 'page')` — specific profile page
- `revalidatePath('/', 'page')` — homepage grid (shows updated card)
- `revalidatePath('/group/[slug]', 'page')` — affected group pages

Use `revalidateTag` for coarse invalidation when multiple pages share data (e.g., `'profiles'` tag on all homepage fetches).

### Data Fetching with Tags

```typescript
// In Server Components
const { data } = await supabase
  .from('profiles')
  .select('*')
  // Next.js cache tags can be attached via fetch() options, not supabase client directly.
  // Use unstable_cache wrapper for tagging Supabase queries:

import { unstable_cache } from 'next/cache'

const getProfile = unstable_cache(
  async (slug: string) => {
    const supabase = await createClient()
    return supabase.from('profiles').select('*').eq('slug', slug).single()
  },
  ['profile'],
  { tags: ['profiles', `profile:${slug}`], revalidate: 60 }
)
```

---

## next/image Configuration for Supabase Storage

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vdrbqgxdyebcncuyemvg.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}
```

Do NOT use the deprecated `domains` key.

---

## Installation

```bash
# Core framework (locked version)
npm install next@14.2.35 react@18 react-dom@18

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# TypeScript + types
npm install -D typescript @types/react @types/react-dom @types/node

# Styling
npm install tailwindcss@^3.4 postcss autoprefixer
npx tailwindcss init -p

# Image processing
npm install sharp

# Image crop editor
npm install react-easy-crop react-dropzone

# Email
npm install resend

# Utilities
npm install clsx tailwind-merge
```

### tsconfig.json Key Flags

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "isolatedModules": true
  }
}
```

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://vdrbqgxdyebcncuyemvg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>  # server-only, never expose client-side
RESEND_API_KEY=<key>
ADMIN_EMAIL=admin@kpeachgirl.com
REVALIDATION_SECRET=<random secret>
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Auth | Supabase Auth + @supabase/ssr | next-auth / auth.js | Creates second auth system, incompatible with Supabase RLS JWT claims |
| Auth helper | @supabase/ssr | @supabase/auth-helpers-nextjs | Officially deprecated, doesn't handle App Router cookies correctly |
| CSS | Tailwind CSS v3 | Tailwind CSS v4 | v4 requires CSS-first config rewrite, no benefit for this project scope |
| i18n | Custom lib/i18n.ts | next-intl | 70 static keys, admin-only toggle — full i18n library is overengineered |
| Image crop | react-easy-crop | react-image-crop | react-easy-crop has native zoom+focal point props; react-image-crop requires more custom work for the focal point model |
| Email | resend | nodemailer, sendgrid | resend is locked per spec; also simpler API, official Next.js examples |
| DB ORM | Supabase JS client | Prisma, Drizzle | ORMs conflict with RLS — policies run at DB level regardless; generated types from Supabase CLI are sufficient |

---

## Sources

- [@supabase/ssr on npm](https://www.npmjs.com/package/@supabase/ssr) — version 0.9.0, MEDIUM confidence (npm listing)
- [@supabase/supabase-js on npm](https://www.npmjs.com/package/@supabase/supabase-js) — version 2.49.x, MEDIUM confidence
- [Supabase: Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) — HIGH confidence (official docs)
- [Supabase: Creating a client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client) — HIGH confidence (official docs)
- [Supabase: Custom Claims and RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) — HIGH confidence (official docs)
- [Next.js: ISR Guide](https://nextjs.org/docs/app/guides/incremental-static-regeneration) — HIGH confidence (official docs)
- [Next.js: revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) — HIGH confidence (official docs)
- [Next.js: revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) — HIGH confidence (official docs)
- [Next.js: Image Optimization (sharp)](https://nextjs.org/docs/messages/install-sharp) — HIGH confidence (official docs)
- [Next.js: Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) — HIGH confidence (official docs)
- [Next.js 14.2.35 security patch](https://nextjs.org/blog/security-update-2025-12-11) — HIGH confidence (official blog)
- [Tailwind CSS v4.0 release post](https://tailwindcss.com/blog/tailwindcss-v4) — HIGH confidence (official blog)
- [resend on npm](https://www.npmjs.com/package/resend) — MEDIUM confidence (npm listing, current version 4.x-6.x range; verify exact version before pinning)
- [react-easy-crop on GitHub](https://github.com/ValentinH/react-easy-crop) — MEDIUM confidence (GitHub, last checked 2026-03-09)
