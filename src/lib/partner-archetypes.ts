import type { SupabaseClient } from '@supabase/supabase-js';
import profileAnalysis from '../../scenes/v2/profile-analysis.json';

interface TagPreference {
  tag_ref: string;
  interest_level: number | null;
  role_preference: 'give' | 'receive' | 'both' | null;
  intensity_preference: number | null;
  experience_level: 'tried' | 'want_to_try' | 'not_interested' | 'curious' | null;
}

interface TagScores {
  [tag: string]: number;
}

interface Archetype {
  id: string;
  name: { ru: string; en: string };
  description: { ru: string; en: string };
  score: number;
}

const ARCHETYPES = profileAnalysis.archetypes;
const ARCHETYPE_THRESHOLD = 0.4;
const MAX_ARCHETYPES = 3;

/**
 * Convert tag_preferences to TagScores format
 * Maps interest_level (0-100) to tag score (0-5 scale)
 */
function tagPreferencesToTagScores(tagPrefs: TagPreference[]): TagScores {
  const tagScores: TagScores = {};
  
  for (const pref of tagPrefs) {
    if (pref.interest_level !== null) {
      // Convert 0-100 to 0-5 scale
      tagScores[pref.tag_ref] = (pref.interest_level / 100) * 5;
    }
  }
  
  return tagScores;
}

/**
 * Calculate give/receive balance from role preferences
 * Returns -1 (receive) to 1 (give)
 */
function calculateGiveReceiveBalance(tagPrefs: TagPreference[]): number {
  let giveCount = 0;
  let receiveCount = 0;
  let bothCount = 0;
  
  for (const pref of tagPrefs) {
    if (pref.role_preference === 'give') {
      giveCount++;
    } else if (pref.role_preference === 'receive') {
      receiveCount++;
    } else if (pref.role_preference === 'both') {
      bothCount++;
    }
  }
  
  const total = giveCount + receiveCount + bothCount;
  if (total === 0) return 0;
  
  // Calculate balance: positive = give, negative = receive
  const balance = (giveCount - receiveCount) / total;
  return Math.max(-1, Math.min(1, balance));
}

/**
 * Calculate archetype match score
 */
function calculateArchetypeScore(
  archetypeId: string,
  archetype: any,
  tagScores: TagScores,
  giveReceiveBalance: number
): number {
  let score = 0;
  let maxPossible = 0;

  // Check high indicators
  if (archetype.indicators?.high) {
    for (const tag of archetype.indicators.high) {
      const tagScore = tagScores[tag] || 0;
      score += Math.min(tagScore, 5); // Cap at 5
      maxPossible += 5;
    }
  }

  // Check moderate indicators
  if (archetype.indicators?.moderate) {
    for (const tag of archetype.indicators.moderate) {
      const tagScore = tagScores[tag] || 0;
      score += Math.min(tagScore, 3); // Cap at 3
      maxPossible += 3;
    }
  }

  // Check low indicators (penalize if present)
  if (archetype.indicators?.low) {
    for (const tag of archetype.indicators.low) {
      const tagScore = tagScores[tag] || 0;
      score -= tagScore * 0.5; // Penalty for having "low" tags high
    }
  }

  // Check pattern
  if (archetype.indicators?.pattern) {
    const pattern = archetype.indicators.pattern as string;

    if (pattern.includes('give >> receive')) {
      if (giveReceiveBalance > 0.3) {
        score += 3;
      } else if (giveReceiveBalance < -0.3) {
        score -= 2;
      }
      maxPossible += 3;
    }

    if (pattern.includes('receive >> give')) {
      if (giveReceiveBalance < -0.3) {
        score += 3;
      } else if (giveReceiveBalance > 0.3) {
        score -= 2;
      }
      maxPossible += 3;
    }

    if (pattern.includes('give ≈ receive')) {
      if (Math.abs(giveReceiveBalance) < 0.3) {
        score += 3;
      } else {
        score -= 1;
      }
      maxPossible += 3;
    }
  }

  // Check high_any (any one of these is high)
  if (archetype.indicators?.high_any) {
    const anyHigh = archetype.indicators.high_any.some(
      (tag: string) => (tagScores[tag] || 0) >= 3
    );
    if (anyHigh) {
      score += 5;
    }
    maxPossible += 5;
  }

  // Normalize to 0-1
  return maxPossible > 0 ? Math.max(0, score / maxPossible) : 0;
}

/**
 * Calculate partner archetypes from tag_preferences
 */
export async function calculatePartnerArchetypes(
  supabase: SupabaseClient,
  partnerId: string
): Promise<Archetype[]> {
  // Get all tag preferences for partner
  const { data: tagPrefs } = await supabase
    .from('tag_preferences')
    .select('tag_ref, interest_level, role_preference, intensity_preference, experience_level')
    .eq('user_id', partnerId);

  if (!tagPrefs || tagPrefs.length === 0) {
    return [];
  }

  // Convert to TagScores format
  const tagScores = tagPreferencesToTagScores(tagPrefs as TagPreference[]);
  
  // Calculate give/receive balance
  const giveReceiveBalance = calculateGiveReceiveBalance(tagPrefs as TagPreference[]);

  // Calculate archetype scores
  const archetypeScores: { id: string; archetype: any; score: number }[] = [];

  for (const [archetypeId, archetype] of Object.entries(ARCHETYPES)) {
    if (archetypeId === '_note') continue;

    const score = calculateArchetypeScore(
      archetypeId,
      archetype,
      tagScores,
      giveReceiveBalance
    );

    if (score >= ARCHETYPE_THRESHOLD) {
      archetypeScores.push({ id: archetypeId, archetype, score });
    }
  }

  // Sort by score and limit
  archetypeScores.sort((a, b) => b.score - a.score);
  const topArchetypes = archetypeScores.slice(0, MAX_ARCHETYPES);

  return topArchetypes.map(({ id, archetype, score }) => ({
    id,
    name: archetype.name,
    description: archetype.description,
    score,
  }));
}

/**
 * Get average intensity preference from tag_preferences
 */
export async function getAverageIntensity(
  supabase: SupabaseClient,
  partnerId: string
): Promise<number | null> {
  const { data: tagPrefs } = await supabase
    .from('tag_preferences')
    .select('intensity_preference')
    .eq('user_id', partnerId)
    .not('intensity_preference', 'is', null);

  if (!tagPrefs || tagPrefs.length === 0) {
    return null;
  }

  const intensities = tagPrefs
    .map((p) => p.intensity_preference)
    .filter((v): v is number => v !== null);
  
  if (intensities.length === 0) return null;

  const sum = intensities.reduce((acc, val) => acc + val, 0);
  return sum / intensities.length;
}
