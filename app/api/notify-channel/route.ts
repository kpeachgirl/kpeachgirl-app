import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

const TELEGRAM_BOT_TOKEN = '8742006927:AAF3KoMUKx6ghujk8aCch_rafWmxCUqnD5Q';
// Channel chat ID — set this once the client creates their channel and adds the bot as admin
const CHANNEL_CHAT_ID = process.env.TELEGRAM_CHANNEL_ID || '';

export async function POST(request: NextRequest) {
  // Verify admin auth
  const serverClient = createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!CHANNEL_CHAT_ID) {
    return NextResponse.json({ error: 'Channel not configured' }, { status: 500 });
  }

  try {
    const { name, slug, region, profileImage } = await request.json();

    const profileUrl = `https://kpeachgirl.com/model/${slug}`;

    const caption = [
      `NEW MODEL`,
      ``,
      name,
      region ? `${region} | Verified` : 'Verified',
      ``,
      `View full profile:`,
      profileUrl,
    ].join('\n');

    if (profileImage) {
      // Send photo with caption
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHANNEL_CHAT_ID,
          photo: profileImage,
          caption,
        }),
      });
    } else {
      // Text only if no image
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHANNEL_CHAT_ID,
          text: caption,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Channel notify error:', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
