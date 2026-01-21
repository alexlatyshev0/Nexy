/**
 * Gates System - scene visibility based on user preferences
 *
 * ARCHITECTURE (as of migration 019_unified_gates.sql):
 * - Gates are computed AUTOMATICALLY by database triggers
 * - Single source of truth: user_gates.gates column
 * - Client should NOT compute gates - only read them from DB
 *
 * Sources:
 * - onboarding_responses.responses → onboarding gates
 * - body_map_responses → body map gates
 * - Future: activity_gates (extensible)
 *
 * Response values:
 * - NO = 0: Not interested
 * - YES = 1: Interested
 * - VERY = 2: Very interested (unlocks advanced scenes)
 *
 * Usage:
 *   // Fetch gates from database
 *   const gates = await fetchUserGates(supabase, userId);
 *   // Check scene access
 *   const allowed = isSceneAllowed('blowjob', gates);
 */

import { SupabaseClient } from '@supabase/supabase-js';

// Response value constants
export const RESPONSE = {
  NO: 0,
  YES: 1,
  VERY: 2,
} as const;

export type ResponseValue = (typeof RESPONSE)[keyof typeof RESPONSE];

// Onboarding responses structure
export interface OnboardingResponses {
  oral?: ResponseValue;
  anal?: ResponseValue;
  group?: ResponseValue;
  toys?: ResponseValue;
  roleplay?: ResponseValue;
  quickie?: ResponseValue;
  romantic?: ResponseValue;
  power_dynamic?: ResponseValue;
  rough?: ResponseValue;
  public?: ResponseValue;
  exhibitionism?: ResponseValue;
  recording?: ResponseValue;
  dirty_talk?: ResponseValue;
  praise?: ResponseValue;
  lingerie?: ResponseValue;
  foot?: ResponseValue;
  bondage?: ResponseValue;
  body_fluids?: ResponseValue;
  sexting?: ResponseValue;
  extreme?: ResponseValue;
}

// Computed gates structure
export interface OnboardingGates {
  // Basic gates (YES or VERY = true)
  oral?: boolean;
  anal?: boolean;
  group?: boolean;
  toys?: boolean;
  roleplay?: boolean;
  quickie?: boolean;
  romantic?: boolean;
  power_dynamic?: boolean;
  rough?: boolean;
  public?: boolean;
  exhibitionism?: boolean;
  recording?: boolean;
  dirty_talk?: boolean;
  praise?: boolean;
  lingerie?: boolean;
  foot?: boolean;
  bondage?: boolean;
  body_fluids?: boolean;
  sexting?: boolean;
  extreme?: boolean;

  // VERY gates (only VERY = true)
  oral_very?: boolean;
  anal_very?: boolean;
  group_very?: boolean;
  roleplay_very?: boolean;
  rough_very?: boolean;
  bondage_very?: boolean;

  // Conditional gates (computed from combinations)
  show_bondage?: boolean;
  show_body_fluids?: boolean;
  show_sexting?: boolean;
  show_extreme?: boolean;
}

// ============================================
// DATABASE FUNCTIONS (preferred)
// ============================================

/**
 * Fetch user gates from database (single source of truth)
 * Gates are auto-computed by triggers - no client computation needed
 */
export async function fetchUserGates(
  supabase: SupabaseClient,
  userId: string
): Promise<OnboardingGates> {
  const { data, error } = await supabase
    .from('user_gates')
    .select('gates')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.warn('No gates found for user:', userId);
    return {};
  }

  return data.gates as OnboardingGates;
}

/**
 * Fetch full gate details from database (for debugging)
 */
export async function fetchUserGatesDetailed(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  gates: OnboardingGates;
  onboarding_gates: OnboardingGates;
  body_map_gates: Record<string, boolean>;
} | null> {
  const { data, error } = await supabase
    .from('user_gates')
    .select('gates, onboarding_gates, body_map_gates')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    gates: data.gates as OnboardingGates,
    onboarding_gates: data.onboarding_gates as OnboardingGates,
    body_map_gates: data.body_map_gates as Record<string, boolean>,
  };
}

