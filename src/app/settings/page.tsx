'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save, Check, Loader2, Lock } from 'lucide-react';

interface Settings {
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
    default_niche: 'Motivation',
    default_platform: 'instagram-reels',
    country: 'US',
  });
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
        setSettings({
          default_niche: data.settings.default_niche || 'Motivation',
          default_platform: data.settings.default_platform || 'instagram-reels',
          country: data.settings.country || 'US',
        });
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
          default_niche: settings.default_niche,
          default_platform: settings.default_platform,
          country: settings.country,
        }),
      });

      if (res.ok) {
        toast.success('Settings saved');
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

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Settings</h1>

      {/* API Key Status — backend only, never visible */}
      <div className="card mb-6 bg-gradient-to-r from-green-500/5 to-emerald-500/5 border-green-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <Lock className="text-green-500" size={20} />
          </div>
          <div>
            <p className="font-semibold text-green-500">API Key Protected</p>
            <p className="text-xs text-[#737373] mt-0.5">Stored securely in server environment — never exposed to frontend</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#737373]">
          <Check className="text-green-500" size={14} />
          <span>Backend-only • Not in code • Not in GitHub • Not visible to anyone</span>
        </div>
      </div>

      {/* Default Preferences */}
      <div className="card">
        <h2 className="text-base sm:text-lg font-semibold mb-4">Default Preferences</h2>
        <p className="text-xs sm:text-sm text-[#737373] mb-4">These defaults will be pre-selected when you open the generator.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm text-[#a3a3a3] mb-2">Default Niche</label>
            <select
              value={settings.default_niche}
              onChange={(e) => setSettings({ ...settings, default_niche: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-black border border-[#262626] outline-none transition-colors text-sm"
            >
              {niches.map((niche) => (
                <option key={niche} value={niche}>{niche}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm text-[#a3a3a3] mb-2">Default Platform</label>
            <select
              value={settings.default_platform}
              onChange={(e) => setSettings({ ...settings, default_platform: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-black border border-[#262626] outline-none transition-colors text-sm"
            >
              {platforms.map((platform) => (
                <option key={platform.value} value={platform.value}>{platform.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm text-[#a3a3a3] mb-2">Country</label>
            <select
              value={settings.country}
              onChange={(e) => setSettings({ ...settings, country: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-black border border-[#262626] outline-none transition-colors text-sm"
            >
              {countries.map((country) => (
                <option key={country.value} value={country.value}>{country.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="w-full mt-6 py-3 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#262626] disabled:text-[#525252] text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Save Preferences
        </button>
      </div>
    </div>
  );
}
