'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save, Check, X, Loader2 } from 'lucide-react';

interface Settings {
  openai_api_key: string | null;
  default_niche: string;
  default_platform: string;
  country: string;
}

const niches = [
  'Fashion', 'Beauty', 'Fitness', 'Food', 'Finance', 'Real Estate',
  'Tech', 'Education', 'Travel', 'Gaming', 'Health', 'Parenting',
  'Motivation', 'Comedy', 'Music', 'Photography', 'Business', 'Crypto', 'Automotive', 'Sports'
];

const platforms = [
  { value: 'instagram-reels', label: 'Instagram Reels' },
  { value: 'youtube-shorts', label: 'YouTube Shorts' },
  { value: 'youtube-long', label: 'YouTube Long-form' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook-reels', label: 'Facebook Reels' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
];

const countries = [
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'IN', label: 'India' },
  { value: 'AU', label: 'Australia' },
  { value: 'CA', label: 'Canada' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    openai_api_key: null,
    default_niche: 'Motivation',
    default_platform: 'instagram-reels',
    country: 'US',
  });
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openai_api_key: apiKey || undefined,
          default_niche: settings.default_niche,
          default_platform: settings.default_platform,
          country: settings.country,
        }),
      });

      if (res.ok) {
        toast.success('Settings saved successfully');
        setApiKey('');
        fetchSettings();
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#22c55e]" size={32} />
      </div>
    );
  }

  const isConfigured = settings.openai_api_key && settings.openai_api_key !== '❌ Missing' && settings.openai_api_key !== 'user_will_add_this';

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* API Key Status Banner */}
      <div className={`p-4 rounded-lg mb-8 flex items-center justify-between ${
        isConfigured
          ? 'bg-green-500/10 border border-green-500/20'
          : 'bg-red-500/10 border border-red-500/20'
      }`}>
        <div className="flex items-center gap-3">
          {isConfigured ? (
            <Check className="text-green-500" size={24} />
          ) : (
            <X className="text-red-500" size={24} />
          )}
          <div>
            <p className="font-medium">
              {isConfigured ? '✅ Connected' : '❌ Missing'}
            </p>
            <p className="text-sm text-[#737373]">
              {isConfigured
                ? 'OpenAI API key is configured'
                : 'Add your OpenAI API key to start generating'}
            </p>
          </div>
        </div>
      </div>

      {/* OpenAI API Key */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">OpenAI API Key</h2>
        <p className="text-sm text-[#737373] mb-4">
          Get your API key from{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#22c55e] hover:underline"
          >
            platform.openai.com
          </a>
        </p>
        <div className="flex gap-3">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={isConfigured ? 'Leave empty to keep current' : 'sk-...'}
            className="flex-1 px-4 py-3 rounded-lg bg-black border border-[#262626] focus:border-[#22c55e] outline-none transition-colors"
          />
          <button
            onClick={saveSettings}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save
          </button>
        </div>
      </div>

      {/* Default Preferences */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Default Preferences</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#a3a3a3] mb-2">Default Niche</label>
            <select
              value={settings.default_niche}
              onChange={(e) => setSettings({ ...settings, default_niche: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-black border border-[#262626] outline-none transition-colors"
            >
              {niches.map((niche) => (
                <option key={niche} value={niche}>{niche}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#a3a3a3] mb-2">Default Platform</label>
            <select
              value={settings.default_platform}
              onChange={(e) => setSettings({ ...settings, default_platform: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-black border border-[#262626] outline-none transition-colors"
            >
              {platforms.map((platform) => (
                <option key={platform.value} value={platform.value}>{platform.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#a3a3a3] mb-2">Country</label>
            <select
              value={settings.country}
              onChange={(e) => setSettings({ ...settings, country: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-black border border-[#262626] outline-none transition-colors"
            >
              {countries.map((country) => (
                <option key={country.value} value={country.value}>{country.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}