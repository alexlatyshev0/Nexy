import type { SupabaseClient } from '@supabase/supabase-js';
import type { Scene, SceneV2 } from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Exploration vs exploitation ratio (70% exploitation, 30% exploration)
 * Exploitation = show scenes matching user preferences
 * Exploration = show diverse/new scenes to discover new interests
 */
const EXPLOITATION_RATIO = 0.7;
// Note: Exploration ratio is implicitly (1 - EXPLOITATION_RATIO) = 0.3

/**
 * Initial phase: show mild scenes first (intensity 1-2)
 * After this many scenes, allow higher intensity based on comfort
 */
const MILD_PHASE_SCENE_COUNT = 10;

/**
 * Baseline scene slugs that act as gates for content filtering
 */
const BASELINE_SCENE_SLUGS = [
  'baseline-bdsm',
  'baseline-anal',
  'baseline-group',
  'baseline-public',
  'baseline-roleplay',
  'baseline-fetish',
  'baseline-pain',
  'baseline-humiliation',
  'baseline-bodyfluids',
  'baseline-voyeur',
  'baseline-exhib',
  'baseline-toys',
  'baseline-oral',
  'baseline-vanilla',
] as const;

/**
 * Neutral role directions that match any preference
 */
const NEUTRAL_ROLE_DIRECTIONS = ['mutual', 'universal', 'solo', 'group'];

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Get all element IDs that user has already selected across all scenes
 */
export async function getAnsweredElementIds(
  supabase: SupabaseClient,
  userId: string
): Promise<Set<string>> {
  const answeredElements = new Set<string>();

  // Get all scene responses with selected elements
  const { data: responses } = await supabase
    .from('scene_responses')
    .select('elements_selected')
    .eq('user_id', userId)
    .eq('skipped', false);

  if (responses) {
    for (const response of responses) {
      if (response.elements_selected && Array.isArray(response.elements_selected)) {
        for (const elementId of response.elements_selected) {
          answeredElements.add(elementId);
        }
      }
    }
  }

  return answeredElements;
}

/**
 * Get all tag_refs that user has already answered (from tag_preferences)
 */
export async function getAnsweredTagRefs(
  supabase: SupabaseClient,
  userId: string
): Promise<Set<string>> {
  const answeredTags = new Set<string>();

  // Get all tag preferences with interest_level > 0 or experience_level set
  const { data: tagPrefs } = await supabase
    .from('tag_preferences')
    .select('tag_ref, interest_level, experience_level')
    .eq('user_id', userId)
    .or('interest_level.gt.0,experience_level.not.is.null');

  if (tagPrefs) {
    for (const pref of tagPrefs) {
      if (pref.tag_ref) {
        answeredTags.add(pref.tag_ref);
      }
    }
  }

  return answeredTags;
}

/**
 * Check if scene should be skipped based on dedupe_by_tag logic
 * Scene is skipped if all its elements have already been answered
 * 
 * Note: This is a conservative check - we only skip if ALL elements are answered
 * This prevents skipping scenes too aggressively for new users
 */
export function shouldSkipSceneByDedupe(
  scene: SceneV2,
  answeredElementIds: Set<string>,
  answeredTagRefs: Set<string>
): boolean {
  if (!scene.elements || scene.elements.length === 0) {
    return false; // Can't dedupe if no elements
  }

  // If user hasn't answered any elements yet, don't skip
  if (answeredElementIds.size === 0 && answeredTagRefs.size === 0) {
    return false;
  }

  // Check if all elements have been answered
  const allElementsAnswered = scene.elements.every((element) => {
    // Check by element ID
    if (answeredElementIds.has(element.id)) {
      return true;
    }
    // Check by tag_ref
    if (element.tag_ref && answeredTagRefs.has(element.tag_ref)) {
      return true;
    }
    return false;
  });

  return allElementsAnswered;
}

// ============================================================================
// BASELINE GATES
// ============================================================================

/**
 * Mapping from baseline scene slugs to categories they gate
 * If user shows low interest (< 30) in baseline, related categories are filtered
 */
