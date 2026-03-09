---
phase: 2
slug: supabase-setup
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification via Supabase Dashboard + SQL queries + TypeScript build |
| **Config file** | none — database operations verified via SQL |
| **Quick run command** | `npm run build` (TypeScript compilation check) |
| **Full suite command** | Run `supabase/verify.sql` in Dashboard SQL Editor + `npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` for TypeScript files
- **After every plan wave:** Run full verification SQL in Dashboard + `npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | DB-01 | smoke | `SELECT column_name FROM information_schema.columns WHERE table_name='profiles';` | N/A (SQL) | ⬜ pending |
| 02-01-02 | 01 | 1 | DB-02 | smoke | `SELECT * FROM information_schema.table_constraints WHERE table_name='gallery_images';` | N/A | ⬜ pending |
| 02-01-03 | 01 | 1 | DB-03 | smoke | `SELECT column_name FROM information_schema.columns WHERE table_name='groups';` | N/A | ⬜ pending |
| 02-01-04 | 01 | 1 | DB-04 | smoke | `SELECT * FROM information_schema.table_constraints WHERE table_name='group_gallery_images';` | N/A | ⬜ pending |
| 02-01-05 | 01 | 1 | DB-05 | smoke | `SELECT column_name FROM information_schema.columns WHERE table_name='submissions';` | N/A | ⬜ pending |
| 02-01-06 | 01 | 1 | DB-06 | smoke | `SELECT * FROM site_config;` | N/A | ⬜ pending |
| 02-01-07 | 01 | 1 | DB-07 | integration | Attempt anon INSERT via client — expect 403 | Wave 0 | ⬜ pending |
| 02-01-08 | 01 | 1 | DB-08 | integration | Attempt anon INSERT to submissions — expect success | Wave 0 | ⬜ pending |
| 02-01-09 | 01 | 1 | DB-09 | smoke | `SELECT * FROM site_config;` via anon client | Wave 0 | ⬜ pending |
| 02-01-10 | 01 | 1 | DB-10 | smoke | `SELECT id, public FROM storage.buckets;` | N/A | ⬜ pending |
| 02-01-11 | 01 | 1 | DB-11 | integration | Attempt anon upload to submissions — check behavior | Wave 0 | ⬜ pending |
| 02-02-01 | 02 | 1 | DB-12 | manual | Check Dashboard > Auth > Users | Manual | ⬜ pending |
| 02-02-02 | 02 | 1 | DB-13 | integration | Login as admin, decode JWT, verify is_admin claim | Wave 0 | ⬜ pending |
| 02-03-01 | 03 | 2 | DB-14 | unit | `npm run build` (TypeScript compilation) | ✅ | ⬜ pending |
| 02-04-01 | 04 | 2 | DB-15 | smoke | `SELECT count(*) FROM profiles;` — expect 12 | N/A | ⬜ pending |
| 02-04-02 | 04 | 2 | DB-16 | smoke | `SELECT id FROM site_config;` — expect 6 rows | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `supabase/verify.sql` — verification script combining all smoke test queries
- [ ] `.env.local` — Supabase credentials (created by implementer from Dashboard)
- [ ] Admin user must be created in Dashboard before running hook migration

*Note: Most verification is SQL-based (run in Dashboard), not file-based tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin user exists in Auth | DB-12 | Requires Dashboard UI | Check Dashboard > Auth > Users for admin@kpeachgirl.com |
| Custom Access Token Hook enabled | DB-13 | Dashboard-only setting | Dashboard > Authentication > Hooks > verify hook is active |
| Storage bucket public URLs resolve | DB-10 | Requires browser check | Open a public image URL in browser, verify it loads |
| Submissions bucket returns 403 | DB-10 | Requires anon HTTP request | Attempt unauthenticated GET to submissions bucket URL |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
