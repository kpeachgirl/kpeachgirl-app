# Phase 3: Public Pages - Research

**Researched:** 2026-03-09
**Domain:** Next.js 14 App Router SSG/ISR pages, Supabase data fetching, client-side interactivity
**Confidence:** HIGH

## Summary

Phase 3 builds all public-facing pages: homepage with model grid, individual model profiles, group profiles, and the membership form. The prototype (ModelDirectory.jsx, 1,828 lines) provides pixel-exact reference for every component, layout, and interaction. The existing infrastructure (Next.js 14.2.35, Tailwind v3 with design tokens, Supabase with seeded data, responsive CSS classes in globals.css) is fully ready.

The primary challenge is translating the monolithic React prototype into Next.js App Router pages with proper server/client component boundaries. Homepage and profile pages use ISR for performance; the membership form is pure CSR. All Supabase queries use the server client for SSG/ISR pages and the browser client for client-side interactions (search, filters, form submission).

**Primary recommendation:** Split each page into a server component (data fetching) and thin client component wrappers (interactivity). Use `generateStaticParams` for profile pages, `revalidate = 60` for ISR. Keep search/filter logic client-side with pre-fetched data passed as props.

**Critical prerequisite:** FOUND-05 (lib/types.ts), FOUND-06 (lib/constants.ts), and FOUND-07 (lib/i18n.ts) are still pending from Phase 1. Phase 3 Plan 01 MUST create these files before any components can be built.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PUB-01 | Age gate overlay, sessionStorage persistence | Client component with useEffect + sessionStorage check; renders fixed overlay |
| PUB-02 | Homepage SSG with ISR, hero banner from site_config | Server component fetches site_config rows; `export const revalidate = 60` |
| PUB-03 | Homepage search filters by name or area (client-side) | Client component receives all profiles as props, filters in state |
| PUB-04 | Homepage area filter chips from site_config areas | Fetched server-side, passed to client FilterBar component |
| PUB-05 | Homepage verified-only toggle | Client-side checkbox filter in FilterBar |
| PUB-06 | Homepage model card grid (4/2 col responsive) | .model-grid CSS class already in globals.css handles responsive |
| PUB-07 | Model cards show verified/away badges per card_settings | ModelCard reads card_settings props for badge visibility/labels |
| PUB-08 | Group cards below model grid with DUO/TRIO/GROUP badge | GroupCard component, badge auto-calculated from member count |
| PUB-09 | Model profile /model/[slug] ISR 60s, hero split, bio, stats, pills | Server component with generateStaticParams + revalidate=60 |
| PUB-10 | Gallery section with lightbox modal | Client component Lightbox with prev/next navigation |
| PUB-11 | "Also Available As" group links | Server-side query: groups where member_ids contains profile.id |
| PUB-12 | Group profile /group/[slug] ISR 60s | Server component with generateStaticParams + revalidate=60 |
| PUB-13 | Group profile member cards linking to profiles | Member cards rendered from member_ids joined with profiles |
| PUB-14 | Membership form /membership CSR, dynamic fields | Client component ('use client'), fetches form_config on mount |
| PUB-15 | All field types: text, email, textarea, area_select, exp_select, type_pills, file_upload | Field renderer switch per type, matching prototype exactly |
| PUB-16 | File upload to Supabase Storage submissions bucket | Browser client upload to 'submissions' bucket (anon INSERT allowed) |
| PUB-17 | Form submission saves to submissions table, shows success | Supabase insert with status 'new', toggle success state |
| PUB-18 | SEO metadata on profile pages | generateMetadata async function per page |
| PUB-19 | next/image with Supabase Storage remotePatterns | Already configured in next.config.mjs -- verified |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 14.2.35 | Framework (App Router, ISR, generateStaticParams) | Locked decision |
| @supabase/ssr | ^0.9.0 | Server-side Supabase client with cookie management | Locked decision |
| @supabase/supabase-js | ^2.99.0 | Supabase client (queries, storage upload) | Locked decision |
| tailwindcss | ^3.4.1 | Styling with design tokens | Locked decision |
| clsx | ^2.1.1 | Conditional class names | Already installed |
| tailwind-merge | ^3.5.0 | Merge Tailwind classes without conflicts | Already installed |
| sharp | ^0.34.5 | next/image optimization | Already installed |

### No Additional Dependencies Needed
All Phase 3 requirements can be met with the existing stack. No new npm packages are needed.

## Architecture Patterns

