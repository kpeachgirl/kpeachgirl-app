# Feature Landscape

**Domain:** Editorial model / talent directory (admin-curated, read-free browsing)
**Researched:** 2026-03-09
**Prototype reference:** `ModelDirectory.jsx` (1,828 lines) — source of truth for all feature decisions

---

## Table Stakes

Features visitors expect. Absence signals an incomplete or untrustworthy product.

| Feature | Why Expected | Complexity | Prototype Status |
|---------|--------------|------------|-----------------|
| Browsable model grid | Primary job-to-be-done for photographers/casting directors | Low | DONE — 4-col responsive grid with card overlay |
| Model profile page | Industry standard: comp card equivalent in digital form | Low | DONE — cover, bio, stats, gallery, pills |
| Physical measurements on profile | Casting directors require age/height/weight/bust/waist/hips before contacting | Low | DONE — Vitals, Look, Work categories |
| Photo gallery with lightbox | Models require portfolio presentation; lightbox is expected UX pattern | Medium | DONE — masonry grid + fullscreen lightbox with prev/next |
| Search by name | Most basic discovery need | Low | DONE — header search field |
| Filter by area/region | LA/OC market is geographically segmented; photographers often need local talent | Low | DONE — area filter pills |
| Shoot type tags on profiles | Photographers filter by specialty (fashion, fitness, commercial, etc.) | Low | DONE — pill taxonomy on profiles and cards |
| Compensation type indicator | TFP vs paid is a deal-breaker detail; must be visible before contact | Low | DONE — pill on card and profile |
| Mobile-responsive layout | Industry browse happens on mobile (onset, casting calls) | Medium | DONE — 2-col mobile grid, scrollable filters |
| Contact mechanism | Photographer must be able to reach the model or admin | Low | DONE — "Contact [name]" CTA on profile, contact form API |
| Verified badge | Trust signal; implies admin has vetted model identity | Low | DONE — verified badge on cards and profiles |
| Availability indicator | "Away/vacation" prevents wasted outreach | Low | DONE — vacation badge + unavailability notice on profile |
| Fast page loads | Directory browsing is repetitive; slow loads cause abandonment | Medium | DONE — ISR 60s for profiles, SSG homepage |

## Differentiators

Features that are not expected by default but create competitive advantage for kpeachgirl specifically.

| Feature | Value Proposition | Complexity | Prototype Status |
|---------|-------------------|------------|-----------------|
| Group / ensemble profiles (Duo/Trio/Group) | Rare in directories; solves a real need for paired or group shoots; cross-links individual profiles bidirectionally | Medium | DONE — full group profile pages with member grid, badges, own gallery |
| "Also available as" cross-link | Individual model profile surfaces group affiliations; reduces discovery friction for casting that wants ensemble options | Low | DONE — group cards at bottom of model profile |
| Admin-curated quality (not self-serve) | Every profile is admin-crafted and verified — no spam, incomplete, or fake profiles. Photographers trust the directory implicitly | N/A (operational) | By design — single admin model |
| Focal point + zoom crop editor | Admin controls exactly how every photo is framed across cards, covers, and galleries — consistent visual quality that self-serve directories cannot match | Medium | DONE — PhotoEditor component |
| Fully dynamic admin CMS | Admin can update every aspect of the site without deploys: hero banner, card subtitle fields, tag taxonomies, membership form fields, area list | High | DONE — Profile Fields tab, Hero editor, Form editor, Areas tab |
| CMS-driven membership form | Form fields are configurable from admin — admin can add/remove/reorder fields without code changes | Medium | DONE — form_config in site_config, full FormBuilder in admin |
| Submission workflow with status tracking | Admin can move model applications through new → reviewed → approved → dismissed → converted pipeline; prevents application loss | Medium | DONE — Submissions tab with status workflow |
| Convert submission to profile | Admin can promote an approved submission directly into a published model profile | Medium | DONE — convert action in Submissions tab |
| ID verification in membership form | Admin captures selfie-with-ID upload in application — confirms age and identity before publishing. Rare in open directories. | Medium | DONE — file_upload field type in membership form |
| Bilingual EN/Korean toggle | LA/OC Korean-American modeling community; Korean language support signals cultural alignment and extends audience | High | DONE — 70+ translation keys, instant toggle in admin |
| Dark luxury editorial aesthetic | Aesthetic match to high-fashion editorial genre builds instant credibility with target users (fashion photographers, casting directors) | N/A (design) | DONE — design token system |
| On-demand ISR revalidation | Profile updates go live within seconds of save, not on the next scheduled rebuild | Low | DONE — /api/revalidate route |
| Configurable card display fields | Admin picks which model fields appear as card subtitle — adapts to evolving content strategy without code changes | Low | DONE — card_settings.subtitleFields |
| Sort order management | Admin manually orders models in the grid — enables editorial curation of who appears first | Low | DONE — sort_order column on profiles and groups |

## Anti-Features

