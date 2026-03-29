import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const platformInstructions = {
  twitter:    'TWITTER: Write 3 tweets (max 280 chars each, punchy and engaging, numbered Tweet 1, Tweet 2, Tweet 3)',
  linkedin:   'LINKEDIN: Write 3 LinkedIn posts (100-200 words each, professional tone, each separated by a blank line)',
  instagram:  'INSTAGRAM: Write 3 Instagram captions (80-120 words each, with emojis and 5 relevant hashtags, each separated by a blank line)',
  facebook:   'FACEBOOK: Write 3 Facebook posts (80-150 words each, conversational and engaging, include a question to spark comments, each separated by a blank line)',
  threads:    'THREADS: Write 3 Threads posts (max 500 chars each, casual and conversational tone like talking to a friend, each separated by a blank line)',
  tiktok:     'TIKTOK: Write 3 TikTok video packages. Each package must have:\n- HOOK: One punchy opening line (under 15 words, scroll-stopping)\n- SCRIPT: A 20-30 second spoken script (about 60-80 words, energetic and conversational)\n- HASHTAGS: 5 relevant hashtags\nSeparate each package with "---"',
  youtube:    'YOUTUBE: Write 1 YouTube video description (150-200 words) with: a compelling first 2 lines, timestamps/chapters placeholder, and 10 SEO tags at the bottom prefixed with "Tags:"',
  pinterest:  'PINTEREST: Write 3 Pinterest pin descriptions (50-80 words each, include 3-5 hashtags, focus on inspiration and discovery, each separated by a blank line)',
  reddit:     'REDDIT: Write 3 Reddit posts. Each must have a title line prefixed with "Title:" and a body (100-150 words, informative, no self-promotion tone). Separate each post with "---"',
  whatsapp:   'WHATSAPP: Write 3 WhatsApp broadcast messages (50-80 words each, friendly and personal tone, no formal language, include a clear call to action, each separated by a blank line)',
  newsletter: 'NEWSLETTER: Write 1 long-form newsletter article (400-500 words) in Substack/Medium style with: a bold headline, engaging intro, 3 key sections with subheadings, and a closing takeaway',
  email:      'EMAIL: Write 1 email newsletter (200-300 words) with 3 subject line options at the very top prefixed with "Subject line options:" then the full email body below',
};

const industryLabels = {
  coaching: 'Coaching & Consulting', ecommerce: 'E-commerce & Products',
  saas: 'SaaS & Tech', creator: 'Content Creation', agency: 'Marketing Agency',
  realestate: 'Real Estate', finance: 'Finance & Investing', health: 'Health & Wellness',
  education: 'Education & Courses', food: 'Food & Restaurant', fashion: 'Fashion & Beauty',
  travel: 'Travel & Hospitality', legal: 'Legal & Professional Services',
  nonprofit: 'Non-profit / NGO', immigration: 'Immigration Services', other: 'General',
};

const locationLabels = {
  local: 'local audience', national: 'national audience', northamerica: 'North American audience',
  uk_europe: 'UK & European audience', asia: 'Asian & Pacific audience', global: 'global audience',
};

const ageLabels = {
  'under18': 'under 18', '18-24': '18-24 year olds', '25-34': '25-34 year olds',
  '35-44': '35-44 year olds', '45-54': '45-54 year olds', '55+': 'over 55s', all: 'all age groups',
};

const toneLabels = {
  professional: 'professional and authoritative',
  casual: 'casual, warm, and approachable',
  bold: 'bold, direct, and no-nonsense',
  educational: 'educational and informative',
  inspirational: 'inspirational and story-driven',
  humorous: 'humorous and entertaining',
};

const goalLabels = {
  awareness: 'building brand awareness', leads: 'generating leads', sales: 'driving sales',
  community: 'growing a community', authority: 'establishing thought leadership',
  traffic: 'driving website traffic', engagement: 'increasing engagement', recruitment: 'attracting talent',
};

