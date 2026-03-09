'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Group, CardSettings } from '@/lib/types';

interface GroupCardProps {
  group: Group;
  cardSettings: CardSettings;
}

function getBadgeLabel(group: Group): string {
  if (group.badge_label) return group.badge_label;
  const count = (group.member_ids || []).length;
  if (count === 2) return 'DUO';
  if (count === 3) return 'TRIO';
  return 'GROUP';
}

export default function GroupCard({ group, cardSettings }: GroupCardProps) {
  const badge = getBadgeLabel(group);
  const oc = cardSettings.overlayColor || '#1a1a1a';
  const oo = (cardSettings.overlayOpacity != null ? cardSettings.overlayOpacity : 70) / 100;
  const overlayHex = Math.round(oo * 255).toString(16).padStart(2, '0');

  const placeholderSvg = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600"><rect width="400" height="600" fill="#2a2622"/><text x="200" y="280" text-anchor="middle" font-family="Georgia,serif" font-size="48" font-weight="300" fill="rgba(138,127,118,0.3)">${badge}</text></svg>`
  )}`;

  return (
    <Link href={`/group/${group.slug}`} className="model-card block relative overflow-hidden bg-card-bg cursor-pointer">
      <div className="relative overflow-hidden" style={{ paddingTop: '135%' }}>
        {group.image ? (
          <Image
            src={group.image}
            alt={group.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            className="card-img object-cover"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={placeholderSvg}
            alt={group.name}
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

        {/* Badge */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="font-sans bg-rose px-3 py-[3px] text-[10px] font-extrabold tracking-[0.1em] text-card-bg uppercase">
            {badge}
          </span>
        </div>

        {/* Name + member count */}
        <div className="absolute bottom-0 left-0 right-0 px-[18px] py-4">
          <div className="card-name font-serif text-2xl font-medium text-white leading-[1.1] transition-[letter-spacing] duration-[600ms] ease-in-out">
            {group.name}
          </div>
          <div className="font-sans text-[10px] font-semibold tracking-[0.14em] text-white/60 uppercase mt-1">
            {(group.member_ids || []).length} models
          </div>
        </div>
      </div>
    </Link>
  );
}