// ============================================
// SCENE GATE CHECKING
// ============================================

// Gate requirement types
type GateOperator = 'AND' | 'OR';

interface GateRequirement {
  gates: string[];
  operator: GateOperator;
  level?: 'basic' | 'very'; // 'basic' = YES+, 'very' = VERY only
}

// Scene to gate mapping (from onboarding-integration.md)
const SCENE_GATES: Record<string, GateRequirement> = {
  // ORAL
  blowjob: { gates: ['oral'], operator: 'AND' },
  cunnilingus: { gates: ['oral'], operator: 'AND' },
  deepthroat: { gates: ['oral'], operator: 'AND' },
  'facesitting-f-on-m': { gates: ['oral'], operator: 'AND' },
  'facesitting-m-on-f': { gates: ['oral'], operator: 'AND' },
  'rimming-m-to-f': { gates: ['oral'], operator: 'AND' },
  'rimming-f-to-m': { gates: ['oral'], operator: 'AND' },
  'cock-worship': { gates: ['oral'], operator: 'AND' },
  'pussy-worship': { gates: ['oral'], operator: 'AND' },

  // ANAL
  'anal-play-on-her': { gates: ['anal'], operator: 'AND' },
  'anal-play-on-him': { gates: ['anal'], operator: 'AND' },
  pegging: { gates: ['anal', 'power_dynamic'], operator: 'AND' },
  'butt-plug': { gates: ['anal', 'toys'], operator: 'OR' },
  figging: { gates: ['anal', 'rough'], operator: 'AND' },

  // BODY FLUIDS
  'cum-where-to-finish': { gates: ['body_fluids'], operator: 'AND' },
  squirting: { gates: ['body_fluids'], operator: 'AND' },
  'squirt-receiving': { gates: ['body_fluids', 'oral'], operator: 'AND' },
  'golden-shower-m-to-f': { gates: ['body_fluids'], operator: 'AND' },
  'golden-shower-f-to-m': { gates: ['body_fluids'], operator: 'AND' },
  'spitting-m-to-f': { gates: ['body_fluids', 'power_dynamic'], operator: 'AND' },
  'spitting-f-to-m': { gates: ['body_fluids', 'power_dynamic'], operator: 'AND' },
  'breeding-kink': { gates: ['body_fluids'], operator: 'AND' },

  // WORSHIP
  'body-worship-m-to-f': { gates: ['romantic'], operator: 'AND' },
  'body-worship-f-to-m': { gates: ['romantic'], operator: 'AND' },
  'foot-worship-m-to-f': { gates: ['foot'], operator: 'AND' },
  'foot-worship-f-to-m': { gates: ['foot'], operator: 'AND' },
  armpit: { gates: ['body_fluids', 'rough'], operator: 'OR' },

  // IMPACT/PAIN
  'spanking-m-to-f': { gates: ['rough'], operator: 'AND' },
  'spanking-f-to-m': { gates: ['rough'], operator: 'AND' },
  'choking-m-to-f': { gates: ['rough'], operator: 'AND' },
  'choking-f-to-m': { gates: ['rough'], operator: 'AND' },
  'face-slapping-m-to-f': { gates: ['rough'], operator: 'AND', level: 'very' },
  'face-slapping-f-to-m': { gates: ['rough'], operator: 'AND', level: 'very' },
  'whipping-m-to-f': { gates: ['rough', 'bondage'], operator: 'AND' },
  'whipping-f-to-m': { gates: ['rough', 'bondage'], operator: 'AND' },
  'wax-play-m-to-f': { gates: ['rough', 'toys'], operator: 'OR' },
  'wax-play-f-to-m': { gates: ['rough', 'toys'], operator: 'OR' },
  'nipple-play-m-to-f': { gates: ['rough', 'toys'], operator: 'OR' },
  'nipple-play-f-to-m': { gates: ['rough', 'toys'], operator: 'OR' },
  cbt: { gates: ['rough', 'power_dynamic'], operator: 'AND' },

  // VERBAL
  'dirty-talk': { gates: ['dirty_talk'], operator: 'AND' },
  'degradation-m-to-f': { gates: ['dirty_talk', 'power_dynamic'], operator: 'AND' },
  'degradation-f-to-m': { gates: ['dirty_talk', 'power_dynamic'], operator: 'AND' },
  'praise-m-to-f': { gates: ['praise'], operator: 'AND' },
  'praise-f-to-m': { gates: ['praise'], operator: 'AND' },

  // CONTROL/POWER
  'bondage-m-ties-f': { gates: ['bondage'], operator: 'AND' },
  'bondage-f-ties-m': { gates: ['bondage'], operator: 'AND' },
  'collar-m-owns-f': { gates: ['power_dynamic'], operator: 'AND' },
  'collar-f-owns-m': { gates: ['power_dynamic'], operator: 'AND' },
  'edging-m-to-f': { gates: ['power_dynamic', 'toys'], operator: 'OR' },
  'edging-f-to-m': { gates: ['power_dynamic', 'toys'], operator: 'OR' },
  'forced-orgasm-m-to-f': { gates: ['power_dynamic'], operator: 'AND' },
  'forced-orgasm-f-to-m': { gates: ['power_dynamic'], operator: 'AND' },
  'ruined-orgasm-m-to-f': { gates: ['power_dynamic'], operator: 'AND' },
  'ruined-orgasm-f-to-m': { gates: ['power_dynamic'], operator: 'AND' },
  'free-use-f-available': { gates: ['power_dynamic'], operator: 'AND' },
  'free-use-m-available': { gates: ['power_dynamic'], operator: 'AND' },
  'objectification-f': { gates: ['power_dynamic'], operator: 'AND' },
  'objectification-m': { gates: ['power_dynamic'], operator: 'AND' },
  'chastity-m-locked': { gates: ['power_dynamic'], operator: 'AND' },
  'chastity-f-locked': { gates: ['power_dynamic'], operator: 'AND' },
  feminization: { gates: ['power_dynamic'], operator: 'AND' },

  // CNC/ROUGH
  'cnc-m-takes-f': { gates: ['rough'], operator: 'AND', level: 'very' },
  'cnc-f-takes-m': { gates: ['rough'], operator: 'AND', level: 'very' },
  primal: { gates: ['rough'], operator: 'AND' },
  'somnophilia-m-to-f': { gates: ['power_dynamic'], operator: 'AND' },
  'somnophilia-f-to-m': { gates: ['power_dynamic'], operator: 'AND' },

  // EXTREME
  'breath-play-m-to-f': { gates: ['rough', 'bondage'], operator: 'AND', level: 'very' },
  'breath-play-f-to-m': { gates: ['rough', 'bondage'], operator: 'AND', level: 'very' },
  'knife-play-m-to-f': { gates: ['rough', 'bondage'], operator: 'AND', level: 'very' },
  'knife-play-f-to-m': { gates: ['rough', 'bondage'], operator: 'AND', level: 'very' },
  'mummification-f': { gates: ['bondage'], operator: 'AND', level: 'very' },
  'mummification-m': { gates: ['bondage'], operator: 'AND', level: 'very' },
  'needle-play': { gates: ['rough', 'bondage'], operator: 'AND', level: 'very' },
  'fisting-m-to-f': { gates: ['anal', 'power_dynamic'], operator: 'OR', level: 'very' },
  'fisting-f-to-m': { gates: ['anal', 'power_dynamic'], operator: 'OR', level: 'very' },
  'fucking-machine': { gates: ['toys'], operator: 'AND' },
  electrostim: { gates: ['toys'], operator: 'AND' },

  // GROUP
  'threesome-fmf': { gates: ['group'], operator: 'AND' },
  'threesome-mfm': { gates: ['group'], operator: 'AND' },
  gangbang: { gates: ['group'], operator: 'AND', level: 'very' },
  orgy: { gates: ['group'], operator: 'AND', level: 'very' },
  swinging: { gates: ['group'], operator: 'AND' },
  'double-penetration': { gates: ['group', 'anal'], operator: 'AND' },

  // CUCKOLD
  cuckold: { gates: ['group', 'power_dynamic'], operator: 'AND' },
  hotwife: { gates: ['group', 'power_dynamic'], operator: 'AND' },

  // EXHIBITIONISM
  exhibitionism: { gates: ['exhibitionism'], operator: 'AND' },
  voyeurism: { gates: ['exhibitionism'], operator: 'AND' },
  'public-sex': { gates: ['public'], operator: 'AND' },
  'glory-hole-f-gives': { gates: ['exhibitionism', 'oral'], operator: 'AND' },
  'glory-hole-m-gives': { gates: ['exhibitionism', 'oral'], operator: 'AND' },
  'striptease-f': { gates: ['exhibitionism'], operator: 'AND' },
  'striptease-m': { gates: ['exhibitionism'], operator: 'AND' },

  // ROLEPLAY
  'boss-m-secretary-f': { gates: ['roleplay'], operator: 'AND' },
  'boss-f-subordinate-m': { gates: ['roleplay'], operator: 'AND' },
  'teacher-m-student-f': { gates: ['roleplay'], operator: 'AND' },
  'teacher-f-student-m': { gates: ['roleplay'], operator: 'AND' },
  'doctor-patient': { gates: ['roleplay'], operator: 'AND' },
  stranger: { gates: ['roleplay'], operator: 'AND' },
  'service-roleplay': { gates: ['roleplay', 'power_dynamic'], operator: 'AND' },
  'taboo-roleplay': { gates: ['roleplay'], operator: 'AND', level: 'very' },

  // PET/AGE PLAY
  'pet-play-f-is-pet': { gates: ['roleplay', 'power_dynamic'], operator: 'AND' },
  'pet-play-m-is-pet': { gates: ['roleplay', 'power_dynamic'], operator: 'AND' },
  ddlg: { gates: ['roleplay', 'power_dynamic'], operator: 'AND' },
  mdlb: { gates: ['roleplay', 'power_dynamic'], operator: 'AND' },

  // SENSORY
  blindfold: { gates: ['power_dynamic', 'romantic'], operator: 'OR' },
  'ice-play': { gates: ['romantic', 'toys'], operator: 'OR' },
  'feather-tickle': { gates: ['romantic'], operator: 'AND' },

  // TOYS
  vibrator: { gates: ['toys'], operator: 'AND' },
  dildo: { gates: ['toys'], operator: 'AND' },
  'cock-ring': { gates: ['toys'], operator: 'AND' },
  'nipple-clamps': { gates: ['toys', 'rough'], operator: 'AND' },
  'remote-control': { gates: ['toys', 'public'], operator: 'AND' },

  // CLOTHING
  'lingerie-f': { gates: ['lingerie'], operator: 'AND' },
  'lingerie-m': { gates: ['lingerie'], operator: 'AND' },
  stockings: { gates: ['lingerie'], operator: 'AND' },
  'heels-only': { gates: ['lingerie'], operator: 'AND' },
  'harness-f': { gates: ['lingerie'], operator: 'AND' },
  'harness-m': { gates: ['lingerie'], operator: 'AND' },
  'latex-leather': { gates: ['lingerie'], operator: 'AND' },
  'uniforms-f': { gates: ['lingerie', 'roleplay'], operator: 'AND' },
  'uniforms-m': { gates: ['lingerie', 'roleplay'], operator: 'AND' },
  'torn-clothes': { gates: ['rough'], operator: 'AND' },

  // FILMING
  filming: { gates: ['recording'], operator: 'AND' },
  sexting: { gates: ['recording', 'exhibitionism'], operator: 'OR' },
  joi: { gates: ['recording', 'power_dynamic'], operator: 'OR' },

  // ROMANTIC
  'romantic-sex': { gates: ['romantic'], operator: 'AND' },
  'emotional-sex': { gates: ['romantic'], operator: 'AND' },
  aftercare: { gates: ['romantic', 'power_dynamic'], operator: 'OR' },
  quickie: { gates: ['quickie'], operator: 'AND' },
  'first-time-together': { gates: ['romantic'], operator: 'AND' },
  'makeup-sex': { gates: ['romantic'], operator: 'AND' },
  'angry-sex': { gates: ['rough', 'quickie'], operator: 'OR' },

  // INTIMACY (always available)
  'casual-touch': { gates: [], operator: 'AND' },
  'morning-teasing': { gates: [], operator: 'AND' },
  'kitchen-counter': { gates: ['public', 'quickie'], operator: 'OR' },

  // MASSAGE
  'massage-m-to-f': { gates: ['romantic'], operator: 'AND' },
  'massage-f-to-m': { gates: ['romantic'], operator: 'AND' },
};