const BASELINE_CATEGORY_GATES: Record<string, string[]> = {
  'baseline-bdsm': ['control-power', 'bondage', 'discipline'],
  'baseline-anal': ['anal', 'pegging', 'prostate'],
  'baseline-group': ['threesome', 'gangbang', 'orgy', 'swinging'],
  'baseline-public': ['public', 'exhibitionism', 'outdoor'],
  'baseline-roleplay': ['roleplay', 'ageplay', 'petplay', 'uniform'],
  'baseline-fetish': ['fetish', 'feet', 'latex', 'leather'],
  'baseline-pain': ['impact', 'pain', 'cbt', 'nipple-torture'],
  'baseline-humiliation': ['humiliation', 'degradation', 'verbal'],
  'baseline-bodyfluids': ['watersports', 'spitting', 'cum'],
  'baseline-voyeur': ['voyeur', 'watching'],
  'baseline-exhib': ['exhib', 'showing-off'],
  'baseline-toys': ['toys', 'vibrator', 'dildo'],
  'baseline-oral': ['oral', 'blowjob', 'cunnilingus'],
  'baseline-vanilla': ['romantic', 'tender', 'vanilla'],
};

/**
 * Categories that are blocked by default until user explicitly shows interest
 * These are more extreme/niche categories that shouldn't appear early
 */
const HARDCORE_CATEGORIES_BLOCKED_BY_DEFAULT = [
  'pain', 'cbt', 'nipple-torture', 'impact',
  'humiliation', 'degradation',
  'watersports', 'spitting',
  'ageplay',
  'gangbang', 'orgy',
];

/**
 * Get baseline responses to determine which categories are gated
 * Returns a map of category -> boolean (true = allowed, false = blocked)
 */
export async function getBaselineGates(
  supabase: SupabaseClient,
  userId: string
): Promise<Map<string, boolean>> {
  const gates = new Map<string, boolean>();

  // Default: most categories allowed, but hardcore blocked by default
  for (const categories of Object.values(BASELINE_CATEGORY_GATES)) {
    for (const cat of categories) {
      // Block hardcore categories by default until user shows interest
      const isHardcore = HARDCORE_CATEGORIES_BLOCKED_BY_DEFAULT.includes(cat);
      gates.set(cat, !isHardcore);
    }
  }

  // Get baseline scene responses
  const { data: responses } = await supabase
    .from('scene_responses')
    .select('scene_slug, elements_selected, skipped')
    .eq('user_id', userId)
    .in('scene_slug', BASELINE_SCENE_SLUGS as unknown as string[]);

  if (!responses) return gates;

  // Process each baseline response
  for (const response of responses) {
    const sceneSlug = response.scene_slug;
    const gatedCategories = BASELINE_CATEGORY_GATES[sceneSlug];

    if (!gatedCategories) continue;

    // If user selected elements, UNLOCK related categories (including hardcore)
    const hasInterest = !response.skipped &&
      response.elements_selected &&
      response.elements_selected.length > 0;

    if (hasInterest) {
      // User showed interest - unlock all related categories
      for (const cat of gatedCategories) {
        gates.set(cat, true);
      }
    } else {
      // User skipped or selected nothing - block categories
      for (const cat of gatedCategories) {
        gates.set(cat, false);
      }
    }
  }

  // Also check tag_preferences for interest signals
  const { data: tagPrefs } = await supabase
    .from('tag_preferences')
    .select('tag_ref, interest_level, experience_level')
    .eq('user_id', userId);

  if (tagPrefs) {
    for (const pref of tagPrefs) {
      // Find categories related to this tag
      for (const categories of Object.values(BASELINE_CATEGORY_GATES)) {
        if (categories.some(cat => pref.tag_ref?.includes(cat))) {
          // If user shows interest (tried, want_to_try, or interest >= 40), unlock
          const showsInterest =
            pref.experience_level === 'tried' ||
            pref.experience_level === 'want_to_try' ||
            (pref.interest_level && pref.interest_level >= 40);

          // If user explicitly not interested, block
          const notInterested =
            pref.experience_level === 'not_interested' ||
            (pref.interest_level && pref.interest_level < 20);

          if (showsInterest) {
            for (const cat of categories) {
              gates.set(cat, true);
            }
          } else if (notInterested) {
            for (const cat of categories) {
              gates.set(cat, false);
            }
          }
        }
      }
    }
  }

  return gates;
}

