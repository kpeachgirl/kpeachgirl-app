# Roadmap: Kpeachgirl Editorial Model Directory

## Overview

Translate the complete 1,828-line React prototype into a production Next.js 14 + Supabase application in five dependency-ordered phases. Phase 1 establishes the static shell and design tokens so every component has a shared foundation. Phase 2 wires in the live Supabase schema, auth, and RLS before any page renders real data. Phase 3 delivers the entire public-facing experience deployed on Vercel with confirmed ISR. Phase 4 builds the admin CMS that curates all content and triggers revalidation of the live public pages. Phase 5 confirms a clean production deployment with all environment variables in place.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Next.js 14 static shell with design tokens, fonts, types, constants, and i18n
- [x] **Phase 2: Supabase Setup** - Live schema, RLS, storage buckets, admin auth, and seed data (completed 2026-03-09)
- [ ] **Phase 3: Public Pages** - Full visitor-facing experience deployed to Vercel with ISR confirmed
- [ ] **Phase 4: Admin CMS** - Complete admin dashboard with all CRUD editors, image uploads, and API routes
- [ ] **Phase 5: Deployment & Launch** - Production environment variables, clean build, and live Vercel URL

## Phase Details

### Phase 1: Foundation
**Goal**: The runnable Next.js 14 app exists with all shared infrastructure so every subsequent component can import from lib/ without gaps
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07
**Success Criteria** (what must be TRUE):
  1. `npm run dev` starts without errors and the app loads at localhost:3000
  2. The dark luxury color tokens (--cream, --rose, --sage, etc.) are available as CSS variables in the browser
  3. Cormorant Garamond and Manrope fonts render on any page without layout shift
  4. TypeScript strict mode is active and `Profile`, `Group`, `Submission`, `SiteConfig`, `GalleryImage` types are importable from lib/types.ts
  5. The useTranslation hook returns correct strings for both English and Korean keys
**Plans**: 2 plans

Plans:
- [x] 01-01: Next.js 14 scaffolding — create-next-app, tailwind.config.ts with design tokens, globals.css
- [ ] 01-02: Shared library — lib/types.ts, lib/constants.ts, lib/i18n.ts, lib/utils.ts (cn helper)

### Phase 2: Supabase Setup
**Goal**: The live Supabase project has all tables with correct RLS, storage buckets with correct policies, a working admin JWT claim, Supabase client files, and seed data — so every page and admin action has a trusted data foundation
**Depends on**: Phase 1
**Requirements**: DB-01, DB-02, DB-03, DB-04, DB-05, DB-06, DB-07, DB-08, DB-09, DB-10, DB-11, DB-12, DB-13, DB-14, DB-15, DB-16
**Success Criteria** (what must be TRUE):
  1. All 6 tables exist in Supabase with RLS enabled and a public SELECT query returns seed data
  2. An unauthenticated client cannot INSERT or UPDATE the profiles table (RLS blocks it)
  3. The admin user can log in via Supabase Auth and their JWT contains the is_admin claim in app_metadata
  4. All 4 storage buckets exist; a public image URL resolves in the browser, the submissions bucket returns 403 to anon reads
  5. 12 seed model profiles and all default site_config rows are present in the database
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — SQL migrations: 6 tables, RLS policies, storage buckets, storage policies, auth hook function
- [ ] 02-02-PLAN.md — Supabase client files (client.ts, server.ts, middleware.ts), root middleware, admin user setup
- [ ] 02-03-PLAN.md — Seed data: 12 model profiles, gallery images, 6 site_config rows

### Phase 3: Public Pages
**Goal**: Any photographer or casting director can browse the full model directory, view individual model and group profiles, and submit a membership inquiry — all pages load fast via ISR and look identical to the prototype
**Depends on**: Phase 2
**Requirements**: PUB-01, PUB-02, PUB-03, PUB-04, PUB-05, PUB-06, PUB-07, PUB-08, PUB-09, PUB-10, PUB-11, PUB-12, PUB-13, PUB-14, PUB-15, PUB-16, PUB-17, PUB-18, PUB-19
**Success Criteria** (what must be TRUE):
  1. A first-time visitor is shown the age gate overlay and cannot see any content until confirming 18+
  2. The homepage displays the full model grid with working search, area filter chips, and verified-only toggle; group cards appear below the grid
  3. Clicking a model card opens the full profile page with bio, measurements, gallery lightbox with prev/next navigation, and shoot type pills
  4. The membership form at /membership renders all dynamic fields from site_config, accepts a file upload, and shows a success message after submission
  5. Each model and group profile page has correct og:title, og:description, and og:image metadata visible in page source
