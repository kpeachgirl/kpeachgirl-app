import type { PillGroup } from '@/lib/types';

interface ProfilePillsProps {
  pillGroups: PillGroup[];
  data: Record<string, string[]>;
}

// Pill group colors are admin-configurable: either a CSS variable like
// `var(--sage)` or a hex value from the color picker. A hex color dark enough
// to disappear against the black page background gets swapped for the neutral
// treatment, so a bad picker value can never render invisible text.
function relativeLuminance(hex: string): number | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Luminance needed to clear WCAG AA (4.5:1) against a black background.
const MIN_LUMINANCE = 0.2;

function isReadable(color: string): boolean {
  const lum = relativeLuminance(color);
  return lum === null || lum >= MIN_LUMINANCE;
}

export default function ProfilePills({ pillGroups, data }: ProfilePillsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {pillGroups.map((pg) => {
        const neutral = pg.color === 'var(--charcoal)' || !isReadable(pg.color);
        return (data[pg.dataKey] || []).map((v) => (
          <span
            key={`${pg.id}-${v}`}
            className="font-sans text-[15px] font-semibold tracking-[0.06em]"
            style={{
              padding: '5px 14px',
              border: '1px solid var(--sand)',
              borderColor: neutral
                ? 'var(--sand)'
                : `color-mix(in srgb, ${pg.color} 20%, transparent)`,
              color: neutral ? 'var(--ink)' : pg.color,
            }}
          >
            {v}
          </span>
        ));
      })}
    </div>
  );
}
