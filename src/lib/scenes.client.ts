import type { Scene, SceneV2 } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAdaptiveScenes } from './scene-progression';

// Client-side version that accepts a Supabase client
export async function getFilteredScenesClient(
  supabaseClient: SupabaseClient,
  userId: string,
  options: {
    maxIntensity?: number;
    limit?: number;
    orderByPriority?: boolean;
    enableAdaptiveFlow?: boolean;
    enableDedupe?: boolean;
  } = {}
): Promise<Scene[]> {
  const {
    maxIntensity = 5,
    limit = 10,
    orderByPriority = false,
    enableAdaptiveFlow = true,
    enableDedupe = true,
  } = options;

  // Get excluded scene IDs
  // If RPC function doesn't exist (404), fallback to empty array
  let excludedIds: string[] | null = null;
  const { data: rpcExcludedIds, error: excludedError } = await supabaseClient
    .rpc('get_excluded_scene_ids', { p_user_id: userId });
  
  if (excludedError) {
    // If function not found (404), it's okay - user might not have exclusions yet
    if (excludedError.code === 'PGRST202' || excludedError.message?.includes('not found')) {
      console.warn('[getFilteredScenesClient] RPC function get_excluded_scene_ids not found, using empty exclusions');
      excludedIds = [];
    } else {
      console.error('[getFilteredScenesClient] Error getting excluded IDs:', excludedError);
      excludedIds = []; // Fallback to empty on error
    }
  } else {
    excludedIds = rpcExcludedIds;
  }

  // Get already seen scene IDs (exclude body_map virtual scenes from seen list)
  const { data: seen, error: seenError } = await supabaseClient
    .from('scene_responses')
    .select('scene_id, question_type')
    .eq('user_id', userId);
  
  if (seenError) {
    console.error('[getFilteredScenesClient] Error getting seen scenes:', seenError);
  }

  // Filter out body_map virtual scenes from seen list (they shouldn't block regular scenes)
  const seenIds = seen
    ?.filter(s => {
      // Exclude body_map virtual scenes (they have IDs like "bodymap-*-{userId}")
      if (s.scene_id && typeof s.scene_id === 'string' && s.scene_id.includes('bodymap-')) {
        return false;
      }
      // Exclude body_map question_type responses
      if (s.question_type === 'body_map') {
        return false;
      }
      return true;
    })
    .map(s => s.scene_id)
    .filter((id): id is string => {
      // Only include valid UUIDs (exclude virtual scene IDs like "bodymap-*-{userId}")
      if (!id || typeof id !== 'string') return false;
      // UUID format: 8-4-4-4-12 hex characters
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(id);
    }) || [];
  
  // Combine excluded IDs, filtering out invalid UUIDs
  const validExcludedIds = (excludedIds || []).filter((id): id is string => {
    if (!id || typeof id !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  });
  
  // Combine all excluded scene IDs
  const allExcluded = [...validExcludedIds, ...seenIds];
  
  console.log('[getFilteredScenesClient] Excluded scenes:', {
    excludedFromRPC: excludedIds?.length || 0,
    validExcludedIds: validExcludedIds.length,
    seenIds: seenIds.length,
    totalExcluded: allExcluded.length,
  });


  // Build query to get all eligible scenes
  // V2 composite scenes only (no question_type filter - that column was removed)
  let query = supabaseClient
    .from('scenes')
    .select('*')
    .eq('version', 2)
    .lte('intensity', maxIntensity);

  if (allExcluded.length > 0) {
    // Use proper Supabase/PostgREST syntax: single quotes for string values
    const excludedList = `('${allExcluded.join("','")}')`;
    query = query.not('id', 'in', excludedList);
  }

  // For adaptive flow, we need all scenes to score them
  // Otherwise, use limit in query
  if (!enableAdaptiveFlow) {
    // Order by priority (lower = shown first) or by created_at
    if (orderByPriority) {
      query = query
        .order('priority', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    query = query.limit(limit);
  }

  const { data, error: queryError } = await query;
  
  if (queryError) {
    console.error('[getFilteredScenesClient] Error fetching scenes:', queryError);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Use adaptive flow if enabled
  if (enableAdaptiveFlow) {
    const adaptiveScenes = await getAdaptiveScenes(
      supabaseClient,
      userId,
      data as Scene[],
      {
        maxIntensity,
        limit,
        enableDedupe,
        enableAdaptiveScoring: true,
      }
    );
    
    // If adaptive flow returns no scenes, fallback to priority-based sorting
    // This can happen if dedupe filters everything or user has no preferences yet
    if (adaptiveScenes.length === 0 && data && data.length > 0) {
      console.log('[getFilteredScenesClient] Adaptive flow returned no scenes, using fallback');
      // Filter V2 composite scenes
      const v2Scenes = (data as Scene[]).filter((s) => {
        const scene = s as SceneV2;
        return scene.version === 2 && Array.isArray(scene.elements);
      }) as SceneV2[];
      
      // Sort by priority
      const sorted = [...v2Scenes].sort((a, b) => {
        const priorityA = a.priority || 50;
        const priorityB = b.priority || 50;
        return priorityA - priorityB;
      });
      
      return sorted.slice(0, limit);
    }
    
    return adaptiveScenes;
  }

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
