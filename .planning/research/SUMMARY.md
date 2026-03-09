# Project Research Summary

**Project:** Kpeachgirl — Editorial Model Directory
**Domain:** Admin-curated talent directory (LA/OC market, editorial/fashion photography)
**Researched:** 2026-03-09
**Confidence:** HIGH

## Executive Summary

Kpeachgirl is an admin-curated editorial model directory serving the LA/OC photography market. Unlike self-serve directories (Model Mayhem, PurplePort), the product's core value proposition is quality control: a single admin builds every profile, vets every model, and curates the grid order. The technical implementation translates a complete 1,828-line React prototype into a production Next.js 14 + Supabase application using a hybrid rendering architecture: ISR-backed Server Components for the public directory (SEO-optimized, CDN-cached) and a fully interactive Client Component CMS for the admin. The prototype is complete and covers all table-stakes and differentiator features — this project is a translation sprint, not a discovery sprint.

The recommended approach centers on a strict 4-phase build sequence driven by dependency order: (1) static shell and design tokens, (2) Supabase schema + auth + RLS, (3) public pages with ISR deployment, (4) admin CMS with image management. This order is non-negotiable — every public page depends on live schema, and the admin CMS depends on ISR being deployed because it triggers cache revalidation. The stack is locked: Next.js 14.2.x (not 15), Tailwind CSS v3 (not v4), `@supabase/ssr` (not the deprecated auth helpers), and Supabase Storage for all images (no external CDN).

The dominant risk cluster is Supabase + Next.js App Router auth integration. Three separate Supabase client files must exist from day one (browser, server, middleware) and must never be mixed. The JWT admin claim must be written to `app_metadata` (not user-writable `user_metadata`) before any RLS policy is written. Image uploads must bypass Vercel's 4.5MB body limit by uploading client-direct to Supabase Storage using signed URLs. All five of the critical pitfalls are concentrated in Session 2 (Supabase setup) — getting this phase right prevents rewrites in all later phases.

---

## Key Findings

### Recommended Stack

The stack is fully determined and locked to the prototype. No technology choices remain open. Next.js 14.2.35 (latest secure patch of the 14.x line) is the framework; upgrading to 15 would break ISR caching semantics and require React 19. Supabase handles database, auth, and storage — the `@supabase/ssr` package (v0.9.x) is the only correct auth helper for App Router; the older `@supabase/auth-helpers-nextjs` is deprecated and broken for server-side cookie management. Tailwind CSS v3 is used because the prototype's design token system (`tailwind.config.ts` with `theme.extend`) is incompatible with v4's CSS-first `@theme` directive. There is no ORM — Supabase's generated TypeScript types with the JS client are sufficient, and ORMs conflict with Supabase RLS.

**Core technologies:**
- **Next.js 14.2.35**: App framework, ISR, App Router, API routes — locked, do not upgrade
- **@supabase/ssr ^0.9.0**: SSR-safe auth cookie handling for App Router — replaces deprecated auth helpers
- **@supabase/supabase-js ^2.49.0**: Database queries, storage operations, auth
- **Tailwind CSS ^3.4.x**: Utility-first CSS with prototype's existing token system — do not upgrade to v4
- **next/font (built-in)**: Zero-CLS font loading for Cormorant Garamond + Manrope
- **next/image + sharp ^0.33.x**: Image optimization with Supabase Storage via `remotePatterns`
- **react-easy-crop ^5.x**: Focal point + zoom crop editor matching the prototype's `{x, y, zoom}` model
- **resend ^4.x**: Transactional email for contact form — locked per spec
- **react-dropzone ^14.x**: Headless drag-and-drop file input for admin uploads
- **clsx + tailwind-merge**: Conditional class merging via `cn()` utility

**Critical version constraints:**
- Next.js: 14.2.35 exactly (not 15.x)
- Tailwind: 3.x (not 4.x)
- Supabase auth: `@supabase/ssr` (not `@supabase/auth-helpers-nextjs`)

### Expected Features

The prototype covers 100% of table-stakes and differentiator features. The build is a translation task with no feature discovery required. However, several production gaps exist in the prototype that must be added during build.