### Recommended Project Structure
```
app/
  layout.tsx                    # Already exists (fonts, metadata)
  page.tsx                      # Homepage (server component + client wrappers)
  model/
    [slug]/
      page.tsx                  # Model profile (server component)
  group/
    [slug]/
      page.tsx                  # Group profile (server component)
  membership/
    page.tsx                    # Membership form (client component)
components/
  AgeGate.tsx                   # Client: sessionStorage age verification
  ModelCard.tsx                 # Client: hover effects, click handler
  GroupCard.tsx                 # Client: group card with badge
  PhotoCropDisplay.tsx          # Server-safe: renders image with crop data
  Lightbox.tsx                  # Client: fullscreen gallery viewer
  Navbar.tsx                    # Server: top navigation bar
  Footer.tsx                    # Server: site footer
  FilterBar.tsx                 # Client: search, area chips, verified toggle
  HeroBanner.tsx                # Server: hero image with text overlay
  ProfilePills.tsx              # Server-safe: shoot type / compensation pills
  CategoryStats.tsx             # Server-safe: vitals/look/work sections
  MembershipForm.tsx            # Client: dynamic form with field renderer
lib/
  types.ts                      # TypeScript interfaces (MUST CREATE - FOUND-05)
  constants.ts                  # Default config values (MUST CREATE - FOUND-06)
  i18n.ts                       # Translation keys (MUST CREATE - FOUND-07)
  supabase/
    client.ts                   # Browser client (exists)
    server.ts                   # Server client (exists)
    middleware.ts               # Session refresh (exists)
```

### Pattern 1: Server Component with Client Islands
**What:** Page-level server component fetches data, passes to client sub-components for interactivity
**When to use:** Homepage and profile pages that need both SSG data and client-side interaction
**Example:**
```typescript
// app/page.tsx (server component)
import { createClient } from '@/lib/supabase/server'
import { HomepageClient } from '@/components/HomepageClient'

export const revalidate = 60 // ISR

export default async function HomePage() {
  const supabase = createClient()
  const [profiles, siteConfig, groups] = await Promise.all([
    supabase.from('profiles').select('*').order('sort_order'),
    supabase.from('site_config').select('*'),
    supabase.from('groups').select('*').order('sort_order'),
  ])
  // Parse site_config into typed objects
  // Pass as props to client component
  return <HomepageClient profiles={profiles.data} ... />
}
```

### Pattern 2: generateStaticParams + generateMetadata for ISR Pages
**What:** Pre-generate all known slugs at build time, revalidate every 60s
**When to use:** /model/[slug] and /group/[slug]
**Example:**
```typescript
// app/model/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export async function generateStaticParams() {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('slug')
  return (data || []).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, bio, profile_image')
    .eq('slug', params.slug)
    .single()
  return {
    title: `${profile?.name} — Kpeachgirl`,
    description: profile?.bio?.slice(0, 160),
    openGraph: { images: profile?.profile_image ? [profile.profile_image] : [] },
  }
}
```

### Pattern 3: Crop System Display
**What:** Apply focal point + zoom crop via CSS object-position and transform
**When to use:** Every image display (cards, profile hero, gallery)
**Example:**
```typescript
// PhotoCropDisplay component
interface CropData { x: number; y: number; zoom: number }

function cropStyle(crop?: CropData | null) {
  const x = crop?.x ?? 50
  const y = crop?.y ?? 50
  const zoom = crop?.zoom ?? 100
  return {
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${zoom / 100})`,
    transformOrigin: `${x}% ${y}%`,
  }
}
```

### Pattern 4: Age Gate with sessionStorage
**What:** Client component checks sessionStorage on mount; if not verified, renders overlay blocking content
**When to use:** Wraps the entire app
**Example:**
```typescript
'use client'
import { useState, useEffect } from 'react'

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null)

  useEffect(() => {
    setVerified(sessionStorage.getItem('age_verified') === 'true')
  }, [])

  const handleVerify = () => {
    sessionStorage.setItem('age_verified', 'true')
    setVerified(true)
  }

  if (verified === null) return null // SSR: render nothing (avoids flash)
  if (!verified) return <AgeGateOverlay onVerified={handleVerify} />
  return <>{children}</>
}
```

### Pattern 5: File Upload to Supabase Storage (Anon)
**What:** Membership form uploads ID photo directly to submissions bucket using anon key
**When to use:** PUB-16 file upload
**Example:**
```typescript
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function uploadIdPhoto(file: File): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`
  const { error } = await supabase.storage
    .from('submissions')
    .upload(fileName, file)
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage
    .from('submissions')
    .getPublicUrl(fileName)
  return publicUrl
}
```

