---
phase: 04-admin-cms
plan: 08
subsystem: admin-profile-fields
tags: [admin, site-config, hero, cards, tags, form-editor, categories]
dependency_graph:
  requires: [04-04, 04-05]
  provides: [profile-fields-tab, site-config-editors]
  affects: [homepage, model-cards, membership-form, profile-pages]
tech_stack:
  added: []
  patterns: [real-time-config-editing, site-config-persistence, isr-revalidation-on-save]
key_files:
  created:
    - components/admin/ProfileFieldsTab.tsx
  modified:
    - components/admin/AdminDashboard.tsx
decisions:
  - All 5 editor sections built in single component with vertical panel stack layout
  - Real-time save pattern (onChange triggers onConfigUpdate immediately, no save button)
  - Hero PhotoEditor opens in fixed modal overlay for crop editing
metrics:
  duration: 3 min
  completed: "2026-03-10T00:13:06Z"
---

# Phase 04 Plan 08: Profile Fields Tab Summary

Full site configuration editor with 5 panels: hero banner (image upload/crop + text), card display (subtitle fields, badges, overlay), tag groups (pill group CRUD with options), membership form (dynamic field editor), and category sections (profile field groups).

## What Was Built

### ProfileFieldsTab Component (326 lines)
Five vertically stacked editor panels, all persisting to site_config table via onConfigUpdate:

1. **Hero Banner Settings** - Image upload via uploadImage to profile-images/hero bucket, PhotoEditor crop (21/9 aspect), preview with brightness overlay showing title text, 2-column subtitle/search + 3-column title fields
2. **Card Display** - Toggle buttons for subtitle fields (region/types/exp/age), verified/away badge switches with label inputs, color picker + opacity slider for overlay
3. **Tag Groups** - Add/remove pill groups, inline title editing, color picker, dataKey display, editable option chips with add/delete
4. **Membership Form** - Form text settings (title, subtitle, success messages), field rows with id/label/type dropdown/width dropdown/required toggle/placeholder, file_upload helper text, add/remove fields
5. **Category Sections** - Editable section titles, 2-column field grid with key (read-only) + label (editable), add/remove fields and sections

### AdminDashboard Wiring
- Added heroConfig and cardSettings state with defaults
- Extended site_config fetch to include hero and card_settings rows
- handleConfigUpdate: persists to site_config table, updates local state, triggers ISR revalidation
- Replaced placeholder categories tab with ProfileFieldsTab component

## Deviations from Plan

None - plan executed exactly as written. Tasks 1 and 2 were combined into a single commit since the component was built as a cohesive unit.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1+2 | db0ee03 | ProfileFieldsTab with all 5 editors + AdminDashboard wiring |

## Verification

- TypeScript: passes (npx tsc --noEmit clean)
- Build: passes (npm run build succeeds)
- All 5 editor sections render in ProfileFieldsTab
- Config changes persist via onConfigUpdate -> site_config update + ISR revalidation
