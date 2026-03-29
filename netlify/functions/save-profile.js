import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // Parse user ID directly from JWT — no HTTP call
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };

    let userId;
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      userId = payload.sub;
    } catch {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
    }
    if (!userId) return { statusCode: 401, body: JSON.stringify({ error: 'No user ID in token' }) };

    // Parse and filter updates
    const updates = JSON.parse(event.body);
    const allowed = ['org_type','brand_name','brand_description','industry',
      'target_age_groups','target_location','content_goals',
      'content_tone','custom_voice','onboarded','transforms_used','transforms_limit'];

    const safeUpdates = { id: userId };
    for (const key of allowed) {
      if (key in updates) safeUpdates[key] = updates[key];
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Use UPSERT instead of UPDATE — avoids RLS UPDATE hang
    const dbCall = supabase
      .from('profiles')
      .upsert(safeUpdates, { onConflict: 'id' })
      .select()
      .single();

    // Hard 8-second timeout on the DB call
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database call timed out after 8s')), 8000)
    );

    const { data, error } = await Promise.race([dbCall, timeout]);

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
