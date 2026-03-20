import { NextRequest, NextResponse } from 'next/server';
import { generateDeeperScript, ScriptOutput } from '@/lib/generator';
import { getSettings } from '@/lib/storage';

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

    // Check for API key in settings
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