Features to deliberately NOT build in v1. Including these would increase scope, complexity, or operational burden without proportionate value at this stage.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Self-serve model account creation | kpeachgirl's quality guarantee depends on admin curation. Self-serve profiles would erode trust and quality | Membership form submits to admin; admin creates profiles manually |
| Photographer accounts / logins | Adds auth complexity, messaging overhead, and abuse vectors for a site where browsing is anonymous by design | Keep browsing public and unauthenticated |
| In-platform messaging | Model agencies with messaging (Model Mayhem, PurplePort) have moderation and abuse problems. Admin intermediates contact. | Contact button → Resend email to admin; admin facilitates connection |
| Booking / calendar system | Full booking software (Mainboard, Syngency, Mediaslide) is a different product category with significantly more complexity | Out of scope; operational coordination is off-platform |
| Multiple admin accounts / role-based access | Single admin owns the business; team accounts add auth complexity with no current business need | Single admin@kpeachgirl.com with JWT claim |
| OAuth / social login | No user-facing accounts exist, so social login provides no value | Supabase email/password for admin only |
| Search engine beyond name/area | Faceted search, measurement ranges, etc. add UI complexity. The directory is small enough (target: ~50–100 models) that browsing + simple filters suffice | Area and shoot-type filter pills cover the meaningful search dimensions |
| Real-time presence / live chat | ISR + on-demand revalidation is sufficient freshness for a curated editorial directory | On-demand ISR revalidation |
| Public model ratings / reviews | Review systems introduce moderation burden, fake reviews, and brand risk for a curated premium directory | Verified badge signals admin quality assurance |
| Mobile app (iOS/Android) | Responsive web covers mobile use cases; native app provides no meaningful advantage for a browsing-only experience | Responsive Next.js site |
| E-commerce / payments | Models pay admin off-platform; keeping payments off-platform avoids PCI scope and payment processor complexity in v1 | Membership form is a lead capture form; billing is handled separately |
| Automated email to model on submission | Admin manually reviews submissions; automated acknowledgement email is a nice-to-have | Success message on form confirms receipt |
| Video support in galleries | Adds storage costs, transcoding complexity, and page weight for a photography-focused directory | Static image galleries only |
| Public group applications | Groups are admin-created from existing profiles; no need for group-specific application flow | Admin creates groups via Groups tab |

---

## Feature Dependencies

```
Membership form → Submissions tab (form creates submission records)
Submissions tab → Model profile (convert workflow creates profile)
Model profile → Group profile (groups reference model IDs)
Group profile → "Also available as" section (back-reference from model to groups)
site_config → Everything (areas, pill groups, hero, form config, card settings are CMS-driven)
PhotoEditor → profile-images, cover-images, gallery-images (crop data persists with image URLs)
Admin auth → Admin CMS (JWT claim required for all write operations)
Supabase Storage → Image uploads (all media through Storage buckets)
On-demand ISR → Profile and group pages (revalidate after any admin save)
```

---

## MVP Feature Completeness Assessment

The prototype covers all table-stakes features and all planned differentiators. The following gaps are worth noting:

### Gaps Not in Prototype (Implementation Considerations)

| Gap | Severity | Notes |
|-----|----------|-------|
| SEO metadata (og:image, title, description per profile) | Medium | Prototype has no `<head>` — Next.js App Router layout must add per-page metadata for photographer Google searches to surface model pages |
| Sitemap / robots.txt | Low | Needed for profile pages to be indexed; not in prototype |
| Error states for image upload failures | Low | Prototype uses base64 data URLs; production upload to Supabase Storage needs explicit error handling UI |
| Loading skeleton states for public grid | Low | Prototype uses client-state pagination simulation; ISR means grid is static but image loading still needs handled |
| 404 pages for deleted profiles | Low | ISR + slug routing needs a notFound() fallback when a model is removed |
| Contact form success/error UI | Low | API route to Resend is listed in requirements but contact form UX states are not fully detailed in prototype |
| Revalidation error handling | Low | /api/revalidate route needs to fail gracefully if Supabase or ISR revalidation errors |

### Features in Prototype with No Direct Gap

All key features from the downstream consumer's checklist are confirmed present:

- Model browsing/filtering — confirmed (search, area pills, verified/away filter)
- Model profiles — confirmed (full bio, measurements, gallery, group links)
- Group profiles — confirmed (members list, combined gallery, type/compensation pills, shared stats)
- Admin CMS — confirmed (Models tab, Groups tab, Submissions tab, Profile Fields tab, Areas tab)
- Membership form — confirmed (dynamic fields from site_config, file upload for ID)
- Image management — confirmed (focal point + zoom crop editor, multiple image types per profile)
- Bilingual support — confirmed (70+ translation keys, EN/Korean instant toggle)
- Age gate — confirmed (modal gate on homepage, must acknowledge before browsing)

---

## Sources

- [Model Mayhem profile features review (fixthephoto.com)](https://fixthephoto.com/model-mayhem.html)
- [Model measurements industry standards (backstage.com)](https://www.backstage.com/magazine/article/model-measurements-75473/)
- [Mainboard — model agency management software](https://www.mainboard.com)
- [Mediaslide — model agency booking system features](https://www.mediaslide.com/booking-system-model-agency/)
- [PurplePort — freelance model directory features](https://purpleport.com/)
- [Models.com — industry directory reference](https://models.com/)
- [Model comp card standards (photosbyanette.com)](https://www.photosbyanette.com/blog/what-is-a-model-comp-card)
- [Age verification best practices 2025 (shuftipro.com)](https://shuftipro.com/blog/age-verification-evasion-in-2025-how-minors-outsmart-weak-age-gates-and-how-to-fight-back/)
