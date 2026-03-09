# Phase 4: Admin CMS - Research

**Researched:** 2026-03-09
**Domain:** Admin dashboard, Supabase Auth/Storage/CRUD, ISR revalidation, email sending
**Confidence:** HIGH

## Summary

Phase 4 builds the entire admin CMS -- login, 5-tab dashboard, CRUD for models/groups/submissions, site config editors, image uploads with crop, and API routes. The prototype (`ModelDirectory.jsx` lines 635-1712) contains the complete admin panel as a single `AdminPanel` component with inline styles, which must be decomposed into Next.js App Router pages and client components.

All infrastructure is already in place from Phases 1-3: Supabase client files (browser, server, middleware), RLS policies with `is_admin` JWT claim, all tables seeded, TypeScript types, i18n translations, and design tokens. The admin panel is entirely client-side rendered (CSR) since it requires authentication and real-time form state.

**Primary recommendation:** Build admin as `app/admin/` route group with client components. Use the existing `lib/supabase/client.ts` browser client for all admin mutations. Protect via middleware `getUser()` check + `is_admin` claim verification. Upload images via Supabase Storage `createSignedUploadUrl` to bypass Vercel's 4.5MB body limit.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ADM-01 | Admin login page (/admin/login) with signInWithPassword | Supabase Auth browser client, existing `lib/supabase/client.ts` |
| ADM-02 | Admin routes protected by middleware redirect | Extend existing `middleware.ts` with `/admin` path check + `getUser()` |
| ADM-03 | Auth verification uses getUser() not getSession(); is_admin checked | getUser() validates JWT server-side; app_metadata.is_admin from custom hook |
| ADM-04 | 5-tab nav + EN/Korean toggle | Prototype lines 1013-1027; existing `lib/i18n.ts` translations |
| ADM-05 | Models tab: list, create, edit, delete | Supabase CRUD on `profiles` table; prototype lines 1040-1076 |
| ADM-06 | Model editor slide-out with all fields | Prototype lines 1554-1673; 500px/420px/full-width responsive |
| ADM-07 | Profile/cover photo upload + PhotoEditor crop | `createSignedUploadUrl` + PhotoEditor component; prototype lines 565-633 |
| ADM-08 | Gallery image management (upload, reorder, delete) | `gallery_images` table CRUD; prototype lines 1616-1637 |
| ADM-09 | Groups tab: list, create, edit, delete | Supabase CRUD on `groups` table; prototype lines 1078-1205 |
| ADM-10 | Group editor with member selection | Prototype lines 1110-1199; member picker from profiles list |
| ADM-11 | Submissions tab with status display | Supabase `submissions` table; prototype lines 1207-1298 |
| ADM-12 | Submission status workflow + convert to profile | Status transitions + INSERT into profiles; prototype lines 1283-1293 |
| ADM-13 | Hero editor (banner image, crop, title fields) | `site_config` id='hero' UPDATE; prototype lines 1309-1360 |
| ADM-14 | Card display config (subtitle fields, badges, overlay) | `site_config` id='card_settings' UPDATE; prototype lines 1362-1422 |
| ADM-15 | Tag groups editor (pill groups) | `site_config` id='pill_groups' UPDATE; prototype lines 1424-1461 |
| ADM-16 | Form editor (field labels, types, required, width) | `site_config` id='form_config' UPDATE; prototype lines 1463-1505 |
| ADM-17 | Category sections editor | `site_config` id='categories' UPDATE; prototype lines 1507-1531 |
| ADM-18 | Areas tab (add/remove areas) | `site_config` id='areas' UPDATE; prototype lines 1534-1551 |
| ADM-19 | All saves trigger on-demand ISR revalidation | `/api/revalidate` route with `revalidatePath()` |
| ADM-20 | Admin logout clears session | `supabase.auth.signOut()` + redirect |
| API-01 | /api/contact POST sends email via Resend | `resend` npm package; simple POST handler |
| API-02 | /api/revalidate POST validates secret, calls revalidatePath | `REVALIDATION_SECRET` header check + `revalidatePath()` |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 14.2.35 | Framework (App Router) | Locked in Phase 1 |
| @supabase/supabase-js | ^2.99.0 | Database, Auth, Storage | Already installed |
| @supabase/ssr | ^0.9.0 | Cookie-based auth for SSR | Already installed |

### New Dependencies
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| resend | latest | Email sending API | API-01: /api/contact route |

