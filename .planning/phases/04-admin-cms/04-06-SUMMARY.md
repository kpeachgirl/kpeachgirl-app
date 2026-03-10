---
phase: 04-admin-cms
plan: "06"
subsystem: admin-groups
tags: [admin, groups, crud, gallery, inline-editor]
dependency_graph:
  requires: ["04-03", "04-04"]
  provides: ["groups-tab", "group-editor", "group-crud"]
  affects: ["admin-dashboard"]
tech_stack:
  added: []
  patterns: ["inline-expand-editor", "member-selection-dropdown", "gallery-crud"]
key_files:
  created:
    - components/admin/GroupsTab.tsx
    - components/admin/GroupEditor.tsx
  modified:
    - components/admin/AdminDashboard.tsx
decisions:
  - "GroupEditor uses inline expand/collapse pattern (not slide-out) matching prototype"
  - "Gallery upload disabled for new unsaved groups (need group ID first)"
  - "Badge auto-calculation: 2=DUO, 3=TRIO, else GROUP unless badge_label override"
metrics:
  duration: "3 min"
  completed: "2026-03-09"
---

# Phase 04 Plan 06: Groups Tab Summary

Groups tab with full CRUD: inline expand/collapse editor with member selection, gallery management, tag toggles, and badge auto-calculation.

## Completed Tasks

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | GroupsTab list and GroupEditor inline component | d7c12c0 | GroupsTab.tsx, GroupEditor.tsx, AdminDashboard.tsx |

## What Was Built

**GroupsTab (components/admin/GroupsTab.tsx):**
- Fetches and displays all groups ordered by sort_order/name
- Each row shows group image (48x48), name, badge (DUO/TRIO/GROUP or custom), member count
- Edit button expands inline GroupEditor; "+ New Group" button opens blank editor
- Empty state with "No groups yet" message

**GroupEditor (components/admin/GroupEditor.tsx):**
- Name + Badge Label (2-column grid) with auto-badge hint
- Group photo upload (200px square, click-to-upload) via uploadImage to gallery-images bucket
- Bio textarea
- Pill toggles for shoot types and compensation from pillGroups config
- Category fields from categories config stored in attributes jsonb
- Member selection: chips with remove, dropdown to add from profiles not already in group
- Gallery grid (4 columns, 3/4 aspect): upload adds to group_gallery_images, delete removes from DB + storage
- Save generates slug, upserts to groups table, revalidates homepage + group page + member profiles
- Delete with confirmation, cascade removes gallery images

**AdminDashboard wiring:**
- Added allProfiles state fetched on mount for member selection
- GroupsTab rendered when groups tab active with profiles, pillGroups, categories props

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- Build compiles successfully with no type errors
- GroupsTab renders group list with badge auto-calculation
- GroupEditor expands inline for create/edit with all field sections
- Member selection dropdown populated from profiles
- Gallery upload/delete wired to group_gallery_images table
- ISR revalidation fires on save/delete

## Self-Check: PASSED
