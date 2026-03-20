import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/storage';

export async function GET() {
  try {
    const settings = getSettings();
    const settingsWithMaskedKey = {
      ...settings,
      openai_api_key: settings?.openai_api_key
        ? settings.openai_api_key.startsWith('sk-')
          ? '✅ Configured'
          : settings.openai_api_key.substring(0, 10) + '...'
        : null
    };
    return NextResponse.json({ settings: settingsWithMaskedKey });
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
    const { openai_api_key, default_niche, default_platform, country } = body;

    const updates: Record<string, unknown> = {};
    if (openai_api_key !== undefined) updates.openai_api_key = openai_api_key;
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
