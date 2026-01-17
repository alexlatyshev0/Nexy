import type {
  Answer,
  SceneV3,
  SignalUpdate,
  PsychologicalProfile,
  BodyMapAnswer,
  BodyZoneId,
} from './types';
import { getResponseCategory } from './question-v3';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Calculate signal updates based on user's answer to a V3 scene
 */
export function calculateSignalUpdates(
  answer: Answer,
  scene: SceneV3
): SignalUpdate[] {
  const signals = scene.ai_context?.profile_signals;
  if (!signals) return [];

  const updates: SignalUpdate[] = [];
  const category = getResponseCategory(answer);

  // Get signal weight based on answer intensity
  const weight = getSignalWeight(answer, category);

  switch (category) {
    case 'positive':
      signals.if_positive?.forEach((signal) => {
        updates.push({ signal, weight });
      });
      break;
    case 'negative':
      signals.if_negative?.forEach((signal) => {
        updates.push({ signal, weight: -weight });
      });
      break;
    case 'curious':
      signals.if_curious?.forEach((signal) => {
        updates.push({ signal, weight: weight * 0.5 });
      });
      break;
  }

  return updates;
}

/**
 * Calculate weight based on answer intensity
 */
function getSignalWeight(answer: Answer, category: 'positive' | 'negative' | 'curious'): number {
  if ('value' in answer && typeof answer.value === 'number') {
    // Scale answer: weight based on distance from neutral (50)
    const value = answer.value;
    if (category === 'positive') {
      return 0.5 + ((value - 60) / 80); // 0.5 at 60, 1.0 at 100
    }
    if (category === 'negative') {
      return 0.5 + ((40 - value) / 80); // 0.5 at 40, 1.0 at 0
    }
    return 0.5; // Curious: neutral weight
  }

  // Default weight for non-scale answers
  return 1.0;
}

/**
 * Calculate test score updates based on answer
 */
export function calculateTestScoreUpdates(
  answer: Answer,
  scene: SceneV3
): Record<string, number> {
  const tests = scene.ai_context?.tests;
  if (!tests) return {};

  const updates: Record<string, number> = {};

  // Get normalized answer value (0-1)
  let normalizedValue = 0.5;
  if ('value' in answer && typeof answer.value === 'number') {
    normalizedValue = answer.value / 100;
  } else if ('value' in answer) {
    if (answer.value === 'yes' || answer.value === true) {
      normalizedValue = 0.8;
    } else if (answer.value === 'no' || answer.value === false) {
      normalizedValue = 0.2;
    } else {
      normalizedValue = 0.5;
    }
  }

  // Update primary kink score
  if (tests.primary_kink) {
    updates[tests.primary_kink] = normalizedValue;
  }

  // Update secondary kink scores (with reduced weight)
  tests.secondary_kinks?.forEach((kink) => {
    updates[kink] = normalizedValue * 0.7;
  });

  // Update power dynamic score
  if (tests.power_dynamic) {
    updates[`power_dynamic.${tests.power_dynamic}`] = normalizedValue;
  }

  // Update gender role aspect
  if (tests.gender_role_aspect) {
    updates[`gender_role.${tests.gender_role_aspect}`] = normalizedValue;
  }

  return updates;
}

/**
 * Calculate running average for test scores
 */
function updateRunningAverage(
  current: number | undefined,
  newValue: number,
  weight: number = 0.3
): number {
  if (current === undefined) {
    return newValue;
  }
  // Exponential moving average
  return current * (1 - weight) + newValue * weight;
}

/**
 * Detect correlations based on accumulated signals
 */
