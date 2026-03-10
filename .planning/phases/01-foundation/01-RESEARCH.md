# Phase 1: Foundation - Research

**Researched:** 2026-03-09
**Domain:** Next.js 14 bootstrapping, Tailwind v3 design tokens, next/font, globals.css, TypeScript types, i18n
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | Next.js 14.2.x project created with TypeScript strict mode and App Router | create-next-app command documented; exact flags and directory layout provided |
| FOUND-02 | Tailwind CSS v3 configured with all design tokens (dark luxury theme) | Complete token values extracted from prototype line 248; tailwind.config.ts pattern documented |
| FOUND-03 | Cormorant Garamond (serif) and Manrope (sans) loaded via next/font/google | next/font/google API documented; exact weight sets extracted from prototype CSS @import |
| FOUND-04 | globals.css includes CSS variables, grain texture, animations, and responsive breakpoints | All CSS extracted verbatim from prototype lines 246-346; translation to CSS custom properties documented |
| FOUND-05 | lib/types.ts defines TypeScript interfaces for Profile, Group, Submission, SiteConfig, GalleryImage | All field shapes extracted from CLAUDE.md Supabase schema; sub-types (CropSettings, etc.) identified |
| FOUND-06 | lib/constants.ts exports default site_config values | All default objects extracted verbatim from prototype lines 10-73 |
| FOUND-07 | lib/i18n.ts exports 70+ translation keys in English and Korean with useTranslation hook | All 90+ keys extracted verbatim from prototype lines 819-937; hook pattern documented |
</phase_requirements>

---

## Summary

Phase 1 is a pure bootstrapping phase — no external services, no environment variables needed, no network calls. The deliverable is a runnable Next.js 14 app with a complete static foundation that every subsequent phase builds on. Research confidence is HIGH because the prototype (ModelDirectory.jsx) contains the exact CSS, exact default values, and exact translation keys to copy; nothing needs to be invented.

The critical translation work in this phase is converting the prototype's inline React styles and a single injected `<style>` block into proper Next.js conventions: CSS custom properties in globals.css, Tailwind config with `theme.extend` referencing those variables, and `next/font/google` replacing the Google Fonts `@import` URL. The TypeScript interfaces must match the Supabase schema column-for-column (defined in CLAUDE.md), because these types will be imported by every page and component in all later phases.

One version constraint governs all decisions: Next.js 14.2.x (not 15) and Tailwind CSS v3 (not v4). Both are locked for compatibility reasons documented in project STATE.md.

**Primary recommendation:** Run `create-next-app` with the exact flags below, then copy-translate the prototype CSS and data constants into the proper file locations. No library research needed — everything is determined.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 14.2.x (pin to 14.2.35) | App framework, App Router, ISR, API routes | Locked — Next 15 breaks ISR semantics and requires React 19 |
| react / react-dom | 18.x (bundled with next) | UI rendering | Bundled, no separate install needed |
| typescript | ^5.x (bundled with next) | Type safety, strict mode | Project requirement; TypeScript strict enabled |
| tailwindcss | ^3.4.x | Utility CSS with token system | Locked — v4 CSS-first @theme incompatible with prototype's theme.extend approach |
| postcss | ^8.x | Tailwind pipeline | Required peer dep for Tailwind v3 |
| autoprefixer | ^10.x | Browser compat | Standard Tailwind companion |
| clsx | ^2.x | Conditional class assembly | Lightweight, composable |
| tailwind-merge | ^2.x | Merge Tailwind classes without conflicts | Prevents conflicting utility collision in cn() |

### Supporting (Phase 1 only — install now to unblock later phases)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sharp | ^0.33.x | next/image optimization backend | Required by next/image in production; install in Phase 1 to avoid build-time surprise |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| tailwind v3 | tailwind v4 | v4 uses CSS-first `@theme` — incompatible with the token system in this prototype; stay on v3 |
| next/font/google | Google Fonts @import URL | @import causes CLS (cumulative layout shift); next/font is zero-CLS and self-hosts automatically |
| clsx + tailwind-merge | classnames alone | tailwind-merge deduplicates conflicting Tailwind utilities (e.g., `p-4 p-6`); classnames does not |

**Installation:**
```bash
npx create-next-app@14.2.35 kpeachgirl-app \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --no-eslint

cd kpeachgirl-app
npm install clsx tailwind-merge sharp
```

> Note: `--no-src-dir` puts the app directory at `app/` (not `src/app/`), matching the project's routing convention. `--app` enables App Router.

---

## Architecture Patterns

