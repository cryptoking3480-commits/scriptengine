import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
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

    // Check for API key in settings
    const settings = db.prepare('SELECT openai_api_key FROM settings WHERE id = 1').get() as { openai_api_key: string | null };
    if (!settings?.openai_api_key || settings.openai_api_key === 'user_will_add_this') {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Add it in Settings.' },
        { status: 400 }
      );
    }

    const scriptObj = JSON.parse(script) as ScriptOutput;
    const production = await generateDeeperScript(niche, platform, topic, videoLength, scriptObj);

    return NextResponse.json({ success: true, production: JSON.parse(production) });
  } catch (error) {
    console.error('Error in go-deeper API:', error);
    return NextResponse.json(
      { error: 'Failed to generate production script' },
      { status: 500 }
    );
  }
}