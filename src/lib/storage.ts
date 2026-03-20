// Client-side storage using localStorage (works on Vercel serverless)
// NOTE: API keys are NEVER stored here — only in server-side .env.local

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

export interface Settings {
  default_niche: string;
  default_platform: string;
  country: string;
}

const SETTINGS_KEY = 'scriptengine_settings';
const SCRIPTS_KEY = 'scriptengine_scripts';

// Settings (no API key — that stays in server .env only)
export function getSettings(): Settings {
  if (typeof window === 'undefined') {
    return { default_niche: 'Motivation', default_platform: 'instagram-reels', country: 'US' };
  }
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) return JSON.parse(stored);
  return { default_niche: 'Motivation', default_platform: 'instagram-reels', country: 'US' };
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
