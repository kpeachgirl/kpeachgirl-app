'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', CA: '🇨🇦', MX: '🇲🇽', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', JP: '🇯🇵', KR: '🇰🇷',
  CN: '🇨🇳', AU: '🇦🇺', BR: '🇧🇷', IN: '🇮🇳', IT: '🇮🇹', ES: '🇪🇸', NL: '🇳🇱', SE: '🇸🇪',
  PH: '🇵🇭', TH: '🇹🇭', SG: '🇸🇬', RU: '🇷🇺', PL: '🇵🇱', AR: '🇦🇷', CO: '🇨🇴', CL: '🇨🇱',
};

const REGION_NAMES: Record<string, string> = {
  CA: 'California', NY: 'New York', TX: 'Texas', FL: 'Florida', IL: 'Illinois',
  WA: 'Washington', NV: 'Nevada', AZ: 'Arizona', OR: 'Oregon', CO: 'Colorado',
  GA: 'Georgia', NC: 'North Carolina', PA: 'Pennsylvania', OH: 'Ohio', MI: 'Michigan',
  NJ: 'New Jersey', VA: 'Virginia', MA: 'Massachusetts', TN: 'Tennessee', MD: 'Maryland',
};

interface BreakdownEntry {
  name: string;
  count: number;
}

interface LiveVisitor {
  visitor_id: string;
  city: string | null;
  region: string | null;
  country: string | null;
  path: string;
  created_at: string;
  device_type: string | null;
  browser: string | null;
  os: string | null;
}

interface LocationEntry {
  city: string;
  region: string;
  country: string;
  visitors: number;
  views: number;
}

interface CountryEntry {
  country: string;
  visitors: number;
  views: number;
}

interface AnalyticsData {
  liveVisitors: number;
  liveVisitorDetails: LiveVisitor[];
  todayViews: number;
  todayUnique: number;
  weekViews: number;
  monthViews: number;
  topPages: { path: string; views: number }[];
  topReferrers: { source: string; views: number }[];
  topLocations: LocationEntry[];
  topCountries: CountryEntry[];
  devices: BreakdownEntry[];
  browsers: BreakdownEntry[];
  operatingSystems: BreakdownEntry[];
  languages: BreakdownEntry[];
  dailyViews: { date: string; views: number }[];
  recentActivity: { path: string; visitor_id: string; created_at: string; referrer: string | null; city: string | null; region: string | null; country: string | null; device_type: string | null; browser: string | null; os: string | null }[];
}

interface AnalyticsTabProps {
  lang: 'en' | 'ko';
}