**Must have (table stakes — all in prototype):**
- Browsable model grid with search, area filter, and shoot-type filter pills
- Individual model profile pages with measurements, bio, gallery, and contact CTA
- Photo gallery with masonry layout and fullscreen lightbox
- Verified badge and availability/vacation indicator
- Mobile-responsive layout (2-col mobile, 4-col desktop)
- Fast page loads via ISR (60s revalidate + on-demand revalidation)
- Contact mechanism via Resend email API

**Should have (differentiators — all in prototype):**
- Group/ensemble profiles (Duo/Trio/Group) with bidirectional cross-linking to individual profiles
- Admin-only CMS with Models, Groups, Submissions, Profile Fields, and Areas tabs
- Focal point + zoom crop editor for every image type (profile, cover, gallery)
- CMS-driven membership form with configurable fields and ID verification upload
- Submission workflow with status pipeline (new → reviewed → approved → dismissed → converted)
- Convert-submission-to-profile action
- Bilingual EN/Korean toggle with 70+ translation keys
- On-demand ISR revalidation after every admin save
- Manual sort order for grid curation
- Dark luxury editorial aesthetic via design token system

**Production gaps not in prototype (must add during build):**
- Per-profile SEO metadata (`<title>`, `og:image`, `description`) — needed for Google indexing
- `sitemap.xml` and `robots.txt` for profile page discoverability
- `notFound()` fallback for deleted profiles in ISR slug routing
- Error handling UI for image upload failures
- Loading skeleton states
- Contact form success/error UI states
- Revalidation endpoint error handling

**Defer to v2+:**
- Photographer accounts or logins
- In-platform messaging
- Booking/calendar system
- Search beyond name and area
- Video support in galleries
- Mobile app

### Architecture Approach

The architecture is a hybrid rendering split: the public directory (`/`, `/model/[slug]`, `/group/[slug]`, `/membership`) uses Server Components with ISR/SSG — every public page is pre-rendered, CDN-cached, and SEO-optimized with zero JavaScript needed for the static content. The admin CMS (`/admin`, `/admin/login`) is a fully interactive Client Component section behind a server-side auth guard. These two personas share the same Next.js app but use separate route groups (`(public)` and `admin/`) with independent layout trees. A root middleware runs on every non-static request to refresh Supabase auth cookies — this is mandatory for session persistence across Server Components.

**Major components:**

1. **lib/supabase/ (3 files)** — Browser client (`client.ts`), server client (`server.ts`), and middleware helper (`middleware.ts`). These three files must never be mixed. The wrong import silently breaks auth with no type errors.

2. **middleware.ts** — Root middleware calling `supabase.auth.getClaims()` (not `getSession()`) on every request to refresh JWT tokens and write updated cookies back to both request and response.

3. **app/(public)/ — Server Component shell** — Homepage, model profile, group profile rendered as ISR pages. Data fetched at build/revalidation time. Client Component islands (Lightbox, AgeGate) embedded where interactivity is needed.

4. **app/admin/ — Client Component CMS** — Admin layout contains server-side auth guard (`getUser()` redirect). `admin/page.tsx` is a Server Component that prefetches all data and passes it as props to the `AdminDashboard` Client Component root.

5. **app/api/ — Route Handlers** — `POST /api/contact` (Resend email), `POST /api/revalidate` (on-demand ISR, secret-protected).

6. **Supabase schema (6 tables)** — `profiles`, `gallery_images`, `groups`, `group_gallery_images`, `submissions`, `site_config`. RLS enabled on all tables: public SELECT, admin-only writes (enforced via JWT `app_metadata.is_admin` claim).

7. **Storage buckets (4)** — `profile-images`, `cover-images`, `gallery-images` (public), `submissions` (admin-read/anon-write). Client-direct upload via browser client; never proxied through Vercel API routes.

**Key patterns:**
- Server shell / Client island — public pages maximize pre-rendered HTML, minimize JS bundle
- Three Supabase clients — explicit separation by execution context, never merged into one file
- Admin JWT claim via `app_metadata` — written via SQL migration, read in all RLS policies
- On-demand revalidation — admin triggers `revalidatePath` after every save via secret-protected API route
- Client-direct storage upload — bypasses Vercel 4.5MB body limit entirely

### Critical Pitfalls

1. **Wrong Supabase client in server code** — Using `createBrowserClient` in a Server Component or middleware silently returns null auth state. Prevent by creating three separate files (`lib/supabase/client.ts`, `server.ts`, `middleware.ts`) with `// SERVER ONLY` / `// CLIENT ONLY` comments. Detection: `getUser()` returns null immediately after login.

