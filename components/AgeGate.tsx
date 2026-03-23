'use client';

import { useState, useEffect } from 'react';
import type { AgeGateConfig } from '@/lib/types';
import { DEFAULT_AGE_GATE } from '@/lib/constants';

const STORAGE_KEY = 'age_verified';

interface AgeGateProps {
  children: React.ReactNode;
  config?: AgeGateConfig;
}

export default function AgeGate({ children, config }: AgeGateProps) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [show, setShow] = useState(false);

  const c = config || DEFAULT_AGE_GATE;

  useEffect(() => {
    // If age gate is disabled, auto-verify
    if (!c.enabled) {
      setVerified(true);
      return;
    }
    const stored = sessionStorage.getItem(STORAGE_KEY);
    setVerified(stored === 'true');
    setTimeout(() => setShow(true), 80);
  }, [c.enabled]);

  const handleVerify = () => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setVerified(true);
  };

  // SSR + initial hydration: render nothing to prevent flash
  if (verified === null) return null;
  if (verified) return <>{children}</>;

  return (
    <div className="font-sans fixed inset-0 z-[9999] bg-cream flex items-center justify-center">
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, var(--charcoal) 0px, var(--charcoal) 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, var(--charcoal) 0px, var(--charcoal) 1px, transparent 1px, transparent 80px)',
        }}
      />

      <div
        className="relative text-center border border-sand bg-card-bg"
        style={{
          maxWidth: 420,
          padding: '56px 44px',
          transform: show ? 'translateY(0)' : 'translateY(20px)',
          opacity: show ? 1 : 0,
          transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Logo */}
        <div className="font-serif text-[42px] font-light tracking-[-0.02em] text-charcoal leading-none">
          K<span className="text-rose">peach</span>girl
        </div>

        {/* Divider */}
        <div className="w-10 h-px bg-rose mx-auto my-5" />

        {/* Heading */}
        <div className="font-sans text-[11px] font-bold tracking-[0.2em] text-rose mb-2 uppercase">
          {c.heading}
        </div>

        {/* Description */}
        <p className="font-sans text-[13px] text-muted leading-[1.7] mb-8">
          {c.body}
        </p>

        {/* Enter button */}
        <button
          onClick={handleVerify}
          className="font-sans w-full py-3.5 bg-charcoal text-cream border-none text-xs font-bold tracking-[0.15em] uppercase cursor-pointer transition-colors duration-300 hover:bg-rose"
        >
          {c.enterButton}
        </button>

        {/* Leave button */}
        <button
          onClick={() => window.history.back()}
          className="font-sans w-full py-3 mt-2 bg-transparent text-sand border border-sand text-[11px] font-semibold tracking-[0.12em] uppercase cursor-pointer"
        >
          {c.leaveButton}
        </button>

        {/* Footer */}
        <p className="font-sans text-[10px] text-sand mt-6 leading-[1.5]">
          {c.disclaimer}
        </p>
      </div>
    </div>
  );
}
