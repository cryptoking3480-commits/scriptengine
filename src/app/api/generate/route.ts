import { NextRequest, NextResponse } from 'next/server';
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

    // API key comes ONLY from server-side .env — never from frontend
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured on server. Please contact the admin.' },
        { status: 500 }
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

    // Note: History saving is handled client-side via the return
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
