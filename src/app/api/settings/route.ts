import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

interface SettingsRow {
  id: number;
  openai_api_key: string | null;
  default_niche: string;
  default_platform: string;
  country: string;
}

export async function GET() {
  try {
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() as SettingsRow | undefined;

    // Don't expose the full API key
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

    if (openai_api_key !== undefined) {
      db.prepare('UPDATE settings SET openai_api_key = ? WHERE id = 1').run(openai_api_key);
    }

    if (default_niche !== undefined) {
      db.prepare('UPDATE settings SET default_niche = ? WHERE id = 1').run(default_niche);
    }

    if (default_platform !== undefined) {
      db.prepare('UPDATE settings SET default_platform = ? WHERE id = 1').run(default_platform);
    }

    if (country !== undefined) {
      db.prepare('UPDATE settings SET country = ? WHERE id = 1').run(country);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}