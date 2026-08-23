'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
      '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="400"><rect width="700" height="400" fill="#0a0a0a"/></svg>'
    );

  const placeholderGroup =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="#0a0a0a"/></svg>'
    );

  // All images for lightbox: gallery images (same order as carousel)
  const allImages: string[] = gallery.map((img) => img.url);
  // If no gallery, fall back to profile/cover image
  if (allImages.length === 0) {
    if (profile.profile_image) allImages.push(profile.profile_image);
    if (profile.cover_image && profile.cover_image !== profile.profile_image) allImages.push(profile.cover_image);
  }

  // Total images for carousel (gallery is the source of truth)
  const totalImages = gallery.length;

  return (
    <div className="grain" style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* ─── Hero Photo Carousel ─── */}
      <div className="fade-up" style={{ paddingTop: 56 }}>
        {totalImages > 0 ? (
          <div style={{ position: 'relative' }}>
            {/* Full-width carousel */}
            <div
              ref={galleryRef}
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchMove={(e) => { touchDeltaX.current = e.touches[0].clientX - touchStartX.current; }}
              onTouchEnd={() => {
                if (Math.abs(touchDeltaX.current) > 50) {
                  if (touchDeltaX.current < 0 && galleryIndex < totalImages - 1) scrollToGalleryIndex(galleryIndex + 1);
                  else if (touchDeltaX.current > 0 && galleryIndex > 0) scrollToGalleryIndex(galleryIndex - 1);
                }
                touchDeltaX.current = 0;
              }}
              style={{
                display: 'flex',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              className="gallery-carousel"
            >
              {gallery.map((img, i) => (
                <div
                  key={img.id}
                  style={{
                    flex: '0 0 100%',
                    scrollSnapAlign: 'start',
                    cursor: 'zoom-in',
                    position: 'relative',
                    height: '75vh',
                    minHeight: 400,
                    background: '#141414',
                  }}
                  onClick={() => setLightboxIndex(i)}
                >
                  <Image
                    src={img.url}
                    alt={`${profile.name} ${i + 1}`}
                    fill
                    sizes="100vw"
                    priority={i === 0}
                    quality={75}
                    style={{
                      objectFit: 'contain',
                      ...(img.crop ? cropStyle(img.crop) : {}),
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Counter overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)',
                padding: '6px 14px',
                borderRadius: 20,
                zIndex: 2,
              }}
            >
              <span className="font-sans" style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '0.05em' }}>
                {galleryIndex + 1} / {totalImages}
              </span>
            </div>

            {/* Arrow buttons - desktop */}
            {totalImages > 1 && (
              <>
                <button
                  onClick={() => scrollToGalleryIndex(Math.max(0, galleryIndex - 1))}
                  className="gallery-arrow"
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: galleryIndex === 0 ? 0.3 : 1,
                    transition: 'opacity 0.2s, background 0.2s',
                    zIndex: 2,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.85)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button
                  onClick={() => scrollToGalleryIndex(Math.min(totalImages - 1, galleryIndex + 1))}
                  className="gallery-arrow"
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: galleryIndex === totalImages - 1 ? 0.3 : 1,
                    transition: 'opacity 0.2s, background 0.2s',
                    zIndex: 2,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.85)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </>
            )}

            {/* Dot indicators */}
            {totalImages > 1 && (
              <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 2 }}>
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToGalleryIndex(i)}
                    style={{
                      width: i === galleryIndex ? 20 : 8,
                      height: 8,
                      borderRadius: 4,
                      border: 'none',
                      background: i === galleryIndex ? 'var(--rose)' : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Fallback if no gallery images */
          <div
            style={{ position: 'relative', height: '60vh', minHeight: 400, background: '#000', cursor: 'zoom-in' }}
            onClick={() => setLightboxIndex(0)}
          >
            {(profile.cover_image || profile.profile_image) ? (
              <Image
                src={profile.cover_image || profile.profile_image!}
                alt={`${profile.name}`}
                fill
                sizes="100vw"
                priority
                quality={75}
                style={{
                  objectFit: 'contain',
                  ...cropStyle(profile.cover_image_crop),
                }}
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={placeholderCover}
                alt={profile.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </div>
        )}
      </div>

      {/* ─── Profile Info ─── */}
      <div
        className="grid-pad"
        style={{
          maxWidth: 900,
          margin: '0 auto',
          paddingTop: 40,
          paddingBottom: 20,
        }}
      >
        {/* Region + verified badge */}
        <div
          className="font-sans text-[14px] font-bold tracking-[0.2em] text-rose uppercase mb-3"
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
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--peach)',
              letterSpacing: '0.05em',
            }}
          >
            Currently unavailable &mdash; check back soon
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <p
            className="font-sans"
            style={{
              fontSize: 22,
              lineHeight: 1.85,
              color: 'var(--muted)',
              maxWidth: 600,
              marginBottom: 32,
            }}
          >
            {profile.bio}
          </p>
        )}

        {/* Pills */}
        <div style={{ marginBottom: 24 }}>
          <ProfilePills pillGroups={pillGroups} data={pillData} />
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

      {/* ─── Also Available As (Group Links) ─── */}
      {groups.length > 0 && (
        <div className="grid-pad" style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 0 }}>
          <div className="font-serif text-[17px] font-semibold tracking-[0.18em] text-rose uppercase mb-5">
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
                    background: 'var(--card-bg)',
                  }}
                >
                  {g.image ? (
                    <Image
                      src={g.image}
                      alt={g.name}
                      width={56}
                      height={56}
                      quality={60}
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={placeholderGroup}
                      alt={g.name}
                      style={{ width: 56, height: 56, objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <span
                      className="font-sans text-[12px] font-extrabold tracking-[0.1em] uppercase mb-1 inline-block"
                      style={{
                        padding: '2px 8px',
                        background: 'var(--rose)',
                        color: 'var(--card-bg)',
                      }}
                    >
                      {badge}
                    </span>
                    <div className="font-sans text-base font-bold text-charcoal mt-0.5">
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
