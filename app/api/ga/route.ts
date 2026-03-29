import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { createClient as createServerClient } from '@/lib/supabase/server';

const GA_PROPERTY_ID = '529493983';

function getAnalyticsClient() {
  const credentials = {
    client_email: process.env.GA_CLIENT_EMAIL!,
    private_key: process.env.GA_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  };

  return new BetaAnalyticsDataClient({ credentials });
}

export async function GET() {
  // Verify admin auth
  const serverClient = createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = getAnalyticsClient();

    // Run all reports in parallel
    const [realtimeRes, demographicsRes, techRes, interestsRes] = await Promise.all([
      // Realtime active users
      client.runRealtimeReport({
        property: `properties/${GA_PROPERTY_ID}`,
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'country' }, { name: 'city' }],
      }),

      // Demographics (last 30 days)
      client.runReport({
        property: `properties/${GA_PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'userAgeBracket' }],
        metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      }),

      // Gender (last 30 days)
      client.runReport({
        property: `properties/${GA_PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'userGender' }],
        metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      }),

      // Interests (last 30 days)
      client.runReport({
        property: `properties/${GA_PROPERTY_ID}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'brandingInterest' }],
        metrics: [{ name: 'activeUsers' }],
        limit: 10,
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      }),
    ]);

    // Parse realtime
    const realtimeUsers = realtimeRes[0]?.rows?.map(row => ({
      country: row.dimensionValues?.[0]?.value || 'Unknown',
      city: row.dimensionValues?.[1]?.value || 'Unknown',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
    })) || [];
    const totalRealtime = realtimeUsers.reduce((s, r) => s + r.users, 0);

    // Parse age brackets
    const ageBrackets = demographicsRes[0]?.rows?.map(row => ({
      age: row.dimensionValues?.[0]?.value || 'Unknown',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
    }))?.filter(r => r.age !== '(not set)') || [];

    // Parse gender
    const genderData = techRes[0]?.rows?.map(row => ({
      gender: row.dimensionValues?.[0]?.value || 'Unknown',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
      sessions: parseInt(row.metricValues?.[1]?.value || '0'),
    }))?.filter(r => r.gender !== '(not set)') || [];

    // Parse interests
    const interests = interestsRes[0]?.rows?.map(row => ({
      interest: row.dimensionValues?.[0]?.value || 'Unknown',
      users: parseInt(row.metricValues?.[0]?.value || '0'),
    }))?.filter(r => r.interest !== '(not set)') || [];

    return NextResponse.json({
      realtime: { total: totalRealtime, locations: realtimeUsers },
      ageBrackets,
      genderData,
      interests,
    });
  } catch (error) {
    console.error('GA4 API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch GA4 data',
      details: error instanceof Error ? error.message : 'Unknown error',
      realtime: { total: 0, locations: [] },
      ageBrackets: [],
      genderData: [],
      interests: [],
    });
  }
}
