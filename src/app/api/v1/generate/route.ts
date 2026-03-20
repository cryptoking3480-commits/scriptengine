import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateScripts, GenerateParams } from '@/lib/generator';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing x-api-key header' },
        { status: 401 }
      );
    }

    // Validate API key
    const keyRecord = db.prepare('SELECT * FROM api_keys WHERE key = ? AND active = 1').get(apiKey) as {
      id: number;
      requestCount: number;
    } | undefined;

    if (!keyRecord) {
      return NextResponse.json(
        { error: 'Invalid or inactive API key' },
        { status: 401 }
      );
    }

    // Update usage stats
    db.prepare('UPDATE api_keys SET lastUsed = datetime("now"), requestCount = ? WHERE id = ?')
      .run(keyRecord.requestCount + 1, keyRecord.id);

    const body = await request.json();
    const { niche, platforms, topic, videoLength, goal } = body;

    if (!niche || !platforms || !topic || !videoLength || !goal) {
      return NextResponse.json(
        { error: 'Missing required fields: niche, platforms, topic, videoLength, goal' },
        { status: 400 }
      );
    }

    // Check for API key in settings
    const settings = db.prepare('SELECT openai_api_key FROM settings WHERE id = 1').get() as { openai_api_key: string | null };
    if (!settings?.openai_api_key || settings.openai_api_key === 'user_will_add_this') {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 400 }
      );
    }

    // Generate for first platform only in this version
    const platform = platforms[0] || 'instagram-reels';

    const params: GenerateParams = {
      niche,
      platform,
      topic,
      videoLength,
      contentGoal: goal,
    };

    const scripts = await generateScripts(params);

    // Save to database
    const insert = db.prepare(`
      INSERT INTO scripts (niche, platform, topic, videoLength, outputs)
      VALUES (?, ?, ?, ?, ?)
    `);
    insert.run(niche, platform, topic, videoLength, JSON.stringify(scripts));

    return NextResponse.json({ success: true, scripts });
  } catch (error) {
    console.error('Error in v1/generate API:', error);
    return NextResponse.json(
      { error: 'Failed to generate scripts' },
      { status: 500 }
    );
  }
}