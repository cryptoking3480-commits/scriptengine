import { NextRequest, NextResponse } from 'next/server';
import { generateDeeperScript, ScriptOutput } from '@/lib/generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { niche, platform, topic, videoLength, script } = body;

    if (!niche || !platform || !topic || !videoLength || !script) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // API key comes ONLY from server-side .env.local
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured on server. Please contact the admin.' },
        { status: 500 }
      );
    }

    const scriptObj = JSON.parse(script) as ScriptOutput;
    const production = await generateDeeperScript(niche, platform, topic, videoLength, scriptObj, apiKey);

    return NextResponse.json({ success: true, production: JSON.parse(production) });
  } catch (error) {
    console.error('Error in go-deeper API:', error);
    return NextResponse.json(
      { error: 'Failed to generate production script' },
      { status: 500 }
    );
  }
}
