'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Trash2, Search, Calendar, Sparkles, ChevronDown, ChevronUp, Instagram, Youtube, Music, Facebook, Linkedin, Twitter, LucideIcon } from 'lucide-react';

interface Script {
  id: number;
  niche: string;
  platform: string;
  topic: string;
  videoLength: string;
  outputs: string;
  createdAt: string;
}

const platformIcons: Record<string, LucideIcon> = {
  'instagram-reels': Instagram,
  'youtube-shorts': Youtube,
  'youtube-long': Youtube,
  'tiktok': Music,
  'facebook-reels': Facebook,
  'linkedin': Linkedin,
  'twitter': Twitter,
};

export default function HistoryPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setScripts(data.scripts || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const deleteScript = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScripts(scripts.filter(s => s.id !== id));
        toast.success('Script deleted');
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredScripts = scripts.filter(script =>
    script.niche.toLowerCase().includes(searchQuery.toLowerCase()) ||
    script.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    script.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#22c55e]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">History</h1>
      <p className="text-[#737373] mb-6">All your past script generations</p>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#525252]" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by niche, topic, or platform..."
          className="w-full pl-12 pr-4 py-3 rounded-lg bg-black border border-[#262626] outline-none transition-colors"
        />
      </div>

      {/* Empty State */}
      {filteredScripts.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="mx-auto text-[#262626] mb-4" size={48} />
          <p className="text-[#737373]">
            {searchQuery ? 'No scripts match your search' : 'No scripts yet'}
          </p>
          <p className="text-sm text-[#525252] mt-2">
            {searchQuery ? 'Try a different search term' : 'Go to Generate to create your first scripts'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredScripts.map((script) => {
            const outputs = JSON.parse(script.outputs || '[]');
            const avgScore = outputs.length > 0
              ? Math.round(outputs.reduce((sum: number, s: { viralityScore?: number }) => sum + (s.viralityScore || 0), 0) / outputs.length)
              : 0;
            const isExpanded = expandedId === script.id;
            const PlatformIcon = platformIcons[script.platform] || Instagram;

            return (
              <div
                key={script.id}
                className="card animate-fadeIn cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : script.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <PlatformIcon className="text-[#525252]" size={20} />
                    <div>
                      <h3 className="font-medium">{script.niche}</h3>
                      <p className="text-sm text-[#737373] truncate max-w-md">
                        {script.topic}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`badge ${
                          avgScore >= 80 ? 'badge-green' :
                          avgScore >= 60 ? 'badge-yellow' : 'badge-red'
                        }`}>
                          {avgScore}% viral
                        </span>
                      </div>
                      <div className="text-xs text-[#525252] mt-1 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(script.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteScript(script.id);
                      }}
                      disabled={deletingId === script.id}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      {deletingId === script.id ? (
                        <Loader2 className="animate-spin text-red-500" size={18} />
                      ) : (
                        <Trash2 className="text-red-500" size={18} />
                      )}
                    </button>

                    {isExpanded ? (
                      <ChevronUp className="text-[#525252]" size={20} />
                    ) : (
                      <ChevronDown className="text-[#525252]" size={20} />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && outputs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#262626]">
                    <div className="grid gap-4">
                      {outputs.map((output: { id: number; hook: string; caption: string; viralityScore: number }, idx: number) => (
                        <div key={idx} className="bg-black rounded-lg p-4 border border-[#262626]">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">#{output.id}</span>
                            <span className={`badge ${
                              output.viralityScore >= 80 ? 'badge-green' :
                              output.viralityScore >= 60 ? 'badge-yellow' : 'badge-red'
                            }`}>
                              {output.viralityScore}% viral
                            </span>
                          </div>
                          <p className="text-sm text-[#22c55e] mb-2">{output.hook}</p>
                          <p className="text-sm text-[#a3a3a3] line-clamp-3">{output.caption}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}