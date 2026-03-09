# Requirements: Kpeachgirl Editorial Model Directory

**Defined:** 2026-03-09
**Core Value:** Photographers and casting directors can instantly browse and discover verified editorial models from LA/OC — browsing is always free, fast, and beautiful.

## v1 Requirements

### Foundation

- [x] **FOUND-01**: Next.js 14.2.x project created with TypeScript strict mode and App Router
- [x] **FOUND-02**: Tailwind CSS v3 configured with all design tokens (dark luxury theme: --cream, --rose, --sage, etc.)
- [x] **FOUND-03**: Cormorant Garamond (serif) and Manrope (sans) loaded via next/font/google
- [x] **FOUND-04**: globals.css includes CSS variables, grain texture, animations, and responsive breakpoints
- [ ] **FOUND-05**: lib/types.ts defines TypeScript interfaces for Profile, Group, Submission, SiteConfig, GalleryImage
- [ ] **FOUND-06**: lib/constants.ts exports default site_config values (card_settings, pill_groups, categories, hero, form_config, areas)
- [ ] **FOUND-07**: lib/i18n.ts exports 70+ translation keys in English and Korean with useTranslation hook

### Database

- [x] **DB-01**: Supabase migration creates profiles table with all columns (id, name, slug, region, parent_region, bio, types[], compensation[], verified, vacation, experience, profile_image, profile_image_crop, cover_image, cover_image_crop, attributes jsonb, sort_order, timestamps)
- [x] **DB-02**: Supabase migration creates gallery_images table with foreign key to profiles
- [x] **DB-03**: Supabase migration creates groups table with member_ids uuid[]
- [x] **DB-04**: Supabase migration creates group_gallery_images table with foreign key to groups
- [x] **DB-05**: Supabase migration creates submissions table (id, form_data jsonb, status, id_photo_url, created_at)
- [x] **DB-06**: Supabase migration creates site_config table (id text PRIMARY KEY, value jsonb, updated_at)
- [x] **DB-07**: RLS enabled on all tables; profiles/gallery/groups have public SELECT, admin-only INSERT/UPDATE/DELETE
- [x] **DB-08**: submissions table allows anon INSERT, admin full access
- [x] **DB-09**: site_config allows public SELECT, admin UPDATE only
- [x] **DB-10**: Supabase Storage buckets created: profile-images (public), cover-images (public), gallery-images (public), submissions (private admin-only)
- [x] **DB-11**: Storage RLS policies set correctly on storage.objects for each bucket
- [ ] **DB-12**: Admin user (admin@kpeachgirl.com) created in Supabase Auth
- [x] **DB-13**: Custom Access Token Hook injects is_admin: true into JWT for admin user; RLS uses (auth.jwt() ->> 'is_admin')::boolean
- [ ] **DB-14**: lib/supabase/client.ts (browser), lib/supabase/server.ts (server components), lib/supabase/middleware.ts created using @supabase/ssr
- [ ] **DB-15**: 12 seed model profiles seeded from prototype data with all attributes, gallery images (Unsplash URLs), and slugs
- [ ] **DB-16**: Default site_config rows seeded (areas, categories, card_settings, pill_groups, hero, form_config)

### Public Pages

- [ ] **PUB-01**: Age gate overlay shown on first visit; user must confirm 18+ to access site; persists in sessionStorage
- [ ] **PUB-02**: Homepage (/) is SSG with ISR fallback; renders hero banner from site_config (image, title, subtitle, accent word)
- [ ] **PUB-03**: Homepage search filters models by name or area (client-side)
- [ ] **PUB-04**: Homepage area filter chips (All / LA / West LA / Mid-Wilshire / OC) from site_config areas
- [ ] **PUB-05**: Homepage verified-only toggle filter
- [ ] **PUB-06**: Homepage model card grid (4-col desktop, 2-col tablet/mobile) with profile image, name, region, badge pills
- [ ] **PUB-07**: Model cards show verified badge and away/vacation badge per card_settings config
- [ ] **PUB-08**: Group cards displayed below individual model grid with DUO/TRIO/GROUP badge
- [ ] **PUB-09**: Model profile page (/model/[slug]) with ISR 60s; hero split (cover + profile photo), bio, measurements/stats, category sections, shoot types and compensation pills
- [ ] **PUB-10**: Model profile page gallery section with lightbox modal (click to enlarge, prev/next navigation)
- [ ] **PUB-11**: Model profile page shows "Also Available As" group links if model is in any groups
- [ ] **PUB-12**: Group profile page (/group/[slug]) with ISR 60s; group image, badge, bio, members grid, combined gallery
- [ ] **PUB-13**: Group profile page shows individual member cards linking to their profiles
- [ ] **PUB-14**: Membership form page (/membership) CSR; renders dynamic fields from site_config form_config
- [ ] **PUB-15**: Membership form supports all field types: text, email, textarea, area_select, exp_select, type_pills (multi-select), file_upload
- [ ] **PUB-16**: Membership form file upload (ID photo) uploads directly to Supabase Storage submissions bucket
- [ ] **PUB-17**: Membership form submission saves to submissions table with status 'new'; shows success message
- [ ] **PUB-18**: Each model/group profile page has SEO metadata (title, description, og:image from profile_image)
- [ ] **PUB-19**: next/image configured with Supabase Storage hostname in remotePatterns

