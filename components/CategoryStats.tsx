import type { CategorySection } from '@/lib/types';

interface CategoryStatsProps {
  categories: CategorySection[];
  attributes: Record<string, string | undefined>;
  experience?: string;
  region?: string;
}

export default function CategoryStats({
  categories,
  attributes,
  experience,
  region,
}: CategoryStatsProps) {
  return (
    <div className="profile-stats">
      {categories.map((cat, ci) => (
        <div key={cat.id} className={`fade-up stagger-${ci + 1}`}>
          {/* Section title */}
          <div className="font-serif text-[13px] font-semibold tracking-[0.18em] text-rose uppercase mb-5 pb-2.5 border-b border-sand">
            {cat.title}
          </div>

          {/* Key-value rows */}
          {cat.fields.map((f) => {
            let value: string | undefined;
            if (f.key === 'exp') {
              value = experience;
            } else if (f.key === 'region') {
              value = region;
            } else {
              value = attributes[f.key];
            }

            return (
              <div
                key={f.key}
                className="flex justify-between py-[9px] border-b border-white/[0.06]"
              >
                <span className="font-sans text-xs font-medium text-muted tracking-[0.03em]">
                  {f.label}
                </span>
                <span className="font-sans text-[13px] font-bold text-charcoal">
                  {value || '\u2014'}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
