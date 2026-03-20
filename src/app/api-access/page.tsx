'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Copy, Trash2, Key, Check, AlertCircle } from 'lucide-react';

interface ApiKey {
  id: number;
  key: string;
  label: string;
  createdAt: string;
  lastUsed: string | null;
  requestCount: number;
  active: number;
}

export default function ApiAccessPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/api-keys');
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (error) {
      console.error('Error fetching keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    if (!label.trim()) {
      toast.error('Please enter a label');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      });

      const data = await res.json();
      if (data.success) {
        setNewKey(data.key);
        setShowNewKey(true);
        setLabel('');
        toast.success('API key created');
        fetchKeys();
      } else {
        toast.error('Failed to create key');
      }
    } catch (error) {
      console.error('Error creating key:', error);
      toast.error('Failed to create key');
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (id: number) => {
    setRevokingId(id);
    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('API key revoked');
        fetchKeys();
      } else {
        toast.error('Failed to revoke key');
      }
    } catch (error) {
      console.error('Error revoking key:', error);
      toast.error('Failed to revoke key');
    } finally {
      setRevokingId(null);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#22c55e]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">API Access</h1>
      <p className="text-[#737373] mb-8">Manage API keys for external integrations</p>

      {showNewKey && newKey && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Check className="text-green-500" size={20} />
            <span className="font-medium text-green-500">API Key Created</span>
          </div>
          <p className="text-sm text-[#737373] mb-3">
            Copy this key now. You won&apos;t be able to see it again!
          </p>
          <div className="flex gap-2">
            <code className="flex-1 px-4 py-2 bg-black rounded border border-[#262626] font-mono text-sm break-all">
              {newKey}
            </code>
            <button
              onClick={() => copyKey(newKey)}
              className="btn-secondary flex items-center gap-2"
            >
              <Copy size={16} />
              Copy
            </button>
          </div>
          <button
            onClick={() => {
              setShowNewKey(false);
              setNewKey(null);
            }}
            className="mt-3 text-sm text-[#22c55e] hover:underline"
          >
            I&apos;ve saved my key
          </button>
        </div>
      )}

      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">Generate New API Key</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Postola Production"
            className="flex-1 px-4 py-3 rounded-lg bg-black border border-[#262626] outline-none transition-colors"
          />
          <button
            onClick={createKey}
            disabled={creating}
            className="btn-primary flex items-center gap-2"
          >
            {creating ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}
            Generate Key
          </button>
        </div>
      </div>

      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">Your API Keys</h2>

        {keys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="mx-auto text-[#262626] mb-3" size={32} />
            <p className="text-[#737373]">No API keys yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-[#737373] border-b border-[#262626]">
                  <th className="pb-3 font-medium">Label</th>
                  <th className="pb-3 font-medium">Created</th>
                  <th className="pb-3 font-medium">Last Used</th>
                  <th className="pb-3 font-medium">Requests</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id} className="border-b border-[#262626]">
                    <td className="py-4">{key.label}</td>
                    <td className="py-4 text-sm text-[#a3a3a3]">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-sm text-[#a3a3a3]">
                      {key.lastUsed
                        ? new Date(key.lastUsed).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="py-4 text-sm">{key.requestCount}</td>
                    <td className="py-4">
                      <span className={`badge ${key.active ? 'badge-green' : 'badge-red'}`}>
                        {key.active ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="py-4">
                      {key.active && (
                        <button
                          onClick={() => revokeKey(key.id)}
                          disabled={revokingId === key.id}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          {revokingId === key.id ? (
                            <Loader2 className="animate-spin text-red-500" size={18} />
                          ) : (
                            <Trash2 className="text-red-500" size={18} />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          API Documentation
          <span className="badge badge-green">REST</span>
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-[#22c55e] mb-2">Endpoint</h3>
            <code className="block px-4 py-2 bg-black rounded border border-[#262626] font-mono text-sm">
              POST /api/v1/generate
            </code>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#22c55e] mb-2">Headers</h3>
            <code className="block px-4 py-2 bg-black rounded border border-[#262626] font-mono text-sm">
              Content-Type: application/json<br/>
              x-api-key: your-key-here
            </code>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#22c55e] mb-2">Request Body</h3>
            <pre className="block px-4 py-3 bg-black rounded border border-[#262626] font-mono text-sm overflow-x-auto">
{`{
  "niche": "beauty",
  "platforms": ["instagram-reels"],
  "topic": "sunscreen for Indian skin",
  "videoLength": "30s",
  "goal": "sales"
}`}
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#22c55e] mb-2">Response</h3>
            <pre className="block px-4 py-3 bg-black rounded border border-[#262626] font-mono text-sm overflow-x-auto">
{`{
  "success": true,
  "scripts": [
    {
      "id": 1,
      "hook": "...",
      "script": { "scenes": [...] },
      "caption": "...",
      "viralityScore": 85
    }
  ]
}`}
            </pre>
          </div>

          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-yellow-500">
              Note: OpenAI API key must be configured in Settings for the API to work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}