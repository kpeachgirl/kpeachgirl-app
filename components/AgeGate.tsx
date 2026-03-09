'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'age_verified';

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    setVerified(stored === 'true');
    setTimeout(() => setShow(true), 80);
  }, []);

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
          Age Verification Required
        </div>

        {/* Description */}
        <p className="font-sans text-[13px] text-muted leading-[1.7] mb-8">
          This website contains content intended for adults. By entering, you
          confirm you are at least{' '}
          <strong className="text-charcoal">18 years of age</strong> and agree
          to our Terms&nbsp;of&nbsp;Service.
        </p>

        {/* Enter button */}
        <button
          onClick={handleVerify}
          className="font-sans w-full py-3.5 bg-charcoal text-cream border-none text-xs font-bold tracking-[0.15em] uppercase cursor-pointer transition-colors duration-300 hover:bg-rose"
        >
          I am 18 or older &mdash; Enter
        </button>

        {/* Leave button */}
        <button
          onClick={() => window.history.back()}
          className="font-sans w-full py-3 mt-2 bg-transparent text-sand border border-sand text-[11px] font-semibold tracking-[0.12em] uppercase cursor-pointer"
        >
          Leave Site
        </button>

        {/* Footer */}
        <p className="font-sans text-[10px] text-sand mt-6 leading-[1.5]">
          All models are 18+. Unauthorized use prohibited.
        </p>
      </div>
    </div>
  );
}
