import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  // Verify admin auth
  const serverClient = createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Live visitors (unique visitor_ids in last 5 min)
  const { data: liveData } = await supabase
    .from('page_views')
    .select('visitor_id, city, region, country, path, created_at, device_type, browser, os')
    .gte('created_at', fiveMinAgo.toISOString());
  const liveVisitorMap = new Map<string, { city: string | null; region: string | null; country: string | null; path: string; created_at: string; device_type: string | null; browser: string | null; os: string | null }>();
  liveData?.forEach(r => {
    if (!liveVisitorMap.has(r.visitor_id)) {
      liveVisitorMap.set(r.visitor_id, { city: r.city, region: r.region, country: r.country, path: r.path, created_at: r.created_at, device_type: r.device_type, browser: r.browser, os: r.os });
    }
  });
  const liveVisitors = liveVisitorMap.size;
  const liveVisitorDetails = Array.from(liveVisitorMap.entries()).map(([id, info]) => ({
    visitor_id: id,
    city: info.city,
    region: info.region,
    country: info.country,
    path: info.path,
    created_at: info.created_at,
    device_type: info.device_type,
    browser: info.browser,
    os: info.os,
  }));

  // Today's views
  const { count: todayViews } = await supabase
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', todayStart.toISOString());

  // Today's unique visitors
  const { data: todayUniqueData } = await supabase
    .from('page_views')
    .select('visitor_id')
    .gte('created_at', todayStart.toISOString());
  const todayUnique = new Set(todayUniqueData?.map(r => r.visitor_id) || []).size;

  // 7-day views
  const { count: weekViews } = await supabase
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString());

  // 30-day views
  const { count: monthViews } = await supabase
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Popular pages (last 7 days)
  const { data: pageData } = await supabase
    .from('page_views')
    .select('path')
    .gte('created_at', sevenDaysAgo.toISOString());

  const pageCounts: Record<string, number> = {};
  pageData?.forEach(r => {
    pageCounts[r.path] = (pageCounts[r.path] || 0) + 1;
  });
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, views]) => ({ path, views }));

  // Referrers (last 7 days)
  const { data: refData } = await supabase
    .from('page_views')
    .select('referrer')
    .gte('created_at', sevenDaysAgo.toISOString())
    .not('referrer', 'is', null);

  const refCounts: Record<string, number> = {};
  refData?.forEach(r => {
    if (r.referrer) {
      try {
        const host = new URL(r.referrer).hostname;
        refCounts[host] = (refCounts[host] || 0) + 1;
      } catch {
        refCounts[r.referrer] = (refCounts[r.referrer] || 0) + 1;
      }
    }
  });
  const topReferrers = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([source, views]) => ({ source, views }));

  // Top locations (last 30 days)
  const { data: locationData } = await supabase
    .from('page_views')
    .select('city, region, country, visitor_id')
    .gte('created_at', thirtyDaysAgo.toISOString());

  const locationCounts: Record<string, { visitors: Set<string>; views: number; city: string; region: string; country: string }> = {};
  locationData?.forEach(r => {
    if (r.city || r.region || r.country) {
      const key = [r.city, r.region, r.country].filter(Boolean).join('|');
      if (!locationCounts[key]) {
        locationCounts[key] = { visitors: new Set(), views: 0, city: r.city || '', region: r.region || '', country: r.country || '' };
      }
      locationCounts[key].views++;
      locationCounts[key].visitors.add(r.visitor_id);
    }
  });
  const topLocations = Object.values(locationCounts)
    .sort((a, b) => b.visitors.size - a.visitors.size)
    .slice(0, 15)
    .map(loc => ({
      city: loc.city,
      region: loc.region,
      country: loc.country,
      visitors: loc.visitors.size,
      views: loc.views,
    }));

  // Country breakdown
  const countryCounts: Record<string, { visitors: Set<string>; views: number }> = {};
  locationData?.forEach(r => {
    if (r.country) {
      if (!countryCounts[r.country]) {
        countryCounts[r.country] = { visitors: new Set(), views: 0 };
      }
      countryCounts[r.country].views++;
      countryCounts[r.country].visitors.add(r.visitor_id);
    }
  });
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1].visitors.size - a[1].visitors.size)
    .slice(0, 10)
    .map(([country, data]) => ({ country, visitors: data.visitors.size, views: data.views }));

  // Device/Browser/OS breakdown (last 30 days)
  const { data: deviceData } = await supabase
    .from('page_views')
    .select('device_type, browser, os, language, visitor_id')
    .gte('created_at', thirtyDaysAgo.toISOString());

  const deviceCounts: Record<string, number> = {};
  const browserCounts: Record<string, number> = {};
  const osCounts: Record<string, number> = {};
  const langCounts: Record<string, number> = {};
  deviceData?.forEach(r => {
    if (r.device_type) deviceCounts[r.device_type] = (deviceCounts[r.device_type] || 0) + 1;
    if (r.browser) browserCounts[r.browser] = (browserCounts[r.browser] || 0) + 1;
    if (r.os) osCounts[r.os] = (osCounts[r.os] || 0) + 1;
    if (r.language) {
      const lang = r.language.split('-')[0].toUpperCase();
      langCounts[lang] = (langCounts[lang] || 0) + 1;
    }
  });

  const toSorted = (obj: Record<string, number>) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

  const devices = toSorted(deviceCounts);
  const browsers = toSorted(browserCounts);
  const operatingSystems = toSorted(osCounts);
  const languages = toSorted(langCounts);

  // Views per day (last 7 days) for chart
  const dailyViews: { date: string; views: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const { count } = await supabase
      .from('page_views')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', dayStart.toISOString())
      .lte('created_at', dayEnd.toISOString());

    dailyViews.push({
      date: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      views: count || 0,
    });
  }

  // Recent activity (last 20 page views with location)
  const { data: recentData } = await supabase
    .from('page_views')
    .select('path, visitor_id, created_at, referrer, city, region, country, device_type, browser, os')
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({
    liveVisitors,
    liveVisitorDetails,
    todayViews: todayViews || 0,
    todayUnique,
    weekViews: weekViews || 0,
    monthViews: monthViews || 0,
    topPages,
    topReferrers,
    topLocations,
    topCountries,
    devices,
    browsers,
    operatingSystems,
    languages,
    dailyViews,
    recentActivity: recentData || [],
  });
}