**Note:** The submissions bucket is admin-only for reads but allows anon uploads per DB-08/DB-11 RLS policies. However, verify that the storage policy allows anon upload -- the bucket is marked "private admin-only" in CLAUDE.md. The upload may need to use a different approach (signed URL from an API route) if anon uploads are blocked. This should be tested during implementation.

### Anti-Patterns to Avoid
- **Fetching data in client components:** Never use useEffect to fetch profiles/config on the homepage. Fetch in server components and pass as props.
- **Using `getServerSideProps`:** This is Pages Router. Use server components with `revalidate` export for ISR.
- **Inline styles for everything:** The prototype uses inline styles (React SPA). Convert to Tailwind classes + the existing CSS classes in globals.css.
- **Giant monolithic page components:** Split into focused components. The prototype has everything in one file; the Next.js app should not.
- **Forgetting `'use client'` directive:** Any component using useState, useEffect, or event handlers needs it. But keep it as low in the tree as possible.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Custom image loader | next/image with remotePatterns (already configured) | Handles lazy loading, srcset, format conversion |
| ISR / static generation | Custom caching layer | Next.js `revalidate` export + `generateStaticParams` | Built-in, battle-tested |
| Responsive grid | Custom media queries | Existing CSS classes in globals.css (.model-grid, .profile-hero, etc.) | Already match prototype breakpoints exactly |
| SEO metadata | Manual meta tags | `generateMetadata` async function | Type-safe, handles og:image |
| Class merging | String concatenation | clsx + tailwind-merge (already installed) | Handles conflicts correctly |

## Common Pitfalls

### Pitfall 1: Server/Client Component Boundary Confusion
**What goes wrong:** Importing a client component into a server component incorrectly, or trying to use hooks in server components
**Why it happens:** Next.js 14 App Router has strict boundaries
**How to avoid:** Mark every component with interactivity as `'use client'`. Pass data DOWN as serializable props (no functions as props from server to client).
**Warning signs:** "useState is not a function" errors, hydration mismatches

### Pitfall 2: Age Gate Flash of Content
**What goes wrong:** Content briefly shows before age gate renders
**Why it happens:** SSR renders page content, then client hydration shows age gate
**How to avoid:** Return `null` during initial render (before useEffect runs). The age gate wraps children and only renders them after verification check completes.
**Warning signs:** Content visible for a split second on first load

### Pitfall 3: Supabase Query in generateStaticParams
**What goes wrong:** Build fails because Supabase env vars aren't available during static generation
**Why it happens:** generateStaticParams runs at build time
**How to avoid:** Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are available during build. Use try/catch and return empty array as fallback.
**Warning signs:** Build errors mentioning missing env vars

### Pitfall 4: Unsplash Images vs Supabase Storage URLs
**What goes wrong:** Seed data uses Unsplash URLs (images.unsplash.com), but next/image remotePatterns only allows *.supabase.co
**Why it happens:** Seed data from Phase 2 uses Unsplash placeholder URLs
**How to avoid:** Add `images.unsplash.com` to remotePatterns in next.config.mjs for development. Both Unsplash and Supabase hostnames needed.
**Warning signs:** next/image errors about unconfigured hostname

### Pitfall 5: Membership Form File Upload Bucket Access
**What goes wrong:** Anon user cannot upload to submissions bucket
**Why it happens:** Submissions bucket is described as "admin-only" in CLAUDE.md, but DB-08 says "anon INSERT only"
**How to avoid:** Verify storage.objects RLS allows anon INSERT on submissions bucket. If not, create an API route that generates a signed upload URL.
**Warning signs:** 403 errors on file upload

### Pitfall 6: Group Member Query with UUID Arrays
**What goes wrong:** Cannot efficiently query "which groups contain this profile ID" using Supabase
**Why it happens:** member_ids is a UUID array column, need containment query
**How to avoid:** Use `.contains('member_ids', [profileId])` or PostgREST `cs` operator
**Warning signs:** Empty "Also Available As" section despite model being in groups

### Pitfall 7: Missing lib/types.ts, lib/constants.ts, lib/i18n.ts
**What goes wrong:** Cannot build any components without TypeScript interfaces and shared constants
**Why it happens:** FOUND-05, FOUND-06, FOUND-07 were not completed in Phase 1
**How to avoid:** Plan 03-01 MUST create these files as its first task before any component work
**Warning signs:** TypeScript errors everywhere, no shared type definitions

