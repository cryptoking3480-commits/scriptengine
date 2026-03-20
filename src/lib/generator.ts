import OpenAI from 'openai';

function createOpenAIClient(apiKey?: string) {
  return new OpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY,
  });
}

const NICHE_PROMPTS: Record<string, string> = {
  'beauty': 'You are the world\'s #1 beauty content creator with 10M followers and 15 years experience. You know exactly what makes beauty content go viral — transformations, honest reviews, skincare routines.',
  'skincare': 'You are the world\'s #1 beauty content creator with 10M followers and 15 years experience. You know exactly what makes beauty content go viral — transformations, honest reviews, skincare routines.',
  'fashion': 'You are the world\'s #1 fashion content creator with 10M followers. You know what makes fashion content go viral — outfit transitions, style hacks, before/afters.',
  'fitness': 'You are a top fitness influencer with 8M followers. You create transformation content, workout hooks, and motivation that drives massive engagement.',
  'food': 'You are a viral food creator with 10M followers. You make food look irresistible and recipes feel achievable.',
  'finance': 'You are the #1 finance educator on social media with 5M followers. You make complex money topics simple, relatable and viral for millennials and Gen Z.',
  'real-estate': 'You are a real estate content creator with 3M followers. You simplify property investing and create FOMO-driven content about dream homes and smart investments.',
  'tech': 'You are a tech reviewer with 5M followers. You make gadgets exciting, comparisons clear, buying decisions easy.',
  'education': 'You are an edutainment creator with 6M followers. You make learning addictive using storytelling and hooks.',
  'travel': 'You are a travel creator with 7M followers. You capture wanderlust, budget hacks, hidden gems.',
  'health': 'You are a health and wellness creator with 5M followers. You make medical topics simple, trustworthy and shareable.',
  'gaming': 'You are a gaming content creator with 8M followers. You create exciting gameplay moments, trending challenges, and engaging commentary.',
  'parenting': 'You are a parenting content creator with 5M followers. You share relatable moments, practical tips, and heartwarming stories.',
  'motivation': 'You are a top motivational speaker with 10M followers. You create inspiring content that drives action and transformation.',
  'comedy': 'You are a viral comedy creator with 10M followers. You know exactly what makes people laugh and share.',
  'music': 'You are a music creator with 10M followers. You create content that showcases talent and connects with fans.',
  'photography': 'You are a photography content creator with 5M followers. You share tips, tricks, and stunning visual content.',
  'business': 'You are a business mentor with 4M followers. You share real insights, startup stories, and money moves that inspire action.',
  'crypto': 'You are a crypto educator with 3M followers. You make complex blockchain topics simple and actionable.',
  'automotive': 'You are an automotive content creator with 4M followers. You review cars, share tips, and create exciting content.',
  'sports': 'You are a sports content creator with 8M followers. You create highlights, analysis, and engaging sports content.',
};

function getNichePrompt(niche: string): string {
  const normalizedNiche = niche.toLowerCase().trim();
  if (NICHE_PROMPTS[normalizedNiche]) {
    return NICHE_PROMPTS[normalizedNiche];
  }
  return `You are the #1 content creator in the ${niche} niche with millions of followers and 20 years of expertise. You create scroll-stopping viral content.`;
}

export interface GenerateParams {
  niche: string;
  platform: string;
  topic: string;
  videoLength: string;
  contentGoal: string;
  imageDesc?: string;
}

export interface ScriptOutput {
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

export async function generateScripts(params: GenerateParams, apiKey?: string): Promise<ScriptOutput[]> {
  const openai = createOpenAIClient(apiKey);
  const { niche, platform, topic, videoLength, contentGoal, imageDesc } = params;
  const nichePrompt = getNichePrompt(niche);

  const systemPrompt = `${nichePrompt}

Generate 5 viral video scripts for ${platform}. The video is about: "${topic}".
Video length: ${videoLength}
Content goal: ${contentGoal}
${imageDesc ? `Image reference: ${imageDesc}` : ''}

RULES:
- Never start hook with "Hey guys" or "Welcome back"
- Hook must create curiosity gap or pattern interrupt
- Script scenes must be specific: exact words + exact visuals
- Hashtags must be real, relevant, tiered by reach
- Virality score based on: hook strength, trend alignment, format match, emotional trigger

Output ONLY valid JSON array with exactly 5 scripts, no markdown. Each script must have:
- id (1-5)
- hook: string (the scroll-stopping opening)
- script.scenes: array of scene objects with timeRange, film, say, textOverlay, sound
- caption: string (with CTA)
- hashtags: { highReach: [], midReach: [], niche: [] }
- audio: suggested audio/voiceover
- thumbnail: thumbnail idea
- postTime: recommended posting time
- whyItWorks: 1 sentence explaining the virality
- viralityScore: number 1-100
- format: "${platform}"`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate 5 viral scripts now.' }
      ],
      temperature: 0.9,
      max_tokens: 8000,
    });

    const content = completion.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const scripts = JSON.parse(jsonMatch[0]) as ScriptOutput[];
    return scripts;
  } catch (error) {
    console.error('Error generating scripts:', error);
    throw error;
  }
}

export async function generateDeeperScript(
  niche: string,
  platform: string,
  topic: string,
  videoLength: string,
  originalScript: ScriptOutput,
  apiKey?: string
): Promise<string> {
  const openai = createOpenAIClient(apiKey);
  const nichePrompt = getNichePrompt(niche);

  const systemPrompt = `${nichePrompt}

Create a FULL PRODUCTION shooting script for ${platform}.
Video topic: "${topic}"
Video length: ${videoLength}

Original concept: ${originalScript.hook}

Provide a detailed production script with:
- Exact camera angles for each shot
- Detailed B-roll suggestions
- Transition recommendations
- Text overlay timing
- Lighting notes
- Sound design details

Output ONLY valid JSON, no markdown. Format:
{
  "production": {
    "overview": "brief overview",
    "shots": [
      {
        "sceneNumber": 1,
        "duration": "5 seconds",
        "camera": {
          "angle": "close-up",
          "movement": "dolly in",
          "lens": "85mm"
        },
        "lighting": "key light from left",
        "audio": "dialogue",
        "broll": ["B-roll suggestions"],
        "textOverlay": {
          "text": "text content",
          "timing": "0:00 - 0:03",
          "style": "bold white"
        },
        "transition": "cut"
      }
    ],
    "transitions": ["list of transitions"],
    "soundDesign": "sound design notes",
    "tips": ["production tips"]
  }
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate full production shooting script now.' }
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    return jsonMatch[0];
  } catch (error) {
    console.error('Error generating deeper script:', error);
    throw error;
  }
}