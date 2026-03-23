/* ─── Shared TypeScript Interfaces ──────────────────────────── */

export interface CropData {
  x: number;
  y: number;
  zoom: number;
}

export interface Profile {
  id: string;
  name: string;
  slug: string | null;
  region: string | null;
  parent_region: string | null;
  bio: string | null;
  types: string[];
  compensation: string[];
  verified: boolean;
  vacation: boolean;
  experience: string | null;
  profile_image: string | null;
  profile_image_crop: CropData | null;
  cover_image: string | null;
  cover_image_crop: CropData | null;
  attributes: Record<string, string | undefined>;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  profile_id: string;
  url: string;
  crop: CropData | null;
  sort_order: number | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  slug: string | null;
  bio: string | null;
  badge_label: string | null;
  image: string | null;
  member_ids: string[];
  types: string[];
  compensation: string[];
  attributes: Record<string, string | undefined>;
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
  form_data: Record<string, any>;
  status: 'new' | 'reviewed' | 'approved' | 'dismissed' | 'converted';
  id_photo_url: string | null;
  created_at: string;
}

export interface SiteConfig {
  id: string;
  value: any;
  updated_at: string;
}

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

export interface HeroConfig {
  img: string;
  imgCrop: CropData | null;
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

export interface CategoryField {
  key: string;
  label: string;
}

export interface CategorySection {
  id: string;
  title: string;
  fields: CategoryField[];
}

export interface AgeGateConfig {
  heading: string;
  body: string;
  enterButton: string;
  leaveButton: string;
  disclaimer: string;
  enabled: boolean;
}

export type AreaConfig = string[];
