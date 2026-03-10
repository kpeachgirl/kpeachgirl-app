# KPEACHGIRL — Editorial Model Directory
# CLAUDE.md Build Bible for Claude Code

## WHAT IS THIS
Admin-managed model directory for LA/OC. Models pay admin to build profiles. Photographers browse free. Dark luxury editorial aesthetic. Single admin, full CMS control.

## PROTOTYPE REFERENCE
`ModelDirectory.jsx` (1,828 lines) — COMPLETE working prototype. Every component, every feature, every data structure. Use as source of truth.

## TECH STACK
- **Framework**: Next.js 14 (App Router), TypeScript strict
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS + custom tokens
- **Fonts**: Cormorant Garamond (serif) + Manrope (sans) via next/font
- **Images**: Supabase Storage + next/image
- **Auth**: Supabase Auth (email/password, admin JWT claim)
- **Deploy**: Vercel
- **Email**: Resend

## DESIGN TOKENS (DARK THEME)
```css
--cream: #0e0d0c          /* page bg */
--warm: #161514            /* secondary bg */
--sand: #2a2622            /* borders */
--charcoal: #f0ebe5        /* primary text */
--ink: #e0d8ce             /* secondary text */
--muted: #8a8078           /* tertiary text */
--rose: #d4758a            /* primary accent */
--rose-soft: rgba(212,117,138,0.12)
--peach: #e0a08c           /* secondary accent */
--sage: #8fad8f            /* success/verified */
card-bg: #181716           /* card backgrounds */
input-bg: #1e1d1b          /* form inputs */
```

## ROUTES
```
/                    SSG     Homepage (age gate + hero + model grid + group cards)
/model/[slug]        ISR60s  Individual model profile
/group/[slug]        ISR60s  Group profile (duo/trio/group)
/membership          CSR     Membership form (direct link only, not in nav)
/admin               CSR     Admin dashboard (auth-gated)
/admin/login         CSR     Login page
/api/contact         API     Contact form → Resend
/api/revalidate      API     On-demand ISR trigger
```

## SUPABASE SCHEMA

### profiles
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  region text,
  parent_region text,        -- 'LA' or 'OC'
  bio text,
  types text[],              -- shoot types
  compensation text[],
  verified boolean DEFAULT false,
  vacation boolean DEFAULT false,
  experience text,
  profile_image text,        -- storage URL
  profile_image_crop jsonb,  -- {x,y,zoom}
  cover_image text,
  cover_image_crop jsonb,
  attributes jsonb,          -- all dynamic fields
  sort_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### gallery_images
```sql
CREATE TABLE gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  crop jsonb,
  sort_order integer,
  created_at timestamptz DEFAULT now()
);
```

