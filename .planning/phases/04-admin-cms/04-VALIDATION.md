---
phase: 4
slug: admin-cms
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Build verification (no test framework per project decision) |
| **Config file** | next.config.mjs |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` + manual admin workflow test |
| **Estimated runtime** | ~30 seconds (build) |

---

## Sampling Rate

- **After every task commit:** `npm run build`
- **After every plan wave:** `npm run build` + verify admin routes exist
- **Before `/gsd:verify-work`:** Full build + manual admin workflow
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 04-01 | 01 | 1 | ADM-01, ADM-02 | build | `npm run build` | ⬜ pending |
| 04-02 | 02 | 1 | ADM-03 | build | `npm run build` | ⬜ pending |
| 04-03 | 03 | 2 | ADM-04, ADM-05 | build | `npm run build` | ⬜ pending |
| 04-04 | 04 | 2 | ADM-06, ADM-07 | build | `npm run build` | ⬜ pending |
| 04-05 | 05 | 3 | ADM-08, ADM-09 | build | `npm run build` | ⬜ pending |
| 04-06 | 06 | 3 | ADM-10, ADM-11, ADM-12, ADM-13 | build | `npm run build` | ⬜ pending |
| 04-07 | 07 | 4 | ADM-14-ADM-20 | build | `npm run build` | ⬜ pending |
| 04-08 | 08 | 4 | API-01, API-02 | build | `npm run build` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- E2E tests explicitly out of scope per project decision
- Build verification is primary automated check
- No test framework needed

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Login redirect | ADM-01 | Browser auth flow | Navigate to /admin unauthenticated, verify redirect |
| Admin creates model | ADM-04,05 | Full CRUD workflow | Create model with all fields, verify on public site |
| Photo crop | ADM-06 | Visual fidelity | Upload image, set focal point + zoom, verify crop |
| Submission workflow | ADM-10-13 | Multi-step status flow | Create submission, advance status, convert to profile |
| Contact form email | API-01 | External service | Submit contact form, verify email received |
| ISR revalidation | API-02 | Cache invalidation | Edit model, verify public page updates |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
