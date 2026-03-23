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
    .select('visitor_id')
    .gte('created_at', fiveMinAgo.toISOString());
  const liveVisitors = new Set(liveData?.map(r => r.visitor_id) || []).size;

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

  // Recent activity (last 20 page views)
  const { data: recentData } = await supabase
    .from('page_views')
    .select('path, visitor_id, created_at, referrer')
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({
    liveVisitors,
    todayViews: todayViews || 0,
    todayUnique,
    weekViews: weekViews || 0,
    monthViews: monthViews || 0,
    topPages,
    topReferrers,
    dailyViews,
    recentActivity: recentData || [],
  });
}