/**
 * Check if a scene is accessible based on user's gates
 * @returns true if scene is ALLOWED, false if BLOCKED
 */
export function isSceneAllowed(
  sceneSlug: string,
  gates: OnboardingGates
): boolean {
  const requirement = SCENE_GATES[sceneSlug];

  // No requirement = always allowed
  if (!requirement || requirement.gates.length === 0) {
    return true;
  }

  const { gates: requiredGates, operator, level } = requirement;

  // Check each required gate
  const gateChecks = requiredGates.map((gate) => {
    // If level is 'very', check the _very gate
    const gateKey = level === 'very' ? `${gate}_very` : gate;
    return gates[gateKey as keyof OnboardingGates] === true;
  });

  // Apply operator
  if (operator === 'AND') {
    return gateChecks.every((check) => check);
  } else {
    return gateChecks.some((check) => check);
  }
}

/**
 * Check if a scene is blocked (inverse of isSceneAllowed)
 * @returns true if scene is BLOCKED, false if ALLOWED
 */
export function isSceneGated(
  sceneSlug: string,
  gates: OnboardingGates
): boolean {
  return !isSceneAllowed(sceneSlug, gates);
}

/**
 * Get all allowed scenes for a user
 */
export function getAllowedScenes(
  sceneSlugs: string[],
  gates: OnboardingGates
): string[] {
  return sceneSlugs.filter((slug) => isSceneAllowed(slug, gates));
}