/**
 * Check if scene is blocked by baseline gates
 */
export function isSceneBlockedByGates(
  scene: SceneV2,
  gates: Map<string, boolean>
): boolean {
  // Check scene category
  if (scene.category && gates.has(scene.category) && !gates.get(scene.category)) {
    return true;
  }

  // Check scene tags
  if (scene.tags) {
    for (const tag of scene.tags) {
      if (gates.has(tag) && !gates.get(tag)) {
        return true;
      }
    }
  }

  // Check first tag as cluster identifier (tags[0] often represents the main category)
  const primaryTag = scene.tags?.[0];
  if (primaryTag && gates.has(primaryTag) && !gates.get(primaryTag)) {
    return true;
  }

  return false;
}

// ============================================================================
// ROLE MATCHING (Fixed)
// ============================================================================

/**
 * Check if scene role_direction matches user's role preference
 * Fixed: Previously both 'give' and 'receive' had identical checks
 *
 * @param rolePreference - User's preference: 'give' (active), 'receive' (passive), 'both'
 * @param roleDirection - Scene's direction: 'm_to_f', 'f_to_m', 'mutual', etc.
 * @param userGender - Optional: user's gender for more accurate matching
 */
export function matchesRolePreference(
  rolePreference: 'give' | 'receive' | 'both' | null,
  roleDirection: string | undefined,
  userGender?: 'male' | 'female'
): boolean {
  if (!rolePreference || !roleDirection) return true; // No preference = match all
  if (rolePreference === 'both') return true; // Both = match all

  // Neutral directions match everyone
  if (NEUTRAL_ROLE_DIRECTIONS.some(dir => roleDirection === dir)) {
    return true;
  }

  // Gender-aware matching for directional scenes
  if (userGender && (roleDirection === 'm_to_f' || roleDirection === 'f_to_m')) {
    if (rolePreference === 'give') {
      // User wants to be active: male→m_to_f, female→f_to_m
      return (userGender === 'male' && roleDirection === 'm_to_f') ||
             (userGender === 'female' && roleDirection === 'f_to_m');
    }
    if (rolePreference === 'receive') {
      // User wants to be passive: male→f_to_m, female→m_to_f
      return (userGender === 'male' && roleDirection === 'f_to_m') ||
             (userGender === 'female' && roleDirection === 'm_to_f');
    }
  }

  // Fallback: pattern-based matching (without gender info)
  if (rolePreference === 'give') {
    // User prefers active/dominant role
    return roleDirection.includes('dom') ||
           roleDirection.includes('daddy') ||
           roleDirection.includes('mommy') ||
           roleDirection.includes('keyholder') ||
           roleDirection === 'm_to_f' ||
           roleDirection === 'f_to_m'; // Both directions have an active party
  }

  if (rolePreference === 'receive') {
    // User prefers passive/submissive role
    return roleDirection.includes('sub') ||
           roleDirection.includes('pet') ||
           roleDirection.includes('little') ||
           roleDirection.includes('locked') ||
           roleDirection === 'm_to_f' ||
           roleDirection === 'f_to_m'; // Both directions have a passive party
  }

  return true;
}

// ============================================================================
// COMFORT SIGNALS / INTENSITY PROGRESSION
// ============================================================================

/**
 * Get user's comfort level based on their response history
 * Higher comfort = allow higher intensity scenes
 */
