import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const updates = JSON.parse(event.body);

    // Use service role key — bypasses RLS entirely
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify the user from their auth token
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid session — please log in again' }) };
    }

    // Only allow updating safe profile fields (never allow changing user_id etc.)
    const allowed = [
      'org_type', 'brand_name', 'brand_description', 'industry',
      'target_age_groups', 'target_location', 'content_goals',
      'content_tone', 'custom_voice', 'onboarded',
      'transforms_used', 'transforms_limit',
    ];

    const safeUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowed.includes(key))
    );

    if (Object.keys(safeUpdates).length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No valid fields to update' }) };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(safeUpdates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, profile: data }),
    };
  } catch (err) {
    console.error('Save profile error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
