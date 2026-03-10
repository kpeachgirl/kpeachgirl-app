'use client';

import { useState, useRef, useCallback } from 'react';
import type { CropData } from '@/lib/types';

interface PhotoEditorProps {
  src: string;
  crop: CropData | null;
  aspect: string;
  onSave: (crop: CropData) => void;
  onCancel: () => void;
  translations: Record<string, string>;
}

export default function PhotoEditor({ src, crop, aspect, onSave, onCancel, translations: t }: PhotoEditorProps) {
  const [pos, setPos] = useState({ x: crop?.x ?? 50, y: crop?.y ?? 50 });
  const [zoom, setZoom] = useState(crop?.zoom ?? 100);
  const dragging = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!dragging.current || !frameRef.current) return;
    const r = frameRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - r.top) / r.height) * 100));
    setPos({ x, y });
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!frameRef.current) return;
    const r = frameRef.current.getBoundingClientRect();
    setPos({
      x: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)),
    });
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}>
      <div className="sans" style={{ background: '#181716', maxWidth: 520, width: '90%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--sand)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--charcoal)' }}>{t.editPhoto || 'Edit Photo'}</div>
          <button onClick={onCancel} style={{ background: 'none', border: '1px solid var(--sand)', width: 28, height: 28, cursor: 'pointer', fontSize: 14, color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope,sans-serif' }}>
            &times;
          </button>
        </div>

        {/* Preview frame */}
        <div style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>
            {t.focalPoint || 'Click to set focal point'}
          </p>
          <div
            ref={frameRef}
            style={{ position: 'relative', width: '100%', aspectRatio: aspect || '2/3', overflow: 'hidden', border: '1px solid var(--sand)', cursor: 'crosshair', background: '#000' }}
            onMouseDown={() => { dragging.current = true; }}
            onMouseUp={() => { dragging.current = false; }}
            onMouseLeave={() => { dragging.current = false; }}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onClick={handleClick}
            onTouchStart={() => { dragging.current = true; }}
            onTouchEnd={() => { dragging.current = false; }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              if (touch) handleMove(touch.clientX, touch.clientY);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover',
                objectPosition: `${pos.x}% ${pos.y}%`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: `${pos.x}% ${pos.y}%`,
                transition: 'transform 0.15s ease',
              }}
            />
            {/* Crosshair indicator */}
            <div style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 2 }}>
              <div style={{ width: 24, height: 24, border: '2px solid #fff', borderRadius: '50%', boxShadow: '0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.3)' }} />
              <div style={{ position: 'absolute', left: 11, top: -8, width: 2, height: 8, background: '#181716', boxShadow: '0 0 2px rgba(0,0,0,0.5)' }} />
              <div style={{ position: 'absolute', left: 11, top: 24, width: 2, height: 8, background: '#181716', boxShadow: '0 0 2px rgba(0,0,0,0.5)' }} />
              <div style={{ position: 'absolute', top: 11, left: -8, width: 8, height: 2, background: '#181716', boxShadow: '0 0 2px rgba(0,0,0,0.5)' }} />
              <div style={{ position: 'absolute', top: 11, left: 24, width: 8, height: 2, background: '#181716', boxShadow: '0 0 2px rgba(0,0,0,0.5)' }} />
            </div>
          </div>

          {/* Zoom slider */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase' }}>{t.zoom || 'Zoom'}</span>
              <span style={{ fontSize: 12, color: 'var(--charcoal)', fontWeight: 600 }}>{zoom}%</span>
            </div>
            <input type="range" min="100" max="200" value={zoom} onChange={(e) => setZoom(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--rose)' }} />
          </div>

          {/* Position readout */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>X: <strong style={{ color: 'var(--charcoal)' }}>{Math.round(pos.x)}%</strong></div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Y: <strong style={{ color: 'var(--charcoal)' }}>{Math.round(pos.y)}%</strong></div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--sand)', display: 'flex', gap: 10 }}>
          <button
            onClick={() => onSave({ x: Math.round(pos.x), y: Math.round(pos.y), zoom })}
            style={{ flex: 1, padding: '10px 0', background: 'var(--charcoal)', color: 'var(--cream)', border: 'none', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Manrope,sans-serif' }}
          >
            {t.applyCrop || 'Apply'}
          </button>
          <button
            onClick={() => { setPos({ x: 50, y: 50 }); setZoom(100); }}
            style={{ padding: '10px 16px', border: '1px solid var(--sand)', background: 'transparent', color: 'var(--muted)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Manrope,sans-serif' }}
          >
            {t.resetCrop || 'Reset'}
          </button>
          <button
            onClick={onCancel}
            style={{ padding: '10px 16px', border: '1px solid var(--sand)', background: 'transparent', color: 'var(--muted)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Manrope,sans-serif' }}
          >
            {t.cancel || 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
