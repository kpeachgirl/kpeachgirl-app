---
phase: 3
slug: public-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Build verification (no test framework per project decision) |
| **Config file** | next.config.mjs |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run start` + manual smoke |
| **Estimated runtime** | ~30 seconds (build) |

---

## Sampling Rate

- **After every task commit:** `npm run build` (catches TS errors and build failures)
- **After every plan wave:** `npm run build && npm run start` (verify pages render)
- **Before `/gsd:verify-work`:** Full build + manual smoke test of all routes
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | PUB-01 | build | `npm run build` | ✅ | ⬜ pending |
| 03-02-01 | 02 | 2 | PUB-02,03,04,05,06,07,08 | smoke | `curl localhost:3000` | N/A | ⬜ pending |
| 03-03-01 | 03 | 3 | PUB-09,10,11,18 | smoke | `curl localhost:3000/model/aria-novak` | N/A | ⬜ pending |
| 03-04-01 | 04 | 3 | PUB-12,13,18 | smoke | `curl localhost:3000/group/[slug]` | N/A | ⬜ pending |
| 03-05-01 | 05 | 4 | PUB-14,15,16,17 | smoke | `curl localhost:3000/membership` | N/A | ⬜ pending |
| 03-06-01 | 06 | 4 | PUB-19 | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- REQUIREMENTS.md explicitly marks "E2E automated tests" as Out of Scope
- Testing is manual UAT for v1
- Build verification (`next build`) is the primary automated check
- No test framework installation needed per project decision

*Existing infrastructure covers all phase requirements via build + manual smoke.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Age gate blocks content | PUB-01 | Requires browser interaction | Open site in incognito, verify overlay appears |
| Search filters models | PUB-03 | Client-side JS interaction | Type in search box, verify grid filters |
| Area filter chips | PUB-04 | Client-side JS interaction | Click area chip, verify filtering |
| Verified toggle | PUB-05 | Client-side JS interaction | Toggle verified-only, verify grid updates |
| Gallery lightbox | PUB-10 | Client-side JS interaction | Click gallery image, verify lightbox opens |
| File upload | PUB-16 | Requires file system access | Upload test file in membership form |
| Form submission | PUB-17 | Full form workflow | Fill form, submit, verify success message |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
