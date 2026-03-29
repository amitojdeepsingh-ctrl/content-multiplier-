import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { content, platforms } = JSON.parse(event.body);

    if (!content || !platforms || platforms.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Content and platforms are required' })
      };
    }

    const platformPrompts = {
      twitter: 'Generate 7 Twitter posts (max 280 chars each, numbered 1/7 to 7/7)',
      linkedin: 'Generate 5 LinkedIn posts (150-300 words each, professional tone)',
      instagram: 'Generate 3 Instagram captions (100-200 words each, with emojis and hashtags)',
      email: 'Generate 1 email newsletter (300-500 words, with 5 subject line options)',
      tiktok: 'Generate 5 TikTok hooks (under 15 words each, with visual directions)'
    };

    const results = {};

    // Generate content for each platform separately so we can split by platform
    for (const platform of platforms) {
      const prompt = platformPrompts[platform];
      if (!prompt) continue;

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Transform this content for ${platform}:\n\n${content}\n\n${prompt}\n\nReturn ONLY the posts/content, no extra commentary.`
          }
        ]
      });

      results[platform] = response.content[0].text;
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