export async function getUserComfortLevel(
  supabase: SupabaseClient,
  userId: string
): Promise<{ maxIntensity: number; answeredCount: number; avgInterest: number }> {
  // Get count of answered scenes
  const { count: answeredCount } = await supabase
    .from('scene_responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('skipped', false);

  // Get average interest level from tag preferences
  const { data: tagPrefs } = await supabase
    .from('tag_preferences')
    .select('interest_level, intensity_preference')
    .eq('user_id', userId);

  const validInterests = tagPrefs?.filter(p => p.interest_level && p.interest_level > 0) || [];
  const avgInterest = validInterests.length > 0
    ? validInterests.reduce((sum, p) => sum + (p.interest_level || 0), 0) / validInterests.length
    : 50;

  // Get average intensity preference
  const validIntensities = tagPrefs?.filter(p => p.intensity_preference && p.intensity_preference > 0) || [];
  const avgIntensityPref = validIntensities.length > 0
    ? validIntensities.reduce((sum, p) => sum + (p.intensity_preference || 0), 0) / validIntensities.length
    : 50;

  // Calculate max allowed intensity
  // Start with intensity 1-2, gradually increase based on:
  // 1. Number of scenes answered
  // 2. Average interest level
  // 3. Average intensity preference
  let maxIntensity = 2; // Start mild

  const count = answeredCount || 0;

  if (count >= MILD_PHASE_SCENE_COUNT) {
    // Past initial mild phase, allow progression
    maxIntensity = 3;

    if (avgInterest >= 60 || avgIntensityPref >= 60) {
      maxIntensity = 4;
    }

    if (avgInterest >= 75 && avgIntensityPref >= 70 && count >= 20) {
      maxIntensity = 5;
    }
  }

  return {
    maxIntensity,
    answeredCount: count,
    avgInterest,
  };
}

// ============================================================================
// CATEGORY COVERAGE (Breadth-First)
// ============================================================================

/**
 * Get categories that user has already seen
 */
export async function getSeenCategories(
  supabase: SupabaseClient,
  userId: string
): Promise<Set<string>> {
  const seenCategories = new Set<string>();

  const { data: responses } = await supabase
    .from('scene_responses')
    .select('scene_slug')
    .eq('user_id', userId);

  // We need to get category from scene data
  // Extract from scene_slug pattern (e.g., "bondage-m-ties-f" -> "bondage")
  if (responses) {
    for (const r of responses) {
      if (r.scene_slug) {
        // Extract category from scene_slug (first part before hyphen)
        // Pattern: "category-..." e.g., "bondage-m-ties-f", "oral-blowjob"
        const firstDash = r.scene_slug.indexOf('-');
        if (firstDash > 0) {
          seenCategories.add(r.scene_slug.substring(0, firstDash));
        } else {
          seenCategories.add(r.scene_slug); // No dash = whole string is category
        }
      }
    }
  }

  return seenCategories;
}

/**
 * Calculate breadth-first bonus for categories user hasn't seen yet
 */
export function calculateBreadthBonus(
  scene: SceneV2,
  seenCategories: Set<string>,
  totalAnsweredScenes: number
): number {
  // Only apply breadth-first in early discovery phase
  if (totalAnsweredScenes > 15) return 0;

  // Use category or first tag as category identifier
  const category = scene.category || scene.tags?.[0];
  if (!category) return 0;

  // Bonus for unseen categories (higher bonus early in discovery)
  if (!seenCategories.has(category)) {
    return Math.max(0, 20 - totalAnsweredScenes); // 20 points initially, decreasing
  }

  return 0;
}

// ============================================================================
// EXPLORATION VS EXPLOITATION
// ============================================================================

/**
 * Apply exploration/exploitation split to scored scenes
 * 70% exploitation (best matches), 30% exploration (random from remaining)
 */
export function applyExplorationExploitation(
  scoredScenes: Array<{ scene: SceneV2; score: number }>,
  limit: number
): SceneV2[] {
  if (scoredScenes.length <= limit) {
    return scoredScenes.map(s => s.scene);
  }

  const exploitCount = Math.ceil(limit * EXPLOITATION_RATIO);
  const exploreCount = limit - exploitCount;

  // Sort by score (highest first) for exploitation
  const sorted = [...scoredScenes].sort((a, b) => b.score - a.score);

  // Take top N for exploitation
  const exploitScenes = sorted.slice(0, exploitCount);

  // Random selection from remaining for exploration
  const remaining = sorted.slice(exploitCount);
  const exploreScenes: typeof scoredScenes = [];

  // Fisher-Yates shuffle for random selection
  const shuffled = [...remaining];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  exploreScenes.push(...shuffled.slice(0, exploreCount));

  // Combine and shuffle the final result to mix exploit and explore
  const combined = [...exploitScenes, ...exploreScenes];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.map(s => s.scene);
}

// ============================================================================
// MAIN SCORING FUNCTION (Fixed & Enhanced)
// ============================================================================

/**
 * Calculate scene score based on user preferences
 * Enhanced with proper role matching and additional signals
 */
export async function calculateSceneScore(
  scene: SceneV2,
  supabase: SupabaseClient,
  userId: string,
  context?: {
    seenCategories?: Set<string>;
    answeredCount?: number;
    userRolePreference?: 'give' | 'receive' | 'both' | null;
  }
): Promise<number> {
  let score = 0;

  // Base score from priority (lower priority = higher score)
  const baseScore = 100 - (scene.priority || 50);
  score += baseScore;

  // Get user's tag preferences
  const { data: tagPrefs } = await supabase
    .from('tag_preferences')
    .select('tag_ref, interest_level, intensity_preference, role_preference')
    .eq('user_id', userId);

  // Determine user's dominant role preference
  let userRolePreference = context?.userRolePreference || null;
  if (!userRolePreference && tagPrefs) {
    const roleCounts = { give: 0, receive: 0, both: 0 };
    for (const pref of tagPrefs) {
      if (pref.role_preference) {
        roleCounts[pref.role_preference as keyof typeof roleCounts]++;
      }
    }
    if (roleCounts.give > roleCounts.receive && roleCounts.give > roleCounts.both) {
      userRolePreference = 'give';
    } else if (roleCounts.receive > roleCounts.give && roleCounts.receive > roleCounts.both) {
      userRolePreference = 'receive';
    } else if (roleCounts.both > 0) {
      userRolePreference = 'both';
    }
  }

  if (tagPrefs && scene.elements) {
    const tagPrefMap = new Map(
      tagPrefs.map((pref) => [pref.tag_ref, pref])
    );

    // Boost score based on element interest levels
    for (const element of scene.elements) {
      const pref = tagPrefMap.get(element.tag_ref);
      if (pref) {
        // Interest level boost (0-100 -> 0-50 points)
        score += (pref.interest_level || 0) * 0.5;

        // Intensity preference match
        if (pref.intensity_preference && scene.intensity) {
          const intensityDiff = Math.abs(pref.intensity_preference - scene.intensity * 20);
          if (intensityDiff <= 20) {
            score += 10; // Bonus for matching intensity
          } else {
            score -= intensityDiff * 0.1; // Penalty for mismatch
          }
        }
      }
    }
  }

  // FIXED: Role preference match using proper logic
  if (userRolePreference && scene.role_direction) {
    if (matchesRolePreference(userRolePreference, scene.role_direction)) {
      score += 15; // Significant bonus for role match
    } else {
      score -= 10; // Penalty for role mismatch
    }
  }

  // Penalty for high intensity if user hasn't shown interest in intense scenes
  const maxInterestLevel = tagPrefs
    ? Math.max(0, ...tagPrefs.map((p) => p.interest_level || 0))
    : 0;
  if (scene.intensity > 3 && maxInterestLevel < 50) {
    score -= (scene.intensity - 3) * 10; // Penalty for high intensity
  }

  // Boost for scenes with elements user hasn't seen yet
  const answeredElementIds = await getAnsweredElementIds(supabase, userId);
  const newElementsCount = scene.elements?.filter(
    (e) => !answeredElementIds.has(e.id)
  ).length || 0;
  if (newElementsCount > 0) {
    score += newElementsCount * 5; // Bonus for new elements
  }

  // Breadth-first bonus for category coverage
  if (context?.seenCategories !== undefined && context?.answeredCount !== undefined) {
    score += calculateBreadthBonus(scene, context.seenCategories, context.answeredCount);
  }

  // Ensure score is non-negative
  return Math.max(0, score);
}

/**
 * Get adaptively ordered scenes based on user preferences and dedupe logic
 *
 * Enhanced with:
 * - Baseline gates filtering (blocked categories based on user's baseline responses)
 * - Comfort-based intensity progression (start mild, increase based on signals)
 * - Breadth-first category coverage (variety in early discovery)
 * - Exploration vs exploitation (70/30 split)
 */
export async function getAdaptiveScenes(
  supabase: SupabaseClient,
  userId: string,
  allScenes: Scene[],
  options: {
    maxIntensity?: number;
    limit?: number;
    enableDedupe?: boolean;
    enableAdaptiveScoring?: boolean;
    enableBaselineGates?: boolean;
    enableComfortProgression?: boolean;
    enableExplorationExploitation?: boolean;
  } = {}
): Promise<SceneV2[]> {
  const {
    limit = 10,
    enableDedupe = true,
    enableAdaptiveScoring = true,
    enableBaselineGates = true,
    enableComfortProgression = true,
    enableExplorationExploitation = true,
  } = options;

  // ========================================
  // 1. COMFORT-BASED INTENSITY LIMIT
  // ========================================
  let maxIntensity = options.maxIntensity ?? 5;
  let answeredCount = 0;

  if (enableComfortProgression && !options.maxIntensity) {
    // Get user's comfort level to determine max intensity
    const comfort = await getUserComfortLevel(supabase, userId);
    maxIntensity = comfort.maxIntensity;
    answeredCount = comfort.answeredCount;
  }

  // ========================================
  // 2. FILTER V2 COMPOSITE SCENES
  // ========================================
  const v2Scenes = allScenes.filter((s) => {
    // Skip body_map scenes (they have their own flow)
    // Check via tags since question_type may not be in base Scene type
    if (s.tags?.includes('body_map')) return false;

    const scene = s as SceneV2;
    return scene.version === 2 && Array.isArray(scene.elements);
  }) as SceneV2[];

  // Filter by intensity (comfort-based)
  let filteredScenes = v2Scenes.filter((s) => s.intensity <= maxIntensity);

  // ========================================
  // 3. BASELINE GATES FILTERING
  // ========================================
  if (enableBaselineGates) {
    const gates = await getBaselineGates(supabase, userId);
    filteredScenes = filteredScenes.filter(
      (scene) => !isSceneBlockedByGates(scene, gates)
    );
  }

  // ========================================
  // 4. DEDUPE BY TAG
  // ========================================
  if (enableDedupe) {
    const answeredElementIds = await getAnsweredElementIds(supabase, userId);
    const answeredTagRefs = await getAnsweredTagRefs(supabase, userId);

    filteredScenes = filteredScenes.filter(
      (scene) => !shouldSkipSceneByDedupe(scene, answeredElementIds, answeredTagRefs)
    );
  }

  // ========================================
  // 5. SCORE SCENES
  // ========================================
  if (enableAdaptiveScoring) {
    // Get context for scoring
    const seenCategories = await getSeenCategories(supabase, userId);

    const scoredScenes = await Promise.all(
      filteredScenes.map(async (scene) => ({
        scene,
        score: await calculateSceneScore(scene, supabase, userId, {
          seenCategories,
          answeredCount,
        }),
      }))
    );

    // ========================================
    // 6. EXPLORATION VS EXPLOITATION
    // ========================================
    if (enableExplorationExploitation) {
      return applyExplorationExploitation(scoredScenes, limit);
    }

    // Sort by score (highest first)
    scoredScenes.sort((a, b) => b.score - a.score);

    // Return top N scenes
    return scoredScenes.slice(0, limit).map((item) => item.scene);
  } else {
    // Fallback to priority-based sorting
    const sorted = [...filteredScenes].sort((a, b) => {
      const priorityA = a.priority || 50;
      const priorityB = b.priority || 50;
      return priorityA - priorityB;
    });

    return sorted.slice(0, limit);
  }
}
