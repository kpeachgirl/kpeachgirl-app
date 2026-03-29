'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/i18n';
import type { Profile } from '@/lib/types';

interface TelegramTabProps {
  lang: 'en' | 'ko';
}

export default function TelegramTab({ lang }: TelegramTabProps) {
  const t = useTranslation(lang);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [postType, setPostType] = useState<'custom' | 'featured' | 'special'>('custom');
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [specialTitle, setSpecialTitle] = useState('');
  const [specialDetails, setSpecialDetails] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{ type: string; text: string; time: string }[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('profiles')
      .select('id, name, slug, region, profile_image')
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (data) setProfiles(data as Profile[]);
      });
  }, []);

  const handleSend = async () => {
    setSending(true);
    setError('');
    setSent(false);

    try {
      const res = await fetch('/api/telegram-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: postType,
          message,
          modelId: selectedModel,
          specialTitle,
          specialDetails,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send');
      }

      setSent(true);
      setHistory(prev => [{
        type: postType,
        text: postType === 'custom' ? message : postType === 'featured' ? `Featured: ${profiles.find(p => p.id === selectedModel)?.name}` : specialTitle,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      }, ...prev]);

      // Reset form
      setMessage('');
      setSelectedModel('');
      setSpecialTitle('');
      setSpecialDetails('');
      setTimeout(() => setSent(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const cardStyle = {
    background: '#181716',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 24,
    marginBottom: 16,
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: '#1e1d1b',
    border: '1px solid var(--sand)',
    borderRadius: 8,
    color: 'var(--charcoal)',
    fontSize: 14,
    fontFamily: 'var(--font-sans)',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700 as const,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--muted)',
    fontFamily: 'var(--font-sans)',
    marginBottom: 8,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400, color: 'var(--charcoal)', margin: 0 }}>
          Telegram Channel
        </h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
          Send posts to Kpeachgirl VIP channel
        </p>
      </div>

      {/* Post Type Selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([
          { id: 'custom', label: 'Custom Post' },
          { id: 'featured', label: 'Feature Model' },
          { id: 'special', label: 'Special / Promo' },
        ] as const).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setPostType(id)}
            style={{
              padding: '8px 18px',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-sans)',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              background: postType === id ? 'var(--charcoal)' : '#1e1d1b',
              color: postType === id ? 'var(--cream)' : 'var(--muted)',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Custom Post */}
      {postType === 'custom' && (
        <div style={cardStyle}>
          <label style={labelStyle}>Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message to the channel..."
            rows={5}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
      )}

      {/* Feature Model */}
      {postType === 'featured' && (
        <div style={cardStyle}>
          <label style={labelStyle}>Select Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">Choose a model...</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name} — {p.region}</option>
            ))}
          </select>

          {selectedModel && (() => {
            const model = profiles.find(p => p.id === selectedModel);
            if (!model) return null;
            return (
              <div style={{ marginTop: 16, padding: 16, background: '#1e1d1b', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 16 }}>
                {model.profile_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={model.profile_image}
                    alt={model.name}
                    style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 6 }}
                  />
                )}
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--charcoal)' }}>{model.name}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{model.region}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--rose)', marginTop: 4 }}>kpeachgirl.com/model/{model.slug}</div>
                </div>
              </div>
            );
          })()}

          <label style={{ ...labelStyle, marginTop: 16 }}>Custom Note (optional)</label>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a note about this model..."
            style={inputStyle}
          />
        </div>
      )}

      {/* Special / Promo */}
      {postType === 'special' && (
        <div style={cardStyle}>
          <label style={labelStyle}>Special Title</label>
          <input
            value={specialTitle}
            onChange={(e) => setSpecialTitle(e.target.value)}
            placeholder="e.g. Weekend Special, New Year Promo..."
            style={{ ...inputStyle, marginBottom: 16 }}
          />

          <label style={labelStyle}>Details</label>
          <textarea
            value={specialDetails}
            onChange={(e) => setSpecialDetails(e.target.value)}
            placeholder="Describe the special or promo details..."
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', marginBottom: 16 }}
          />

          <label style={labelStyle}>Select Model (optional)</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">All models / No specific model</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name} — {p.region}</option>
            ))}
          </select>
        </div>
      )}

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={sending || (postType === 'custom' && !message) || (postType === 'featured' && !selectedModel) || (postType === 'special' && !specialTitle)}
        style={{
          width: '100%',
          padding: '14px 24px',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-sans)',
          border: 'none',
          borderRadius: 8,
          cursor: sending ? 'wait' : 'pointer',
          background: sent ? 'var(--sage)' : 'var(--rose)',
          color: '#fff',
          opacity: sending ? 0.6 : 1,
          transition: 'all 0.2s',
          marginBottom: 24,
        }}
      >
        {sending ? 'Sending...' : sent ? 'Sent to Channel!' : 'Send to Kpeachgirl VIP'}
      </button>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(224,85,85,0.1)', border: '1px solid rgba(224,85,85,0.3)', borderRadius: 8, color: '#e05555', fontSize: 13, fontFamily: 'var(--font-sans)', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Recent Posts */}
      {history.length > 0 && (
        <div style={cardStyle}>
          <div style={labelStyle}>Sent This Session</div>
          {history.map((h, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: i < history.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: h.type === 'featured' ? 'var(--rose)' : h.type === 'special' ? 'var(--peach)' : 'var(--muted)', fontFamily: 'var(--font-sans)', marginRight: 8 }}>
                  {h.type}
                </span>
                <span style={{ fontSize: 13, color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
                  {h.text.length > 50 ? h.text.slice(0, 50) + '...' : h.text}
                </span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{h.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
