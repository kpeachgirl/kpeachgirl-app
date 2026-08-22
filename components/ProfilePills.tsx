import type { PillGroup } from '@/lib/types';

interface ProfilePillsProps {
  pillGroups: PillGroup[];
  data: Record<string, string[]>;
}

// Pill group colors come from config as either a hex value (admin color picker)
// or a CSS variable like `var(--sage)`. Concatenating an alpha suffix only works
// for hex, so use color-mix and let the plain `border` above it act as fallback.
function borderColor(color: string) {
  return `color-mix(in srgb, ${color} 20%, transparent)`;
}

export default function ProfilePills({ pillGroups, data }: ProfilePillsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {pillGroups.map((pg) =>
        (data[pg.dataKey] || []).map((v) => {
          const isCharcoal = pg.color === 'var(--charcoal)';
          return (
            <span
              key={`${pg.id}-${v}`}
              className="font-sans text-[12px] font-semibold tracking-[0.06em]"
              style={{
                padding: '5px 14px',
                border: '1px solid var(--sand)',
                borderColor: isCharcoal ? 'var(--sand)' : borderColor(pg.color),
                color: isCharcoal ? 'var(--ink)' : pg.color,
              }}
            >
              {v}
            </span>
          );
        })
      )}
    </div>
  );
}
