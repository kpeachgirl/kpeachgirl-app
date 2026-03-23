'use client';

import { useEffect, useCallback, useRef } from 'react';

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ images, currentIndex, onClose, onNavigate }: LightboxProps) {
  const touchStartX = useRef<number | null>(null);

  const handlePrev = useCallback(() => {
    onNavigate(Math.max(0, currentIndex - 1));
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate(Math.min(images.length - 1, currentIndex + 1));
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, handlePrev, handleNext]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handlePrev();
      else handleNext();
    }
    touchStartX.current = null;
  };

  return (
    <div
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="fixed inset-0 z-[2000] flex items-center justify-center cursor-zoom-out"
      style={{
        background: 'rgba(0, 0, 0, 0.96)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Previous button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        className="font-sans absolute left-6 bg-transparent border border-white/15 text-white w-11 h-11 cursor-pointer text-lg hover:border-white/30 transition-colors"
        aria-label="Previous image"
      >
        &#8249;
      </button>

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[currentIndex]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="cursor-default"
        style={{ maxHeight: '88vh', maxWidth: '88vw', objectFit: 'contain' }}
      />

      {/* Next button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        className="font-sans absolute right-6 bg-transparent border border-white/15 text-white w-11 h-11 cursor-pointer text-lg hover:border-white/30 transition-colors"
        aria-label="Next image"
      >
        &#8250;
      </button>

      {/* Counter */}
      <span className="font-sans absolute bottom-7 text-white/30 text-[11px] tracking-[0.15em]">
        {currentIndex + 1} / {images.length}
      </span>
    </div>
  );
}
