import { createClient } from '@supabase/supabase-js';

// Cron job — runs every hour
// Finds posts that are due and marks them 'ready' (Phase 2 will actually send them)
export const handler = async () => {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const now = new Date().toISOString();

    // Find all scheduled posts that are due
    const { data: duePosts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now);

    if (fetchError) throw fetchError;

    if (!duePosts || duePosts.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ message: 'No posts due', checked_at: now }) };
    }

    // Mark them as 'ready' — Phase 2 will add actual posting here
    const ids = duePosts.map(p => p.id);
    const { error: updateError } = await supabase
      .from('scheduled_posts')
      .update({ status: 'ready', updated_at: now })
      .in('id', ids);

    if (updateError) throw updateError;

    console.log(`Marked ${ids.length} posts as ready`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Processed ${ids.length} posts`, ids })
    };
  } catch (error) {
    console.error('Cron error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
