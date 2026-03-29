import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { posts } = JSON.parse(event.body);

    if (!posts || posts.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No posts provided' }) };
    }

    // Use service role key to bypass RLS — user_id is validated via JWT below
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get user from auth token in header
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };
    }

    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid session — please log in again' }) };
    }

    // Force user_id to be the authenticated user (security)
    const rows = posts.map(p => ({
      user_id: user.id,
      platform: p.platform,
      content: p.content,
      scheduled_at: p.scheduled_at,
      status: 'scheduled',
    }));

    const { data, error } = await supabase.from('scheduled_posts').insert(rows).select();

    if (error) {
      console.error('Insert error:', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, count: rows.length, data }),
    };
  } catch (err) {
    console.error('Save scheduled post error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
