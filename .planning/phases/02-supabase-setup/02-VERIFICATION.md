---
phase: 02-supabase-setup
verified: 2026-03-09T23:59:00Z
status: human_needed
score: 7/7 must-haves verified
re_verification: false
human_verification:
  - test: "Run verify.sql in Supabase SQL Editor and confirm 6 tables, 25+ RLS policies, 4 buckets, 7 storage policies, and the hook function"
    expected: "All tables, policies, buckets, and hook function present in query results"
    why_human: "Live database state cannot be verified from local codebase"
  - test: "Log in as admin@kpeachgirl.com via Supabase Auth and confirm JWT contains is_admin claim"
    expected: "JWT access token includes is_admin: true after Custom Access Token Hook processes the token"
    why_human: "Auth hook execution and JWT claim injection require live Supabase Auth service"
  - test: "Confirm SELECT count(*) FROM profiles returns 12 and SELECT id FROM site_config returns 6 rows"
    expected: "12 profiles, 6 site_config rows present in live database"
    why_human: "Seed data was applied to live Supabase; cannot verify remotely from codebase"
  - test: "Try INSERT INTO profiles (name) VALUES ('test') as anon — should be blocked by RLS"
    expected: "Row-level security policy violation error"
    why_human: "RLS enforcement requires live database query as unauthenticated client"
---

# Phase 2: Supabase Setup Verification Report

**Phase Goal:** The live Supabase project has all tables with correct RLS, storage buckets with correct policies, a working admin JWT claim, Supabase client files, and seed data -- so every page and admin action has a trusted data foundation
**Verified:** 2026-03-09T23:59:00Z
**Status:** human_needed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | All 6 tables exist with correct columns and constraints | VERIFIED | `20260309000001_create_tables.sql` contains 6 CREATE TABLE statements matching CLAUDE.md schema exactly (profiles, gallery_images, groups, group_gallery_images, submissions, site_config) with correct column types, PKs, FKs, and defaults |
| 2 | RLS blocks anon writes to profiles/groups/gallery tables | VERIFIED | `20260309000002_enable_rls.sql` enables RLS on all 6 tables. 25 policies use `(auth.jwt() ->> 'is_admin')::boolean = true` for write operations. Public SELECT allowed via `USING (true)` |
| 3 | RLS allows anon INSERT to submissions | VERIFIED | `submissions_anon_insert` policy grants anon INSERT WITH CHECK (true); also `submissions_authenticated_insert` for flexibility |
| 4 | RLS allows public SELECT on site_config, admin-only UPDATE | VERIFIED | `site_config_public_select` uses `USING (true)` for anon+authenticated; update/insert/delete require is_admin |
| 5 | 4 storage buckets exist (3 public, 1 private) with correct policies | VERIFIED | `20260309000003_storage_buckets.sql` creates profile-images, cover-images, gallery-images (public: true) and submissions (public: false). 7 storage.objects policies cover admin uploads and anon submission uploads |
| 6 | Custom Access Token Hook function exists with correct grants | VERIFIED | `20260309000004_custom_access_token_hook.sql` creates `custom_access_token_hook` reading `is_admin` from `raw_app_meta_data`. GRANTs to supabase_auth_admin, REVOKEs from authenticated/anon/public. Additional `20260309000005_revoke_hook_from_public.sql` for defense-in-depth |
| 7 | Supabase client files exist and are wired | VERIFIED | `lib/supabase/client.ts` (createBrowserClient), `lib/supabase/server.ts` (createServerClient with cookie handling), `lib/supabase/middleware.ts` (updateSession with getUser()), `middleware.ts` imports and calls updateSession |
| 8 | 12 seed profiles and 6 site_config rows defined | VERIFIED | `supabase/seed.sql` (509 lines) contains all 12 model slugs, 12 gallery_images INSERT blocks (one per model), 6 site_config INSERTs (areas, categories, card_settings, pill_groups, hero, form_config). Idempotent via TRUNCATE+transaction |
| 9 | Supabase packages installed | VERIFIED | `package.json` includes `@supabase/supabase-js@^2.99.0` and `@supabase/ssr@^0.9.0` |
| 10 | .env.local configured | VERIFIED | `.env.local` exists with NEXT_PUBLIC_SUPABASE_URL present |

