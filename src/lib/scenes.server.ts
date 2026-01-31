import { createClient } from '@/lib/supabase/server';
import type { Scene } from '@/lib/types';

export async function getNextScene(userId: string, maxIntensity = 5): Promise<Scene | null> {
  const supabase = await createClient();

  // Get excluded scene IDs using the database function
  const { data: excludedIds } = await supabase
    .rpc('get_excluded_scene_ids', { p_user_id: userId });

  // Get already seen scene IDs
  const { data: seen } = await supabase
    .from('scene_responses')
    .select('scene_id')
    .eq('user_id', userId);

  const seenIds = seen?.map(s => s.scene_id) || [];
  const allExcluded = [...(excludedIds || []), ...seenIds];

  // Build query - only active scenes
  let query = supabase
    .from('scenes')
    .select('*')
    .eq('is_active', true)
    .lte('intensity', maxIntensity);

  if (allExcluded.length > 0) {
    // Use proper Supabase/PostgREST syntax: single quotes for string values
    const excludedList = `('${allExcluded.join("','")}')`;
    query = query.not('id', 'in', excludedList);
  }

  const { data } = await query.limit(1).single();

  return data as Scene | null;
}

export async function getFilteredScenes(
  userId: string,
  options: {
    maxIntensity?: number;
    limit?: number;
  } = {}
): Promise<Scene[]> {
  const supabase = await createClient();
  const { maxIntensity = 5, limit = 10 } = options;

  // Get excluded scene IDs
  const { data: excludedIds } = await supabase
    .rpc('get_excluded_scene_ids', { p_user_id: userId });

  // Get already seen scene IDs
  const { data: seen } = await supabase
    .from('scene_responses')
    .select('scene_id')
    .eq('user_id', userId);

  const seenIds = seen?.map(s => s.scene_id) || [];
  const allExcluded = [...(excludedIds || []), ...seenIds];

  // Build query - only active scenes
  let query = supabase
    .from('scenes')
    .select('*')
    .eq('is_active', true)
    .lte('intensity', maxIntensity)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (allExcluded.length > 0) {
    // Use proper Supabase/PostgREST syntax: single quotes for string values
    const excludedList = `('${allExcluded.join("','")}')`;
    query = query.not('id', 'in', excludedList);
  }

  const { data } = await query;

  return (data as Scene[]) || [];
}
