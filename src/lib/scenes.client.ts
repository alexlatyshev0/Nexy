import type { Scene } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Client-side version that accepts a Supabase client
export async function getFilteredScenesClient(
  supabaseClient: SupabaseClient,
  userId: string,
  options: {
    maxIntensity?: number;
    limit?: number;
    orderByPriority?: boolean;
  } = {}
): Promise<Scene[]> {
  const { maxIntensity = 5, limit = 10, orderByPriority = false } = options;

  // Get excluded scene IDs
  const { data: excludedIds } = await supabaseClient
    .rpc('get_excluded_scene_ids', { p_user_id: userId });

  // Get already seen scene IDs
  const { data: seen } = await supabaseClient
    .from('scene_responses')
    .select('scene_id')
    .eq('user_id', userId);

  const seenIds = seen?.map(s => s.scene_id) || [];
  const allExcluded = [...(excludedIds || []), ...seenIds];

  // Build query with optional priority ordering
  let query = supabaseClient
    .from('scenes')
    .select('*')
    .lte('intensity', maxIntensity);

  // Order by priority (lower = shown first) or by created_at
  if (orderByPriority) {
    query = query
      .order('priority', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  query = query.limit(limit);

  if (allExcluded.length > 0) {
    query = query.not('id', 'in', `(${allExcluded.join(',')})`);
  }

  const { data } = await query;

  return (data as Scene[]) || [];
}

// Get categories for scene tags
export async function getSceneCategories(
  supabaseClient: SupabaseClient,
  tags: string[]
): Promise<Array<{ slug: string; name: string }>> {
  if (!tags.length) return [];

  const { data } = await supabaseClient
    .from('tag_categories')
    .select('category:categories(slug, name)')
    .in('tag', tags);

  const categories = new Map<string, { slug: string; name: string }>();

  data?.forEach(item => {
    const cat = item.category as { slug: string; name: string } | null;
    if (cat && !categories.has(cat.slug)) {
      categories.set(cat.slug, cat);
    }
  });

  return Array.from(categories.values());
}
