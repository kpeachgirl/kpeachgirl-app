import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const TELEGRAM_BOT_TOKEN = '8742006927:AAF3KoMUKx6ghujk8aCch_rafWmxCUqnD5Q';
const CHANNEL_CHAT_ID = process.env.TELEGRAM_CHANNEL_ID || '';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendTelegramMessage(text: string) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_CHAT_ID,
      text,
      disable_web_page_preview: false,
    }),
  });
  return res.json();
}

async function sendTelegramPhoto(photo: string, caption: string) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_CHAT_ID,
      photo,
      caption,
    }),
  });
  return res.json();
}

export async function POST(request: NextRequest) {
  // Verify admin auth
  const serverClient = createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!CHANNEL_CHAT_ID) {
    return NextResponse.json({ error: 'Telegram channel not configured' }, { status: 500 });
  }

  try {
    const { type, message, modelId, specialTitle, specialDetails } = await request.json();

    if (type === 'custom') {
      if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });
      await sendTelegramMessage(message);
    }

    else if (type === 'featured') {
      if (!modelId) return NextResponse.json({ error: 'Select a model' }, { status: 400 });

      const { data: model } = await supabase
        .from('profiles')
        .select('name, slug, region, profile_image, verified')
        .eq('id', modelId)
        .single();

      if (!model) return NextResponse.json({ error: 'Model not found' }, { status: 404 });

      const caption = [
        'FEATURED MODEL',
        '',
        model.name,
        [model.region, model.verified ? 'Verified' : ''].filter(Boolean).join(' | '),
        message ? `\n${message}` : '',
        '',
        'View full profile:',
        `https://kpeachgirl.com/model/${model.slug}`,
      ].filter(s => s !== undefined).join('\n');

      if (model.profile_image) {
        await sendTelegramPhoto(model.profile_image, caption);
      } else {
        await sendTelegramMessage(caption);
      }
    }

    else if (type === 'special') {
      if (!specialTitle) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

      let caption = [
        specialTitle.toUpperCase(),
        '',
        specialDetails || '',
      ].filter(Boolean).join('\n');

      // If a model is attached to the special
      if (modelId) {
        const { data: model } = await supabase
          .from('profiles')
          .select('name, slug, region, profile_image')
          .eq('id', modelId)
          .single();

        if (model) {
          caption += `\n\n${model.name}`;
          if (model.region) caption += ` | ${model.region}`;
          caption += `\nhttps://kpeachgirl.com/model/${model.slug}`;

          if (model.profile_image) {
            await sendTelegramPhoto(model.profile_image, caption);
            return NextResponse.json({ success: true });
          }
        }
      }

      await sendTelegramMessage(caption);
    }

    else {
      return NextResponse.json({ error: 'Invalid post type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Telegram post error:', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
