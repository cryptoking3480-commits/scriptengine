'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Sparkles, Instagram, Youtube, Music, Facebook, Linkedin, Twitter, Camera } from 'lucide-react';
import { saveScript } from '@/lib/storage';

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

  useEffect(() => {
    // Load default preferences only (API key is backend-only, never checked in frontend)
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.default_niche) setNiche(data.settings.default_niche);
        if (data.settings?.default_platform) setSelectedPlatforms([data.settings.default_platform]);
      })
      .catch(console.error);
  }, []);

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
      saveScript({
        niche: finalNiche,
        platform: selectedPlatforms[0],
        topic,
        videoLength,
        imageDesc: imageDesc || null,
        outputs: JSON.stringify(data.scripts),
      });
      toast.success('Generated 5 scripts successfully!');
    } catch (error) {
      console.error('Error generating scripts:', error);
      toast.error('Failed to generate scripts');
    } finally {
      setLoading(false);
    }
  };

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

  const isApiKeyMissing = false;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
      {isApiKeyMissing && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
          <div className="text-yellow-500 shrink-0">⚠️</div>
          <p className="text-sm">
            API key not configured. Please contact the admin.
          </p>
        </div>
      )}

      <h1 className="text-xl sm:text-2xl font-bold mb-1">Generate Scripts</h1>
      <p className="text-[#737373] text-sm mb-6 sm:mb-8">Create viral video scripts in seconds</p>

      <div className="space-y-6 sm:space-y-8">
        {/* Platform Selection */}
        <section>
          <h2 className="text-xs sm:text-sm font-medium text-[#a3a3a3] mb-3">SELECT PLATFORM</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedPlatforms.includes(platform.value);
              return (
                <button
                  key={platform.value}
                  onClick={() => togglePlatform(platform.value)}
                  className={`p-2 sm:p-3 md:p-4 rounded-lg border transition-all flex flex-col items-center gap-1 sm:gap-2 ${
                    isSelected
                      ? 'bg-[#22c55e]/10 border-[#22c55e] text-[#22c55e]'
                      : 'bg-black border-[#262626] hover:border-[#404040]'
                  }`}
                >
                  <Icon size={16} className="sm:w-[20px] sm:h-[20px]" />
                  <span className="text-[10px] sm:text-xs font-medium leading-tight">{platform.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Niche Selection */}
        <section>
          <h2 className="text-xs sm:text-sm font-medium text-[#a3a3a3] mb-3">SELECT NICHE</h2>
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
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-black border border-[#262626] outline-none transition-colors text-sm"
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
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-black border border-[#262626] outline-none transition-colors text-sm"
              />
            )}
          </div>
        </section>

        {/* Video Topic */}
        <section>
          <h2 className="text-xs sm:text-sm font-medium text-[#a3a3a3] mb-3">WHAT IS YOUR VIDEO ABOUT?</h2>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. A sunscreen cream that works for Indian skin..."
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-black border border-[#262626] outline-none transition-colors h-24 sm:h-32 resize-none text-sm"
          />
        </section>

        {/* Image Upload (Optional) */}
        <section>
          <h2 className="text-xs sm:text-sm font-medium text-[#a3a3a3] mb-3">UPLOAD IMAGE (OPTIONAL)</h2>
          <div className="border-2 border-dashed border-[#262626] rounded-lg p-4 sm:p-8 text-center hover:border-[#404040] transition-colors">
            <Camera className="mx-auto text-[#525252] mb-2 sm:mb-3 w-6 h-6 sm:w-8 sm:h-8" />
            <p className="text-xs sm:text-sm text-[#737373]">
              Describe product/service for better script (optional)
            </p>
            <input
              type="text"
              value={imageDesc}
              onChange={(e) => setImageDesc(e.target.value)}
              placeholder="Describe the image here..."
              className="mt-3 w-full px-3 sm:px-4 py-2 rounded-lg bg-black border border-[#262626] outline-none transition-colors text-sm"
            />
          </div>
        </section>

        {/* Video Length */}
        <section>
          <h2 className="text-xs sm:text-sm font-medium text-[#a3a3a3] mb-3">VIDEO LENGTH</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {videoLengths.map((length) => (
              <button
                key={length.value}
                onClick={() => setVideoLength(length.value)}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg border transition-all text-sm ${
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
          <h2 className="text-xs sm:text-sm font-medium text-[#a3a3a3] mb-3">CONTENT GOAL</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {contentGoals.map((goal) => {
              const isSelected = contentGoal === goal.value;
              return (
                <button
                  key={goal.value}
                  onClick={() => setContentGoal(goal.value)}
                  className={`p-3 sm:p-4 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'bg-[#22c55e]/10 border-[#22c55e]'
                      : 'bg-black border-[#262626] hover:border-[#404040]'
                  }`}
                >
                  <div className={`font-medium text-sm ${isSelected ? 'text-[#22c55e]' : ''}`}>
                    {goal.label}
                  </div>
                  <div className="text-[10px] sm:text-xs text-[#737373] mt-0.5 sm:mt-1">{goal.desc}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Generate Button */}
        <button
          onClick={generateScripts}
          disabled={loading || isApiKeyMissing}
          className="w-full py-3 sm:py-4 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#262626] disabled:text-[#525252] text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generate 5 Scripts</span>
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
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="text-[#22c55e] hover:underline mb-4 sm:mb-6 text-sm"
      >
        ← Back to Generate
      </button>

      <h1 className="text-xl sm:text-2xl font-bold mb-1">Generated Scripts</h1>
      <p className="text-[#737373] text-sm mb-6 sm:mb-8">
        {niche} • {platform} • {topic.substring(0, 30)}...
      </p>

      <div className="space-y-4 sm:space-y-6">
        {scripts.map((script, index) => (
          <div
            key={script.id}
            className="card animate-fadeIn"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#262626]">
              <span className="text-base sm:text-lg font-bold">#{script.id}</span>
              <span className={`badge text-[10px] sm:text-xs ${getViralityColor(script.viralityScore)}`}>
                Virality: {script.viralityScore}
              </span>
              <span className="platform-badge text-[10px] sm:text-xs">{script.format}</span>
            </div>

            {/* Hook */}
            <div className="mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-[#22c55e] mb-1 sm:mb-2">🎯 HOOK</h3>
              <p className="text-base sm:text-lg font-semibold leading-snug">{script.hook}</p>
            </div>

            {/* Script */}
            <div className="mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-[#22c55e] mb-2">🎬 SCRIPT</h3>
              <div className="space-y-3 sm:space-y-4">
                {script.script.scenes.map((scene, i) => (
                  <div key={i} className="bg-black/50 rounded-lg p-3 sm:p-4 border border-[#262626]">
                    <div className="text-xs text-[#737373] mb-2 sm:mb-3">{scene.timeRange}</div>
                    <div className="grid gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <div className="flex gap-2">
                        <span className="text-[#525252] shrink-0">🎥 Film:</span>
                        <span>{scene.film}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#525252] shrink-0">🗣 Say:</span>
                        <span>{scene.say}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#525252] shrink-0">📝 Text:</span>
                        <span>{scene.textOverlay}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#525252] shrink-0">🎵 Sound:</span>
                        <span>{scene.sound}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Caption */}
            <div className="mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-[#22c55e] mb-1 sm:mb-2">✍️ CAPTION</h3>
              <p className="text-xs sm:text-sm leading-relaxed">{script.caption}</p>
            </div>

            {/* Hashtags */}
            <div className="mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-[#22c55e] mb-1 sm:mb-2">#️⃣ HASHTAGS</h3>
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="break-words">
                  <span className="text-[#737373]">High:</span>{' '}
                  <span className="text-[#a3a3a3]">{script.hashtags.highReach.join(' ')}</span>
                </div>
                <div className="break-words">
                  <span className="text-[#737373]">Mid:</span>{' '}
                  <span className="text-[#a3a3a3]">{script.hashtags.midReach.join(' ')}</span>
                </div>
                <div className="break-words">
                  <span className="text-[#737373]">Niche:</span>{' '}
                  <span className="text-[#a3a3a3]">{script.hashtags.niche.join(' ')}</span>
                </div>
              </div>
            </div>

            {/* Audio, Thumbnail, Post Time */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 sm:mb-4 text-xs sm:text-sm">
              <div><span className="text-[#737373]">🎵</span> {script.audio}</div>
              <div><span className="text-[#737373]">🖼</span> {script.thumbnail}</div>
              <div><span className="text-[#737373]">⏰</span> {script.postTime}</div>
            </div>

            {/* Why It Works */}
            <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#262626]">
              <div className="text-xs sm:text-sm">
                <span className="text-[#22c55e]">💡 Why:</span> {script.whyItWorks}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => copyAll(script)}
                className="btn-secondary flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 sm:py-2 px-3 sm:px-4"
              >
                📋 Copy All
              </button>
              <button
                onClick={() => goDeeper(script)}
                disabled={loadingDeeper === script.id}
                className="btn-secondary flex items-center justify-center gap-2 text-xs sm:text-sm py-2.5 sm:py-2 px-3 sm:px-4"
              >
                {loadingDeeper === script.id ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  '🎬 Go Deeper'
                )}
              </button>
            </div>

            {/* Deeper Section */}
            {expandedCard === script.id && deeperScripts[script.id] && (
              <div className="mt-4 p-3 sm:p-4 bg-[#0f0f0f] rounded-lg border border-[#262626] animate-fadeIn">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">🎬 Production Script</h3>
                {deeperScripts[script.id].production?.shots?.map((shot, i) => {
                  const shotObj = shot as { sceneNumber?: number; duration?: string; camera?: { angle?: string; movement?: string; lens?: string }; lighting?: string; audio?: string; broll?: string[]; textOverlay?: { text?: string; timing?: string }; transition?: string };
                  return (
                  <div key={i} className="mb-3 sm:mb-4 last:mb-0 p-2.5 sm:p-3 bg-black rounded border border-[#262626]">
                    <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                      <span className="font-medium text-sm">Scene {shotObj.sceneNumber}</span>
                      <span className="text-xs text-[#737373]">{shotObj.duration}</span>
                    </div>
                    <div className="text-xs sm:text-sm space-y-1">
                      <div>📷 {shotObj.camera?.angle} • {shotObj.camera?.movement} • {shotObj.camera?.lens}</div>
                      <div>💡 {shotObj.lighting}</div>
                      <div>🎵 {shotObj.audio}</div>
                      {shotObj.broll && <div>🎬 {shotObj.broll.join(', ')}</div>}
                      {shotObj.textOverlay && (
                        <div>📝 &ldquo;{shotObj.textOverlay.text}&rdquo; ({shotObj.textOverlay.timing})</div>
                      )}
                      {shotObj.transition && <div>➡️ {shotObj.transition}</div>}
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