**Plans**: 6 plans

Plans:
- [ ] 03-01-PLAN.md — Shared lib files (types, constants, i18n, utils) and reusable UI components
- [ ] 03-02-PLAN.md — Homepage with hero banner, search, area filters, verified toggle, model grid, group cards
- [ ] 03-03-PLAN.md — Model profile page /model/[slug] with ISR, hero split, stats, gallery lightbox, group links, SEO
- [ ] 03-04-PLAN.md — Group profile page /group/[slug] with ISR, members grid, combined gallery, SEO
- [ ] 03-05-PLAN.md — Membership form /membership with dynamic fields, file upload, submission
- [ ] 03-06-PLAN.md — next.config remotePatterns for Unsplash and full build verification

### Phase 4: Admin CMS
**Goal**: The admin can log in and fully manage all site content — create, edit, and delete models and groups; advance submission statuses; configure site appearance and form fields; upload and crop all images — with every save triggering on-demand ISR revalidation of the public site
**Depends on**: Phase 3
**Requirements**: ADM-01, ADM-02, ADM-03, ADM-04, ADM-05, ADM-06, ADM-07, ADM-08, ADM-09, ADM-10, ADM-11, ADM-12, ADM-13, ADM-14, ADM-15, ADM-16, ADM-17, ADM-18, ADM-19, ADM-20, API-01, API-02
**Success Criteria** (what must be TRUE):
  1. Navigating to /admin without being logged in redirects to /admin/login; after login the dashboard is accessible
  2. Admin can create a new model with profile photo (focal point + zoom crop), cover photo, gallery images, and all profile fields; the model appears on the public homepage after save
  3. Admin can review a new submission, advance its status to approved, and convert it to a live profile
  4. Admin can edit the hero banner image and title in Profile Fields tab; the homepage reflects the change after ISR revalidation
  5. The contact form API route sends an email and the revalidation API route refreshes affected pages when called with the correct secret
**Plans**: 9 plans

Plans:
- [ ] 04-01-PLAN.md — Auth layer: /admin/login page, middleware auth guard, admin layout with getUser() check, logout
- [ ] 04-02-PLAN.md — Admin shell: 5-tab navigation, EN/Korean toggle, AdminDashboard client component
- [ ] 04-03-PLAN.md — Models tab: profile list with stats/filters, slide-out editor with all fields, CRUD
- [ ] 04-04-PLAN.md — Image infrastructure: PhotoEditor (focal point + zoom), upload helpers, revalidation utility
- [ ] 04-05-PLAN.md — Model image wiring: photo uploads into ModelEditor, gallery management, ISR on save
- [ ] 04-06-PLAN.md — Groups tab: group list, inline editor with member selection and gallery
- [ ] 04-07-PLAN.md — Submissions tab: status workflow, convert-to-profile action
- [ ] 04-08-PLAN.md — Profile Fields tab: hero, card display, tag groups, form editor, category sections
- [ ] 04-09-PLAN.md — Areas tab, API routes (/api/contact Resend, /api/revalidate ISR)

### Phase 5: Deployment & Launch
**Goal**: The production Vercel deployment is live with all environment variables set, a clean TypeScript build, and every public route accessible at the production URL
**Depends on**: Phase 4
**Requirements**: DEP-01, DEP-02, DEP-03, DEP-04
**Success Criteria** (what must be TRUE):
  1. The Vercel project is linked to the repository and auto-deploys on push to main
  2. All 6 environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, ADMIN_EMAIL, REVALIDATION_SECRET) are set in Vercel production
  3. `next build` completes with zero TypeScript errors and zero build failures
  4. The production URL serves the homepage, a model profile page, and the admin login page without errors
**Plans**: TBD

Plans:
- [ ] 05-01: Vercel project setup, environment variables, production deployment, smoke test all routes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/2 | In progress | - |
| 2. Supabase Setup | 3/3 | Complete   | 2026-03-09 |
| 3. Public Pages | 5/6 | In Progress|  |
| 4. Admin CMS | 4/9 | In Progress|  |
| 5. Deployment & Launch | 0/1 | Not started | - |
