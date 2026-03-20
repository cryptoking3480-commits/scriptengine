import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateScripts, GenerateParams } from '@/lib/generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { niche, platform, topic, videoLength, contentGoal, imageDesc } = body;

    if (!niche || !platform || !topic || !videoLength || !contentGoal) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for API key in settings (database) or env
    const settings = db.prepare('SELECT openai_api_key FROM settings WHERE id = 1').get() as { openai_api_key: string | null };
    const envKey = process.env.OPENAI_API_KEY;
    const dbKey = settings?.openai_api_key;

    console.log('=== API KEY CHECK ===');
    console.log('ENV key exists:', !!envKey, envKey ? `starts with: ${envKey.substring(0, 15)}...` : '');
    console.log('DB key exists:', !!dbKey, dbKey ? `starts with: ${dbKey.substring(0, 15)}...` : '');
    console.log('DB key value:', dbKey);

    const apiKey = envKey || dbKey;
    if (!apiKey || apiKey === 'user_will_add_this') {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Add it in Settings.' },
        { status: 400 }
      );
    }

    const params: GenerateParams = {
      niche,
      platform,
      topic,
      videoLength,
      contentGoal,
      imageDesc,
    };

    console.log('Calling generateScripts with API key:', apiKey.substring(0, 10) + '...');
    const scripts = await generateScripts(params, apiKey);

    // Save to database
    const insert = db.prepare(`
      INSERT INTO scripts (niche, platform, topic, videoLength, imageDesc, outputs)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insert.run(niche, platform, topic, videoLength, imageDesc || null, JSON.stringify(scripts));

    return NextResponse.json({ success: true, scripts });
  } catch (error) {
    console.error('Error in generate API:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to generate scripts', details: errMsg },
      { status: 500 }
    );
  }
}