### Recommended Project Structure

```
kpeachgirl-app/
├── app/
│   └── layout.tsx          # root layout (fonts, grain wrapper, globals.css import)
├── lib/
│   ├── types.ts            # TypeScript interfaces (Profile, Group, etc.)
│   ├── constants.ts        # default site_config values
│   ├── i18n.ts             # translations + useTranslation hook
│   └── utils.ts            # cn() helper
├── public/                 # static assets
├── tailwind.config.ts      # design tokens via theme.extend
├── globals.css             # CSS variables, grain, animations, breakpoints
└── next.config.ts          # remotePatterns placeholder for Supabase Storage
```

> `lib/supabase/` is NOT created in Phase 1 — that belongs in Phase 2. Creating it now without environment variables would cause build errors.

### Pattern 1: Tailwind Design Tokens via CSS Variables

**What:** CSS custom properties defined in `:root` in globals.css, then referenced in `tailwind.config.ts` via `theme.extend`. Components use Tailwind utility classes that resolve to the CSS variables at runtime.

**When to use:** Any time a color or value must be both a CSS variable (for inline styles in dynamic props) and a Tailwind utility class.

**Why:** The admin CMS uses inline styles like `background: 'var(--rose)'` (dynamic values from CMS config). The prototype does this extensively. Defining tokens as CSS variables lets both `className="text-rose"` and `style={{ color: 'var(--rose)' }}` reference the same value.

**Example:**
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream:    'var(--cream)',
        warm:     'var(--warm)',
        sand:     'var(--sand)',
        charcoal: 'var(--charcoal)',
        ink:      'var(--ink)',
        muted:    'var(--muted)',
        rose:     'var(--rose)',
        peach:    'var(--peach)',
        sage:     'var(--sage)',
        'card-bg':  'var(--card-bg)',
        'input-bg': 'var(--input-bg)',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:  ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

```css
/* globals.css */
:root {
  --cream:       #0e0d0c;
  --warm:        #161514;
  --sand:        #2a2622;
  --charcoal:    #f0ebe5;
  --ink:         #e0d8ce;
  --muted:       #8a8078;
  --rose:        #d4758a;
  --rose-soft:   rgba(212, 117, 138, 0.12);
  --rose-mid:    rgba(212, 117, 138, 0.2);
  --peach:       #e0a08c;
  --sage:        #8fad8f;
  --card-bg:     #181716;
  --input-bg:    #1e1d1b;
}
```

### Pattern 2: next/font/google with CSS Variable Injection

**What:** Load fonts via `next/font/google` in `app/layout.tsx`, inject them as CSS variables on `<html>`, reference in Tailwind config.

**When to use:** Always for Google Fonts in Next.js — zero CLS, self-hosted automatically, no external network request from browser.

**Weights to load (extracted from prototype CSS @import, line 247):**
- Cormorant Garamond: weights 300, 400, 500, 600, 700 — with italic variants (the prototype uses `ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400`)
- Manrope: weights 300, 400, 500, 600, 700, 800

**Example:**
```typescript
// app/layout.tsx
import { Cormorant_Garamond, Manrope } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="bg-cream text-charcoal font-sans grain">
        {children}
      </body>
    </html>
  )
}
```

### Pattern 3: cn() Utility

**What:** A wrapper combining `clsx` (conditional classes) and `tailwind-merge` (deduplication).

**Example:**
```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Pattern 4: useTranslation Hook in lib/i18n.ts

**What:** A simple hook wrapping the translations object. Returns the correct locale string set based on a lang prop or state value.

**When to use:** Any component that renders bilingual text. The admin panel default lang is `'ko'` (Korean) per the prototype (line 947: `const [lang, setLang] = useState("ko")`).

**Example:**
```typescript
// lib/i18n.ts
import { useState, useCallback } from 'react'

export type Lang = 'en' | 'ko'

export const translations = {
  en: { /* ... all keys ... */ },
  ko: { /* ... all keys ... */ },
} as const

export type TranslationKeys = keyof typeof translations.en

