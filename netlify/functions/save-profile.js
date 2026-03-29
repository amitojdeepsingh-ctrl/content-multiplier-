import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // Get auth token
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };
    }

    // Parse user ID directly from JWT — no HTTP call needed
    let userId;
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      userId = payload.sub;
    } catch {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
    }

    if (!userId) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Could not read user from token' }) };
    }

    // Parse body
    const updates = JSON.parse(event.body);

    // Only allow safe profile fields
    const allowed = ['org_type','brand_name','brand_description','industry',
      'target_age_groups','target_location','content_goals',
      'content_tone','custom_voice','onboarded','transforms_used','transforms_limit'];

    const safeUpdates = {};
    for (const key of allowed) {
      if (key in updates) safeUpdates[key] = updates[key];
    }

    if (Object.keys(safeUpdates).length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No valid fields' }) };
    }

    // Use service role — bypasses RLS
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('profiles')
      .update(safeUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message, code: error.code }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, profile: data }),
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