### No Additional Libraries Needed
| Problem | Why Not Needed |
|---------|----------------|
| Drag-and-drop reorder | Gallery has few items; simple button reorder (move up/down) matches prototype |
| Form validation | Admin-only forms; inline validation sufficient |
| State management | React useState is sufficient per prototype pattern |
| Rich text editor | Bio is plain textarea per prototype |
| Image cropping library | Custom PhotoEditor component (focal point + zoom) already designed in prototype |

**Installation:**
```bash
npm install resend
```

## Architecture Patterns

### Recommended Project Structure
```
app/
  admin/
    layout.tsx          # Admin layout with auth check (server component)
    page.tsx            # Redirects to /admin with default tab, or renders AdminDashboard
    login/
      page.tsx          # Login page (client component)
  api/
    contact/
      route.ts          # POST: Resend email
    revalidate/
      route.ts          # POST: ISR revalidation
components/
  admin/
    AdminDashboard.tsx  # Main dashboard shell with tabs + language toggle
    AdminNav.tsx        # Top nav bar with tabs, lang toggle, user, logout
    ModelsTab.tsx       # Model list + stats + filters
    ModelEditor.tsx     # Slide-out editor panel
    GroupsTab.tsx       # Group list
    GroupEditor.tsx     # Inline group editor (expand/collapse, not slide-out)
    SubmissionsTab.tsx  # Submission list + status workflow
    ProfileFieldsTab.tsx # Hero, cards, tags, form, categories editors
    AreasTab.tsx        # Areas management
    PhotoEditor.tsx     # Focal point + zoom editor (reuse from Phase 3 or build fresh)
lib/
  supabase/
    admin.ts            # Admin-specific helpers (e.g., revalidate trigger, storage upload)
```

### Pattern 1: Client-Side Admin with Server Layout Auth Guard
**What:** Admin layout.tsx (server component) checks auth, admin pages are 'use client' components
**When to use:** All admin routes
**Example:**
```typescript
// app/admin/layout.tsx (server component)
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/admin/login')
  }

  // Check is_admin claim from app_metadata
  const isAdmin = user.app_metadata?.is_admin === true
  if (!isAdmin) {
    redirect('/admin/login')
  }

  return <>{children}</>
}
```