2. **JWT admin claim in user_metadata** — Any authenticated user can call `updateUser({ data: { is_admin: true } })` from the client SDK to escalate to admin if the claim is in `user_metadata`. Prevent by writing the claim via SQL migration to `raw_app_meta_data` and reading it in RLS policies as `auth.jwt() -> 'app_metadata' ->> 'is_admin'`.

3. **Missing or broken auth middleware** — Using `getSession()` instead of `getClaims()` in middleware means expired tokens are trusted without revalidation. Tokens expire after 1 hour; the bug only surfaces in production. Prevent by following the exact `@supabase/ssr` middleware pattern with `getClaims()` and bidirectional cookie updates (request and response).

4. **RLS not enabled or missing storage policies** — Tables default to RLS off in Supabase. Missing policies on `storage.objects` cause 403 errors on admin uploads even with a valid JWT. Prevent by adding `ALTER TABLE [table] ENABLE ROW LEVEL SECURITY` to every migration and writing storage bucket policies alongside table policies in Session 2.

5. **Image uploads routed through Vercel API routes** — Vercel serverless functions have a 4.5MB body limit; gallery and ID verification photos routinely exceed this. Prevent by using client-direct upload to Supabase Storage using signed URLs from a Server Action. Never let file bytes touch a Next.js Route Handler body.

---

## Implications for Roadmap

Based on the combined research, the build follows a strict 4-phase dependency order that cannot be reordered. The architecture file explicitly documents this sequence. Each phase gate-checks the next.

### Phase 1: Foundation (Static Shell)

**Rationale:** All components import from `lib/`. Tailwind tokens, TypeScript types, i18n keys, and font setup must exist before any component can be built. This phase has zero external dependencies — it can be built and tested entirely offline.

**Delivers:** Runnable Next.js 14 app with design tokens, fonts, globals.css, `lib/types.ts`, `lib/constants.ts`, `lib/i18n.ts`, and `next.config.ts`. No pages, no data.

**Addresses:** Dark luxury aesthetic, bilingual support infrastructure, TypeScript strict mode setup.

**Avoids:** Retrofitting design tokens into existing components (always painful); Tailwind v4 migration risk (locked to v3 from project start); `remotePatterns` gap (configure in `next.config.ts` here before any `<Image>` components exist).

**Research flag:** No additional research needed. Well-documented Next.js bootstrapping with zero novel patterns.

---

### Phase 2: Supabase Setup (Data + Auth + Security)

**Rationale:** Every public page and every admin operation depends on live schema and correct auth. Getting this phase wrong requires rewrites of everything built after it. All 5 critical pitfalls are concentrated here. This phase must be completed and verified before any page code is written.

**Delivers:** All 6 tables with RLS enabled, 4 storage buckets with storage policies, admin user with JWT claim in `app_metadata`, 3 Supabase client files, root middleware with `getClaims()`, seed data (12 models + default `site_config`), and generated TypeScript types.

**Uses:** `@supabase/supabase-js`, `@supabase/ssr`, SQL migrations, Supabase Auth Custom Access Token Hook.

**Implements:** RLS policy pattern (public SELECT, admin write via `app_metadata` claim), three-client separation, middleware JWT refresh.

**Avoids:** Wrong client context (Pitfall 1), broken middleware (Pitfall 2), user-writable admin claim (Pitfall 3), missing RLS (Pitfall 4), stale generated types (Pitfall 9), service role key leakage (Pitfall 10).

**Research flag:** No additional research needed. Official Supabase docs cover all patterns at HIGH confidence. The specific SQL for the Custom Access Token Hook is documented in STACK.md and ARCHITECTURE.md.

**Verification gate:** Before proceeding to Phase 3 — confirm that (a) anon cannot read `submissions` table, (b) `updateUser({ data: { is_admin: true } })` from a non-admin client does NOT grant write access to `profiles`, and (c) admin auth persists past 1 hour without redirect loop.

---

### Phase 3: Public Pages + ISR Deployment

**Rationale:** Public pages are the product's primary value. Deploying to Vercel in this phase validates ISR behavior in production before the admin CMS is built — the admin CMS triggers revalidation of public pages, so ISR must be confirmed working first. This phase delivers the entire visitor-facing experience.

