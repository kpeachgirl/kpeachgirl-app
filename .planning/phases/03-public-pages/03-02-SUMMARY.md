---
phase: 03-public-pages
plan: 02
subsystem: ui
tags: [next.js, isr, supabase, homepage, search, filters, responsive-grid]

requires:
  - phase: 03-01
    provides: "Shared UI components (ModelCard, GroupCard, FilterBar, AgeGate, Navbar, Footer), types, utils, constants"
  - phase: 02-supabase-setup
    provides: "Supabase schema, RLS policies, seed data, site_config"
provides:
  - "Homepage server component with ISR (revalidate=60)"
  - "HomepageClient with hero banner, search, area filters, verified/available toggles"
  - "Static Supabase client for ISR-compatible public reads"
  - "Responsive model+group grid (4-col desktop, 2-col mobile)"
affects: [03-03, 03-04, 04-admin]

tech-stack:
  added: []
  patterns: ["Static Supabase client for ISR pages (no cookies)", "Server component data fetch + client component interactivity"]

key-files:
  created:
    - app/page.tsx
    - components/HomepageClient.tsx
    - lib/supabase/static.ts
  modified: []

key-decisions:
  - "Static Supabase client (lib/supabase/static.ts) for ISR — cookie-based server client makes route dynamic, breaking revalidate=60"
  - "Hero section rendered inside HomepageClient (not separate server component) — search input is tightly coupled to client state"

patterns-established:
  - "ISR public pages use createStaticClient() not createClient() from server.ts"
  - "Hero + search + filters + grid all in one client component for state cohesion"

requirements-completed: [PUB-02, PUB-03, PUB-04, PUB-05, PUB-06]

duration: 3min
completed: 2026-03-09
---

# Phase 3 Plan 2: Homepage Summary

**ISR homepage with hero banner, real-time search/filter, and responsive 4-col model grid using static Supabase client**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-09T23:26:23Z
- **Completed:** 2026-03-09T23:29:25Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Homepage fetches profiles, groups, and site_config server-side with ISR (revalidate=60)
- Hero banner with configurable title, subtitle, accent word, background image with crop support
- Real-time search filters by name or region, area chips filter by region/parent_region
- Verified-only and Available-only toggles with responsive filter bar
- Model grid (4-col desktop, 2-col mobile) with group cards below model cards
- Empty state message when no models match filters

## Task Commits

Each task was committed atomically:

1. **Task 1: Create homepage server component with ISR data fetching** - `ef2f8d7` (feat)
2. **Task 1 fix: Use static Supabase client for ISR compatibility** - `d52030e` (fix)

Task 2 (HomepageClient) was created as part of Task 1 per the revised plan approach (hero tightly coupled to search state).

## Files Created/Modified
- `app/page.tsx` - Homepage server component, ISR revalidate=60, parallel data fetching
- `components/HomepageClient.tsx` - Client component with hero, search, filters, model grid
- `lib/supabase/static.ts` - Cookie-free Supabase client for static/ISR pages

## Decisions Made
- Created lib/supabase/static.ts using @supabase/supabase-js createClient (no cookies) so homepage can be ISR-cached. The cookie-based server.ts client forces dynamic rendering.
- Hero section lives inside HomepageClient rather than a separate HeroBanner server component, since the search input in the hero needs client-side state.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created static Supabase client for ISR compatibility**
- **Found during:** Task 1 (homepage server component)
- **Issue:** Using createClient from lib/supabase/server.ts calls cookies(), which makes the route dynamic and breaks ISR with revalidate=60
- **Fix:** Created lib/supabase/static.ts with a cookie-free @supabase/supabase-js client for public anonymous reads
- **Files modified:** lib/supabase/static.ts, app/page.tsx
- **Verification:** npm run build succeeds, route shows as Static
- **Committed in:** d52030e

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for ISR to work. Established pattern for all future ISR pages.

## Issues Encountered
None beyond the ISR/cookies issue documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Homepage complete and rendering with seed data
- Static Supabase client pattern ready for model/group profile pages (03-03, 03-04)
- All shared components verified working in production build

---
*Phase: 03-public-pages*
*Completed: 2026-03-09*
