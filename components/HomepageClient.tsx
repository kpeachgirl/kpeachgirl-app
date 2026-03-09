'use client';

import { useState, useMemo } from 'react';
import type {
  Profile,
  Group,
  HeroConfig,
  CardSettings,
  PillGroup,
  AreaConfig,
} from '@/lib/types';
import { cropStyle } from '@/lib/utils';
import ModelCard from '@/components/ModelCard';
import GroupCard from '@/components/GroupCard';
import FilterBar from '@/components/FilterBar';

interface HomepageClientProps {
  profiles: Profile[];
  groups: Group[];
  hero: HeroConfig;
  areas: AreaConfig;
  cardSettings: CardSettings;
  pillGroups: PillGroup[];
}

const HERO_FALLBACK =
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&h=800&fit=crop';

export default function HomepageClient({
  profiles,
  groups,
  hero,
  areas,
  cardSettings,
}: HomepageClientProps) {
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hideVacation, setHideVacation] = useState(true);

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      if (hideVacation && p.vacation) return false;
      if (verifiedOnly && !p.verified) return false;
      if (area !== 'All') {
        if (area === 'LA' || area === 'OC') {
          if (p.parent_region !== area) return false;
        } else {
          if (p.region !== area) return false;
        }
      }
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const regionMatch = (p.region || '').toLowerCase().includes(q);
        if (!nameMatch && !regionMatch) return false;
      }
      return true;
    });
  }, [profiles, search, area, verifiedOnly, hideVacation]);

  const heroCrop = cropStyle(hero.imgCrop);

  return (
    <>
      {/* Hero Section */}
      <div
        className="fade-up relative overflow-hidden flex items-end"
        style={{ height: '70vh', minHeight: 380 }}
      >
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero.img || HERO_FALLBACK}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            ...heroCrop,
            filter: 'brightness(0.4) contrast(1.05)',
          }}
        />

        {/* Hero content */}
        <div className="hero-pad relative z-[1]" style={{ maxWidth: 700 }}>
          <div className="font-sans text-[10px] font-bold tracking-[0.25em] text-white/50 uppercase mb-3">
            {hero.subtitle}
          </div>
          <h1
            className="font-serif hero-title font-light text-white leading-[0.95] tracking-[-0.03em]"
          >
            {hero.titleLine1}
            <br />
            {hero.titleLine2}{' '}
            <em className="italic text-peach">{hero.titleAccent}</em>
          </h1>
          <div className="w-12 h-0.5 bg-rose" style={{ margin: '28px 0' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={hero.searchPlaceholder}
            className="font-sans hero-search text-white text-[13px] font-medium backdrop-blur-[12px]"
            style={{
              padding: '13px 20px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
            }}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        areas={areas}
        search={search}
        onSearchChange={setSearch}
        area={area}
        onAreaChange={setArea}
        verifiedOnly={verifiedOnly}
        onVerifiedChange={setVerifiedOnly}
        hideVacation={hideVacation}
        onHideVacationChange={setHideVacation}
        modelCount={filtered.length}
      />

      {/* Model Grid */}
      <div className="grid-pad max-w-[1200px] mx-auto">
        <div className="model-grid">
          {filtered.map((p, i) => (
            <div key={p.id} className={`fade-up stagger-${(i % 5) + 1}`}>
              <ModelCard profile={p} cardSettings={cardSettings} />
            </div>
          ))}
          {groups.map((g, i) => (
            <div
              key={`g-${g.id}`}
              className={`fade-up stagger-${((filtered.length + i) % 5) + 1}`}
            >
              <GroupCard group={g} cardSettings={cardSettings} />
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center" style={{ padding: '80px 0' }}>
            <div className="font-serif text-[28px] font-light text-sand">
              No models match your filters
            </div>
            <div className="font-sans text-xs text-sand mt-2">
              Try adjusting your search
            </div>
          </div>
        )}
      </div>
    </>
  );
}
