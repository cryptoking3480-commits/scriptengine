import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const keys = db.prepare(`
      SELECT id, key, label, createdAt, lastUsed, requestCount, active
      FROM api_keys
      ORDER BY createdAt DESC
    `).all();

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { label } = body;

    if (!label) {
      return NextResponse.json(
        { error: 'Label is required' },
        { status: 400 }
      );
    }

    const apiKey = `sk_${crypto.randomBytes(24).toString('hex')}`;

    db.prepare(`
      INSERT INTO api_keys (key, label, requestCount, active)
      VALUES (?, ?, 0, 1)
    `).run(apiKey, label);

    return NextResponse.json({ success: true, key: apiKey });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }
}