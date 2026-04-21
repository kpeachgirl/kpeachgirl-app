'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Profile, CardSettings } from '@/lib/types';
import { cropStyle } from '@/lib/utils';

interface ModelCardProps {
  profile: Profile;
  cardSettings: CardSettings;
}

export default function ModelCard({ profile, cardSettings }: ModelCardProps) {
  const sf = cardSettings.subtitleFields || ['region', 'types'];
  const subtitle = sf
    .map((f) => {
      if (f === 'region') return profile.region;
      if (f === 'types') return (profile.types || [])[0];
      if (f === 'exp') return profile.experience;
      if (f === 'age') return profile.attributes?.age;
      return '';
    })
    .filter(Boolean)
    .join(' \u00b7 ');

  const oc = cardSettings.overlayColor || '#1a1a1a';
  const oo = (cardSettings.overlayOpacity != null ? cardSettings.overlayOpacity : 70) / 100;
  const overlayHex = Math.round(oo * 255).toString(16).padStart(2, '0');

  const crop = cropStyle(profile.profile_image_crop);
  const firstLetter = (profile.name || '?')[0];
  const placeholderSvg = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect width="400" height="600" fill="#d9cfc4"/><text x="200" y="280" text-anchor="middle" font-family="Georgia,serif" font-size="64" font-weight="300" fill="rgba(138,127,118,0.4)">${firstLetter}</text></svg>`
  )}`;

  return (
    <Link href={`/model/${profile.slug}`} className="model-card block relative overflow-hidden bg-card-bg cursor-pointer">
      <div className="relative overflow-hidden" style={{ paddingTop: '135%' }}>
        {/* Image */}
        {profile.profile_image ? (
          <Image
            src={profile.profile_image}
            alt={profile.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            className="card-img object-cover"
            style={{
              ...crop,
              filter: profile.vacation ? 'grayscale(0.6) brightness(0.9)' : 'none',
            }}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={placeholderSvg}
            alt={profile.name}
            className="card-img absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Gradient overlay */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '40%',
            background: `linear-gradient(transparent, ${oc}${overlayHex})`,
          }}
        />

        {/* Vacation overlay */}
        {profile.vacation && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
            <span className="font-serif text-lg tracking-[0.2em] text-white/80 uppercase px-5 py-2 border border-white/30 backdrop-blur-sm">
              Vacation
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 z-20">
          {cardSettings.showVerifiedBadge !== false && profile.verified && (
            <span className="font-sans bg-[rgba(24,23,22,0.92)] backdrop-blur-sm px-2.5 py-[3px] text-[10px] font-bold tracking-[0.08em] text-sage uppercase">
              {cardSettings.verifiedLabel || 'Verified'}
            </span>
          )}
        </div>

        {/* Name + subtitle */}
        <div className="absolute bottom-0 left-0 right-0 px-[18px] py-4">
          <div className="card-name font-serif text-2xl font-medium text-white leading-[1.1] transition-[letter-spacing] duration-[600ms] ease-in-out">
            {profile.name}
          </div>
          {subtitle && (
            <div className="font-sans text-[10px] font-semibold tracking-[0.14em] text-white/60 uppercase mt-1">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
