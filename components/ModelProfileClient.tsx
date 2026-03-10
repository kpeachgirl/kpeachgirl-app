'use client';

import { useState, useCallback, useRef } from 'react';
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
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const contactRef = useRef<HTMLDivElement>(null);

  const handleNavigate = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const firstName = profile.name.split(' ')[0];

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

  return (
    <div className="grain" style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* ─── Hero Split Section ─── */}
      <div className="fade-up profile-hero" style={{ paddingTop: 72 }}>
        {/* Cover image */}
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: 350 }}>
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

          {/* Contact button */}
          {!profile.vacation && (
            <button
              onClick={() => { setShowContact(true); setContactStatus('idle'); }}
              className="font-sans self-start transition-colors duration-300 hover:!bg-[var(--rose)]"
              style={{
                padding: '14px 36px',
                background: 'var(--charcoal)',
                color: 'var(--cream)',
                border: 'none',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Contact {firstName}
            </button>
          )}

          {/* Contact modal */}
          {showContact && (
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
              onClick={(e) => { if (e.target === e.currentTarget) setShowContact(false); }}
            >
              <div ref={contactRef} style={{ background: 'var(--warm)', border: '1px solid var(--sand)', borderRadius: 12, padding: 28, width: '100%', maxWidth: 440, fontFamily: 'var(--font-sans)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--charcoal)', margin: 0 }}>
                    Contact {firstName}
                  </h3>
                  <button onClick={() => setShowContact(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer' }}>x</button>
                </div>
                {contactStatus === 'sent' ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ color: 'var(--sage)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Message Sent!</div>
                    <p style={{ color: 'var(--muted)', fontSize: 13 }}>We&apos;ll forward your message to {firstName}.</p>
                    <button onClick={() => setShowContact(false)} style={{ marginTop: 16, padding: '10px 24px', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Close</button>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Your Name</label>
                      <input value={contactForm.name} onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: '8px 12px', background: 'var(--input-bg)', border: '1px solid var(--sand)', color: 'var(--charcoal)', fontSize: 13 }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Your Email</label>
                      <input type="email" value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} style={{ width: '100%', padding: '8px 12px', background: 'var(--input-bg)', border: '1px solid var(--sand)', color: 'var(--charcoal)', fontSize: 13 }} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Message</label>
                      <textarea value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} rows={4} style={{ width: '100%', padding: '8px 12px', background: 'var(--input-bg)', border: '1px solid var(--sand)', color: 'var(--charcoal)', fontSize: 13, resize: 'vertical' }} />
                    </div>
                    {contactStatus === 'error' && (
                      <div style={{ color: 'var(--rose)', fontSize: 12, marginBottom: 10 }}>Failed to send. Please try again.</div>
                    )}
                    <button
                      disabled={contactStatus === 'sending' || !contactForm.name || !contactForm.email || !contactForm.message}
                      onClick={async () => {
                        setContactStatus('sending');
                        try {
                          const res = await fetch('/api/contact', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...contactForm, modelName: profile.name }),
                          });
                          if (!res.ok) throw new Error();
                          setContactStatus('sent');
                          setContactForm({ name: '', email: '', message: '' });
                        } catch { setContactStatus('error'); }
                      }}
                      style={{
                        width: '100%', padding: '12px 0', background: contactStatus === 'sending' ? 'var(--sand)' : 'var(--charcoal)', color: 'var(--cream)', border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                        cursor: contactStatus === 'sending' ? 'wait' : 'pointer', opacity: (!contactForm.name || !contactForm.email || !contactForm.message) ? 0.4 : 1,
                      }}
                    >
                      {contactStatus === 'sending' ? 'Sending...' : 'Send Message'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
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
            {gallery.map((img, i) => (
              <div
                key={img.id}
                className="gallery-item"
                onClick={() => setLightboxIndex(i)}
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
            ))}
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
          images={gallery.map((img) => img.url)}
          currentIndex={lightboxIndex}
          onClose={handleClose}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
