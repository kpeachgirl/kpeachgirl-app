---
phase: 04-admin-cms
plan: 05
subsystem: admin-image-management
tags: [photo-upload, crop, gallery, isr, storage]
dependency_graph:
  requires: [04-03, 04-04]
  provides: [model-photo-management, isr-revalidation-on-mutation]
  affects: [model-editor, models-tab, public-pages]
tech_stack:
  added: []
  patterns: [click-to-upload, PhotoEditor-modal, CSS-transform-crop, fire-and-forget-revalidation]
key_files:
  created: []
  modified:
    - components/admin/ModelEditor.tsx
    - components/admin/ModelsTab.tsx
decisions:
  - "Gallery images require model save first (needs profile_id for FK)"
  - "ISR revalidation fires on save, delete, and toggle — includes group pages containing the model"
  - "Delete handler cleans up gallery rows, profile/cover/gallery storage files before deleting profile"
metrics:
  duration: 3min
  completed: "2026-03-10T00:07:00Z"
---

# Phase 04 Plan 05: Model Editor Photo Uploads + ISR Summary

Photo upload and crop integration for ModelEditor with ISR revalidation on all model mutations.

## What Was Done

### Task 1: Wire photo uploads into ModelEditor photos section
- **Commit:** 7f560c7
- Replaced PHOTOS placeholder with full upload UI for profile photo (2/3 aspect), cover photo (7/3 aspect), and gallery grid (3/4 aspect)
- Profile/cover: click-to-upload when empty, Edit/Upload/Remove overlay when image exists
- Gallery: 3-column grid with add button, per-image delete and crop edit
- PhotoEditor modal opens for all image types with correct aspect ratios
- Crop data applied via CSS objectPosition + transform scale + transformOrigin
- Gallery images loaded from gallery_images table on editor open
- New models show "Save first" message for gallery (needs profile_id FK)
- File input value reset after each upload (research pitfall #5)
- Save handler includes profile_image, profile_image_crop, cover_image, cover_image_crop in upsert
- Delete handler cleans up all gallery images (DB + storage), profile/cover storage files
- ISR revalidation on save (homepage + model page + group pages containing model) and delete

### Task 2: Wire ISR revalidation into ModelsTab toggle handlers
- **Commit:** f0a9675
- Verified and vacation toggle handlers now call triggerRevalidation for homepage and model profile page

## Deviations from Plan

None - plan executed exactly as written. Tasks 1 and 2 were partially merged since the ModelEditor rewrite naturally included the save/delete revalidation from Task 2.

## Verification

- `npm run build` completes without errors
- Image upload uses UUID-based paths via uploadImage helper
- PhotoEditor opens from profile, cover, and gallery edit buttons
- ISR revalidation fires on save, delete, and toggle operations