**Delivers:** Age gate, model grid (homepage with search + filter), model profile pages, group profile pages, membership form with dynamic fields and ID verification upload, Vercel deployment with confirmed ISR, on-demand revalidation API route.

**Addresses:** All table-stakes features (browsable grid, profiles, gallery, lightbox, filters, contact CTA, verified/away badges, mobile layout), group profiles (differentiator), membership form with ID verification (differentiator), all production gaps (SEO metadata, sitemap, 404 handling, skeleton states).

**Implements:** ISR with `generateStaticParams` + `revalidate: 60`, Server shell / Client island pattern, AgeGate with middleware cookie check, `notFound()` fallback for deleted slugs.

**Avoids:** ISR stale cache issues (Pitfall 7), missing `remotePatterns` (Pitfall 6), age gate bypass via direct URL (Pitfall 13), missing Korean translations for new UI strings (Pitfall 14), `generateStaticParams` build timeout (Pitfall 12), Vercel preview contaminating production DB (Pitfall 11).

**Research flag:** No additional research needed. All patterns documented at HIGH confidence. ISR with `@supabase/ssr` is well-established.

---

### Phase 4: Admin CMS + Image Management

**Rationale:** The admin CMS depends on ISR being deployed (admin triggers revalidation of live public pages) and on the full schema being seeded with real data to test workflows. This phase is the most complex single phase — it encompasses 10 sub-tasks including all CRUD editors, the PhotoEditor component, image uploads to Supabase Storage, the submissions pipeline, and the Resend contact form integration.

**Delivers:** Login page, auth guard layout, all admin tabs (Models, Groups, Submissions, Profile Fields, Areas), slide-out profile/group editors, PhotoEditor with focal point + zoom, client-direct image uploads with signed URLs, submission status workflow and convert-to-profile action, CMS hero/form/card config editors, contact form via Resend, E2E verification.

**Addresses:** Fully dynamic admin CMS (differentiator), focal point + zoom crop editor (differentiator), submission workflow with status tracking (differentiator), convert submission to profile (differentiator), on-demand ISR revalidation from CMS, sort order management, CMS-driven card display fields, bilingual EN/Korean toggle.

**Uses:** `react-easy-crop`, `react-dropzone`, Supabase Storage signed upload URLs, `resend`, Server Actions for upload URL generation, `AdminDashboard` Client Component pattern with Server Component data prefetch.

**Implements:** Auth guard in `app/admin/layout.tsx` via `getUser()`, `AdminDashboard` as Client Component receiving initial data props from Server Component `page.tsx`, client-direct upload flow bypassing Vercel body limit.

**Avoids:** Image upload size limit (Pitfall 5 — use signed URLs), service role key in client bundle (Pitfall 10), admin dashboard as Server Component anti-pattern.

**Research flag:** Image upload via signed URLs is the one area where implementation details should be confirmed against current `@supabase/ssr` and Supabase Storage docs before building. The pattern is documented in PITFALLS.md but verify the `createSignedUploadUrl` API signature is current.

---

### Phase Ordering Rationale

- **Types before pages:** `lib/types.ts` is imported by every component and page. Establishing TypeScript interfaces for `Profile`, `Group`, `Submission`, `SiteConfig`, and all sub-shapes before writing any component prevents interface mismatches that cause cascading refactors.
- **Schema before components:** Components that render data need to know the shape of that data. Building against seed data in a live Supabase project is essential; building against mock objects produces components that need retrofitting.
- **Public before admin:** The admin CMS triggers on-demand revalidation of public ISR pages. If ISR is not deployed and verified first, there is no feedback loop to confirm the revalidation mechanism works.
- **Foundation pitfall prevention:** Configuring `remotePatterns` in Phase 1 and establishing the three-client pattern in Phase 2 prevents the two most common image and auth pitfalls from ever appearing in later phases.

### Research Flags