/**
 * Get all blocked scenes for a user
 */
export function getBlockedScenes(
  sceneSlugs: string[],
  gates: OnboardingGates
): string[] {
  return sceneSlugs.filter((slug) => !isSceneAllowed(slug, gates));
}

/**
 * Get gate requirements for a scene
 */
export function getSceneGateRequirement(
  sceneSlug: string
): GateRequirement | null {
  return SCENE_GATES[sceneSlug] || null;
}

/**
 * Check which categories should be shown in onboarding
 * Based on conditional display rules
 */
export function getVisibleOnboardingCategories(
  responses: OnboardingResponses
): string[] {
  const baseCategories = [
    'oral',
    'anal',
    'group',
    'toys',
    'roleplay',
    'quickie',
    'romantic',
    'power_dynamic',
    'rough',
    'public',
    'exhibitionism',
    'recording',
    'dirty_talk',
    'praise',
    'lingerie',
    'foot',
  ];

  const conditionalCategories: string[] = [];

  // bondage: show if power_dynamic ≠ vanilla OR rough = YES
  if (
    (responses.power_dynamic !== undefined && responses.power_dynamic >= RESPONSE.YES) ||
    (responses.rough !== undefined && responses.rough >= RESPONSE.YES)
  ) {
    conditionalCategories.push('bondage');
  }

  // body_fluids: show if oral = YES
  if (responses.oral !== undefined && responses.oral >= RESPONSE.YES) {
    conditionalCategories.push('body_fluids');
  }

  // sexting: show if recording = YES OR exhibitionism = YES
  if (
    (responses.recording !== undefined && responses.recording >= RESPONSE.YES) ||
    (responses.exhibitionism !== undefined && responses.exhibitionism >= RESPONSE.YES)
  ) {
    conditionalCategories.push('sexting');
  }

  // extreme: show if rough = VERY AND bondage = YES
  if (
    (responses.rough !== undefined && responses.rough >= RESPONSE.VERY) &&
    (responses.bondage !== undefined && responses.bondage >= RESPONSE.YES)
  ) {
    conditionalCategories.push('extreme');
  }

  return [...baseCategories, ...conditionalCategories];
}
