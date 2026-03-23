'use client';

import { useState, useCallback } from 'react';
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

  const handleNavigate = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

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

      {/* ─── Gallery Section ─── */}
      {gallery.length > 0 && (
        <div className="grid-pad" style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 0 }}>
          <div className="font-serif text-[13px] font-semibold tracking-[0.18em] text-rose uppercase mb-7">
            Portfolio
          </div>
          <div className="profile-gallery">
            {gallery.map((img, i) => {
              // Offset index by number of hero images added before gallery
              const heroCount = allImages.length - gallery.length;
              return (
              <div
                key={img.id}
                className="gallery-item"
                onClick={() => setLightboxIndex(i + heroCount)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setLightboxIndex(i);
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={`${profile.name} gallery ${i + 1}`}
                  style={img.crop ? cropStyle(img.crop) : { objectFit: 'cover' }}
                />
              </div>
              );
            })}
          </div>
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