### Pitfall 8: Attributes JSONB Column Access
**What goes wrong:** Profile attributes (age, height, hair, etc.) are stored in the `attributes` jsonb column, not as top-level columns
**Why it happens:** The prototype uses flat model objects, but the DB schema stores dynamic fields in `attributes`
**How to avoid:** Access via `profile.attributes?.age` not `profile.age`. The type definitions must reflect this.
**Warning signs:** All attribute values showing as undefined

## Code Examples

### Homepage Data Fetching (Server Component)
```typescript
// app/page.tsx
import { createClient } from '@/lib/supabase/server'
import type { Profile, Group, SiteConfig } from '@/lib/types'

export const revalidate = 60

async function getSiteConfig(supabase: any) {
  const { data } = await supabase.from('site_config').select('id, value')
  const config: Record<string, any> = {}
  for (const row of data || []) {
    config[row.id] = row.value
  }
  return config
}

export default async function HomePage() {
  const supabase = createClient()

  const [profilesRes, groupsRes, configRows] = await Promise.all([
    supabase.from('profiles').select('*').order('sort_order'),
    supabase.from('groups').select('*').order('sort_order'),
    getSiteConfig(supabase),
  ])

  return (
    <HomepageClient
      profiles={profilesRes.data || []}
      groups={groupsRes.data || []}
      hero={configRows.hero}
      areas={configRows.areas}
      cardSettings={configRows.card_settings}
      pillGroups={configRows.pill_groups}
    />
  )
}
```

### Model Card Component
```typescript
// components/ModelCard.tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import type { Profile, CardSettings } from '@/lib/types'

interface ModelCardProps {
  profile: Profile
  cardSettings: CardSettings
}

export function ModelCard({ profile, cardSettings }: ModelCardProps) {
  const cs = cardSettings
  const sf = cs.subtitleFields || ['region', 'types']
  const subtitle = sf
    .map((f) => {
      if (f === 'region') return profile.region
      if (f === 'types') return profile.types?.[0]
      if (f === 'exp') return profile.experience
      if (f === 'age') return profile.attributes?.age
      return ''
    })
    .filter(Boolean)
    .join(' \u00B7 ')

  const overlayHex = Math.round(((cs.overlayOpacity ?? 70) / 100) * 255)
    .toString(16)
    .padStart(2, '0')

  return (
    <Link href={`/model/${profile.slug}`} className="model-card block relative overflow-hidden bg-card-bg">
      <div className="relative" style={{ paddingTop: '135%' }}>
        {/* Image with crop */}
        {/* Overlay gradient */}
        {/* Badges */}
        {/* Name + subtitle */}
      </div>
    </Link>
  )
}
```

### Lightbox Component
```typescript
// components/Lightbox.tsx
'use client'
import { useEffect, useCallback } from 'react'

interface LightboxProps {
  images: string[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function Lightbox({ images, currentIndex, onClose, onNavigate }: LightboxProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') onNavigate(Math.max(0, currentIndex - 1))
    if (e.key === 'ArrowRight') onNavigate(Math.min(images.length - 1, currentIndex + 1))
  }, [currentIndex, images.length, onClose, onNavigate])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  return (
    <div onClick={onClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center cursor-zoom-out"
      style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(20px)' }}>
      {/* Prev/Next buttons */}
      {/* Current image */}
      {/* Counter: currentIndex+1 / images.length */}
    </div>
  )
}
```