Phases needing deeper research during planning:
- **Phase 4 (image uploads):** Confirm the current `createSignedUploadUrl` API signature in `@supabase/supabase-js` v2.49.x and verify the client-direct PUT flow against current Supabase Storage docs before implementation. The pattern is documented but API signatures can shift between minor versions.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Pure Next.js + Tailwind bootstrapping. All patterns are official-docs-verified.
- **Phase 2 (Supabase):** RLS, Custom Access Token Hook, and `@supabase/ssr` patterns are fully documented in STACK.md and ARCHITECTURE.md at HIGH confidence.
- **Phase 3 (Public pages):** ISR, `generateStaticParams`, Server shell/Client island — all established Next.js 14 App Router patterns with official documentation.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technology choices verified against official npm and official docs. Version constraints clearly justified. |
| Features | HIGH | Derived from a complete working prototype (1,828 lines). Table stakes confirmed against industry references (Model Mayhem, Backstage, Models.com). No feature ambiguity. |
| Architecture | HIGH | All patterns verified against official Next.js and Supabase docs (last checked 2026-03). Middleware pattern, RLS, ISR all confirmed current. |
| Pitfalls | HIGH | Each pitfall sourced from official Supabase troubleshooting docs, GitHub issues, and Vercel community posts. Prevention patterns are official-docs-verified. |

**Overall confidence:** HIGH

### Gaps to Address

- **Resend version pin:** npm listing shows a wide version range (4.x–6.9.x). Verify the exact current stable version with `npm view resend version` before installing. The API is simple enough that minor version differences are unlikely to break anything, but pin explicitly.
- **Signed upload URL API signature:** `createSignedUploadUrl` is documented in PITFALLS.md but should be verified against the current `@supabase/supabase-js` v2.49.x API reference before Phase 4 begins. The method exists and is correct in concept; confirm the exact parameter signature.
- **Age gate cookie implementation:** PITFALLS.md recommends checking the age gate cookie in middleware (Pitfall 13) but does not provide the full implementation. This needs design during Phase 3 planning — decide whether to implement as a middleware redirect or a client-only cookie check, balancing SEO (middleware redirect is better) against implementation complexity.
- **SEO metadata strategy:** The prototype has no `<head>` metadata. Phase 3 must define the per-profile metadata structure (`title`, `description`, `og:image` using the model's profile photo) before building profile pages. This is straightforward Next.js `generateMetadata` — no research needed, just a design decision.

---

## Sources

### Primary (HIGH confidence)
- [Supabase: Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) — middleware pattern, three-client setup
- [Supabase: Creating a client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client) — `@supabase/ssr` API
- [Supabase: Custom Claims and RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) — JWT admin claim, `app_metadata`
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS policy patterns
- [Supabase: Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) — storage bucket policies
- [Next.js: ISR Guide](https://nextjs.org/docs/app/guides/incremental-static-regeneration) — ISR, `generateStaticParams`, `revalidatePath`
- [Next.js: Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) — route groups, App Router file conventions
- [Next.js 14.2.35 security patch](https://nextjs.org/blog/security-update-2025-12-11) — version justification
- [Tailwind CSS v4.0 release](https://tailwindcss.com/blog/tailwindcss-v4) — v3 vs v4 decision

### Secondary (MEDIUM confidence)
- [@supabase/ssr on npm](https://www.npmjs.com/package/@supabase/ssr) — version 0.9.0
- [@supabase/supabase-js on npm](https://www.npmjs.com/package/@supabase/supabase-js) — version 2.49.x
- [resend on npm](https://www.npmjs.com/package/resend) — version range 4.x–6.x (pin before installing)
- [react-easy-crop on GitHub](https://github.com/ValentinH/react-easy-crop) — v5.x, focal point API
- [How to Bypass Vercel's 4.5MB Limit — Medium](https://medium.com/@jpnreddy25/how-to-bypass-vercels-4-5mb-body-size-limit-for-serverless-functions-using-supabase-09610d8ca387) — signed upload URL pattern
- [Model Mayhem features review](https://fixthephoto.com/model-mayhem.html) — table stakes validation
- [Model measurements standards](https://www.backstage.com/magazine/article/model-measurements-75473/) — industry requirements

### Tertiary (LOW confidence — community/discussion sources)
- [AuthSessionMissingError — GitHub Issue #107](https://github.com/supabase/ssr/issues/107) — middleware pitfall confirmation
- [Next.js 13/14 Stale Data with RLS — Supabase Discussion](https://github.com/orgs/supabase/discussions/19084) — ISR cache pitfall

---
*Research completed: 2026-03-09*
*Ready for roadmap: yes*