function buildBrandContext(brandProfile) {
  if (!brandProfile) return '';

  const lines = [];

  if (brandProfile.brand_name) {
    const type = brandProfile.org_type === 'personal' ? 'personal brand' : 'business';
    lines.push(`Brand: "${brandProfile.brand_name}" (${type})`);
  }

  if (brandProfile.brand_description) {
    lines.push(`What they do: ${brandProfile.brand_description}`);
  }

  if (brandProfile.industry && industryLabels[brandProfile.industry]) {
    lines.push(`Industry: ${industryLabels[brandProfile.industry]}`);
  }

  if (brandProfile.target_age_groups) {
    const ages = brandProfile.target_age_groups.split(',')
      .map(a => ageLabels[a.trim()] || a.trim())
      .filter(Boolean);
    if (ages.length > 0) lines.push(`Target audience ages: ${ages.join(', ')}`);
  }

  if (brandProfile.target_location && locationLabels[brandProfile.target_location]) {
    lines.push(`Geographic focus: ${locationLabels[brandProfile.target_location]}`);
  }

  if (brandProfile.content_goals) {
    const goals = brandProfile.content_goals.split(',')
      .map(g => goalLabels[g.trim()] || g.trim())
      .filter(Boolean);
    if (goals.length > 0) lines.push(`Content goals: ${goals.join(', ')}`);
  }

  if (brandProfile.content_tone && toneLabels[brandProfile.content_tone]) {
    lines.push(`Tone & voice: ${toneLabels[brandProfile.content_tone]}`);
  }

  if (brandProfile.custom_voice) {
    lines.push(`Additional voice instructions: ${brandProfile.custom_voice}`);
  }

  if (lines.length === 0) return '';

  return `
BRAND CONTEXT — Apply this to EVERY post you write:
${lines.map(l => `• ${l}`).join('\n')}

Write every post AS IF you are the social media manager for "${brandProfile.brand_name || 'this brand'}".
Match the tone, speak to the exact audience described, and write with the stated goals in mind.
Generic, one-size-fits-all content is NOT acceptable — make it specific to this brand.
`;
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { content, platforms, brandProfile } = JSON.parse(event.body);

    if (!content || !platforms || platforms.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Content and platforms are required' }) };
    }

    // Build one combined prompt for all platforms at once
    const sections = platforms.map(p => platformInstructions[p]).filter(Boolean).join('\n\n');
    let brandContext = '';
    try {
      brandContext = buildBrandContext(brandProfile) || '';
    } catch (e) {
      console.error('Brand context error:', e.message);
    }

    const prompt = `You are an expert social media manager. Transform the content below into platform-specific posts.
${brandContext}
IMPORTANT: Use this EXACT format with these EXACT section headers:
---TWITTER---
(twitter posts here)
---LINKEDIN---
(linkedin posts here)
---INSTAGRAM---
(instagram posts here)
---EMAIL---
(email here)
---TIKTOK---
(tiktok content here)

Only include sections for the platforms requested below. Do not include any other text outside the sections.

CONTENT TO TRANSFORM:
${content}

PLATFORMS REQUESTED:
${sections}`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 5000,
      messages: [{ role: 'user', content: prompt }]
    });

    const raw = response.content[0].text;

    // Parse the response into per-platform results
    const results = {};
    for (const platform of platforms) {
      const header = `---${platform.toUpperCase()}---`;
      const nextHeaders = platforms
        .filter(p => p !== platform)
        .map(p => `---${p.toUpperCase()}---`);

      const start = raw.indexOf(header);
      if (start === -1) {
        results[platform] = raw; // fallback: return full response
        continue;
      }

      let end = raw.length;
      for (const next of nextHeaders) {
        const pos = raw.indexOf(next, start + header.length);
        if (pos !== -1 && pos < end) end = pos;
      }

      results[platform] = raw.slice(start + header.length, end).trim();
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results })
    };
  } catch (error) {
    console.error('Transform error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