### Membership Form Submission
```typescript
// components/MembershipForm.tsx - submission handler
async function handleSubmit() {
  setSubmitting(true)
  try {
    let idPhotoUrl = ''
    if (formData.id_photo instanceof File) {
      idPhotoUrl = await uploadIdPhoto(formData.id_photo)
    }
    const { error } = await supabase.from('submissions').insert({
      form_data: { ...formData, id_photo: undefined },
      id_photo_url: idPhotoUrl,
      status: 'new',
    })
    if (error) throw error
    setDone(true)
  } catch (err) {
    setError('Submission failed. Please try again.')
  } finally {
    setSubmitting(false)
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| getStaticProps / getServerSideProps | Server components + revalidate export | Next.js 13+ App Router | Simpler data fetching, no serialization needed |
| pages/_app.tsx wrapper | app/layout.tsx with nested layouts | Next.js 13+ | Layout composition, not page-level wrapping |
| Head component for SEO | generateMetadata export | Next.js 13+ | Type-safe, async metadata |
| next/image domains config | remotePatterns (protocol + hostname + pathname) | Next.js 12.3+ | More granular control |

## Open Questions

1. **Submissions bucket upload permissions**
   - What we know: DB-08 allows anon INSERT on submissions table. DB-11 says storage policies are set.
   - What's unclear: Whether storage.objects RLS on submissions bucket allows anon upload
   - Recommendation: Test during implementation. If blocked, create `/api/upload` route using service role key.

2. **FOUND-05/06/07 not yet created**
   - What we know: lib/types.ts, lib/constants.ts, lib/i18n.ts do not exist yet
   - What's unclear: Whether they should be created in Phase 3 Plan 01 or as a separate prerequisite
   - Recommendation: Create them in Plan 03-01 as the first task. They are required by every component.

3. **Age gate placement decision**
   - What we know: STATE.md blocker says "Decide age gate implementation: middleware redirect vs client-only cookie check"
   - What's unclear: Whether to use middleware or client-side
   - Recommendation: Use client-side sessionStorage (simpler, avoids SEO issues with middleware redirect). The prototype uses client-side. Age gate wraps page content in layout or homepage.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- no test config or test files exist |
| Config file | none -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PUB-01 | Age gate blocks content until 18+ confirmed | manual-only | Manual browser test | N/A |
| PUB-02 | Homepage renders with hero banner | smoke | `curl -s localhost:3000 \| grep "Kpeachgirl"` | N/A |
| PUB-03 | Search filters models by name | manual-only | Manual browser test | N/A |
| PUB-04 | Area filter chips render from config | manual-only | Manual browser test | N/A |
| PUB-05 | Verified-only toggle works | manual-only | Manual browser test | N/A |
| PUB-06 | Model grid renders 4-col desktop | manual-only | Manual browser test | N/A |
| PUB-07 | Verified/away badges display | manual-only | Manual browser test | N/A |
| PUB-08 | Group cards render with badge | manual-only | Manual browser test | N/A |
| PUB-09 | Model profile page renders with ISR | smoke | `curl -s localhost:3000/model/aria-novak \| grep "Aria Novak"` | N/A |
| PUB-10 | Gallery lightbox opens | manual-only | Manual browser test | N/A |
| PUB-11 | "Also Available As" shows groups | manual-only | Manual browser test | N/A |
| PUB-12 | Group profile page renders | smoke | `curl -s localhost:3000/group/[slug] \| grep groupname` | N/A |
| PUB-13 | Group member cards link to profiles | manual-only | Manual browser test | N/A |
| PUB-14 | Membership form renders dynamic fields | smoke | `curl -s localhost:3000/membership \| grep "Membership"` | N/A |
| PUB-15 | All field types render correctly | manual-only | Manual browser test | N/A |
| PUB-16 | File upload works | manual-only | Manual browser test | N/A |
| PUB-17 | Form submits to submissions table | manual-only | Manual browser test | N/A |
| PUB-18 | SEO metadata present | smoke | `curl -s localhost:3000/model/aria-novak \| grep "og:image"` | N/A |
| PUB-19 | next/image works with Supabase URLs | smoke | Build succeeds with `next build` | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` (catches TypeScript errors and build failures)
- **Per wave merge:** `npm run build && npm run start` (verify pages render)
- **Phase gate:** Full build + manual smoke test of all routes

### Wave 0 Gaps
- REQUIREMENTS.md explicitly marks "E2E automated tests" as Out of Scope
- Testing is manual UAT for v1
- Build verification (`next build`) is the primary automated check
- No test framework installation needed per project decision

## Sources

### Primary (HIGH confidence)
- ModelDirectory.jsx prototype (lines 1-1828) -- complete component reference, every UI element
- CLAUDE.md -- schema, routes, design tokens, config objects, build order
- Existing codebase -- layout.tsx, globals.css, supabase clients, next.config.mjs, tailwind.config.ts
- REQUIREMENTS.md -- PUB-01 through PUB-19 specifications

### Secondary (MEDIUM confidence)
- Next.js 14 App Router patterns (generateStaticParams, generateMetadata, revalidate) -- based on training data for Next.js 14.2.x which is the locked version
- @supabase/ssr cookie-based client patterns -- verified by existing server.ts implementation

### Tertiary (LOW confidence)
- Supabase Storage anon upload to submissions bucket -- needs runtime verification against actual RLS policies

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed, versions locked
- Architecture: HIGH -- prototype provides exact component structure, Next.js patterns are well-established
- Pitfalls: HIGH -- identified from prototype-to-Next.js translation experience and known App Router gotchas
- Data access: MEDIUM -- attributes jsonb column access pattern needs careful type mapping

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable stack, no version changes expected)
