'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Group, Profile, GroupGalleryImage, CategorySection, PillGroup } from '@/lib/types';
import ProfilePills from '@/components/ProfilePills';
import CategoryStats from '@/components/CategoryStats';
import Lightbox from '@/components/Lightbox';

interface GroupProfileClientProps {
  group: Group;
  members: Profile[];
  gallery: GroupGalleryImage[];
  categories: CategorySection[];
  pillGroups: PillGroup[];
}

function getBadgeLabel(group: Group, memberCount: number): string {
  if (group.badge_label) return group.badge_label;
  if (memberCount === 2) return 'DUO';
  if (memberCount === 3) return 'TRIO';
  return 'GROUP';
}

export default function GroupProfileClient({
  group,
  members,
  gallery,
  categories,
  pillGroups,
}: GroupProfileClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const badgeLabel = getBadgeLabel(group, members.length);

  /* Build pill data from group fields */
  const pillData: Record<string, string[]> = {};
  for (const pg of pillGroups) {
    const key = pg.dataKey as keyof Group;
    const val = group[key];
    if (Array.isArray(val)) {
      pillData[pg.dataKey] = val as string[];
    }
  }

  /* Check if group has any attribute data for categories */
  const hasAttributes = categories.some((cat) =>
    cat.fields.some((f) => group.attributes?.[f.key])
  );

  /* Gallery image URLs */
  const galleryUrls = gallery.map((img) => img.url);

  return (
    <>
      {/* Hero: 2-column grid */}
      <div className="fade-up profile-hero pt-[72px] grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">
        {/* Left: group image */}
        <div className="relative overflow-hidden min-h-[350px]">
          {group.image ? (
            <Image
              src={group.image}
              alt={group.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full min-h-[350px] bg-sand" />
          )}
          {/* Badge overlay */}
          <span className="font-sans absolute top-4 left-4 bg-rose py-1 px-3.5 text-[10px] font-extrabold tracking-[0.12em] text-card-bg uppercase">
            {badgeLabel}
          </span>
        </div>

        {/* Right: group info */}
        <div className="profile-info-pad flex flex-col justify-center relative">
          {/* Badge label */}
          <div className="font-sans text-[10px] font-bold tracking-[0.2em] text-rose uppercase mb-3">
            {badgeLabel} Profile
          </div>

          {/* Group name */}
          <h1 className="font-serif profile-name font-light leading-none tracking-[-0.03em] text-charcoal mb-5">
            {group.name}
          </h1>

          {/* Bio */}
          {group.bio && (
            <p className="font-sans text-[15px] leading-[1.85] text-muted max-w-[440px] mb-6">
              {group.bio}
            </p>
          )}

          {/* Pills */}
          <div className="mb-6">
            <ProfilePills pillGroups={pillGroups} data={pillData} />
          </div>

          {/* Member cards */}
          <div className="flex gap-3 flex-wrap">
            {members.map((m) => (
              <Link
                key={m.id}
                href={`/model/${m.slug}`}
                className="flex items-center gap-2.5 py-2 pl-2 pr-4 border border-sand no-underline hover:border-rose transition-colors duration-200"
              >
                <div className="relative w-9 h-9 overflow-hidden flex-shrink-0">
                  {m.profile_image ? (
                    <Image
                      src={m.profile_image}
                      alt={m.name}
                      fill
                      sizes="36px"
                      className="object-cover"
                      style={
                        m.profile_image_crop
                          ? {
                              objectPosition: `${m.profile_image_crop.x}% ${m.profile_image_crop.y}%`,
                            }
                          : undefined
                      }
                    />
                  ) : (
                    <div className="w-full h-full bg-sand" />
                  )}
                </div>
                <div>
                  <div className="font-sans text-xs font-bold text-charcoal">
                    {m.name}
                  </div>
                  <div className="font-sans text-[10px] text-muted">
                    {m.region}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Category stats */}
      {hasAttributes && (
        <div className="grid-pad max-w-[1100px] mx-auto">
          <CategoryStats
            categories={categories}
            attributes={group.attributes || {}}
          />
        </div>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="grid-pad max-w-[1200px] mx-auto pt-0">
          <div className="font-serif text-[13px] font-semibold tracking-[0.18em] text-rose uppercase mb-7">
            Gallery
          </div>
          <div className="profile-gallery">
            {gallery.map((img, i) => (
              <div
                key={img.id}
                className="gallery-item cursor-pointer"
                onClick={() => setLightboxIndex(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={galleryUrls}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
