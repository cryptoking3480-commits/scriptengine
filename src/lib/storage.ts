// Client-side storage using localStorage (works on Vercel serverless)

export interface Script {
  id: string;
  niche: string;
  platform: string;
  topic: string;
  videoLength: string;
  imageDesc: string | null;
  outputs: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  key: string;
  label: string;
  createdAt: string;
  lastUsed: string | null;
  requestCount: number;
  active: boolean;
}

export interface Settings {
  openai_api_key: string | null;
  default_niche: string;
  default_platform: string;
  country: string;
}

const SETTINGS_KEY = 'scriptengine_settings';
const SCRIPTS_KEY = 'scriptengine_scripts';
const API_KEYS_KEY = 'scriptengine_api_keys';

// Settings
export function getSettings(): Settings {
  if (typeof window === 'undefined') {
    return { openai_api_key: null, default_niche: 'Motivation', default_platform: 'instagram-reels', country: 'US' };
  }
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) return JSON.parse(stored);
  return { openai_api_key: null, default_niche: 'Motivation', default_platform: 'instagram-reels', country: 'US' };
}

export function saveSettings(settings: Partial<Settings>): Settings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

// Scripts (History)
export function getScripts(): Script[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SCRIPTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveScript(script: Omit<Script, 'id' | 'createdAt'>): Script {
  const scripts = getScripts();
  const newScript: Script = {
    ...script,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  scripts.unshift(newScript);
  // Keep last 100
  const trimmed = scripts.slice(0, 100);
  localStorage.setItem(SCRIPTS_KEY, JSON.stringify(trimmed));
  return newScript;
}

export function getScriptById(id: string): Script | undefined {
  return getScripts().find(s => s.id === id);
}

export function deleteScript(id: string): void {
  const scripts = getScripts().filter(s => s.id !== id);
  localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
}

// API Keys
export function getApiKeys(): ApiKey[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(API_KEYS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveApiKey(apiKey: Omit<ApiKey, 'id' | 'createdAt' | 'lastUsed' | 'requestCount' | 'active'>): ApiKey {
  const keys = getApiKeys();
  const newKey: ApiKey = {
    ...apiKey,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    lastUsed: null,
    requestCount: 0,
    active: true,
  };
  keys.push(newKey);
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(keys));
  return newKey;
}

export function updateApiKey(id: string, updates: Partial<ApiKey>): ApiKey | null {
  const keys = getApiKeys();
  const idx = keys.findIndex(k => k.id === id);
  if (idx === -1) return null;
  keys[idx] = { ...keys[idx], ...updates };
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(keys));
  return keys[idx];
}

export function deleteApiKey(id: string): void {
  const keys = getApiKeys().filter(k => k.id !== id);
  localStorage.setItem(API_KEYS_KEY, JSON.stringify(keys));
}
