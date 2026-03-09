'use client';

interface FilterBarProps {
  areas: string[];
  search: string;
  onSearchChange: (s: string) => void;
  area: string;
  onAreaChange: (a: string) => void;
  verifiedOnly: boolean;
  onVerifiedChange: (v: boolean) => void;
  hideVacation: boolean;
  onHideVacationChange: (v: boolean) => void;
  modelCount: number;
}

export default function FilterBar({
  areas,
  search,
  onSearchChange,
  area,
  onAreaChange,
  verifiedOnly,
  onVerifiedChange,
  hideVacation,
  onHideVacationChange,
  modelCount,
}: FilterBarProps) {
  const allAreas = ['All', ...areas];

  return (
    <div className="content-pad max-w-[1200px] mx-auto">
      <div className="font-sans flex justify-between items-center flex-wrap gap-3">
        {/* Area filter chips */}
        <div className="filter-scroll flex gap-2 items-center">
          <span className="text-[10px] font-bold tracking-[0.14em] text-muted uppercase mr-2 whitespace-nowrap">
            Area
          </span>
          {allAreas.map((a) => (
            <button
              key={a}
              onClick={() => onAreaChange(a)}
              className="font-sans whitespace-nowrap transition-all duration-200"
              style={{
                padding: '6px 16px',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                border: area === a ? '1px solid var(--charcoal)' : '1px solid var(--sand)',
                background: area === a ? 'var(--charcoal)' : 'transparent',
                color: area === a ? 'var(--cream)' : 'var(--muted)',
                textTransform: 'uppercase',
              }}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Toggles */}
        <div className="flex gap-4 items-center">
          <label className="font-sans flex items-center gap-1.5 text-[11px] font-semibold text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => onVerifiedChange(e.target.checked)}
              style={{ accentColor: 'var(--sage)' }}
            />
            Verified
          </label>
          <label className="font-sans flex items-center gap-1.5 text-[11px] font-semibold text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={hideVacation}
              onChange={(e) => onHideVacationChange(e.target.checked)}
              style={{ accentColor: 'var(--peach)' }}
            />
            Available
          </label>
        </div>
      </div>

      {/* Model count */}
      <div className="font-sans text-[11px] text-sand mt-3 font-semibold tracking-[0.06em]">
        {modelCount} model{modelCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
