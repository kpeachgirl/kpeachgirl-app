import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TELEGRAM_BOT_TOKEN = '8742006927:AAF3KoMUKx6ghujk8aCch_rafWmxCUqnD5Q';
const TELEGRAM_CHAT_ID = '8551268851';
const NOTIFY_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes between notifications

let lastNotifyTime = 0;

async function sendTelegramAlert(path: string, visitorId: string) {
  const now = Date.now();
  if (now - lastNotifyTime < NOTIFY_COOLDOWN_MS) return;
  lastNotifyTime = now;

  const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const message = `🍑 <b>Visitor on Kpeachgirl</b>\n\n📍 Page: <code>${path}</code>\n🕐 ${time}\n👤 ID: ${visitorId.slice(0, 8)}`;

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
    // silent - don't break tracking if Telegram fails
  }
}

export async function POST(request: NextRequest) {
  try {
    const { path, referrer } = await request.json();

    // Generate visitor ID from IP + user-agent (privacy-friendly fingerprint)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const ua = request.headers.get('user-agent') || '';

    // Simple hash for visitor ID
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
    });

    // Send Telegram notification (with cooldown)
    sendTelegramAlert(path || '/', visitorId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
