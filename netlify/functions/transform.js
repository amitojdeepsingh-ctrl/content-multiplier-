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

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { content, platforms } = JSON.parse(event.body);

    if (!content || !platforms || platforms.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Content and platforms are required' }) };
    }

    // Build one combined prompt for all platforms at once
    const sections = platforms.map(p => platformInstructions[p]).filter(Boolean).join('\n\n');

    const prompt = `You are a social media expert. Transform the content below into posts for each platform listed.

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
(tiktok hooks here)

Only include sections for the platforms requested below.

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
