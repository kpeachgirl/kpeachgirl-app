'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';

interface AnalyticsData {
  liveVisitors: number;
  todayViews: number;
  todayUnique: number;
  weekViews: number;
  monthViews: number;
  topPages: { path: string; views: number }[];
  topReferrers: { source: string; views: number }[];
  dailyViews: { date: string; views: number }[];
  recentActivity: { path: string; visitor_id: string; created_at: string; referrer: string | null }[];
}

interface AnalyticsTabProps {
  lang: 'en' | 'ko';
}

export default function AnalyticsTab({ lang }: AnalyticsTabProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const t = useTranslation(lang);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const cardStyle = {
    background: '#181716',
    border: '1px solid var(--sand)',
    borderRadius: 12,
    padding: '24px',
  };

  const labelStyle = {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    fontWeight: 700 as const,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'var(--muted)',
    marginBottom: 8,
  };

  const bigNumberStyle = {
    fontFamily: 'var(--font-serif)',
    fontWeight: 300 as const,
    color: 'var(--charcoal)',
    lineHeight: 1,
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)', fontFamily: 'var(--font-sans)', fontSize: 14 }}>
        {t.loading}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)', fontFamily: 'var(--font-sans)', fontSize: 14 }}>
        Failed to load analytics. Make sure the page_views table exists in Supabase.
      </div>
    );
  }

  const maxDailyViews = Math.max(...data.dailyViews.map(d => d.views), 1);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, color: 'var(--charcoal)', margin: 0 }}>
            {lang === 'ko' ? '\ub300\uc2dc\ubcf4\ub4dc' : 'Dashboard'}
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
            {lang === 'ko' ? '\uc2e4\uc2dc\uac04 \uc0ac\uc774\ud2b8 \ud1b5\uacc4' : 'Real-time site analytics'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6, margin: 0, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ accentColor: 'var(--rose)' }}
            />
            {lang === 'ko' ? '\uc790\ub3d9 \uc0c8\ub85c\uace0\uce68' : 'Auto-refresh'}
          </label>
          <button
            onClick={fetchData}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid var(--sand)',
              background: 'transparent',
              color: 'var(--muted)',
              cursor: 'pointer',
            }}
          >
            {lang === 'ko' ? '\uc0c8\ub85c\uace0\uce68' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Live Visitors */}
        <div style={cardStyle}>
          <div style={labelStyle}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#4ade80', marginRight: 6, animation: 'pulse 2s infinite' }} />
            {lang === 'ko' ? '\uc2e4\uc2dc\uac04 \ubc29\ubb38\uc790' : 'Live Now'}
          </div>
          <div style={{ ...bigNumberStyle, fontSize: 42, color: '#4ade80' }}>
            {data.liveVisitors}
          </div>
        </div>

        {/* Today Views */}
        <div style={cardStyle}>
          <div style={labelStyle}>{lang === 'ko' ? '\uc624\ub298 \uc870\ud68c\uc218' : 'Today Views'}</div>
          <div style={{ ...bigNumberStyle, fontSize: 42 }}>{data.todayViews}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
            {data.todayUnique} {lang === 'ko' ? '\uace0\uc720 \ubc29\ubb38\uc790' : 'unique'}
          </div>
        </div>

        {/* 7-Day Views */}
        <div style={cardStyle}>
          <div style={labelStyle}>{lang === 'ko' ? '7\uc77c \uc870\ud68c\uc218' : '7-Day Views'}</div>
          <div style={{ ...bigNumberStyle, fontSize: 42 }}>{data.weekViews}</div>
        </div>

        {/* 30-Day Views */}
        <div style={cardStyle}>
          <div style={labelStyle}>{lang === 'ko' ? '30\uc77c \uc870\ud68c\uc218' : '30-Day Views'}</div>
          <div style={{ ...bigNumberStyle, fontSize: 42 }}>{data.monthViews}</div>
        </div>
      </div>

      {/* ─── Bar Chart (7-day) ─── */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ ...labelStyle, marginBottom: 20 }}>{lang === 'ko' ? '\uc8fc\uac04 \ud2b8\ub798\ud53d' : 'Weekly Traffic'}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
          {data.dailyViews.map((day, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--muted)' }}>
                {day.views}
              </span>
              <div
                style={{
                  width: '100%',
                  maxWidth: 48,
                  height: `${Math.max((day.views / maxDailyViews) * 100, 4)}%`,
                  background: i === data.dailyViews.length - 1 ? 'var(--rose)' : 'var(--sand)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease',
                  minHeight: 4,
                }}
              />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, color: 'var(--muted)', textAlign: 'center' }}>
                {day.date.split(',')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Two-column: Top Pages + Referrers ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Top Pages */}
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: 16 }}>{lang === 'ko' ? '\uc778\uae30 \ud398\uc774\uc9c0' : 'Top Pages'}</div>
          {data.topPages.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)' }}>
              {lang === 'ko' ? '\ub370\uc774\ud130 \uc5c6\uc74c' : 'No data yet'}
            </div>
          ) : (
            data.topPages.map((page, i) => (
              <div
                key={page.path}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: i < data.topPages.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                  {page.path}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--rose)' }}>
                  {page.views}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Top Referrers */}
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: 16 }}>{lang === 'ko' ? '\uc720\uc785 \uacbd\ub85c' : 'Top Referrers'}</div>
          {data.topReferrers.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)' }}>
              {lang === 'ko' ? '\ub370\uc774\ud130 \uc5c6\uc74c' : 'No data yet'}
            </div>
          ) : (
            data.topReferrers.map((ref, i) => (
              <div
                key={ref.source}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: i < data.topReferrers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--charcoal)' }}>
                  {ref.source}
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--sage)' }}>
                  {ref.views}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Recent Activity Feed ─── */}
      <div style={cardStyle}>
        <div style={{ ...labelStyle, marginBottom: 16 }}>{lang === 'ko' ? '\ucd5c\uadfc \ud65c\ub3d9' : 'Recent Activity'}</div>
        {data.recentActivity.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)' }}>
            {lang === 'ko' ? '\ud65c\ub3d9 \uc5c6\uc74c' : 'No activity yet'}
          </div>
        ) : (
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {data.recentActivity.map((entry, i) => {
              const time = new Date(entry.created_at);
              const ago = getTimeAgo(time, lang);
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: i < data.recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--rose-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lang === 'ko' ? '\ubc29\ubb38\uc790' : 'Visitor'} #{entry.visitor_id.slice(0, 6)} &rarr; <strong>{entry.path}</strong>
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--muted)' }}>
                      {ago}{entry.referrer ? ` · from ${entry.referrer}` : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

function getTimeAgo(date: Date, lang: 'en' | 'ko'): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return lang === 'ko' ? `${seconds}\ucd08 \uc804` : `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return lang === 'ko' ? `${minutes}\ubd84 \uc804` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return lang === 'ko' ? `${hours}\uc2dc\uac04 \uc804` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return lang === 'ko' ? `${days}\uc77c \uc804` : `${days}d ago`;
}
