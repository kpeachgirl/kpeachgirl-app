import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CropData, SiteConfig } from './types';

/**
 * Merge Tailwind classes with clsx + tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generate CSS properties for the crop system.
 * Applied to images via style prop: objectPosition, transform, transformOrigin.
 */
export function cropStyle(crop?: CropData | null): React.CSSProperties {
  if (!crop) return {};
  const x = crop.x ?? 50;
  const y = crop.y ?? 50;
  const zoom = crop.zoom ?? 100;
  return {
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${zoom / 100})`,
    transformOrigin: `${x}% ${y}%`,
  };
}

/**
 * Convert array of SiteConfig rows [{id, value}] into keyed object { [id]: value }.
 */
export function parseSiteConfig(rows: SiteConfig[]): Record<string, any> {
  const result: Record<string, any> = {};
  for (const row of rows) {
    result[row.id] = row.value;
  }
  return result;
}
