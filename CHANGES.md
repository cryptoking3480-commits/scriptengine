# ScriptEngine - Viral Content Script Generation Platform

## Overview
ScriptEngine is a Next.js 14 application that generates viral video scripts for social media platforms using OpenAI's GPT-4o-mini model.

## Features

### Generate Page (/generate)
- Platform selection (Instagram Reels, YouTube Shorts, YouTube Long-form, TikTok, Facebook Reels, LinkedIn, Twitter/X)
- Niche selection with custom option (20+ niches including Beauty, Fitness, Food, Finance, Tech, etc.)
- Video topic input with optional image description
- Video length selection (15s, 30s, 60s, 3min)
- Content goal selection (Awareness, Engagement, Sales, Education)
- Generates 5 unique scripts with virality scores
- "Go Deeper" feature for full production scripts

### History Page (/history)
- View all past script generations
- Search by niche, topic, or platform
- Delete individual scripts
- Expand to view full script details
- Shows average virality score

### API Access Page (/api-access)
- Generate API keys with labels
- Copy keys (shown only once)
- View key usage stats (requests, last used)
- Revoke API keys
- Full API documentation

### Settings Page (/settings)
- OpenAI API key configuration
- Default preferences (niche, platform, country)
- Connection status indicator

## Technical Stack
- **Framework**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS (dark mode)
- **Database**: SQLite (better-sqlite3) - auto-creates on startup
- **AI**: OpenAI GPT-4o-mini
- **Notifications**: Sonner
- **Icons**: Lucide React

## Database Schema

### scripts table
- id (INTEGER PRIMARY KEY)
- niche (TEXT)
- platform (TEXT)
- topic (TEXT)
- videoLength (TEXT)
- imageDesc (TEXT, nullable)
- outputs (JSON)
- createdAt (DATETIME)

### api_keys table
- id (INTEGER PRIMARY KEY)
- key (TEXT UNIQUE)
- label (TEXT)
- createdAt (DATETIME)
- lastUsed (DATETIME, nullable)
- requestCount (INTEGER)
- active (INTEGER)

### settings table
- id (INTEGER PRIMARY KEY)
- openai_api_key (TEXT)
- default_niche (TEXT)
- default_platform (TEXT)
- country (TEXT)

## API Endpoints
- POST /api/generate - UI generation
- POST /api/v1/generate - API generation (requires x-api-key header)
- GET /api/history - List all scripts
- DELETE /api/history/[id] - Delete a script
- GET /api/api-keys - List API keys
- POST /api/api-keys - Generate new key
- DELETE /api/api-keys/[id] - Revoke key
- GET/PUT /api/settings - Get/Update settings
- POST /api/go-deeper - Generate production script

## Running the Application

```bash
cd scriptengine
npm run dev
```

Open http://localhost:3000 to view the application.

## Configuration

The OpenAI API key is pre-configured in .env.local. To change it, edit the file or update via the Settings page.