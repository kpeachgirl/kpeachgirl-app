'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type {
  Profile,
  Group,
  HeroConfig,
  CardSettings,
  PillGroup,
  AreaConfig,
} from '@/lib/types';
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
  heroGalleryUrls?: string[];
}

export default function HomepageClient({
  profiles,
  groups,
  hero,
  areas,
  cardSettings,
  heroGalleryUrls = [],
}: HomepageClientProps) {
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hideVacation, setHideVacation] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  // Use high-res gallery images for hero slideshow
  const heroImages = useMemo(() => {
    if (heroGalleryUrls.length > 0) return heroGalleryUrls;
    // Fallback to profile images if no gallery
    const imgs: string[] = [];
    for (const p of profiles) {
      if (p.profile_image) imgs.push(p.profile_image);
    }
    return imgs;
  }, [heroGalleryUrls, profiles]);

  // Rotate every 5 seconds
  const nextSlide = useCallback(() => {
    if (heroImages.length > 1) {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }
  }, [heroImages.length]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, heroImages.length]);

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

  return (
    <>
      {/* Hero Section */}
      <div
        className="fade-up relative overflow-hidden flex items-end"
        style={{ height: '70vh', minHeight: 380 }}
      >
        {/* Rotating background images */}
        {heroImages.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img}
            src={img}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: i === heroIndex ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
              objectPosition: '50% 15%',
            }}
          />
        ))}

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(14,13,12,0.95) 0%, rgba(14,13,12,0.6) 40%, rgba(14,13,12,0.35) 100%)',
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
