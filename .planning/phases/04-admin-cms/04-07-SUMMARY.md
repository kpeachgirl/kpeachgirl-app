---
phase: 04-admin-cms
plan: 07
subsystem: admin-submissions
tags: [admin, submissions, status-workflow, convert-to-profile]
dependency_graph:
  requires: [04-03, 04-04]
  provides: [submissions-tab, submission-status-workflow, convert-action]
  affects: [profiles, homepage-revalidation]
tech_stack:
  added: []
  patterns: [status-workflow, convert-to-profile, share-link-copy]
key_files:
  created:
    - components/admin/SubmissionsTab.tsx
  modified:
    - components/admin/AdminDashboard.tsx
decisions:
  - "Status badge uses color-mix() for tinted backgrounds matching status color"
  - "Convert action maps form_data fields to profile columns with sensible defaults"
  - "SubmissionsTab fires onConverted callback so dashboard refreshes models list and submission count"
metrics:
  duration: 4min
  completed: "2026-03-10T00:08:00Z"
---

# Phase 04 Plan 07: Submissions Tab Summary

Submissions tab with full status lifecycle (new/reviewed/approved/dismissed/converted), share membership link with copy-to-clipboard, and convert-to-profile action that creates live model profiles from approved submissions.

## What Was Built

### Task 1: SubmissionsTab with status workflow and convert action
- **Commit:** 3ec38d8
- **Files:** components/admin/SubmissionsTab.tsx (308 lines)
- Submission list fetched from Supabase ordered by created_at desc
- Header with title, description, and new-count badge (rose-soft bg)
- Share Link Box: displays membership URL with monospace styling, copy button with 2-second "Copied!" feedback
- Empty state with suggestion to share membership form link
- Submission cards: avatar (colored by status), name, email, phone, submitted date, status badge
- Details section: 4-column grid (Age, Height, Area, Experience), shoot type pills, bio, social link, ID photo thumbnail
- Status transitions: new -> reviewed/approved/dismissed, reviewed -> approved/dismissed, approved -> convert
- Convert action: maps form_data to profile columns (name, slug, region, parent_region, bio, experience, types, attributes), inserts into profiles, marks submission converted, triggers homepage revalidation

### Task 2: Wire SubmissionsTab into AdminDashboard
- **Files:** components/admin/AdminDashboard.tsx
- Already wired from prior plan execution (d7c12c0)
- Added formConfig state fetched from site_config for file upload field detection
- Added refreshSubmissionCount callback to update nav badge on status changes
- Added handleSubmissionConverted callback that refreshes models list + submission count
- Placeholder for submissions tab replaced with live SubmissionsTab component

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] AdminDashboard already had SubmissionsTab import**
- **Found during:** Task 2
- **Issue:** A prior plan (04-06 GroupsTab) had already added the SubmissionsTab import and basic wiring to AdminDashboard.tsx
- **Fix:** Wrote the complete updated file with formConfig state, refreshSubmissionCount, and onConverted handler additions
- **Files modified:** components/admin/AdminDashboard.tsx

## Verification

- `npm run build` completes without errors
- SubmissionsTab component created with 308 lines (exceeds 120-line minimum)
- Status workflow buttons for all state transitions implemented
- Convert action creates profile via supabase.from('profiles').insert
- Share link box with copy-to-clipboard functionality

## Self-Check: PASSED

- SubmissionsTab.tsx: FOUND (508 lines)
- Commit 3ec38d8: FOUND
- AdminDashboard.tsx has SubmissionsTab wired: CONFIRMED
