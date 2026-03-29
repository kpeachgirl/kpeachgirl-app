'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { Profile, GalleryImage, Group, CategorySection, PillGroup } from '@/lib/types';
import { cropStyle } from '@/lib/utils';
import ProfilePills from '@/components/ProfilePills';
import CategoryStats from '@/components/CategoryStats';
import Lightbox from '@/components/Lightbox';

interface ModelProfileClientProps {
  profile: Profile;
  gallery: GalleryImage[];
  groups: Group[];
  categories: CategorySection[];
  pillGroups: PillGroup[];
}

function getGroupBadge(group: Group): string {
  if (group.badge_label) return group.badge_label;
  const count = group.member_ids.length;
  if (count === 2) return 'DUO';
  if (count === 3) return 'TRIO';
  return 'GROUP';
}

export default function ModelProfileClient({
  profile,
  gallery,
  groups,
  categories,
  pillGroups,
}: ModelProfileClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const handleNavigate = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const scrollToGalleryIndex = useCallback((idx: number) => {
    if (!galleryRef.current) return;
    const container = galleryRef.current;
    const child = container.children[idx] as HTMLElement;
    if (child) {
      container.scrollTo({ left: child.offsetLeft - container.offsetLeft, behavior: 'smooth' });
      setGalleryIndex(idx);
    }
  }, []);

  // Sync gallery index on scroll
  useEffect(() => {
    const container = galleryRef.current;
    if (!container) return;
    const handleScroll = () => {
      const children = Array.from(container.children) as HTMLElement[];
      const scrollLeft = container.scrollLeft;
      const containerLeft = container.offsetLeft;
      let closest = 0;
      let minDist = Infinity;
      children.forEach((child, i) => {
        const dist = Math.abs(child.offsetLeft - containerLeft - scrollLeft);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      setGalleryIndex(closest);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [gallery.length]);

  // Build pill data from profile
  const pillData: Record<string, string[]> = {
    types: profile.types || [],
    compensation: profile.compensation || [],
  };

  // Placeholder SVG for missing images
  const placeholderCover =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="400"><rect width="700" height="400" fill="#d9cfc4"/></svg>'
    );

  const placeholderGroup =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="#2a2622"/></svg>'
    );

  // Build all viewable images: profile image first, then gallery
  const allImages: string[] = [];
  if (profile.profile_image) allImages.push(profile.profile_image);
  if (profile.cover_image && profile.cover_image !== profile.profile_image) allImages.push(profile.cover_image);
  gallery.forEach((img) => allImages.push(img.url));

  return (
    <div className="grain" style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* ─── Hero Split Section ─── */}
      <div className="fade-up profile-hero" style={{ paddingTop: 72 }}>
        {/* Cover image */}
        <div
          style={{ position: 'relative', overflow: 'hidden', minHeight: 350, cursor: 'zoom-in' }}
          onClick={() => setLightboxIndex(0)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.cover_image || profile.profile_image || placeholderCover}
            alt={`${profile.name} cover`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              minHeight: 350,
              ...cropStyle(profile.cover_image_crop),
            }}
          />
        </div>

        {/* Profile info */}
        <div
          className="profile-info-pad"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Region + verified badge */}
          <div
            className="font-sans text-[10px] font-bold tracking-[0.2em] text-rose uppercase mb-3"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {profile.region}
            {profile.verified && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--sage)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
          </div>

          {/* Name */}
          <h1
            className="font-serif profile-name"
            style={{
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: 'var(--charcoal)',
              marginBottom: 20,
            }}
          >
            {profile.name}
          </h1>

          {/* Vacation alert */}
          {profile.vacation && (
            <div
              className="font-sans"
              style={{
                background: 'rgba(212, 144, 124, 0.1)',
                border: '1px solid rgba(212, 144, 124, 0.2)',
                padding: '12px 18px',
                marginBottom: 24,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--peach)',
                letterSpacing: '0.05em',
              }}
            >
              Currently unavailable &mdash; check back soon
            </div>
          )}

          {/* Bio */}
          <p
            className="font-sans"
            style={{
              fontSize: 15,
              lineHeight: 1.85,
              color: 'var(--muted)',
              maxWidth: 440,
              marginBottom: 32,
            }}
          >
            {profile.bio}
          </p>

          {/* Pills */}
          <div style={{ marginBottom: 24 }}>
            <ProfilePills pillGroups={pillGroups} data={pillData} />
          </div>

        </div>
      </div>

      {/* ─── Category Stats Section ─── */}
      <div className="grid-pad" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <CategoryStats
          categories={categories}
          attributes={profile.attributes || {}}
          experience={profile.experience || undefined}
          region={profile.region || undefined}
        />
      </div>

      {/* ─── Gallery Carousel ─── */}
      {gallery.length > 0 && (
        <div className="grid-pad" style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="font-serif text-[13px] font-semibold tracking-[0.18em] text-rose uppercase">
              Portfolio
            </div>
            <div className="font-sans text-[11px] text-muted" style={{ letterSpacing: '0.05em' }}>
              {galleryIndex + 1} / {gallery.length}
            </div>
          </div>

          {/* Carousel container */}
          <div style={{ position: 'relative' }}>
            {/* Scrollable track */}
            <div
              ref={galleryRef}
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchMove={(e) => { touchDeltaX.current = e.touches[0].clientX - touchStartX.current; }}
              onTouchEnd={() => {
                if (Math.abs(touchDeltaX.current) > 50) {
                  if (touchDeltaX.current < 0 && galleryIndex < gallery.length - 1) scrollToGalleryIndex(galleryIndex + 1);
                  else if (touchDeltaX.current > 0 && galleryIndex > 0) scrollToGalleryIndex(galleryIndex - 1);
                }
                touchDeltaX.current = 0;
              }}
              style={{
                display: 'flex',
                gap: 12,
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              className="gallery-carousel"
            >
              {gallery.map((img, i) => {
                const heroCount = allImages.length - gallery.length;
                return (
                  <div
                    key={img.id}
                    style={{
                      flex: '0 0 85%',
                      maxWidth: 600,
                      scrollSnapAlign: 'start',
                      cursor: 'zoom-in',
                      overflow: 'hidden',
                      borderRadius: 4,
                    }}
                    onClick={() => setLightboxIndex(i + heroCount)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`${profile.name} gallery ${i + 1}`}
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '70vh',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.5s ease',
                        ...(img.crop ? cropStyle(img.crop) : {}),
                      }}
                      onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'scale(1.02)'; }}
                      onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Arrow buttons - desktop only */}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={() => scrollToGalleryIndex(Math.max(0, galleryIndex - 1))}
                  className="gallery-arrow gallery-arrow-left"
                  style={{
                    position: 'absolute',
                    left: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: '1px solid var(--sand)',
                    background: 'rgba(14,13,12,0.85)',
                    backdropFilter: 'blur(8px)',
                    color: 'var(--charcoal)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    opacity: galleryIndex === 0 ? 0.3 : 1,
                    transition: 'opacity 0.2s, border-color 0.2s',
                    zIndex: 2,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--rose)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--sand)'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button
                  onClick={() => scrollToGalleryIndex(Math.min(gallery.length - 1, galleryIndex + 1))}
                  className="gallery-arrow gallery-arrow-right"
                  style={{
                    position: 'absolute',
                    right: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: '1px solid var(--sand)',
                    background: 'rgba(14,13,12,0.85)',
                    backdropFilter: 'blur(8px)',
                    color: 'var(--charcoal)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    opacity: galleryIndex === gallery.length - 1 ? 0.3 : 1,
                    transition: 'opacity 0.2s, border-color 0.2s',
                    zIndex: 2,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--rose)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--sand)'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </>
            )}
          </div>

          {/* Dot indicators */}
          {gallery.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
              {gallery.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToGalleryIndex(i)}
                  style={{
                    width: i === galleryIndex ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    border: 'none',
                    background: i === galleryIndex ? 'var(--rose)' : 'var(--sand)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Also Available As (Group Links) ─── */}
      {groups.length > 0 && (
        <div className="grid-pad" style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 0 }}>
          <div className="font-serif text-[13px] font-semibold tracking-[0.18em] text-rose uppercase mb-5">
            Also available as
          </div>
          <div className="flex gap-4 flex-wrap">
            {groups.map((g) => {
              const badge = getGroupBadge(g);
              return (
                <Link
                  key={g.id}
                  href={`/group/${g.slug}`}
                  className="flex items-center gap-3.5 no-underline transition-colors duration-200 hover:border-rose"
                  style={{
                    padding: '12px 20px 12px 12px',
                    border: '1px solid var(--sand)',
                    background: '#181716',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.image || placeholderGroup}
                    alt={g.name}
                    style={{ width: 56, height: 56, objectFit: 'cover' }}
                  />
                  <div>
                    <span
                      className="font-sans text-[8px] font-extrabold tracking-[0.1em] uppercase mb-1 inline-block"
                      style={{
                        padding: '2px 8px',
                        background: 'var(--rose)',
                        color: '#181716',
                      }}
                    >
                      {badge}
                    </span>
                    <div className="font-sans text-sm font-bold text-charcoal mt-0.5">
                      {g.name}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Lightbox ─── */}
      {lightboxIndex !== null && (
        <Lightbox
          images={allImages}
          currentIndex={lightboxIndex}
          onClose={handleClose}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
