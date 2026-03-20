import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/storage';

export async function GET() {
  try {
    const settings = getSettings();
    // API key status is always ✅ if env var is set, never expose the actual key
    return NextResponse.json({
      settings: {
        ...settings,
        openai_api_key: process.env.OPENAI_API_KEY ? '✅ Backend Configured' : null
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { default_niche, default_platform, country } = body;

    // NOTE: openai_api_key is NEVER saved from frontend — only .env.local is used
    const updates: Record<string, unknown> = {};
    if (default_niche !== undefined) updates.default_niche = default_niche;
    if (default_platform !== undefined) updates.default_platform = default_platform;
    if (country !== undefined) updates.country = country;

    saveSettings(updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