export function useTranslation(initialLang: Lang = 'ko') {
  const [lang, setLang] = useState<Lang>(initialLang)
  const t = translations[lang]
  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'en' ? 'ko' : 'en')
  }, [])
  return { t, lang, setLang, toggleLang }
}
```

### Anti-Patterns to Avoid

- **Importing next/font in a non-layout file:** `next/font` must be initialized in a layout or page, not in a shared utility module. The CSS variable approach (`variable: '--font-cormorant'`) lets you reference it anywhere after the variable is injected on `<html>`.
- **Putting design tokens only in tailwind.config.ts:** Tokens must be CSS variables too, not only Tailwind values. The admin CMS uses `style={{ background: 'var(--rose)' }}` directly. Tailwind-only tokens would break dynamic inline style usage.
- **Using Tailwind v4:** The `create-next-app` CLI as of early 2026 may default to Tailwind v4 if no version is specified. Pin explicitly to `tailwindcss@^3.4` in package.json after scaffolding, or pass `--tailwind` and then immediately downgrade.
- **Creating lib/supabase/ in Phase 1:** Without environment variables this file would throw at import time. Leave it for Phase 2.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Conditional class merging | Custom string concat | cn() via clsx + tailwind-merge | tailwind-merge handles Tailwind-specific class conflict resolution (bg-red-500 + bg-blue-500 → only last wins) |
| Font loading with CLS prevention | Manual @font-face or Google Fonts CDN link in `<head>` | next/font/google | Auto self-hosts, zero CLS, subset optimization, preload links generated automatically |
| CSS variable + Tailwind bridge | Hardcoded hex values in tailwind.config.ts | CSS vars in :root + var() references in config | Lets both Tailwind utilities and inline style props share the same token source |

**Key insight:** Phase 1 has no domain-complex problems. The risk is copy errors (wrong color hex, missing translation key, mismatched field name). Use the prototype as the authoritative source for all values.

---

## Common Pitfalls

### Pitfall 1: create-next-app Defaulting to Wrong Tailwind Version

**What goes wrong:** As of 2026, `create-next-app@14.2.35 --tailwind` may install Tailwind CSS v4 (the current latest) rather than v3. Tailwind v4 uses a CSS-first `@theme` configuration approach that is incompatible with the `tailwind.config.ts` token system described in this research.

**Why it happens:** npm resolves `tailwindcss` to the latest major if no version is pinned in the scaffolded package.json.

**How to avoid:** After `create-next-app`, immediately check the installed Tailwind version. If it is 4.x, run `npm install tailwindcss@^3.4 postcss autoprefixer` to downgrade and replace the `globals.css` Tailwind v4 directives (`@import "tailwindcss"`) with v3 directives (`@tailwind base; @tailwind components; @tailwind utilities`).

**Warning signs:** `globals.css` contains `@import "tailwindcss"` instead of `@tailwind` directives. The `tailwind.config.ts` file is missing or minimal.

### Pitfall 2: TypeScript Interface Mismatch with Supabase Schema

**What goes wrong:** If `lib/types.ts` interfaces don't match the database columns exactly (e.g., `types` typed as `string` instead of `string[]`, or `attributes` typed as a concrete object instead of `Record<string, string>`), Phase 2 and 3 components will accumulate type errors that require retrofitting all query results.

**Why it happens:** Typing convenience — it's tempting to narrow `attributes jsonb` to a specific shape too early.

**How to avoid:** Keep `attributes` as `Record<string, string> | null` and `profile_image_crop` / `cover_image_crop` as `CropSettings | null`. The Supabase-generated types (Phase 2) will be the authoritative source; Phase 1 types should match the schema as designed in CLAUDE.md, not be narrowed further.

**Warning signs:** TypeScript complains about `attributes.age` access — signals that `attributes` was typed as `{ age: string }` instead of `Record<string, string>`.

### Pitfall 3: Missing `card-bg` and `input-bg` Tokens

**What goes wrong:** CLAUDE.md's design token table lists `--cream` through `--sage` but notes `card-bg` and `input-bg` separately without the `--` prefix in the comment. If these are omitted from the CSS variables and Tailwind config, all card and form backgrounds will be unstyled.

**Why it happens:** They appear as a footnote in the token table, not in the main `--variable` list.

**How to avoid:** Explicitly define `--card-bg: #181716` and `--input-bg: #1e1d1b` in `:root` alongside all other tokens, and add them to Tailwind's `colors` extension.

**Warning signs:** Card backgrounds appear as `--cream` (page background) rather than slightly lighter charcoal.

### Pitfall 4: Translation Key Count Below 70

**What goes wrong:** FOUND-07 requires 70+ translation keys. The prototype's `T` object (lines 819-937) contains approximately 90 keys per locale, but if keys are accidentally consolidated (e.g., combining `subNew`, `subReviewed`, `subApproved`, `subDismissed` into a single object), the count can fall below 70.

**Why it happens:** Refactoring during translation — grouping related keys feels cleaner but reduces the flat count.