### Admin CMS

- [ ] **ADM-01**: Admin login page (/admin/login) authenticates via Supabase Auth signInWithPassword
- [ ] **ADM-02**: Admin routes (/admin/*) protected by middleware; unauthenticated users redirected to /admin/login
- [ ] **ADM-03**: Admin uses getUser() (not getSession()) for auth verification; JWT is_admin claim checked
- [ ] **ADM-04**: Admin dashboard has 5-tab navigation: Models, Groups, Submissions, Profile Fields, Areas; EN/Korean language toggle
- [ ] **ADM-05**: Models tab lists all profiles; admin can create, edit, delete models
- [ ] **ADM-06**: Model editor slide-out panel: all profile fields (name, region, bio, experience, attributes, types, compensation, verified, vacation)
- [ ] **ADM-07**: Model editor uploads profile photo, cover photo to Supabase Storage (client-direct signed URL); PhotoEditor with focal point + zoom crop
- [ ] **ADM-08**: Model editor manages gallery images: upload multiple, reorder, delete; images go to gallery-images bucket
- [ ] **ADM-09**: Groups tab lists all groups; admin can create, edit, delete groups
- [ ] **ADM-10**: Group editor: name, bio, badge_label, image upload, member selection from existing profiles, gallery upload
- [ ] **ADM-11**: Submissions tab lists all membership form submissions with status (new/reviewed/approved/dismissed/converted)
- [ ] **ADM-12**: Submissions status workflow: admin can advance status; can convert approved submission to live profile
- [ ] **ADM-13**: Profile Fields tab — Hero section: upload banner image with crop, edit title lines, accent word, subtitle, search placeholder
- [ ] **ADM-14**: Profile Fields tab — Card Display: configure subtitle fields, badge visibility/labels, overlay color/opacity
- [ ] **ADM-15**: Profile Fields tab — Tag Groups: create/edit/delete pill groups (types, compensation) with colors and options
- [ ] **ADM-16**: Profile Fields tab — Membership Form Editor: customize field labels, required, width, field type
- [ ] **ADM-17**: Profile Fields tab — Category Sections: add/edit/remove profile sections (Vitals, Look, Work) with dynamic fields
- [ ] **ADM-18**: Areas tab: add/remove geographic areas used for filtering
- [ ] **ADM-19**: All admin saves call Supabase DB mutations then trigger on-demand ISR revalidation via /api/revalidate
- [ ] **ADM-20**: Admin logout clears session

### API Routes

- [ ] **API-01**: /api/contact POST route receives contact form data, sends email via Resend to admin
- [ ] **API-02**: /api/revalidate POST route validates REVALIDATION_SECRET header, calls revalidatePath for affected model/group pages

### Deployment

- [ ] **DEP-01**: Vercel project created/linked for kpeachgirl-app repository
- [ ] **DEP-02**: All environment variables set in Vercel: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, ADMIN_EMAIL, REVALIDATION_SECRET
- [ ] **DEP-03**: Production build succeeds (next build) with no TypeScript errors
- [ ] **DEP-04**: Deployed to Vercel production URL; homepage, model profiles, admin login all accessible

## v2 Requirements

### Enhancements

- **ENH-01**: Sitemap.xml dynamically generated from profiles and groups (SEO)
- **ENH-02**: Age gate persistence in localStorage (skip on repeat visits)
- **ENH-03**: Admin session timeout with auto-logout
- **ENH-04**: Audit log of admin actions (create/update/delete)
- **ENH-05**: Backup/restore functionality for site_config
- **ENH-06**: Model card loading skeletons for better UX
- **ENH-07**: ISR 404 fallback handling for deleted profile slugs
- **ENH-08**: Supabase image transformation as next/image custom loader (Pro plan)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-admin accounts | Single admin by design — business model |
| Self-serve model registration | Admin-curated quality is the differentiator |
| OAuth login | Email/password sufficient; complexity not justified |
| Real-time messaging | Not core to directory value; high complexity |
| Booking/scheduling | Out of scope — directory only, not marketplace |
| Model reviews/ratings | Quality maintained by admin, not crowdsourced |
| Video profiles | Storage/bandwidth costs; not in prototype |
| Mobile app | Responsive web covers mobile use case |
| E2E automated tests | Manual UAT acceptable for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01–04 | Phase 1: Foundation | Complete (01-01) |
| FOUND-05–07 | Phase 1: Foundation | Pending (01-02) |
| DB-01–16 | Phase 2: Supabase Setup | Pending |
| PUB-01–19 | Phase 3: Public Pages | Pending |
| ADM-01–20 | Phase 4: Admin CMS | Pending |
| API-01–02 | Phase 4: Admin CMS | Pending |
| DEP-01–04 | Phase 5: Deployment & Launch | Pending |

**Coverage:**
- v1 requirements: 68 total (FOUND: 7, DB: 16, PUB: 19, ADM: 20, API: 2, DEP: 4)
- Mapped to phases: 68
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 after roadmap creation — corrected requirement count from 60 to 68*
