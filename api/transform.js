import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const MASTER_PROMPT = `You are a professional social media content strategist. Transform the given content into platform-specific posts.

INPUT CONTENT:
"""
{input_content}
"""

PLATFORMS TO GENERATE: {platforms}

{brand_voice}

Generate content for each platform following these guidelines:

FOR TWITTER: 7 tweets in thread format, max 260 chars each
FOR LINKEDIN: 5 posts, 150-350 words each
FOR INSTAGRAM: 3 captions, 100-220 words each with emojis
FOR EMAIL: 1 newsletter with 5 subject lines and body text
FOR TIKTOK: 5 hooks under 15 words each with visual directions

Return ONLY the content in this format:

=== TWITTER ===
1/7 [tweet]
2/7 [tweet]
...

=== LINKEDIN ===
POST 1:
[full post]
...

=== INSTAGRAM ===
CAPTION 1:
[caption]
Hashtags: #tag1 #tag2...
...

=== EMAIL ===
Subject Lines:
1. [option]
...
Preview: [text]
[email body]

=== TIKTOK ===
HOOK 1: [text]
Visual: [direction]
...

=== END ===`

function extractSection(text, startMarker, endMarker = null) {
  try {
    const startIdx = text.indexOf(startMarker)
    if (startIdx === -1) return ''
    const contentStart = startIdx + startMarker.length
    if (endMarker) {
      const endIdx = text.indexOf(endMarker, contentStart)
      return endIdx > -1 ? text.substring(contentStart, endIdx).trim() : text.substring(contentStart).trim()
    }
    return text.substring(contentStart).trim()
  } catch {
    return ''
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization' })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify JWT with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { content, platforms, brandVoice } = req.body

    if (!content || !platforms || platforms.length === 0) {
      return res.status(400).json({ error: 'Missing content or platforms' })
    }

    // Check usage
    const { data: profile } = await supabase
      .from('profiles')
      .select('transforms_used, transforms_limit')
      .eq('id', user.id)
      .single()

    if (profile.transforms_used >= profile.transforms_limit) {
      return res.status(402).json({ error: 'Limit exceeded' })
    }

    // Build brand voice block
    let brandVoiceBlock = ''
    if (brandVoice) {
      brandVoiceBlock = `BRAND VOICE:\n${brandVoice}`
    }

    // Call Claude
    const prompt = MASTER_PROMPT.replace('{input_content}', content)
      .replace('{platforms}', platforms.join(', '))
      .replace('{brand_voice}', brandVoiceBlock)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })

    const aiOutput = response.content[0].text

    // Parse response
    const results = {}
    if (platforms.includes('twitter')) {
      results.twitter = extractSection(aiOutput, '=== TWITTER ===', '=== LINKEDIN ===')
    }
    if (platforms.includes('linkedin')) {
      results.linkedin = extractSection(aiOutput, '=== LINKEDIN ===', '=== INSTAGRAM ===')
    }
    if (platforms.includes('instagram')) {
      results.instagram = extractSection(aiOutput, '=== INSTAGRAM ===', '=== EMAIL ===')
    }
    if (platforms.includes('email')) {
      results.email = extractSection(aiOutput, '=== EMAIL ===', '=== TIKTOK ===')
    }
    if (platforms.includes('tiktok')) {
      results.tiktok = extractSection(aiOutput, '=== TIKTOK ===', '=== END ===')
    }

    // Save to database
    await supabase.from('transformations').insert({
      user_id: user.id,
      input_content: content.substring(0, 1000),
      input_length: content.length,
      platforms,
      results,
    })

    // Update usage
    await supabase
      .from('profiles')
      .update({ transforms_used: profile.transforms_used + 1 })
      .eq('id', user.id)

    res.status(200).json({
      results,
      creditsRemaining: profile.transforms_limit - (profile.transforms_used + 1),
    })
  } catch (error) {
    console.error('Transform error:', error)
    res.status(500).json({ error: error.message || 'Transform failed' })
  }
}