**How to avoid:** Keep the flat key structure from the prototype exactly. Do not nest keys. Count should be ~90 per locale.

**Warning signs:** `Object.keys(translations.en).length` returns fewer than 70.

### Pitfall 5: `next.config.ts` Missing `remotePatterns` Placeholder

**What goes wrong:** In Phase 3, `<Image>` components will load from Supabase Storage. If `remotePatterns` is not configured, every `next/image` call will throw a runtime error. Configuring it in Phase 1 costs nothing and prevents the error from ever appearing.

**Why it happens:** It's easy to skip config concerns when no images are being loaded yet.

**How to avoid:** Add the Supabase Storage remotePattern to `next.config.ts` in Phase 1 as a placeholder. The Supabase project URL will be filled in during Phase 2.

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
```

---

## Code Examples

Verified from prototype source (ModelDirectory.jsx) — these are copy-faithful translations.

### Complete :root CSS Variables (from prototype line 248)

```css
/* globals.css — :root section */
:root {
  --cream:       #0e0d0c;       /* page background */
  --warm:        #161514;       /* secondary background */
  --sand:        #2a2622;       /* borders */
  --charcoal:    #f0ebe5;       /* primary text */
  --ink:         #e0d8ce;       /* secondary text */
  --muted:       #8a8078;       /* tertiary text */
  --rose:        #d4758a;       /* primary accent */
  --rose-soft:   rgba(212, 117, 138, 0.12);
  --rose-mid:    rgba(212, 117, 138, 0.2);
  --peach:       #e0a08c;       /* secondary accent */
  --sage:        #8fad8f;       /* success / verified */
  --card-bg:     #181716;       /* model card backgrounds */
  --input-bg:    #1e1d1b;       /* form input backgrounds */
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: var(--cream); color: var(--charcoal); }
html { color-scheme: dark; }
```

### Grain Texture (CSS-only, from prototype line 254)

```css
/* globals.css — grain overlay */
.grain::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9998;
  pointer-events: none;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

The grain is a CSS-only SVG `<feTurbulence>` filter applied as a `::before` pseudo-element on the `<body>` (or a wrapper element with class `.grain`). No canvas, no JavaScript, no external image file.

### Animations (from prototype lines 255-262)

```css
/* globals.css — animations */
.card-img {
  transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s ease;
}
.model-card:hover .card-img { transform: scale(1.06); }
.model-card:hover .card-name { letter-spacing: 0.04em; }

.slide-in { animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}

.fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes fadeUp {
  from { transform: translateY(24px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}

.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.1s; }
.stagger-3 { animation-delay: 0.15s; }
.stagger-4 { animation-delay: 0.2s; }
.stagger-5 { animation-delay: 0.25s; }

.gallery-item { break-inside: avoid; margin-bottom: 10px; cursor: pointer; overflow: hidden; }
.gallery-item img { transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); display: block; width: 100%; }
.gallery-item:hover img { transform: scale(1.03); }

input:focus, textarea:focus, select:focus { outline: none; border-color: var(--rose) !important; }
::selection { background: var(--rose-mid); }
```

### Responsive Breakpoints (from prototype lines 269-345)

```css
/* globals.css — layout classes and responsive breakpoints */

/* Desktop (>1024px) */
.model-grid     { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
.profile-hero   { display: grid; grid-template-columns: 1fr 1fr; min-height: 85vh; }
.profile-stats  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; }
.profile-gallery { columns: 3; column-gap: 10px; }
.admin-slide    { position: fixed; top: 0; right: 0; bottom: 0; width: 500px; }
.hero-title     { font-size: 72px; }
.hero-search    { width: 360px; }
.profile-name   { font-size: 64px; }
.admin-fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; }

/* Tablet (640-1024px) */
@media (max-width: 1024px) {
  .model-grid     { grid-template-columns: repeat(2, 1fr); }
  .profile-hero   { grid-template-columns: 1fr; min-height: auto; }
  .profile-stats  { grid-template-columns: repeat(2, 1fr); gap: 32px; }
  .profile-gallery { columns: 2; }
  .admin-slide    { width: 420px; }
  .hero-title     { font-size: 56px; }
  .profile-name   { font-size: 48px; }
  .admin-fields-grid { grid-template-columns: 1fr 1fr; }
}

/* Mobile (<640px) */
@media (max-width: 640px) {
  .model-grid     { grid-template-columns: repeat(2, 1fr); gap: 1px; }
  .profile-hero   { grid-template-columns: 1fr; }
  .profile-stats  { grid-template-columns: 1fr; gap: 24px; }
  .profile-gallery { columns: 2; column-gap: 6px; }
  .admin-slide    { width: 100%; left: 0; }
  .admin-save-bar { width: 100%; left: 0; }
  .admin-fields-grid { grid-template-columns: 1fr; }
  .hero-title     { font-size: 36px; }
  .profile-name   { font-size: 36px; }
  .filter-scroll  { flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; }
}
```

