# Kpeachgirl — Editorial Model Directory

## What This Is

Kpeachgirl is an admin-managed editorial model directory for the LA/OC region. Models pay the admin to build professional profiles with photos and stats; photographers and casting directors browse for free. The platform features a dark luxury aesthetic with full bilingual (English/Korean) support.

## Core Value

Photographers and casting directors can instantly browse and discover verified editorial models from LA/OC — browsing is always free, fast, and beautiful.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Next.js 14 App Router project with TypeScript strict mode, Tailwind CSS, Cormorant Garamond + Manrope fonts
- [ ] Supabase PostgreSQL schema: profiles, gallery_images, groups, group_gallery_images, submissions, site_config
- [ ] Supabase Storage buckets: profile-images, cover-images, gallery-images, submissions (with RLS)
- [ ] Supabase Auth: admin user (admin@kpeachgirl.com) with JWT admin claim for RLS
- [ ] Public homepage: age gate, hero banner (CMS-driven), search, area/verified filters, model card grid (4-col), group cards
- [ ] Public model profile pages (ISR 60s): full bio, measurements, gallery lightbox, group links
- [ ] Public group profile pages (ISR 60s): members list, combined gallery, stats
- [ ] Membership form page (CSR): dynamic fields from site_config, file upload for ID verification
- [ ] Admin CMS: login + auth guard, Models tab (CRUD + photo editor), Groups tab, Submissions tab (status workflow), Profile Fields tab (hero/cards/tags/form editor), Areas tab
- [ ] Image uploads to Supabase Storage with focal point + zoom crop editor
- [ ] Contact form API route → Resend email
- [ ] On-demand ISR revalidation API route
- [ ] Seed data: 12 models from prototype + default site_config
- [ ] Deploy to Vercel with environment variables

### Out of Scope

- Multi-admin or team accounts — single admin only (by design)
- OAuth login — email/password admin auth only
- Mobile app — web-first, responsive design covers mobile
- Real-time features — ISR with on-demand revalidation is sufficient
- E2E automated testing — manual UAT acceptable for v1

## Context

- **Prototype exists**: `ModelDirectory.jsx` (1,828 lines) — complete working prototype with all UI, components, and business logic. This is the single source of truth for all design decisions.
- **Supabase project**: `vdrbqgxdyebcncuyemvg` — project already exists, needs migrations and setup
- **Design system**: Dark luxury theme with custom CSS variables (see CLAUDE.md for full token list)
- **12 seed models**: Complete profiles with Unsplash photos in the prototype — used for seeding
- **i18n**: 70+ translation keys in English and Korean, instant toggle in admin
- **CLAUDE.md**: Full build bible in project root — reference for all decisions

## Constraints

- **Tech Stack**: Next.js 14 App Router, TypeScript strict, Tailwind CSS, Supabase, Vercel, Resend — locked
- **Supabase Project**: Must use existing project `vdrbqgxdyebcncuyemvg`
- **Design**: Must match prototype exactly — dark theme tokens, responsive breakpoints, typography
- **Auth**: Supabase Auth with JWT admin claim for RLS — no other auth approach
- **Images**: Supabase Storage only — all uploads must persist to buckets

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router (not Pages) | Prototype spec, ISR support, modern approach | — Pending |
| Supabase for auth + DB + storage | Single vendor simplicity, RLS for security | — Pending |
| Single admin user model | Business model: admin manages all content | — Pending |
| ISR 60s for profiles | Fast public browsing, near-real-time updates | — Pending |
| Migrate from JSX prototype | Preserve all UX decisions, only change architecture | — Pending |

---
*Last updated: 2026-03-09 after initialization*
