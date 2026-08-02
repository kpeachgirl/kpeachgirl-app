import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { submissionId, imageUrl } = await request.json();

    if (!submissionId || !imageUrl) {
      return NextResponse.json({ error: 'Missing submissionId or imageUrl' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        status: 'skipped',
        reason: 'ID verification not configured',
      });
    }

    // Download the image from Supabase storage
    const storagePath = imageUrl.replace('submissions/', '');
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('submissions')
      .download(storagePath);

    if (downloadError || !fileData) {
      return NextResponse.json({ error: 'Failed to download image' }, { status: 500 });
    }

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = fileData.type || 'image/jpeg';

    // Send to Claude Vision for analysis
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 500,
      // Sonnet 5 runs adaptive thinking unless told otherwise, and max_tokens
      // caps thinking + response together — the JSON would truncate.
      thinking: { type: 'disabled' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: base64,
              },
            },
            {
              type: 'text',
              text: `Analyze this ID verification photo. The person should be holding an ID document next to their face.

Check and respond ONLY with a JSON object (no markdown, no backticks):
{
  "face_detected": true/false,
  "id_detected": true/false,
  "face_matches_id": true/false/"unclear",
  "name_on_id": "name if readable, or null",
  "confidence": "high"/"medium"/"low",
  "issues": ["list of any issues found"],
  "summary": "one sentence summary of verification result"
}

Be strict: if the face is obscured, ID is blurry, or they clearly don't match, flag it. If the image is not an ID verification photo at all, set all to false.`,
            },
          ],
        },
      ],
    });

    // Parse Claude's response
    const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
    let verification;
    try {
      verification = JSON.parse(responseText);
    } catch {
      verification = {
        face_detected: false,
        id_detected: false,
        face_matches_id: false,
        name_on_id: null,
        confidence: 'low',
        issues: ['Failed to parse verification result'],
        summary: responseText,
      };
    }

    // Determine pass/fail
    const passed = verification.face_detected &&
      verification.id_detected &&
      (verification.face_matches_id === true || verification.face_matches_id === 'unclear') &&
      verification.confidence !== 'low';

    const result = {
      ...verification,
      passed,
      verified_at: new Date().toISOString(),
    };

    // Update the submission with verification result
    const { data: existing } = await supabase
      .from('submissions')
      .select('form_data')
      .eq('id', submissionId)
      .single();

    if (existing) {
      await supabase
        .from('submissions')
        .update({
          form_data: {
            ...existing.form_data,
            id_verification: result,
          },
        })
        .eq('id', submissionId);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('ID verification error:', error);
    return NextResponse.json({
      error: 'Verification failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