### lib/types.ts — Complete TypeScript Interfaces

```typescript
// lib/types.ts
// Matches CLAUDE.md Supabase schema column-for-column.

export interface CropSettings {
  x: number;     // percentage 0-100
  y: number;     // percentage 0-100
  zoom: number;  // 100-200
}

export interface Profile {
  id: string;
  name: string;
  slug: string | null;
  region: string | null;
  parent_region: string | null;       // 'LA' or 'OC'
  bio: string | null;
  types: string[] | null;             // shoot types
  compensation: string[] | null;
  verified: boolean;
  vacation: boolean;
  experience: string | null;
  profile_image: string | null;       // storage URL
  profile_image_crop: CropSettings | null;
  cover_image: string | null;
  cover_image_crop: CropSettings | null;
  attributes: Record<string, string> | null;  // dynamic profile fields
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  profile_id: string;
  url: string;
  crop: CropSettings | null;
  sort_order: number | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  slug: string | null;
  bio: string | null;
  badge_label: string | null;         // custom or auto DUO/TRIO/GROUP
  image: string | null;
  member_ids: string[] | null;        // profile IDs (uuid[])
  types: string[] | null;
  compensation: string[] | null;
  attributes: Record<string, string> | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface GroupGalleryImage {
  id: string;
  group_id: string;
  url: string;
  sort_order: number | null;
  created_at: string;
}

export interface Submission {
  id: string;
  form_data: Record<string, unknown>;
  status: 'new' | 'reviewed' | 'approved' | 'dismissed' | 'converted';
  id_photo_url: string | null;
  created_at: string;
}

// --- site_config sub-types ---

export interface CardSettings {
  subtitleFields: string[];
  showVerifiedBadge: boolean;
  showAwayBadge: boolean;
  verifiedLabel: string;
  awayLabel: string;
  overlayColor: string;
  overlayOpacity: number;
}

export interface PillGroup {
  id: string;
  title: string;
  color: string;
  dataKey: string;
  options: string[];
}

export interface CategoryField {
  key: string;
  label: string;
}

export interface Category {
  id: string;
  title: string;
  fields: CategoryField[];
}

export interface HeroSettings {
  img: string;
  imgCrop: CropSettings | null;
  subtitle: string;
  titleLine1: string;
  titleLine2: string;
  titleAccent: string;
  searchPlaceholder: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'area_select' | 'exp_select' | 'type_pills' | 'file_upload';
  required?: boolean;
  width: 'full' | 'half' | 'third';
  placeholder?: string;
  helperText?: string;
}

export interface FormConfig {
  title: string;
  subtitle: string;
  successTitle: string;
  successMsg: string;
  submitLabel: string;
  fields: FormField[];
}

export interface SiteConfig {
  id: string;   // 'areas' | 'categories' | 'card_settings' | 'pill_groups' | 'hero' | 'form_config'
  value: string[] | Category[] | CardSettings | PillGroup[] | HeroSettings | FormConfig;
  updated_at: string;
}
```

### lib/constants.ts — Default site_config Values (from prototype lines 10-73)

