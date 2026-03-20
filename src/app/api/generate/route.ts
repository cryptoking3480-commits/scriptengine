import { NextRequest, NextResponse } from 'next/server';
import { generateScripts, GenerateParams } from '@/lib/generator';
import { getSettings, saveScript } from '@/lib/storage';

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

    // Check for API key in localStorage or env
    const settings = getSettings();
    const envKey = process.env.OPENAI_API_KEY;
    const storedKey = settings?.openai_api_key;

    const apiKey = envKey || storedKey;
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

    const scripts = await generateScripts(params, apiKey);

    // Save to history (localStorage)
    saveScript({ niche, platform, topic, videoLength, imageDesc: imageDesc || null, outputs: JSON.stringify(scripts) });

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
