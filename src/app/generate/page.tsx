'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Sparkles, Instagram, Youtube, Music, Facebook, Linkedin, Twitter, Camera } from 'lucide-react';

interface ScriptOutput {
  id: number;
  hook: string;
  script: {
    scenes: Array<{
      timeRange: string;
      film: string;
      say: string;
      textOverlay: string;
      sound: string;
    }>;
  };
  caption: string;
  hashtags: {
    highReach: string[];
    midReach: string[];
    niche: string[];
  };
  audio: string;
  thumbnail: string;
  postTime: string;
  whyItWorks: string;
  viralityScore: number;
  format: string;
}

const platforms = [
  { value: 'instagram-reels', label: 'Instagram Reels', icon: Instagram },
  { value: 'youtube-shorts', label: 'YouTube Shorts', icon: Youtube },
  { value: 'youtube-long', label: 'YouTube Long-form', icon: Youtube },
  { value: 'tiktok', label: 'TikTok', icon: Music },
  { value: 'facebook-reels', label: 'Facebook Reels', icon: Facebook },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'twitter', label: 'Twitter/X', icon: Twitter },
];

const niches = [
  'Fashion', 'Beauty', 'Fitness', 'Food', 'Finance', 'Real Estate',
  'Tech', 'Education', 'Travel', 'Gaming', 'Health', 'Parenting',
  'Motivation', 'Comedy', 'Music', 'Photography', 'Business', 'Crypto', 'Automotive', 'Sports'
];

const videoLengths = [
  { value: '15s', label: '15 sec' },
  { value: '30s', label: '30 sec' },
  { value: '60s', label: '60 sec' },
  { value: '3m', label: '3 min' },
];

const contentGoals = [
  { value: 'awareness', label: 'Awareness', desc: 'Build brand recognition' },
  { value: 'engagement', label: 'Engagement', desc: 'Get likes & comments' },
  { value: 'sales', label: 'Sales', desc: 'Drive conversions' },
  { value: 'education', label: 'Education', desc: 'Teach something' },
];