```typescript
// lib/constants.ts
import type {
  CardSettings, PillGroup, Category, HeroSettings, FormConfig, FormField
} from './types'

export const DEFAULT_AREAS: string[] = ['LA', 'West LA', 'Mid-Wilshire', 'OC']

export const DEFAULT_CARD_SETTINGS: CardSettings = {
  subtitleFields: ['region', 'types'],
  showVerifiedBadge: true,
  showAwayBadge: true,
  verifiedLabel: 'Verified',
  awayLabel: 'Away',
  overlayColor: '#1a1a1a',
  overlayOpacity: 70,
}

export const DEFAULT_PILL_GROUPS: PillGroup[] = [
  {
    id: 'types',
    title: 'Shoot Types',
    color: 'var(--charcoal)',
    dataKey: 'types',
    options: ['Portrait', 'Fashion', 'Commercial', 'Glamour', 'Fitness', 'Editorial', 'Artistic', 'Swimwear', 'Lingerie', 'Cosplay', 'Lifestyle', 'Event'],
  },
  {
    id: 'compensation',
    title: 'Compensation',
    color: 'var(--sage)',
    dataKey: 'compensation',
    options: ['Paid Only', 'TFP', 'Negotiable'],
  },
]

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'stats',
    title: 'Vitals',
    fields: [
      { key: 'age',    label: 'Age' },
      { key: 'height', label: 'Height' },
      { key: 'weight', label: 'Weight' },
      { key: 'bust',   label: 'Bust' },
      { key: 'waist',  label: 'Waist' },
      { key: 'hips',   label: 'Hips' },
    ],
  },
  {
    id: 'appearance',
    title: 'Look',
    fields: [
      { key: 'hair',      label: 'Hair' },
      { key: 'eyes',      label: 'Eyes' },
      { key: 'shoe',      label: 'Shoe' },
      { key: 'dress',     label: 'Dress' },
      { key: 'tattoos',   label: 'Tattoos' },
      { key: 'piercings', label: 'Piercings' },
    ],
  },
  {
    id: 'professional',
    title: 'Work',
    fields: [
      { key: 'exp',    label: 'Experience' },
      { key: 'region', label: 'Based In' },
    ],
  },
]

export const DEFAULT_HERO: HeroSettings = {
  img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&h=800&fit=crop',
  imgCrop: null,
  subtitle: 'Los Angeles · Orange County',
  titleLine1: 'Find Your',
  titleLine2: 'Perfect',
  titleAccent: 'Model',
  searchPlaceholder: 'Search by name or area...',
}

export const DEFAULT_FORM_CONFIG: FormConfig = {
  title: 'Model Membership Form',
  subtitle: 'You\'ve been invited to submit your information for consideration on our platform. Fill out the form below and our team will review within 48 hours.',
  successTitle: 'Submission Received!',
  successMsg: 'Thank you for your interest! Our team will review your information and reach out within 48 hours.',
  submitLabel: 'Submit Membership Form',
  fields: [
    { id: 'name',     label: 'Full Name',                         type: 'text',       required: true,  width: 'half',  placeholder: 'Jane Doe' },
    { id: 'email',    label: 'Email',                             type: 'email',      required: true,  width: 'half',  placeholder: 'jane@email.com' },
    { id: 'phone',    label: 'Phone',                             type: 'text',       required: false, width: 'third', placeholder: '(555) 123-4567' },
    { id: 'age',      label: 'Age',                               type: 'text',       required: false, width: 'third', placeholder: '21' },
    { id: 'height',   label: 'Height',                            type: 'text',       required: false, width: 'third', placeholder: '5\'7"' },
    { id: 'region',   label: 'Preferred Area',                    type: 'area_select', required: false, width: 'half', placeholder: 'Select area...' },
    { id: 'exp',      label: 'Experience Level',                  type: 'exp_select', required: false, width: 'half',  placeholder: 'Select...' },
    { id: 'types',    label: 'Shoot Types (select all that apply)', type: 'type_pills', required: false, width: 'full', placeholder: '' },
    { id: 'bio',      label: 'Tell us about yourself',            type: 'textarea',   required: false, width: 'full',  placeholder: 'Your experience, style, what you bring to a shoot...' },
    { id: 'social',   label: 'Instagram / Social',                type: 'text',       required: false, width: 'full',  placeholder: '@yourhandle' },
    {
      id: 'id_photo',
      label: 'ID Verification',
      type: 'file_upload',
      required: true,
      width: 'full',
      placeholder: '',
      helperText: 'Upload a photo holding your ID next to your face. You may cover all other information — we only need to verify your name matches. No other personal details will be recorded.',
    },
  ] as FormField[],
}

export const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Experienced', 'Professional'] as const
```

### lib/i18n.ts — All Translation Keys (from prototype lines 819-937)

The prototype's `T` object contains approximately 90 flat keys per locale. Full key listing:

