import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'scriptengine.db');
const db = new Database(dbPath);

// Auto-create tables on first run
db.exec(`
  CREATE TABLE IF NOT EXISTS scripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    niche TEXT NOT NULL,
    platform TEXT NOT NULL,
    topic TEXT NOT NULL,
    videoLength TEXT NOT NULL,
    imageDesc TEXT,
    outputs TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    lastUsed TEXT,
    requestCount INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    openai_api_key TEXT,
    default_niche TEXT DEFAULT 'Motivation',
    default_platform TEXT DEFAULT 'instagram-reels',
    country TEXT DEFAULT 'US'
  );

  INSERT OR IGNORE INTO settings (id) VALUES (1);
`);

export default db;

export interface Script {
  id: number;
  niche: string;
  platform: string;
  topic: string;
  videoLength: string;
  imageDesc: string | null;
  outputs: string;
  createdAt: string;
}

export interface ApiKey {
  id: number;
  key: string;
  label: string;
  createdAt: string;
  lastUsed: string | null;
  requestCount: number;
  active: number;
}

export interface Settings {
  id: number;
  openai_api_key: string | null;
  default_niche: string;
  default_platform: string;
  country: string;
}