import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const updates = JSON.parse(event.body);

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify auth token
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid session — please log in again' }) };
    }

    // Always-safe core fields (these columns exist from the start)
    const coreFields = ['industry', 'content_tone', 'onboarded', 'transforms_used', 'transforms_limit'];

    // Extended fields — only include if they have actual content (avoid hanging on missing columns)
    const extendedFields = ['org_type', 'brand_name', 'brand_description', 'target_age_groups', 'target_location', 'content_goals', 'custom_voice'];

    // Build safe update object
    const safeUpdates = {};

    for (const key of coreFields) {
      if (key in updates) safeUpdates[key] = updates[key];
    }

    for (const key of extendedFields) {
      if (key in updates) safeUpdates[key] = updates[key];
    }

    if (Object.keys(safeUpdates).length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No valid fields to update' }) };
    }

    console.log('Updating profile for user:', user.id, 'fields:', Object.keys(safeUpdates));

    // First, try the full update with a timeout
    const updateWithTimeout = new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Supabase update timed out')), 8000);
      try {
        const result = await supabase
          .from('profiles')
          .update(safeUpdates)
          .eq('id', user.id)
          .select()
          .single();
        clearTimeout(timer);
        resolve(result);
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    });

    let result;
    try {
      result = await updateWithTimeout;
    } catch (timeoutErr) {
      // If full update timed out, try with only core fields
      console.log('Full update timed out, falling back to core fields only');
      const coreOnly = {};
      for (const key of coreFields) {
        if (key in safeUpdates) coreOnly[key] = safeUpdates[key];
      }
      // Also include simple text fields that are likely to exist
      if ('content_tone' in safeUpdates) coreOnly.content_tone = safeUpdates.content_tone;
      if ('industry' in safeUpdates) coreOnly.industry = safeUpdates.industry;
      if ('onboarded' in safeUpdates) coreOnly.onboarded = safeUpdates.onboarded;

      result = await supabase
        .from('profiles')
        .update(coreOnly)
        .eq('id', user.id)
        .select()
        .single();
    }

    const { data, error } = result;

    if (error) {
      console.error('Profile update error:', error.message, error.code);

      // If the error is about missing columns, try again with only existing columns
      if (error.message && error.message.includes('column')) {
        const fallbackUpdates = {};
        for (const key of coreFields) {
          if (key in safeUpdates) fallbackUpdates[key] = safeUpdates[key];
        }

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .update(fallbackUpdates)
          .eq('id', user.id)
          .select()
          .single();

        if (fallbackError) {
          return { statusCode: 500, body: JSON.stringify({ error: fallbackError.message, hint: 'Run the SQL to add missing columns' }) };
        }

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: true, profile: fallbackData, warning: 'Some fields not saved — run the SQL to add missing columns' }),
        };
      }

      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, profile: data }),
    };
  } catch (err) {
    console.error('Save profile error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