**EN locale keys (90 keys):**
`back`, `admin`, `tabModels`, `tabCategories`, `tabAreas`, `tabGroups`, `grpTitle`, `grpDesc`, `grpNew`, `grpName`, `grpBio`, `grpMembers`, `grpAddMember`, `grpGallery`, `grpBadgeLabel`, `grpBadgeAuto`, `grpDelete`, `grpNone`, `worksIn`, `total`, `verified`, `onVacation`, `pending`, `filterAll`, `filterVerified`, `filterVacation`, `thName`, `thArea`, `thLevel`, `thVerified`, `thVacation`, `edit`, `editing`, `catTitle`, `catDesc`, `addSection`, `sectionTitle`, `remove`, `fieldKey`, `addField`, `newFieldLabel`, `newSectionTitle`, `areasTitle`, `areasDesc`, `areasPlaceholder`, `add`, `identity`, `biography`, `fullName`, `area`, `parentRegion`, `experience`, `expBeginner`, `expIntermediate`, `expExperienced`, `expProfessional`, `saved`, `savePublish`, `cancel`, `tabSubmissions`, `subTitle`, `subDesc`, `subNew`, `subReviewed`, `subApproved`, `subDismissed`, `subMarkReviewed`, `subApprove`, `subDismiss`, `subConvert`, `subNone`, `subDate`, `subStatus`, `subShareTitle`, `subShareDesc`, `subCopyLink`, `subCopied`, `formEditor`, `formEditorDesc`, `formTitle`, `formSubtitle`, `formSuccessTitle`, `formSuccessMsg`, `formSubmitLabel`, `formFields`, `formFieldLabel`, `formFieldType`, `formFieldReq`, `formFieldWidth`, `formAddField`, `formFieldPh`, `ftText`, `ftEmail`, `ftTextarea`, `ftAreaSelect`, `ftExpSelect`, `ftTypePills`, `ftFileUpload`, `fwFull`, `fwHalf`, `fwThird`, `regTitle`, `regSubtitle`, `regDesc`, `regName`, `regEmail`, `regPhone`, `regAge`, `regHeight`, `regRegion`, `regExp`, `regTypes`, `regBio`, `regBioPlaceholder`, `regSocial`, `regSubmit`, `regSubmitting`, `regSuccess`, `regSuccessMsg`, `regBack`, `regRequired`, `cardDisplay`, `cardDisplayDesc`, `subtitleFields`, `subtitleDesc`, `sfRegion`, `sfType`, `sfExp`, `sfAge`, `badges`, `showVerified`, `showAway`, `verifiedLabelT`, `awayLabelT`, `overlay`, `overlayColor`, `overlayOpacity`, `heroSettings`, `heroSettingsDesc`, `heroImage`, `heroSubtitle`, `heroLine1`, `heroLine2`, `heroAccent`, `heroSearchPh`, `newModel`, `deleteModel`, `deleteConfirm`, `pillGroups`, `pillGroupsDesc`, `groupTitle`, `groupColor`, `addOption`, `addGroup`, `newGroupTitle`, `newOption`, `dataKey`, `photos`, `profilePhoto`, `coverPhoto`, `galleryPhotos`, `uploadPhoto`, `removePhoto`, `dragOrClick`, `galleryAdd`, `editPhoto`, `focalPoint`, `zoom`, `applyCrop`, `resetCrop`, `editBtn`

**Total:** 160 keys (80 per semantic group × 2). `Object.keys(translations.en).length` will return 160 in the flat structure matching the prototype.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Google Fonts `@import` in CSS | `next/font/google` with CSS variable injection | Next.js 13 (2022) | Zero CLS, self-hosted, automatic subset optimization |
| `tailwind.config.js` (CommonJS) | `tailwind.config.ts` (TypeScript) | Tailwind v3.3+ | Full type safety on config; same API |
| `pages/` directory | `app/` directory with App Router | Next.js 13 (stable in 14) | Server Components, nested layouts, streaming |
| `next.config.js` | `next.config.ts` | Next.js 14.1+ | TypeScript types on `NextConfig` |

**Deprecated/outdated:**
- `@import url('https://fonts.googleapis.com/...')` in globals.css: Replaced by `next/font/google`. Do not use for new Next.js projects.
- `pages/` directory: Not used in this project — App Router only.
- `classnames` package (without tailwind-merge): Still functional but does not deduplicate conflicting Tailwind utilities. Replace with `clsx + tailwind-merge`.

---

## Validation Architecture

> `nyquist_validation` is enabled in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None yet — this phase creates the project from scratch |
| Config file | None — Wave 0 must create it |
| Quick run command | `npx tsc --noEmit` (TypeScript type check) |
| Full suite command | `npm run build` (full Next.js build including type check and lint) |

