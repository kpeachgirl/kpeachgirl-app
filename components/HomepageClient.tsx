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
  const [hideVacation, setHideVacation] = useState(false);
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
          // Match on parent_region, or fall back to region if parent_region is missing
          const parentMatch = p.parent_region === area;
          const regionFallback = !p.parent_region && p.region === area;
          if (!parentMatch && !regionFallback) return false;
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
        className="fade-up flex flex-col items-center justify-center text-center"
        style={{ minHeight: 280, padding: '60px 20px 40px' }}
      >
        {/* Logo */}
        <h1
          className="font-serif font-light tracking-[0.22em] uppercase"
          style={{ fontSize: 'clamp(32px, 6vw, 52px)', color: 'var(--charcoal)', lineHeight: 1 }}
        >
          K<span style={{ color: 'var(--rose)' }}>PEACH</span>GIRL
        </h1>
        <div className="w-12 h-0.5 bg-rose mx-auto" style={{ margin: '20px 0' }} />
        <p className="font-sans text-[10px] font-bold tracking-[0.25em] text-muted uppercase mb-5">
          {hero.subtitle}
        </p>
        {/* Phone */}
        <a
          href="tel:+12133176530"
          className="font-sans text-charcoal no-underline hover:text-rose transition-colors"
          style={{ fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: 300, letterSpacing: '0.08em' }}
        >
          (213) 317-6530
        </a>
        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={hero.searchPlaceholder}
          className="font-sans text-charcoal text-[13px] font-medium mt-8 w-full"
          style={{
            maxWidth: 400,
            padding: '13px 20px',
            border: '1px solid var(--sand)',
            background: 'var(--warm)',
          }}
        />
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
