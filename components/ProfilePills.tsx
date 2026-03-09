import type { PillGroup } from '@/lib/types';

interface ProfilePillsProps {
  pillGroups: PillGroup[];
  data: Record<string, string[]>;
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
              className="font-sans text-[11px] font-semibold tracking-[0.06em]"
              style={{
                padding: '5px 14px',
                border: `1px solid ${isCharcoal ? 'var(--sand)' : pg.color + '33'}`,
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