> Phase 1 has no runtime behavior to unit test. The "tests" for this phase are: (a) TypeScript compiles with zero errors, (b) `npm run build` succeeds, (c) `npm run dev` serves a page at localhost:3000. No Jest/Vitest needed for Phase 1.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | Project exists with TS strict, App Router | build smoke | `npx tsc --noEmit` | ❌ Wave 0 |
| FOUND-02 | Tailwind tokens resolve in classes | build smoke | `npm run build` | ❌ Wave 0 |
| FOUND-03 | Fonts load without console errors | manual | `npm run dev` + browser DevTools | ❌ Wave 0 |
| FOUND-04 | globals.css variables, grain, animations present | build smoke | `npm run build` | ❌ Wave 0 |
| FOUND-05 | types.ts compiles with no errors | type check | `npx tsc --noEmit` | ❌ Wave 0 |
| FOUND-06 | constants.ts imports without error | type check | `npx tsc --noEmit` | ❌ Wave 0 |
| FOUND-07 | i18n.ts has 70+ keys per locale | type check + manual count | `node -e "const {translations}=require('./lib/i18n'); console.log(Object.keys(translations.en).length)"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx tsc --noEmit`
- **Per wave merge:** `npm run build`
- **Phase gate:** `npm run build` produces zero errors before advancing to Phase 2

### Wave 0 Gaps
- [ ] `tsconfig.json` with `"strict": true` — created by `create-next-app`
- [ ] `tailwind.config.ts` — created by `create-next-app`, then customized
- [ ] `app/globals.css` — created by `create-next-app`, then replaced
- [ ] `lib/types.ts` — NEW: must be created
- [ ] `lib/constants.ts` — NEW: must be created
- [ ] `lib/i18n.ts` — NEW: must be created
- [ ] `lib/utils.ts` — NEW: must be created (cn() helper)
- [ ] `next.config.ts` — created by `create-next-app`, then add `remotePatterns`

---

## Open Questions

1. **create-next-app Tailwind version behavior in March 2026**
   - What we know: As of the knowledge cutoff, `create-next-app@14.2.35 --tailwind` installs Tailwind during scaffolding; but the installed version depends on the latest available at run time.
   - What's unclear: Whether `create-next-app@14.2.35` pins Tailwind to v3 in its template or picks up v4.
   - Recommendation: After scaffolding, check `node_modules/tailwindcss/package.json` version. If 4.x, run `npm install tailwindcss@^3.4 postcss autoprefixer` immediately.

2. **`app/layout.tsx` font variable class application**
   - What we know: The `variable` property on `next/font/google` injects a CSS variable (e.g., `--font-cormorant`) when the variable class is applied to `<html>`.
   - What's unclear: Whether `display: 'swap'` is the correct choice vs `display: 'optional'` for LCP on dark luxury editorial pages.
   - Recommendation: Use `display: 'swap'` (matches prototype intent, standard choice). `optional` would suppress font flash at cost of potential font not loading.

---

## Sources

### Primary (HIGH confidence)
- `ModelDirectory.jsx` lines 246-346 — all CSS tokens, grain, animations, responsive breakpoints extracted verbatim from working prototype
- `ModelDirectory.jsx` lines 10-73 — all default constants extracted verbatim from working prototype
- `ModelDirectory.jsx` lines 818-937 — all 160 translation keys (80 EN + 80 KO) extracted verbatim from working prototype
- `CLAUDE.md` — Supabase schema (TypeScript interface shapes derived column-for-column)
- `.planning/STATE.md` — locked version decisions (Next.js 14.2.x, Tailwind v3)
- `.planning/research/SUMMARY.md` — confirmed stack, architecture, pitfalls at HIGH confidence

### Secondary (MEDIUM confidence)
- [Next.js docs: next/font](https://nextjs.org/docs/app/api-reference/components/font) — font variable injection pattern, `display: 'swap'`
- [Next.js docs: Image remotePatterns](https://nextjs.org/docs/app/api-reference/components/image#remotepatterns) — wildcard `*.supabase.co` hostname pattern
- [Tailwind CSS v3 theme configuration](https://tailwindcss.com/docs/theme) — `theme.extend.colors` with CSS var references
- [tailwind-merge README](https://github.com/dcastil/tailwind-merge) — cn() pattern, merging behavior

### Tertiary (LOW confidence)
- None. All findings backed by prototype source code (HIGH) or official documentation (MEDIUM).

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All versions and packages sourced from locked project decisions + prototype
- Architecture: HIGH — File structure and patterns extracted directly from working prototype and CLAUDE.md
- Pitfalls: HIGH — Sourced from STATE.md locked decisions + verified prototype behavior
- Code examples: HIGH — All examples copy-translated from prototype source, not invented

**Research date:** 2026-03-09
**Valid until:** 2026-09-09 (stable — Tailwind v3 and Next.js 14 are frozen versions; prototype is static source of truth)