export default function GeneratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState<ScriptOutput[]>([]);

  // Form state
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram-reels']);
  const [niche, setNiche] = useState('Motivation');
  const [customNiche, setCustomNiche] = useState('');
  const [useCustomNiche, setUseCustomNiche] = useState(false);
  const [topic, setTopic] = useState('');
  const [imageDesc, setImageDesc] = useState('');
  const [videoLength, setVideoLength] = useState('30s');
  const [contentGoal, setContentGoal] = useState('engagement');

  const [settings, setSettings] = useState<{ openai_api_key: string | null; default_niche: string; default_platform: string; country: string } | null>(null);
  const [checkingSettings, setCheckingSettings] = useState(true);

  useEffect(() => {
    checkSettings();
  }, []);

  const checkSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data.settings);

      if (data.settings?.default_niche) {
        setNiche(data.settings.default_niche);
      }
      if (data.settings?.default_platform) {
        setSelectedPlatforms([data.settings.default_platform]);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setCheckingSettings(false);
    }
  };

  const togglePlatform = (value: string) => {
    if (selectedPlatforms.includes(value)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(p => p !== value));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, value]);
    }
  };

  const generateScripts = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a video topic');
      return;
    }

    const finalNiche = useCustomNiche ? customNiche : niche;
    if (useCustomNiche && !finalNiche.trim()) {
      toast.error('Please enter a niche');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: finalNiche,
          platform: selectedPlatforms[0],
          topic,
          videoLength,
          contentGoal,
          imageDesc: imageDesc || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to generate scripts');
        return;
      }

      setScripts(data.scripts);
      toast.success('Generated 5 scripts successfully!');
    } catch (error) {
      console.error('Error generating scripts:', error);
      toast.error('Failed to generate scripts');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSettings) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#22c55e]" size={32} />
      </div>
    );
  }

  if (scripts.length > 0) {
    return (
      <ResultsPage
        scripts={scripts}
        onBack={() => setScripts([])}
        niche={useCustomNiche ? customNiche : niche}
        platform={selectedPlatforms[0]}
        topic={topic}
        videoLength={videoLength}
      />
    );
  }

  const isApiKeyMissing = !settings?.openai_api_key || settings.openai_api_key === '❌ Missing';

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {isApiKeyMissing && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
          <div className="text-yellow-500">⚠️</div>
          <p className="text-sm">
            Add your OpenAI API key in{' '}
            <span
              onClick={() => router.push('/settings')}
              className="text-[#22c55e] cursor-pointer hover:underline"
            >
              Settings
            </span>{' '}
            to start generating
          </p>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-2">Generate Scripts</h1>
      <p className="text-[#737373] mb-8">Create viral video scripts in seconds</p>

      <div className="space-y-8">
        {/* Platform Selection */}
        <section>
          <h2 className="text-sm font-medium text-[#a3a3a3] mb-3">SELECT PLATFORM</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedPlatforms.includes(platform.value);
              return (
                <button
                  key={platform.value}
                  onClick={() => togglePlatform(platform.value)}
                  className={`p-4 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                    isSelected
                      ? 'bg-[#22c55e]/10 border-[#22c55e] text-[#22c55e]'
                      : 'bg-black border-[#262626] hover:border-[#404040]'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{platform.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Niche Selection */}
        <section>
          <h2 className="text-sm font-medium text-[#a3a3a3] mb-3">SELECT NICHE</h2>
          <div className="space-y-3">
            <select
              value={useCustomNiche ? 'custom' : niche}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setUseCustomNiche(true);
                } else {
                  setUseCustomNiche(false);
                  setNiche(e.target.value);
                }
              }}
              className="w-full px-4 py-3 rounded-lg bg-black border border-[#262626] outline-none transition-colors"
            >
              {niches.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
              <option value="custom">+ Custom (type your own)</option>
            </select>

            {useCustomNiche && (
              <input
                type="text"
                value={customNiche}
                onChange={(e) => setCustomNiche(e.target.value)}
                placeholder="Enter your custom niche..."
                className="w-full px-4 py-3 rounded-lg bg-black border border-[#262626] outline-none transition-colors"
              />
            )}
          </div>
        </section>

        {/* Video Topic */}
        <section>
          <h2 className="text-sm font-medium text-[#a3a3a3] mb-3">WHAT IS YOUR VIDEO ABOUT?</h2>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. A sunscreen cream that works for Indian skin, or a 10-minute home workout for busy moms..."
            className="w-full px-4 py-3 rounded-lg bg-black border border-[#262626] outline-none transition-colors h-32 resize-none"
          />
        </section>

        {/* Image Upload (Optional) */}
        <section>
          <h2 className="text-sm font-medium text-[#a3a3a3] mb-3">UPLOAD IMAGE (OPTIONAL)</h2>
          <div className="border-2 border-dashed border-[#262626] rounded-lg p-8 text-center hover:border-[#404040] transition-colors cursor-pointer">
            <Camera className="mx-auto text-[#525252] mb-3" size={32} />
            <p className="text-sm text-[#737373]">
              Drag & drop product/service image for better script (optional)
            </p>
            <input
              type="text"
              value={imageDesc}
              onChange={(e) => setImageDesc(e.target.value)}
              placeholder="Or describe the image here..."
              className="mt-3 w-full px-4 py-2 rounded-lg bg-black border border-[#262626] outline-none transition-colors text-sm"
            />
          </div>
        </section>

        {/* Video Length */}
        <section>
          <h2 className="text-sm font-medium text-[#a3a3a3] mb-3">VIDEO LENGTH</h2>
          <div className="flex flex-wrap gap-3">
            {videoLengths.map((length) => (
              <button
                key={length.value}
                onClick={() => setVideoLength(length.value)}
                className={`px-6 py-3 rounded-lg border transition-all ${
                  videoLength === length.value
                    ? 'bg-[#22c55e]/10 border-[#22c55e] text-[#22c55e]'
                    : 'bg-black border-[#262626] hover:border-[#404040]'
                }`}
              >
                {length.label}
              </button>
            ))}
          </div>
        </section>

        {/* Content Goal */}
        <section>
          <h2 className="text-sm font-medium text-[#a3a3a3] mb-3">CONTENT GOAL</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {contentGoals.map((goal) => {
              const isSelected = contentGoal === goal.value;
              return (
                <button
                  key={goal.value}
                  onClick={() => setContentGoal(goal.value)}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'bg-[#22c55e]/10 border-[#22c55e]'
                      : 'bg-black border-[#262626] hover:border-[#404040]'
                  }`}
                >
                  <div className={`font-medium ${isSelected ? 'text-[#22c55e]' : ''}`}>
                    {goal.label}
                  </div>
                  <div className="text-xs text-[#737373] mt-1">{goal.desc}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Generate Button */}
        <button
          onClick={generateScripts}
          disabled={loading || isApiKeyMissing}
          className="w-full py-4 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#262626] disabled:text-[#525252] text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate 5 Scripts
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Results Page Component
function ResultsPage({
  scripts,
  onBack,
  niche,
  platform,
  topic,
  videoLength
}: {
  scripts: ScriptOutput[];
  onBack: () => void;
  niche: string;
  platform: string;
  topic: string;
  videoLength: string;
}) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [deeperScripts, setDeeperScripts] = useState<Record<number, { production?: { shots?: Array<Record<string, unknown>> } }>>({});
  const [loadingDeeper, setLoadingDeeper] = useState<number | null>(null);

  const goDeeper = async (script: ScriptOutput) => {
    setLoadingDeeper(script.id);
    try {
      const res = await fetch('/api/go-deeper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          platform,
          topic,
          videoLength,
          script: JSON.stringify(script),
        }),
      });

      const data = await res.json();
      if (data.production) {
        setDeeperScripts(prev => ({ ...prev, [script.id]: data.production }));
        setExpandedCard(script.id);
      }
    } catch (error) {
      console.error('Error generating deeper script:', error);
    } finally {
      setLoadingDeeper(null);
    }
  };

  const copyAll = (script: ScriptOutput) => {
    const text = `${script.hook}

${script.script.scenes.map((scene, i) => `
Scene ${i + 1} (${scene.timeRange})
🎥 Film: ${scene.film}
🗣 Say: ${scene.say}
📝 Text: ${scene.textOverlay}
🎵 Sound: ${scene.sound}
`).join('\n')}

✍️ Caption:
${script.caption}

#️⃣ Hashtags:
${script.hashtags.highReach.join(' ')} ${script.hashtags.midReach.join(' ')} ${script.hashtags.niche.join(' ')}
`;
    navigator.clipboard.writeText(text);
  };

  const getViralityColor = (score: number) => {
    if (score >= 80) return 'text-green-500 bg-green-500/10';
    if (score >= 60) return 'text-yellow-500 bg-yellow-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="text-[#22c55e] hover:underline mb-6"
      >
        ← Back to Generate
      </button>

      <h1 className="text-2xl font-bold mb-2">Generated Scripts</h1>
      <p className="text-[#737373] mb-8">
        {niche} • {platform} • {topic.substring(0, 50)}...
      </p>

      <div className="space-y-6">
        {scripts.map((script, index) => (
          <div
            key={script.id}
            className="card animate-fadeIn"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#262626]">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">#{script.id}</span>
                <span className={`badge ${getViralityColor(script.viralityScore)}`}>
                  Virality: {script.viralityScore}
                </span>
                <span className="platform-badge">{script.format}</span>
              </div>
            </div>

            {/* Hook */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-[#22c55e] mb-2">🎯 HOOK</h3>
              <p className="text-lg font-semibold">{script.hook}</p>
            </div>

            {/* Script */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-[#22c55e] mb-2">🎬 SCRIPT</h3>
              <div className="space-y-4">
                {script.script.scenes.map((scene, i) => (
                  <div key={i} className="bg-black/50 rounded-lg p-4 border border-[#262626]">
                    <div className="text-sm text-[#737373] mb-3">{scene.timeRange}</div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex gap-2">
                        <span className="text-[#525252] min-w-[60px]">🎥 Film:</span>
                        <span>{scene.film}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#525252] min-w-[60px]">🗣 Say:</span>
                        <span>{scene.say}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#525252] min-w-[60px]">📝 Text:</span>
                        <span>{scene.textOverlay}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#525252] min-w-[60px]">🎵 Sound:</span>
                        <span>{scene.sound}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-[#22c55e] mb-2">✍️ CAPTION</h3>
              <p className="text-sm">{script.caption}</p>
            </div>

            {/* Hashtags */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-[#22c55e] mb-2">#️⃣ HASHTAGS</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-[#737373]">High Reach (1M+):</span>{' '}
                  {script.hashtags.highReach.join(' ')}
                </div>
                <div>
                  <span className="text-[#737373]">Mid Reach (100K):</span>{' '}
                  {script.hashtags.midReach.join(' ')}
                </div>
                <div>
                  <span className="text-[#737373]">Niche (&lt;100K):</span>{' '}
                  {script.hashtags.niche.join(' ')}
                </div>
              </div>
            </div>

            {/* Audio, Thumbnail, Post Time */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              <div>
                <span className="text-[#737373]">🎵 Audio:</span> {script.audio}
              </div>
              <div>
                <span className="text-[#737373]">🖼 Thumbnail:</span> {script.thumbnail}
              </div>
              <div>
                <span className="text-[#737373]">⏰ Post Time:</span> {script.postTime}
              </div>
            </div>

            {/* Why It Works */}
            <div className="mb-4 pb-4 border-b border-[#262626]">
              <div className="text-sm">
                <span className="text-[#22c55e]">💡 Why This Works:</span> {script.whyItWorks}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => copyAll(script)}
                className="btn-secondary flex items-center gap-2"
              >
                📋 Copy All
              </button>
              <button
                onClick={() => goDeeper(script)}
                disabled={loadingDeeper === script.id}
                className="btn-secondary flex items-center gap-2"
              >
                {loadingDeeper === script.id ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  '🎬 Go Deeper'
                )}
              </button>
            </div>

            {/* Deeper Section */}
            {expandedCard === script.id && deeperScripts[script.id] && (
              <div className="mt-4 p-4 bg-[#0f0f0f] rounded-lg border border-[#262626] animate-fadeIn">
                <h3 className="text-lg font-semibold mb-4">🎬 Production Script</h3>
                {deeperScripts[script.id].production?.shots?.map((shot, i) => {
                  const shotObj = shot as { sceneNumber?: number; duration?: string; camera?: { angle?: string; movement?: string; lens?: string }; lighting?: string; audio?: string; broll?: string[]; textOverlay?: { text?: string; timing?: string }; transition?: string };
                  return (
                  <div key={i} className="mb-4 p-3 bg-black rounded border border-[#262626]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Scene {shotObj.sceneNumber}</span>
                      <span className="text-sm text-[#737373]">{shotObj.duration}</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>📷 Camera: {shotObj.camera?.angle} • {shotObj.camera?.movement} • {shotObj.camera?.lens}</div>
                      <div>💡 Lighting: {shotObj.lighting}</div>
                      <div>🎵 Audio: {shotObj.audio}</div>
                      {shotObj.broll && <div>🎬 B-roll: {shotObj.broll.join(', ')}</div>}
                      {shotObj.textOverlay && (
                        <div>📝 Text: &quot;{shotObj.textOverlay.text}&quot; ({shotObj.textOverlay.timing})</div>
                      )}
                      {shotObj.transition && <div>➡️ Transition: {shotObj.transition}</div>}
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}