### Pattern 2: Middleware Auth Protection (Belt + Suspenders)
**What:** Extend existing middleware to redirect unauthenticated users from /admin/* to /admin/login
**When to use:** Defense-in-depth alongside server layout check
**Example:**
```typescript
// middleware.ts (extend existing)
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Protect admin routes (except login page)
  if (request.nextUrl.pathname.startsWith('/admin') &&
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return response
}
```

### Pattern 3: Supabase Storage Signed Upload (Client-Direct)
**What:** Admin client gets a signed URL, then uploads directly to Supabase Storage
**When to use:** All image uploads (profile, cover, gallery, hero, group, submissions)
**Why:** Bypasses Vercel's 4.5MB body limit; files go directly to Supabase
**Example:**
```typescript
// Upload flow in admin component
async function uploadImage(file: File, bucket: string, path: string) {
  const supabase = createClient()

  // Option 1: Direct upload (simpler, works for authenticated admin)
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return publicUrl
}

// Option 2: Signed upload URL (if RLS blocks direct upload)
async function uploadWithSignedUrl(file: File, bucket: string, path: string) {
  const supabase = createClient()

  const { data: signedData, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path)

  if (signedError) throw signedError

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(path, signedData.token, file)

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}
```

### Pattern 4: ISR Revalidation After Admin Save
**What:** After every admin mutation, POST to /api/revalidate to refresh affected pages
**When to use:** All admin save operations
**Example:**
```typescript
// lib/supabase/admin.ts
export async function triggerRevalidation(paths: string[]) {
  await fetch('/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths }),
  })
}

// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidation-secret')

  // For internal calls from admin (same origin), skip secret check
  // For external webhooks, validate secret
  if (secret && secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const { paths } = await request.json()

  for (const path of paths) {
    revalidatePath(path)
  }

  return NextResponse.json({ revalidated: true, paths })
}
```

### Pattern 5: Slide-Out Editor Panel
**What:** Fixed-position panel that slides in from right with backdrop overlay
**When to use:** Model editor (ADM-06), responsive across breakpoints
**Example:**
```typescript
// Responsive slide-out: 500px desktop, 420px tablet, full-width mobile
// Sticky header with model name + close button
// Sticky footer with Save & Publish + Cancel
// Scrollable content area between header and footer
// Backdrop click closes the editor
```

### Anti-Patterns to Avoid
- **Using getSession() for auth in server code:** Always use getUser() -- getSession() does not revalidate the JWT and can be spoofed
- **Uploading files through API routes:** Files would hit Vercel's 4.5MB body limit; upload directly to Supabase Storage
- **Building separate pages for each admin tab:** Single admin page with client-side tab switching matches prototype UX
- **Server components for admin forms:** Admin needs constant client state (form values, editing state, modals); use 'use client' throughout admin
- **Storing crop data separately from the image reference:** Keep crop as a jsonb column on the same row as the image URL

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email sending | Custom SMTP/nodemailer setup | Resend SDK | 3 lines of code, reliable delivery, React email templates |
| Image upload to cloud | Custom upload endpoint + streaming | Supabase Storage direct upload | Signed URLs, built-in CDN, RLS policies already configured |
| JWT validation | Custom JWT decode/verify | `supabase.auth.getUser()` | Server-side validation against Supabase Auth, handles refresh |
| ISR cache busting | Custom cache headers or timestamps | `revalidatePath()` from next/cache | Built into Next.js 14, works with Vercel ISR |
| Slug generation | Custom regex replacer | Simple toLowerCase + replace(/\s+/g, '-') + replace(/[^a-z0-9-]/g, '') | Prototype uses simple slugs, no i18n slug concerns |

## Common Pitfalls

### Pitfall 1: getSession() vs getUser() Security
**What goes wrong:** Using `getSession()` in server code allows JWT spoofing -- the session is read from cookies without revalidation
**Why it happens:** `getSession()` is faster (no network call) so devs reach for it
**How to avoid:** Always use `getUser()` in middleware and server components; it makes a round-trip to Supabase Auth to validate
**Warning signs:** Auth checks that don't await a network call

### Pitfall 2: Supabase Storage Upload Path Collisions
**What goes wrong:** Uploading with the same filename overwrites existing images
**Why it happens:** Two models with the same profile photo filename
**How to avoid:** Use UUID-based paths: `profile-images/{profileId}/{timestamp}-{filename}`
**Warning signs:** Images disappearing or changing unexpectedly

### Pitfall 3: Middleware Double-Creating Supabase Client
**What goes wrong:** Creating a second Supabase client in middleware (after updateSession) uses stale cookies
**Why it happens:** The updateSession function already creates a client and refreshes cookies
**How to avoid:** Extend the existing `updateSession` function in `lib/supabase/middleware.ts` to include admin route checking, rather than creating a new client in `middleware.ts`
**Warning signs:** Auth state inconsistency, occasional redirects when logged in

### Pitfall 4: Forgetting to Revalidate All Affected Paths
**What goes wrong:** Admin edits a model but homepage still shows old data
**Why it happens:** Only revalidating `/model/[slug]` but not `/` (homepage) or `/group/[slug]` pages that reference the model
**How to avoid:** Revalidate all potentially affected paths: `/`, `/model/[slug]`, `/group/[slug]` for any model/group change
**Warning signs:** Homepage grid not updating after model edit

### Pitfall 5: File Input Reset After Upload
**What goes wrong:** Can't upload the same file twice in a row
**Why it happens:** Browser file input doesn't fire onChange for the same file
**How to avoid:** Reset `input.value = ''` after each upload (prototype does this: `e.target.value=''`)
**Warning signs:** Gallery "add" button stops working after uploading same image

### Pitfall 6: Submission Convert Logic
**What goes wrong:** Converting a submission to a profile loses data or creates duplicates
**Why it happens:** form_data is jsonb with arbitrary structure; must map to profile columns correctly
**How to avoid:** Map form_data fields to profile columns explicitly; set status to 'converted' atomically; generate slug from name
**Warning signs:** Converted profiles missing data or submission still showing as "approved"

## Code Examples

### Login Page with Supabase Auth
```typescript
// app/admin/login/page.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh() // Trigger server component re-render
  }

  // ... render login form matching prototype design (lines 639-700)
}
```

### Admin CRUD Operations
```typescript
// Example: Save model profile
async function saveProfile(profile: Partial<Profile>) {
  const supabase = createClient()

  const slug = profile.name
    ? profile.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    : undefined

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      ...profile,
      slug,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  // Trigger ISR revalidation
  await triggerRevalidation(['/', `/model/${slug}`])

  return data
}
```

### Contact Form API Route (Resend)
```typescript
// app/api/contact/route.ts
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, email, message, modelName } = body

  const { error } = await resend.emails.send({
    from: 'Kpeachgirl <noreply@kpeachgirl.com>', // Must be verified domain
    to: [process.env.ADMIN_EMAIL!],
    subject: `Contact: ${modelName} - from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

### Site Config Update Pattern
```typescript
// Generic site_config update
async function updateSiteConfig(configId: string, value: any) {
  const supabase = createClient()

  const { error } = await supabase
    .from('site_config')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('id', configId)

  if (error) throw error

  // Revalidate all pages since site_config affects global display
  await triggerRevalidation(['/'])
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| auth-helpers-nextjs | @supabase/ssr | 2024 | Already using correct package |
| getSession() for auth | getUser() for server-side auth | Supabase security advisory | Must use getUser() everywhere |
| Upload through API route | Direct to Supabase Storage | Always best practice | Bypasses Vercel body limit |
| res.revalidate() (Pages Router) | revalidatePath() (App Router) | Next.js 13+ | Using App Router pattern |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr` (already avoided)
- `getSession()` for server auth: Security risk, use `getUser()` instead
- Pages Router API routes (`pages/api/`): Use App Router route handlers (`app/api/*/route.ts`)

## Open Questions

1. **Supabase Storage direct upload vs signed URL for admin**
   - What we know: Admin has `is_admin` JWT claim; RLS allows admin writes to storage
   - What's unclear: Whether direct `.upload()` works with RLS or if `createSignedUploadUrl` is needed
   - Recommendation: Try direct `.upload()` first since admin is authenticated; fall back to signed URLs if RLS blocks it

2. **Resend domain verification**
   - What we know: Resend requires a verified sending domain for production
   - What's unclear: Whether user has a verified domain or will use `onboarding@resend.dev` for testing
   - Recommendation: Use `onboarding@resend.dev` as default "from" for development; document that production needs domain verification

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual testing (E2E tests out of scope per REQUIREMENTS.md) |
| Config file | none |
| Quick run command | `npm run build` (TypeScript compilation check) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADM-01 | Login authenticates | manual | `npm run build` (type check) | N/A |
| ADM-02 | Routes protected | manual | `npm run build` (type check) | N/A |
| ADM-03 | getUser() used (not getSession) | code review | `grep -r "getSession" app/admin/` (should return nothing) | N/A |
| ADM-05 | Model CRUD works | manual | `npm run build` (type check) | N/A |
| ADM-19 | ISR revalidation fires | manual | `npm run build` (type check) | N/A |
| API-01 | Contact email sends | manual | `npm run build` (type check) | N/A |
| API-02 | Revalidate endpoint works | manual | `npm run build` (type check) | N/A |

### Sampling Rate
- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build && npm run lint`
- **Phase gate:** Full build green + manual admin walkthrough

