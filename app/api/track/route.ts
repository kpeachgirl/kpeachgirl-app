import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TELEGRAM_BOT_TOKEN = '8742006927:AAF3KoMUKx6ghujk8aCch_rafWmxCUqnD5Q';
const TELEGRAM_CHAT_ID = '8551268851';
const NOTIFY_COOLDOWN_MS = 5 * 60 * 1000;

let lastNotifyTime = 0;

function parseUserAgent(ua: string): { browser: string; os: string; deviceType: string } {
  // Device type
  let deviceType = 'Desktop';
  if (/iPad|Tablet/i.test(ua)) deviceType = 'Tablet';
  else if (/Mobile|iPhone|Android.*Mobile/i.test(ua)) deviceType = 'Mobile';

  // Browser
  let browser = 'Unknown';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Opera|OPR\//i.test(ua)) browser = 'Opera';
  else if (/MSIE|Trident/i.test(ua)) browser = 'IE';
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung';

  // OS
  let os = 'Unknown';
  if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/CrOS/i.test(ua)) os = 'ChromeOS';

  return { browser, os, deviceType };
}

async function sendTelegramAlert(
  path: string,
  visitorId: string,
  city?: string,
  region?: string,
  country?: string,
  deviceType?: string,
  browser?: string,
  os?: string,
  language?: string,
) {
  const now = Date.now();
  if (now - lastNotifyTime < NOTIFY_COOLDOWN_MS) return;
  lastNotifyTime = now;

  // Pacific Time
  const time = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles',
  });

  const locationParts = [city, region, country].filter(Boolean);
  const location = locationParts.length > 0 ? locationParts.join(', ') : 'Unknown';

  const deviceInfo = [deviceType, os, browser].filter(Boolean).join(' · ');
  const langDisplay = language || '';

  let message = `🍑 <b>Visitor on Kpeachgirl</b>\n\n`;
  message += `📍 Page: <code>${path}</code>\n`;
  message += `🌎 Location: <b>${location}</b>\n`;
  if (deviceInfo) message += `📱 Device: ${deviceInfo}\n`;
  if (langDisplay) message += `🗣 Language: ${langDisplay}\n`;
  message += `🕐 ${time} PT\n`;
  message += `👤 ID: ${visitorId.slice(0, 8)}`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch {
    // silent
  }
}

export async function POST(request: NextRequest) {
  try {
    const { path, referrer, screen_width, screen_height, language, timezone } = await request.json();

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const ua = request.headers.get('user-agent') || '';

    // Vercel geo headers
    const city = request.headers.get('x-vercel-ip-city') || request.geo?.city || null;
    const region = request.headers.get('x-vercel-ip-country-region') || request.geo?.region || null;
    const country = request.headers.get('x-vercel-ip-country') || request.geo?.country || null;

    const decodedCity = city ? decodeURIComponent(city) : null;
    const decodedRegion = region ? decodeURIComponent(region) : null;

    // Parse device info from user-agent
    const { browser, os, deviceType } = parseUserAgent(ua);

    // Screen size
    const screen = screen_width && screen_height ? `${screen_width}x${screen_height}` : null;

    // Accept-Language header as fallback
    const acceptLang = request.headers.get('accept-language');
    const langCode = language || (acceptLang ? acceptLang.split(',')[0]?.trim() : null);

    // Visitor ID hash
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + ua + new Date().toDateString());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const visitorId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);

    await supabase.from('page_views').insert({
      path: path || '/',
      visitor_id: visitorId,
      referrer: referrer || null,
      user_agent: ua.slice(0, 256),
      city: decodedCity,
      region: decodedRegion,
      country: country,
      device_type: deviceType,
      browser: browser,
      os: os,
      language: langCode,
      screen: screen,
      timezone: timezone || null,
    });

    sendTelegramAlert(
      path || '/', visitorId,
      decodedCity || undefined, decodedRegion || undefined, country || undefined,
      deviceType, browser, os, langCode || undefined,
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