### groups
```sql
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  bio text,
  badge_label text,          -- custom or auto DUO/TRIO/GROUP
  image text,
  member_ids uuid[],         -- profile IDs
  types text[],
  compensation text[],
  attributes jsonb,
  sort_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### group_gallery_images
```sql
CREATE TABLE group_gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order integer,
  created_at timestamptz DEFAULT now()
);
```

### submissions
```sql
CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_data jsonb NOT NULL,
  status text DEFAULT 'new',  -- new/reviewed/approved/dismissed/converted
  id_photo_url text,
  created_at timestamptz DEFAULT now()
);
```

### site_config
```sql
CREATE TABLE site_config (
  id text PRIMARY KEY,        -- 'areas','categories','card_settings','pill_groups','hero','form_config'
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);
```

### Storage Buckets
- `profile-images` (public)
- `cover-images` (public)
- `gallery-images` (public)
- `submissions` (admin-only)

### RLS
- profiles/gallery/groups: public SELECT, admin-only writes
- submissions: admin full access, anon INSERT only
- site_config: public SELECT, admin UPDATE

## CONFIG OBJECTS (stored in site_config)

### card_settings
```json
{
  "subtitleFields": ["region", "types"],
  "showVerifiedBadge": true,
  "showAwayBadge": true,
  "verifiedLabel": "Verified",
  "awayLabel": "Away",
  "overlayColor": "#1a1a1a",
  "overlayOpacity": 70
}
```

### pill_groups
```json
[
  { "id": "types", "title": "Shoot Types", "color": "var(--charcoal)", "dataKey": "types",
    "options": ["Portrait","Fashion","Commercial","Glamour","Fitness","Editorial","Artistic","Swimwear","Lingerie","Cosplay","Lifestyle","Event"] },
  { "id": "compensation", "title": "Compensation", "color": "var(--sage)", "dataKey": "compensation",
    "options": ["Paid Only","TFP","Negotiable"] }
]
```

### categories
```json
[
  { "id": "stats", "title": "Vitals", "fields": [
    {"key":"age","label":"Age"},{"key":"height","label":"Height"},{"key":"weight","label":"Weight"},
    {"key":"bust","label":"Bust"},{"key":"waist","label":"Waist"},{"key":"hips","label":"Hips"}
  ]},
  { "id": "appearance", "title": "Look", "fields": [
    {"key":"hair","label":"Hair"},{"key":"eyes","label":"Eyes"},{"key":"shoe","label":"Shoe"},
    {"key":"dress","label":"Dress"},{"key":"tattoos","label":"Tattoos"},{"key":"piercings","label":"Piercings"}
  ]},
  { "id": "professional", "title": "Work", "fields": [
    {"key":"exp","label":"Experience"},{"key":"region","label":"Region"}
  ]}
]
```

### hero
```json
{
  "img": "",
  "imgCrop": null,
  "subtitle": "Los Angeles · Orange County",
  "titleLine1": "Find Your",
  "titleLine2": "Perfect",
  "titleAccent": "Model",
  "searchPlaceholder": "Search by name or area..."
}
```

### form_config
```json
{
  "title": "Model Membership Form",
  "subtitle": "You've been invited to submit...",
  "successTitle": "Submission Received!",
  "successMsg": "Thank you for your interest!...",
  "submitLabel": "Submit Membership Form",
  "fields": [
    { "id": "name", "label": "Full Name", "type": "text", "required": true, "width": "half", "placeholder": "Jane Doe" },
    { "id": "email", "label": "Email", "type": "email", "required": true, "width": "half" },
    { "id": "phone", "label": "Phone", "type": "text", "width": "third" },
    { "id": "age", "label": "Age", "type": "text", "width": "third" },
    { "id": "height", "label": "Height", "type": "text", "width": "third" },
    { "id": "region", "label": "Preferred Area", "type": "area_select", "width": "half" },
    { "id": "exp", "label": "Experience Level", "type": "exp_select", "width": "half" },
    { "id": "types", "label": "Shoot Types", "type": "type_pills", "width": "full" },
    { "id": "bio", "label": "Tell us about yourself", "type": "textarea", "width": "full" },
    { "id": "social", "label": "Instagram / Social", "type": "text", "width": "full" },
    { "id": "id_photo", "label": "ID Verification", "type": "file_upload", "required": true, "width": "full",
      "helperText": "Upload a photo holding your ID next to your face. You may cover all other information — we only need to verify your name matches." }
  ]
}
```

## CROP SYSTEM
All photos support focal point + zoom:
```
{ x: 50, y: 50, zoom: 100 }
```
Applied via CSS:
```css
object-position: x% y%;
transform: scale(zoom/100);
transform-origin: x% y%;
```
PhotoEditor component: click/drag to set focal point, slider for zoom (100-200%).

## I18N
Full EN/Korean toggle. 70+ translation keys in lib/i18n.ts. Admin panel switches instantly. Korean translations exist for all labels, buttons, descriptions.

## RESPONSIVE
- Desktop >1024px: 4-col grid, split profile hero, 500px admin slide-out
- Tablet 640-1024px: 2-col grid, stacked hero, 420px slide-out
- Mobile <640px: 2-col grid, full-width slide-out, scrollable filter pills

## BUILD ORDER

### Session 1: Foundation
1. create-next-app with TypeScript + Tailwind + App Router
2. tailwind.config.ts with design tokens
3. Google Fonts setup
4. globals.css (variables, grain, animations, breakpoints)
5. lib/types.ts, lib/constants.ts, lib/i18n.ts

### Session 2: Supabase
1. Create project, run migrations
2. Storage buckets + policies
3. RLS policies
4. Admin user + JWT claims
5. lib/supabase.ts
6. Seed data (12 models + site_config)

### Session 3: Public Pages
1. AgeGate, ModelCard, PhotoEditor, Lightbox
2. Homepage (hero, search, filters, grid, group cards)
3. ProfilePage (categories, pills, gallery, "also available as")
4. GroupProfilePage (members, categories, pills, gallery)
5. Membership form (dynamic fields, file upload)
6. Deploy to Vercel

### Session 4: Admin
1. Login page + auth guard
2. Admin nav + tabs + i18n toggle
3. Models tab + editor slide-out
4. Groups tab + editor
5. Submissions tab + status workflow + convert
6. Profile Fields tab (hero, cards, tags, form editor, categories)
7. Areas tab
8. Image uploads → Supabase Storage
9. Contact form → Resend
10. E2E testing

## ENV VARS
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ADMIN_EMAIL=admin@kpeachgirl.com
REVALIDATION_SECRET=
```