**Score:** 7/7 truths verified (from plan must_haves; 10/10 including derived truths)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/20260309000001_create_tables.sql` | 6 tables | VERIFIED | 117 lines, 6 CREATE TABLE + updated_at trigger function + 3 triggers |
| `supabase/migrations/20260309000002_enable_rls.sql` | RLS policies for all 6 tables | VERIFIED | 143 lines, 6 ALTER TABLE ENABLE RLS + 25 CREATE POLICY statements |
| `supabase/migrations/20260309000003_storage_buckets.sql` | 4 buckets + storage policies | VERIFIED | 71 lines, 4 bucket INSERTs + 7 storage.objects policies |
| `supabase/migrations/20260309000004_custom_access_token_hook.sql` | JWT is_admin hook | VERIFIED | 41 lines, function + GRANTs + REVOKEs |
| `supabase/migrations/20260309000005_revoke_hook_from_public.sql` | Defense-in-depth REVOKE | VERIFIED | 2 lines, additional REVOKE for security |
| `supabase/migrations/20260309000006_seed_data.sql` | Seed migration copy | VERIFIED | Duplicate of seed.sql as numbered migration |
| `supabase/verify.sql` | Verification script | VERIFIED | 55 lines, 6 queries covering tables, policies, buckets, hook, triggers |
| `supabase/seed.sql` | 12 profiles + gallery + site_config | VERIFIED | 509 lines, all 12 models + 12 gallery blocks + 6 config rows |
| `lib/supabase/client.ts` | Browser client | VERIFIED | 9 lines, exports createClient using createBrowserClient |
| `lib/supabase/server.ts` | Server client | VERIFIED | 29 lines, exports createClient using createServerClient with cookie handling |
| `lib/supabase/middleware.ts` | Session refresh | VERIFIED | 33 lines, exports updateSession calling getUser() |
| `middleware.ts` | Root middleware | VERIFIED | 13 lines, imports updateSession, exports middleware + config matcher |
| `.env.local.example` | Env var template | VERIFIED | 7 lines, all 5 env vars documented |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `20260309000002_enable_rls.sql` | `custom_access_token_hook` | `is_admin` JWT claim | WIRED | All write policies reference `(auth.jwt() ->> 'is_admin')::boolean` which the hook injects |
| `20260309000003_storage_buckets.sql` | `custom_access_token_hook` | `is_admin` JWT claim | WIRED | Storage policies also use `(auth.jwt() ->> 'is_admin')::boolean = true` |
| `middleware.ts` | `lib/supabase/middleware.ts` | `import { updateSession }` | WIRED | Line 1: `import { updateSession } from '@/lib/supabase/middleware'` |
| `lib/supabase/server.ts` | `@supabase/ssr` | `createServerClient` | WIRED | Line 1: `import { createServerClient } from '@supabase/ssr'` |
| `lib/supabase/client.ts` | `@supabase/ssr` | `createBrowserClient` | WIRED | Line 1: `import { createBrowserClient } from '@supabase/ssr'` |
| `supabase/seed.sql` | `20260309000001_create_tables.sql` | INSERTs into created tables | WIRED | INSERT INTO profiles, gallery_images, site_config match table schemas |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| DB-01 | 02-01 | profiles table with all columns | SATISFIED | `20260309000001_create_tables.sql` lines 7-27 |
| DB-02 | 02-01 | gallery_images table with FK to profiles | SATISFIED | Lines 32-39, `REFERENCES profiles(id) ON DELETE CASCADE` |
| DB-03 | 02-01 | groups table with member_ids uuid[] | SATISFIED | Lines 44-58 |
| DB-04 | 02-01 | group_gallery_images table with FK to groups | SATISFIED | Lines 63-69, `REFERENCES groups(id) ON DELETE CASCADE` |
| DB-05 | 02-01 | submissions table | SATISFIED | Lines 74-80 |
| DB-06 | 02-01 | site_config table | SATISFIED | Lines 85-89 |
| DB-07 | 02-01 | RLS: public SELECT, admin-only writes | SATISFIED | `20260309000002_enable_rls.sql` - all content tables have public_select + admin_insert/update/delete |
| DB-08 | 02-01 | submissions: anon INSERT, admin full access | SATISFIED | `submissions_anon_insert` + `submissions_authenticated_insert` + admin select/update/delete |
| DB-09 | 02-01 | site_config: public SELECT, admin UPDATE | SATISFIED | `site_config_public_select` + admin insert/update/delete |
| DB-10 | 02-01 | 4 storage buckets (3 public, 1 private) | SATISFIED | `20260309000003_storage_buckets.sql` lines 7-12 |
| DB-11 | 02-01 | Storage RLS policies on storage.objects | SATISFIED | 7 policies in storage migration |
| DB-12 | 02-02 | Admin user in Supabase Auth | SATISFIED | Summary confirms admin@kpeachgirl.com created; .env.local exists |
| DB-13 | 02-01 | Custom Access Token Hook with is_admin | SATISFIED | `20260309000004_custom_access_token_hook.sql` + GRANT/REVOKE |
| DB-14 | 02-02 | lib/supabase client files using @supabase/ssr | SATISFIED | 3 client files + root middleware verified |
| DB-15 | 02-03 | 12 seed model profiles | SATISFIED | All 12 slugs present in seed.sql with attributes, gallery images |
| DB-16 | 02-03 | Default site_config rows seeded | SATISFIED | 6 site_config INSERTs (areas, categories, card_settings, pill_groups, hero, form_config) |

No orphaned requirements found. All 16 DB requirements are claimed by plans and verified.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | - | - | - | - |

No TODO/FIXME/placeholder comments, no empty implementations, no stub patterns detected across any phase 2 artifacts.

### Commit Verification

All 6 claimed commits verified in git log:
- `a4b3155` feat(02-01): create 6 tables and RLS policies
- `2a184e0` feat(02-01): add storage buckets, auth hook, and verification script
- `81738ff` feat(02-02): install Supabase packages and create SSR client files
- `86a2c23` chore(02-02): add REVOKE migration for auth hook security
- `9ba85dd` feat(02-03): create seed.sql with 12 model profiles
- `375af30` chore(02-03): add seed data migration file

### Human Verification Required

### 1. Live Database Schema Validation

**Test:** Run `supabase/verify.sql` in Supabase SQL Editor
**Expected:** All 6 tables with correct columns, 25+ RLS policies, 4 storage buckets, 7 storage.objects policies, custom_access_token_hook function, 3 updated_at triggers
**Why human:** SQL migration files exist locally but live database state requires Dashboard access

### 2. Admin JWT Claim Injection

**Test:** Log in as admin@kpeachgirl.com and inspect JWT access token (e.g., via Supabase client `getSession()`)
**Expected:** JWT contains `is_admin: true` claim injected by Custom Access Token Hook
**Why human:** Hook execution is a live Supabase Auth service behavior

### 3. Seed Data Present in Live Database

**Test:** Run `SELECT count(*) FROM profiles;` and `SELECT id FROM site_config;` in SQL Editor
**Expected:** 12 profiles returned; 6 site_config rows (areas, categories, card_settings, pill_groups, hero, form_config)
**Why human:** Seed was applied to live Supabase project; cannot verify from local files alone

### 4. RLS Enforcement

**Test:** Attempt `INSERT INTO profiles (name) VALUES ('test');` as an unauthenticated/anon client
**Expected:** RLS policy violation error (blocked by admin-only INSERT policy)
**Why human:** RLS enforcement requires live database query context

### Gaps Summary

No gaps found. All SQL migration files, Supabase client files, seed data, and environment configuration are present, substantive, and correctly wired. Every one of the 16 DB requirements (DB-01 through DB-16) is satisfied by concrete artifacts in the codebase.

The only verification that cannot be performed programmatically is confirming the live Supabase database state (migrations applied, seed data present, Custom Access Token Hook enabled in Dashboard). These are flagged for human verification above.

---

_Verified: 2026-03-09T23:59:00Z_
_Verifier: Claude (gsd-verifier)_