export function detectCorrelations(
  signals: Record<string, number>,
  sceneCorrelations: { positive: string[]; negative: string[] }
): string[] {
  const detected: string[] = [];

  // Check if signals suggest positive correlations
  sceneCorrelations.positive?.forEach((correlation) => {
    // Simple heuristic: if multiple related signals are positive, add correlation
    const relatedSignals = Object.entries(signals).filter(([key]) =>
      key.toLowerCase().includes(correlation.toLowerCase().split('_')[0])
    );

    if (relatedSignals.length >= 2) {
      const avgValue = relatedSignals.reduce((sum, [, v]) => sum + v, 0) / relatedSignals.length;
      if (avgValue > 1.5) {
        detected.push(correlation);
      }
    }
  });

  return [...new Set(detected)]; // Remove duplicates
}

/**
 * Update psychological profile in database
 */
export async function updatePsychologicalProfile(
  supabase: SupabaseClient,
  userId: string,
  signalUpdates: SignalUpdate[],
  testScoreUpdates: Record<string, number>,
  scene: SceneV3
): Promise<void> {
  // Fetch current profile
  const { data: profile } = await supabase
    .from('psychological_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  const currentSignals: Record<string, number> = profile?.profile_signals || {};
  const currentTests: Record<string, number> = profile?.test_scores || {};
  const currentCorrelations: string[] = profile?.correlations_detected || [];

  // Update signal counts
  for (const update of signalUpdates) {
    currentSignals[update.signal] = (currentSignals[update.signal] || 0) + update.weight;
  }

  // Update test scores with running average
  for (const [test, value] of Object.entries(testScoreUpdates)) {
    currentTests[test] = updateRunningAverage(currentTests[test], value);
  }

  // Detect new correlations
  const correlations = scene.ai_context?.correlations;
  if (correlations) {
    const newCorrelations = detectCorrelations(currentSignals, correlations);
    for (const corr of newCorrelations) {
      if (!currentCorrelations.includes(corr)) {
        currentCorrelations.push(corr);
      }
    }
  }

  // Upsert profile
  await supabase.from('psychological_profiles').upsert(
    {
      user_id: userId,
      profile_signals: currentSignals,
      test_scores: currentTests,
      correlations_detected: currentCorrelations,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  );
}

/**
 * Add a follow-up signal to the profile
 */
export async function addFollowUpSignal(
  supabase: SupabaseClient,
  userId: string,
  signal: string
): Promise<void> {
  const { data: profile } = await supabase
    .from('psychological_profiles')
    .select('profile_signals')
    .eq('user_id', userId)
    .single();

  const signals: Record<string, number> = profile?.profile_signals || {};
  signals[signal] = (signals[signal] || 0) + 1.5; // Follow-up answers are weighted more

  await supabase.from('psychological_profiles').upsert(
    {
      user_id: userId,
      profile_signals: signals,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  );
}

/**
 * Get user's psychological profile
 */
export async function getPsychologicalProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<PsychologicalProfile | null> {
  const { data } = await supabase
    .from('psychological_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data;
}

/**
 * Get top signals from profile (for recommendations)
 */
export function getTopSignals(
  profile: PsychologicalProfile,
  limit: number = 10
): Array<{ signal: string; weight: number }> {
  const signals = Object.entries(profile.profile_signals)
    .map(([signal, weight]) => ({ signal, weight }))
    .sort((a, b) => b.weight - a.weight);

  return signals.slice(0, limit);
}

/**
 * Get top test scores from profile
 */
export function getTopTestScores(
  profile: PsychologicalProfile,
  limit: number = 10
): Array<{ test: string; score: number }> {
  const tests = Object.entries(profile.test_scores)
    .map(([test, score]) => ({ test, score }))
    .sort((a, b) => b.score - a.score);

  return tests.slice(0, limit);
}

// ============================================
// BODY MAP SIGNAL CALCULATIONS
// ============================================

// Sensitive zones that get special signal tracking
const SENSITIVE_ZONES: BodyZoneId[] = [
  'anus',
  'feet',
  'nipples',
  'testicles',
  'clitoris',
  'nape',
  'ears',
  'inner_thighs',
];

/**
 * Check if answer is a BodyMapAnswer
 */
export function isBodyMapAnswer(answer: Answer): answer is BodyMapAnswer {
  return 'passes' in answer && Array.isArray((answer as BodyMapAnswer).passes);
}

/**
 * Calculate signals from a body map answer
 */
export function calculateBodyMapSignals(
  answer: BodyMapAnswer,
  scene: SceneV3
): SignalUpdate[] {
  const signals: SignalUpdate[] = [];

  for (const pass of answer.passes) {
    const { action, subject, markings } = pass;

    // Count preferences
    const loveCount = markings.filter((m) => m.preference === 'love').length;
    const sometimesCount = markings.filter((m) => m.preference === 'sometimes').length;
    const noCount = markings.filter((m) => m.preference === 'no').length;

    // Enthusiast signal if many "love" markings
    if (loveCount >= 5) {
      signals.push({
        signal: `${action}_enthusiast_${subject}`,
        weight: 1.0 + loveCount * 0.1,
      });
    }

    // Action-specific signals based on total positive markings
    if (loveCount + sometimesCount >= 3) {
      signals.push({
        signal: `enjoys_${action}_${subject}`,
        weight: 0.8 + (loveCount * 0.1),
      });
    }

    // Aversion signal if many "no" markings
    if (noCount >= 10) {
      signals.push({
        signal: `${action}_averse_${subject}`,
        weight: 0.5 + noCount * 0.05,
      });
    }

    // Track sensitive zone preferences
    for (const marking of markings) {
      if (SENSITIVE_ZONES.includes(marking.zoneId)) {
        if (marking.preference === 'love') {
          signals.push({
            signal: `${marking.zoneId}_${action}_${subject}_positive`,
            weight: 1.5,
          });
        } else if (marking.preference === 'no') {
          signals.push({
            signal: `${marking.zoneId}_${action}_${subject}_negative`,
            weight: -1.0,
          });
        }
      }

      // General zone preference tracking
      if (marking.preference === 'love') {
        signals.push({
          signal: `zone_${marking.zoneId}_${subject}_love`,
          weight: 0.5,
        });
      }
    }

    // Pattern detection signals
    const genitalsLove = markings.filter(
      (m) =>
        m.preference === 'love' &&
        ['penis', 'testicles', 'vulva', 'clitoris'].includes(m.zoneId)
    ).length;
    if (genitalsLove >= 2) {
      signals.push({
        signal: `genital_${action}_focused_${subject}`,
        weight: 1.2,
      });
    }

    // Intimate touch preference
    const intimateZonesLove = markings.filter(
      (m) =>
        m.preference === 'love' &&
        ['neck', 'ears', 'inner_thighs', 'belly', 'lower_back'].includes(m.zoneId)
    ).length;
    if (intimateZonesLove >= 3) {
      signals.push({
        signal: `sensual_${action}_preference_${subject}`,
        weight: 1.0,
      });
    }
  }

  return signals;
}

/**
 * Calculate body map test scores
 */
export function calculateBodyMapTestScores(
  answer: BodyMapAnswer,
  scene: SceneV3
): Record<string, number> {
  const scores: Record<string, number> = {};
  const tests = scene.ai_context?.tests;

  if (!tests) return scores;

  // Calculate overall engagement score based on total markings
  let totalLove = 0;
  let totalSometimes = 0;
  let totalNo = 0;

  for (const pass of answer.passes) {
    totalLove += pass.markings.filter((m) => m.preference === 'love').length;
    totalSometimes += pass.markings.filter((m) => m.preference === 'sometimes').length;
    totalNo += pass.markings.filter((m) => m.preference === 'no').length;
  }

  const totalMarkings = totalLove + totalSometimes + totalNo;
  if (totalMarkings > 0) {
    // Normalized engagement score
    const engagementScore = (totalLove * 1.0 + totalSometimes * 0.5) / totalMarkings;

    if (tests.primary_kink) {
      scores[tests.primary_kink] = engagementScore;
    }

    tests.secondary_kinks?.forEach((kink) => {
      scores[kink] = engagementScore * 0.7;
    });
  }

  return scores;
}