function formatLocation(city: string | null, region: string | null, country: string | null): string {
  const regionName = region && REGION_NAMES[region] ? REGION_NAMES[region] : region;
  const parts = [city, regionName, country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Unknown';
}

function formatLocationShort(city: string | null, region: string | null, country: string | null): string {
  const flag = country ? (COUNTRY_FLAGS[country] || '') : '';
  const regionName = region && REGION_NAMES[region] ? REGION_NAMES[region] : region;
  if (city && regionName) return `${flag} ${city}, ${regionName}`;
  if (city) return `${flag} ${city}`;
  if (regionName && country) return `${flag} ${regionName}, ${country}`;
  if (country) return `${flag} ${country}`;
  return 'Unknown';
}

interface GAData {
  realtime: { total: number; locations: { country: string; city: string; users: number }[] };
  ageBrackets: { age: string; users: number; sessions: number }[];
  genderData: { gender: string; users: number; sessions: number }[];
  interests: { interest: string; users: number }[];
  error?: string;
}

const GENDER_COLORS: Record<string, string> = {
  male: '#5b9bd5',
  female: '#d4758a',
};

const GENDER_LABELS: Record<string, Record<string, string>> = {
  en: { male: 'Male', female: 'Female', other: 'Other' },
  ko: { male: '남성', female: '여성', other: '기타' },
};

const AGE_COLORS = ['#d4758a', '#e0a08c', '#8fad8f', '#5b9bd5', '#b08fd4', '#d4c78f'];

export default function AnalyticsTab({ lang }: AnalyticsTabProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [gaData, setGaData] = useState<GAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const t = useTranslation(lang);

  const fetchData = useCallback(async () => {
    try {
      const [res, gaRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/ga'),
      ]);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
      if (gaRes.ok) {
        const gaJson = await gaRes.json();
        setGaData(gaJson);
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
  const maxLocationViews = data.topLocations.length > 0 ? Math.max(...data.topLocations.map(l => l.views)) : 1;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, color: 'var(--charcoal)', margin: 0 }}>
            {lang === 'ko' ? '대시보드' : 'Dashboard'}
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)', margin: '4px 0 0' }}>
            {lang === 'ko' ? '실시간 사이트 통계' : 'Real-time site analytics'}
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
            {lang === 'ko' ? '자동 새로고침' : 'Auto-refresh'}
          </label>
          <button
            onClick={fetchData}
            type="button"
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
            {lang === 'ko' ? '새로고침' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Live Visitors */}
        <div style={cardStyle}>
          <div style={labelStyle}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#4ade80', marginRight: 6, animation: 'pulse 2s infinite' }} />
            {lang === 'ko' ? '실시간 방문자' : 'Live Now'}
          </div>
          <div style={{ ...bigNumberStyle, fontSize: 42, color: '#4ade80' }}>
            {data.liveVisitors}
          </div>
        </div>

        {/* Today Views */}
        <div style={cardStyle}>
          <div style={labelStyle}>{lang === 'ko' ? '오늘 조회수' : 'Today Views'}</div>
          <div style={{ ...bigNumberStyle, fontSize: 42 }}>{data.todayViews}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
            {data.todayUnique} {lang === 'ko' ? '고유 방문자' : 'unique'}
          </div>
        </div>

        {/* 7-Day Views */}
        <div style={cardStyle}>
          <div style={labelStyle}>{lang === 'ko' ? '7일 조회수' : '7-Day Views'}</div>
          <div style={{ ...bigNumberStyle, fontSize: 42 }}>{data.weekViews}</div>
        </div>

        {/* 30-Day Views */}
        <div style={cardStyle}>
          <div style={labelStyle}>{lang === 'ko' ? '30일 조회수' : '30-Day Views'}</div>
          <div style={{ ...bigNumberStyle, fontSize: 42 }}>{data.monthViews}</div>
        </div>
      </div>

      {/* ─── Live Visitors Detail ─── */}
      {data.liveVisitorDetails.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <div style={{ ...labelStyle, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} />
            {lang === 'ko' ? '현재 접속 중인 방문자' : 'Visitors Online Right Now'}
          </div>
          {data.liveVisitorDetails.map((v, i) => (
            <div
              key={v.visitor_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                borderBottom: i < data.liveVisitorDetails.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(74, 222, 128, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {v.country ? (COUNTRY_FLAGS[v.country] || '🌍') : '🌍'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--charcoal)', fontWeight: 600 }}>
                  {formatLocation(v.city, v.region, v.country)}
                </div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  {lang === 'ko' ? '보는 중' : 'Viewing'}: <strong style={{ color: 'var(--peach)' }}>{v.path}</strong>
                  {v.device_type && ` · ${v.device_type}`}
                  {v.browser && ` · ${v.browser}`}
                  {v.os && ` · ${v.os}`}
                </div>
              </div>
              <div style={{
                padding: '3px 8px',
                borderRadius: 4,
                background: 'rgba(74, 222, 128, 0.12)',
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                fontWeight: 700,
                color: '#4ade80',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Live
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Bar Chart (7-day) ─── */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ ...labelStyle, marginBottom: 20 }}>{lang === 'ko' ? '주간 트래픽' : 'Weekly Traffic'}</div>
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

      {/* ─── Visitor Locations ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Top Cities/Regions */}
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: 16 }}>
            {lang === 'ko' ? '방문자 위치' : 'Visitor Locations'}
          </div>
          {data.topLocations.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)' }}>
              {lang === 'ko' ? '위치 데이터 수집 중...' : 'Collecting location data...'}
            </div>
          ) : (
            data.topLocations.map((loc, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 0',
                  borderBottom: i < data.topLocations.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--charcoal)' }}>
                    {formatLocationShort(loc.city, loc.region, loc.country)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--muted)' }}>
                    <strong style={{ color: 'var(--rose)', fontWeight: 600 }}>{loc.visitors}</strong> {lang === 'ko' ? '명' : 'visitors'}
                    {' · '}{loc.views} {lang === 'ko' ? '조회' : 'views'}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 4, borderRadius: 2, background: 'var(--sand)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, var(--rose), var(--peach))',
                    width: `${(loc.views / maxLocationViews) * 100}%`,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Countries */}
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: 16 }}>
            {lang === 'ko' ? '국가별 방문자' : 'Countries'}
          </div>
          {data.topCountries.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)' }}>
              {lang === 'ko' ? '데이터 없음' : 'No data yet'}
            </div>
          ) : (
            data.topCountries.map((c, i) => {
              const flag = COUNTRY_FLAGS[c.country] || '🌍';
              const maxCountryViews = data.topCountries[0]?.views || 1;
              return (
                <div
                  key={c.country}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: i < data.topCountries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{flag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--charcoal)', fontWeight: 500 }}>
                        {c.country}
                      </span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--peach)' }}>
                        {c.visitors} {lang === 'ko' ? '명' : 'visitors'}
                      </span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'var(--sand)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        borderRadius: 2,
                        background: 'var(--sage)',
                        width: `${(c.views / maxCountryViews) * 100}%`,
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Google Analytics Demographics ─── */}
      {gaData && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ ...labelStyle, marginBottom: 16, fontSize: 13, letterSpacing: '0.05em' }}>
            {lang === 'ko' ? 'Google Analytics 인사이트' : 'Google Analytics Insights'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Gender */}
            <div style={cardStyle}>
              <div style={{ ...labelStyle, marginBottom: 16 }}>{lang === 'ko' ? '성별' : 'Gender'}</div>
              {gaData.genderData.length === 0 ? (
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)' }}>
                  {lang === 'ko' ? '데이터 수집 중... (24-48시간 소요)' : 'Collecting data... (takes 24-48hrs)'}
                </div>
              ) : (
                <>
                  {/* Donut-style bar */}
                  <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', height: 12, marginBottom: 16 }}>
                    {gaData.genderData.map(g => {
                      const total = gaData.genderData.reduce((s, x) => s + x.users, 0);
                      const pct = total > 0 ? (g.users / total) * 100 : 0;
                      return (
                        <div key={g.gender} style={{ width: `${pct}%`, background: GENDER_COLORS[g.gender] || 'var(--muted)', transition: 'width 0.3s' }} />
                      );
                    })}
                  </div>
                  {gaData.genderData.map(g => {
                    const total = gaData.genderData.reduce((s, x) => s + x.users, 0);
                    const pct = total > 0 ? Math.round((g.users / total) * 100) : 0;
                    return (
                      <div key={g.gender} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--charcoal)', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: GENDER_COLORS[g.gender] || 'var(--muted)', display: 'inline-block' }} />
                          {GENDER_LABELS[lang]?.[g.gender] || g.gender}
                        </span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: GENDER_COLORS[g.gender] || 'var(--charcoal)' }}>
                          {pct}% <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: 11 }}>({g.users})</span>
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Age */}
            <div style={cardStyle}>
              <div style={{ ...labelStyle, marginBottom: 16 }}>{lang === 'ko' ? '연령대' : 'Age Range'}</div>
              {gaData.ageBrackets.length === 0 ? (
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)' }}>
                  {lang === 'ko' ? '데이터 수집 중... (24-48시간 소요)' : 'Collecting data... (takes 24-48hrs)'}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
                  {gaData.ageBrackets.sort((a, b) => a.age.localeCompare(b.age)).map((bracket, i) => {
                    const maxUsers = Math.max(...gaData.ageBrackets.map(b => b.users), 1);
                    const pct = (bracket.users / maxUsers) * 100;
                    return (
                      <div key={bracket.age} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--muted)' }}>{bracket.users}</span>
                        <div style={{
                          width: '100%',
                          height: `${Math.max(pct, 6)}%`,
                          background: AGE_COLORS[i % AGE_COLORS.length],
                          borderRadius: '4px 4px 0 0',
                          minHeight: 6,
                        }} />
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 9, color: 'var(--muted)', textAlign: 'center' }}>{bracket.age}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Interests */}
            <div style={cardStyle}>
              <div style={{ ...labelStyle, marginBottom: 16 }}>{lang === 'ko' ? '관심사' : 'Interests'}</div>
              {gaData.interests.length === 0 ? (
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)' }}>
                  {lang === 'ko' ? '데이터 수집 중... (24-48시간 소요)' : 'Collecting data... (takes 24-48hrs)'}
                </div>
              ) : (
                gaData.interests.slice(0, 8).map((interest, i) => {
                  const maxInt = gaData.interests[0]?.users || 1;
                  return (
                    <div key={interest.interest} style={{
                      padding: '6px 0',
                      borderBottom: i < Math.min(gaData.interests.length, 8) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--charcoal)', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {interest.interest}
                        </span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, color: 'var(--peach)' }}>{interest.users}</span>
                      </div>
                      <div style={{ height: 3, borderRadius: 2, background: 'var(--sand)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, var(--rose), var(--peach))', width: `${(interest.users / maxInt) * 100}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {gaData.error && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--muted)', marginTop: 8, opacity: 0.6 }}>
              GA4 Note: {gaData.error === 'Failed to fetch GA4 data' ? 'Waiting for Google Signals to activate (24-48hrs)' : gaData.error}
            </div>
          )}
        </div>
      )}

      {/* ─── Device & Tech Breakdown ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Devices */}
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: 16 }}>
            {lang === 'ko' ? '기기 유형' : 'Devices'}
          </div>
          {(!data.devices || data.devices.length === 0) ? (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)' }}>
              {lang === 'ko' ? '수집 중...' : 'Collecting...'}
            </div>
          ) : (
            data.devices.map((d, i) => {
              const icon = d.name === 'Mobile' ? '📱' : d.name === 'Tablet' ? '📋' : '💻';
              const total = data.devices.reduce((s, x) => s + x.count, 0);
              const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
              return (
                <div key={d.name} style={{ padding: '8px 0', borderBottom: i < data.devices.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--charcoal)' }}>{icon} {d.name}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--peach)' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--sand)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: 'var(--peach)', width: `${pct}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Browsers */}
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: 16 }}>
            {lang === 'ko' ? '브라우저' : 'Browsers'}
          </div>
          {(!data.browsers || data.browsers.length === 0) ? (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)' }}>
              {lang === 'ko' ? '수집 중...' : 'Collecting...'}
            </div>
          ) : (
            data.browsers.slice(0, 6).map((b, i) => {
              const total = data.browsers.reduce((s, x) => s + x.count, 0);
              const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
              return (
                <div key={b.name} style={{ padding: '8px 0', borderBottom: i < Math.min(data.browsers.length, 6) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--charcoal)' }}>{b.name}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--rose)' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--sand)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: 'var(--rose)', width: `${pct}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Operating Systems */}
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: 16 }}>
            {lang === 'ko' ? '운영체제' : 'Operating Systems'}
          </div>
          {(!data.operatingSystems || data.operatingSystems.length === 0) ? (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)' }}>
              {lang === 'ko' ? '수집 중...' : 'Collecting...'}
            </div>
          ) : (
            data.operatingSystems.slice(0, 6).map((o, i) => {
              const total = data.operatingSystems.reduce((s, x) => s + x.count, 0);
              const pct = total > 0 ? Math.round((o.count / total) * 100) : 0;
              return (
                <div key={o.name} style={{ padding: '8px 0', borderBottom: i < Math.min(data.operatingSystems.length, 6) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--charcoal)' }}>{o.name}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--sage)' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--sand)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: 'var(--sage)', width: `${pct}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Languages */}
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: 16 }}>
            {lang === 'ko' ? '언어' : 'Languages'}
          </div>
          {(!data.languages || data.languages.length === 0) ? (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)' }}>
              {lang === 'ko' ? '수집 중...' : 'Collecting...'}
            </div>
          ) : (
            data.languages.slice(0, 6).map((l, i) => {
              const total = data.languages.reduce((s, x) => s + x.count, 0);
              const pct = total > 0 ? Math.round((l.count / total) * 100) : 0;
              return (
                <div key={l.name} style={{ padding: '8px 0', borderBottom: i < Math.min(data.languages.length, 6) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--charcoal)' }}>{l.name}</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--charcoal)' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--sand)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, var(--rose), var(--peach))', width: `${pct}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Two-column: Top Pages + Referrers ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Top Pages */}
        <div style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: 16 }}>{lang === 'ko' ? '인기 페이지' : 'Top Pages'}</div>
          {data.topPages.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)' }}>
              {lang === 'ko' ? '데이터 없음' : 'No data yet'}
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
          <div style={{ ...labelStyle, marginBottom: 16 }}>{lang === 'ko' ? '유입 경로' : 'Top Referrers'}</div>
          {data.topReferrers.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)' }}>
              {lang === 'ko' ? '데이터 없음' : 'No data yet'}
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
        <div style={{ ...labelStyle, marginBottom: 16 }}>{lang === 'ko' ? '최근 활동' : 'Recent Activity'}</div>
        {data.recentActivity.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--muted)' }}>
            {lang === 'ko' ? '활동 없음' : 'No activity yet'}
          </div>
        ) : (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {data.recentActivity.map((entry, i) => {
              const time = new Date(entry.created_at);
              const ago = getTimeAgo(time, lang);
              const location = formatLocationShort(entry.city, entry.region, entry.country);
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
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--rose-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {entry.country ? (COUNTRY_FLAGS[entry.country] || '🌍') : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: 'var(--peach)' }}>{location}</strong>
                      {' '}&rarr;{' '}
                      <span>{entry.path}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      {ago}
                      {entry.device_type && ` · ${entry.device_type}`}
                      {entry.browser && ` · ${entry.browser}`}
                      {entry.os && ` on ${entry.os}`}
                      {entry.referrer ? ` · from ${entry.referrer}` : ''}
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
  if (seconds < 60) return lang === 'ko' ? `${seconds}초 전` : `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return lang === 'ko' ? `${minutes}분 전` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return lang === 'ko' ? `${hours}시간 전` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return lang === 'ko' ? `${days}일 전` : `${days}d ago`;
}
