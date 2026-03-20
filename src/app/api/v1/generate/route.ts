import { NextRequest, NextResponse } from 'next/server';
import { generateScripts, GenerateParams } from '@/lib/generator';
import { getSettings } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');

    // For v1 API, require explicit API key header
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing x-api-key header' },
        { status: 401 }
      );
    }

    // Check the key against env or settings
    const settings = getSettings();
    const envKey = process.env.OPENAI_API_KEY;
    const storedKey = settings?.openai_api_key;
    const validKey = envKey || storedKey;

    if (apiKey !== validKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { niche, platforms, topic, videoLength, goal } = body;

    if (!niche || !platforms || !topic || !videoLength || !goal) {
      return NextResponse.json(
        { error: 'Missing required fields: niche, platforms, topic, videoLength, goal' },
        { status: 400 }
      );
    }

    // Generate for first platform only
    const platform = platforms[0] || 'instagram-reels';

    const params: GenerateParams = {
      niche,
      platform,
      topic,
      videoLength,
      contentGoal: goal,
    };

    const scripts = await generateScripts(params, validKey);

    return NextResponse.json({ success: true, scripts });
  } catch (error) {
    console.error('Error in v1/generate API:', error);
    return NextResponse.json(
      { error: 'Failed to generate scripts' },
      { status: 500 }
    );
  }
}
