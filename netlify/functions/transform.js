import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const platformInstructions = {
  twitter: 'TWITTER: Write 7 tweets (max 280 chars each, numbered 1/7 through 7/7)',
  linkedin: 'LINKEDIN: Write 3 LinkedIn posts (100-200 words each, professional tone)',
  instagram: 'INSTAGRAM: Write 3 Instagram captions (80-120 words each, with emojis and 5 relevant hashtags)',
  email: 'EMAIL: Write 1 email newsletter (200-300 words, with 3 subject line options at the top)',
  tiktok: 'TIKTOK: Write 5 TikTok hooks (under 15 words each, punchy and scroll-stopping)'
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
      max_tokens: 3000,
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