### Wave 0 Gaps
None -- E2E automated tests are explicitly out of scope per REQUIREMENTS.md. Build compilation serves as the automated validation gate.

## Sources

### Primary (HIGH confidence)
- ModelDirectory.jsx prototype (lines 565-1712) -- complete admin panel implementation
- CLAUDE.md -- all routes, schema, design tokens, config objects
- Existing codebase: lib/supabase/*.ts, lib/types.ts, lib/i18n.ts, lib/constants.ts, middleware.ts
- [Supabase createSignedUploadUrl docs](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl)
- [Supabase Auth Server-Side Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)

### Secondary (MEDIUM confidence)
- [Resend + Next.js docs](https://resend.com/docs/send-with-nextjs) -- verified API pattern
- [Next.js revalidatePath docs](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) -- ISR on-demand pattern
- [Next.js ISR guide](https://nextjs.org/docs/app/guides/incremental-static-regeneration)

### Tertiary (LOW confidence)
- Direct `.upload()` vs `createSignedUploadUrl` for admin-authenticated users -- needs runtime verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed except `resend`; prototype provides exact implementation reference
- Architecture: HIGH -- prototype provides complete admin panel; decomposition pattern is straightforward
- Pitfalls: HIGH -- security concerns (getUser vs getSession) and upload patterns well-documented by Supabase
- ISR revalidation: HIGH -- Next.js 14 `revalidatePath` is stable and well-documented

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable -- all dependencies are locked versions)
