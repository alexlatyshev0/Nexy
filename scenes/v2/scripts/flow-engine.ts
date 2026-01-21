/**
 * Flow Engine - Adaptive scene ordering and scoring
 *
 * Implements:
 * - Offline scoring based on flow-rules.json
 * - Runtime AI integration (async, non-blocking)
 * - Body map → tag boosting
 * - Intensity gating
 * - Exploration vs exploitation balance
 */

import flowRules from '../flow-rules.json';

// Types
export interface TagScores {
  [tag: string]: number;
}

export interface UserResponse {
  sceneId: string;
  liked: boolean;
  rating?: number; // 1-5
  elementsSelected: string[];
  followUpAnswers: Record<string, any>;
}

export interface BodyMapResponse {
  activityId: string; // e.g., 'spanking', 'biting'
  pass: 'give' | 'receive';
  zonesSelected: string[];
}

export interface Scene {
  id: string;
  slug: string;
  intensity: number;
  category: string;
  tags: string[];
  ai_context: {
    tests_primary: string[];
    tests_secondary: string[];
  };
}

export interface ScoredScene extends Scene {
  score: number;
  scoreBreakdown: {
    tagBoost: number;
    clusterBoost: number;
    similarityBoost: number;
    intensityPenalty: number;
    categoryPenalty: number;
  };
}

export interface FlowState {
  tagScores: TagScores;
  seenScenes: Set<string>;
  seenCategories: Set<string>;
  preferredIntensity: number;
  giveReceiveBalance: number; // -1 = receive only, 0 = balanced, 1 = give only
  calibrationComplete: boolean;
  runtimeAiEnabled: boolean;
  aiPredictions?: Record<string, number>;
}

// Constants from flow-rules.json
const WEIGHTS = flowRules.scoring_algorithm.weights;
const TAG_CLUSTERS = flowRules.tag_clusters;
const BODYMAP_MAPPINGS = flowRules.bodymap_to_tags;
const INTENSITY_GATES = flowRules.intensity_gates;
const EXPLORATION = flowRules.exploration_strategy;

/**
 * Initialize empty flow state
 */
export function createFlowState(): FlowState {
  return {
    tagScores: {},
    seenScenes: new Set(),
    seenCategories: new Set(),
    preferredIntensity: 2, // Start with light kink assumption
    giveReceiveBalance: 0,
    calibrationComplete: false,
    runtimeAiEnabled: false,
  };
}

/**
 * Process body map responses and boost relevant tags
 */
export function processBodyMapResponses(
  state: FlowState,
  responses: BodyMapResponse[]
): FlowState {
  const newTagScores = { ...state.tagScores };
  let giveCount = 0;
  let receiveCount = 0;

  for (const response of responses) {
    const mapping = BODYMAP_MAPPINGS[response.activityId as keyof typeof BODYMAP_MAPPINGS];
    if (!mapping) continue;

    // Track give/receive balance - only count if zones were selected
    if (response.zonesSelected.length > 0) {
      if (response.pass === 'give') giveCount++;
      else receiveCount++;
    }

    // Process zone selections
    const zones = mapping.zones as Record<string, { boost: string[] }>;
    for (const zone of response.zonesSelected) {
      const zoneMapping = zones[zone];
      if (zoneMapping?.boost) {
        for (const tag of zoneMapping.boost) {
          newTagScores[tag] = (newTagScores[tag] || 0) + 1;
        }
      }
    }

    // Check for "many zones" bonus
    if (response.zonesSelected.length >= 4 && zones.many_zones) {
      for (const tag of zones.many_zones.boost) {
        newTagScores[tag] = (newTagScores[tag] || 0) + 1;
      }
    }

    // Process give/receive signals
    const giveReceive = (mapping as any).give_receive;
    if (giveReceive) {
      // This will be processed after all responses
    }
  }

  // Calculate give/receive balance
  const total = giveCount + receiveCount;
  const balance = total > 0 ? (giveCount - receiveCount) / total : 0;

  // Apply give/receive boosts based on overall pattern
  if (balance > 0.3) {
    // Predominantly give = dominant signals
    newTagScores['dominant'] = (newTagScores['dominant'] || 0) + 2;
    newTagScores['sadist'] = (newTagScores['sadist'] || 0) + 1;
  } else if (balance < -0.3) {
    // Predominantly receive = submissive signals
    newTagScores['submissive'] = (newTagScores['submissive'] || 0) + 2;
    newTagScores['masochist'] = (newTagScores['masochist'] || 0) + 1;
  } else {
    // Balanced = switch signals
    newTagScores['switch'] = (newTagScores['switch'] || 0) + 2;
    newTagScores['versatile'] = (newTagScores['versatile'] || 0) + 1;
  }

  return {
    ...state,
    tagScores: newTagScores,
    giveReceiveBalance: balance,
  };
}

/**
 * Process a user response to a scene
 */
export function processSceneResponse(
  state: FlowState,
  response: UserResponse,
  scene: Scene
): FlowState {
  const newTagScores = { ...state.tagScores };
  const newSeenScenes = new Set(state.seenScenes);
  const newSeenCategories = new Set(state.seenCategories);

  newSeenScenes.add(response.sceneId);
  newSeenCategories.add(scene.category);

  if (response.liked) {
    // Boost primary tags
    for (const tag of scene.ai_context.tests_primary) {
      newTagScores[tag] = (newTagScores[tag] || 0) + WEIGHTS.tag_match_primary;
    }
    // Boost secondary tags
    for (const tag of scene.ai_context.tests_secondary) {
      newTagScores[tag] = (newTagScores[tag] || 0) + WEIGHTS.tag_match_secondary;
    }
    // Boost cluster members
    for (const [clusterId, cluster] of Object.entries(TAG_CLUSTERS)) {
      // Skip meta fields like "_note"
      if (clusterId.startsWith('_')) continue;
      const clusterData = cluster as { core: string[]; related: string[] };
      if (!clusterData.core || !Array.isArray(clusterData.core)) continue;
      const hasMatch = scene.ai_context.tests_primary.some(
        tag => clusterData.core.includes(tag)
      );
      if (hasMatch) {
        for (const relatedTag of clusterData.related) {
          newTagScores[relatedTag] = (newTagScores[relatedTag] || 0) + WEIGHTS.cluster_membership;
        }
      }
    }
  } else {
    // Penalize primary tags for disliked scenes
    for (const tag of scene.ai_context.tests_primary) {
      newTagScores[tag] = (newTagScores[tag] || 0) - 1;
    }
  }

  // Update preferred intensity based on response
  let newIntensity = state.preferredIntensity;
  if (response.liked && scene.intensity > state.preferredIntensity) {
    newIntensity = Math.min(5, state.preferredIntensity + 0.2);
  } else if (!response.liked && scene.intensity >= state.preferredIntensity) {
    newIntensity = Math.max(1, state.preferredIntensity - 0.1);
  }

  // Check if calibration is complete
  const calibrationComplete = newSeenScenes.size >= EXPLORATION.calibration_phase.scenes_count;

  return {
    ...state,
    tagScores: newTagScores,
    seenScenes: newSeenScenes,
    seenCategories: newSeenCategories,
    preferredIntensity: newIntensity,
    calibrationComplete,
  };
}

/**
 * Calculate score for a single scene
 */
export function scoreScene(scene: Scene, state: FlowState): ScoredScene {
  let tagBoost = 0;
  let clusterBoost = 0;
  let similarityBoost = 0;
  let intensityPenalty = 0;
  let categoryPenalty = 0;

  // Tag boost from user's tag scores
  for (const tag of scene.ai_context.tests_primary) {
    tagBoost += (state.tagScores[tag] || 0) * WEIGHTS.tag_match_primary;
  }
  for (const tag of scene.ai_context.tests_secondary) {
    tagBoost += (state.tagScores[tag] || 0) * WEIGHTS.tag_match_secondary;
  }

  // Cluster boost - if user likes related tags
  for (const [clusterId, cluster] of Object.entries(TAG_CLUSTERS)) {
    // Skip meta fields like "_note"
    if (clusterId.startsWith('_')) continue;
    const clusterData = cluster as { core: string[]; related: string[] };
    if (!clusterData.core || !Array.isArray(clusterData.core)) continue;
    const sceneInCluster = scene.ai_context.tests_primary.some(
      tag => clusterData.core.includes(tag)
    );
    if (sceneInCluster) {
      const userLikesCluster = clusterData.core.some(
        tag => (state.tagScores[tag] || 0) > 0
      );
      if (userLikesCluster) {
        clusterBoost += WEIGHTS.cluster_membership;
      }
    }
  }

  // Intensity penalty
  const intensityDiff = Math.abs(scene.intensity - state.preferredIntensity);
  if (intensityDiff > 1) {
    intensityPenalty = intensityDiff * WEIGHTS.intensity_mismatch_penalty;
  }

  // Category penalty - reduce score if category already explored
  if (state.seenCategories.has(scene.category)) {
    categoryPenalty = WEIGHTS.already_seen_category_penalty;
  }

  // Apply AI predictions if available
  if (state.runtimeAiEnabled && state.aiPredictions?.[scene.id]) {
    similarityBoost = state.aiPredictions[scene.id] * 2;
  }

  const score = tagBoost + clusterBoost + similarityBoost - intensityPenalty - categoryPenalty;

  return {
    ...scene,
    score,
    scoreBreakdown: {
      tagBoost,
      clusterBoost,
      similarityBoost,
      intensityPenalty,
      categoryPenalty,
    },
  };
}

/**
 * Check if a scene passes intensity gates
 */
export function passesIntensityGates(scene: Scene, state: FlowState): boolean {
  const gateKey = scene.slug || scene.id;
  const gate = INTENSITY_GATES[gateKey as keyof typeof INTENSITY_GATES];

  if (!gate) return true; // No gate = allowed

  // Check require_any
  if (gate.require_any) {
    const meetsAny = gate.require_any.some((condition: string) => {
      const [tag, operator, value] = condition.split(/\s*(>=|<=|>|<|==)\s*/);
      const tagScore = state.tagScores[tag] || 0;
      const threshold = parseFloat(value);

      switch (operator) {
        case '>=': return tagScore >= threshold;
        case '<=': return tagScore <= threshold;
        case '>': return tagScore > threshold;
        case '<': return tagScore < threshold;
        case '==': return tagScore === threshold;
        default: return false;
      }
    });
    if (!meetsAny) return false;
  }

  // Check require_all
  if (gate.require_all) {
    const meetsAll = gate.require_all.every((condition: string) => {
      if (condition === 'trust_established') return state.seenScenes.size > 10;

      const [tag, operator, value] = condition.split(/\s*(>=|<=|>|<|==)\s*/);
      const tagScore = state.tagScores[tag] || 0;
      const threshold = parseFloat(value);

      switch (operator) {
        case '>=': return tagScore >= threshold;
        case '<=': return tagScore <= threshold;
        case '>': return tagScore > threshold;
        case '<': return tagScore < threshold;
        case '==': return tagScore === threshold;
        default: return true;
      }
    });
    if (!meetsAll) return false;
  }

  // Check skip_if
  if (gate.skip_if) {
    const shouldSkip = gate.skip_if.some((condition: string) => {
      const [tag, operator, value] = condition.split(/\s*(>=|<=|>|<|==)\s*/);
      const tagScore = state.tagScores[tag] || 0;
      const threshold = parseFloat(value || '0');

      switch (operator) {
        case '>=': return tagScore >= threshold;
        case '<=': return tagScore <= threshold;
        case '>': return tagScore > threshold;
        case '<': return tagScore < threshold;
        case '==': return tagScore === threshold;
        default: return false;
      }
    });
    if (shouldSkip) return false;
  }

  return true;
}

/**
 * Get ordered list of scenes to show
 */
export function getOrderedScenes(
  scenes: Scene[],
  state: FlowState
): ScoredScene[] {
  // Filter out already seen scenes
  const unseenScenes = scenes.filter(s => !state.seenScenes.has(s.id));

  // Filter by intensity gates
  const eligibleScenes = unseenScenes.filter(s => passesIntensityGates(s, state));

  // Score all scenes
  const scoredScenes = eligibleScenes.map(s => scoreScene(s, state));

  // Sort by score (highest first)
  scoredScenes.sort((a, b) => b.score - a.score);

  // Apply exploration strategy
  if (state.calibrationComplete) {
    // Main phase: 70% exploit, 30% explore
    const exploitCount = Math.floor(scoredScenes.length * EXPLORATION.main_phase.exploit_ratio);
    const exploitScenes = scoredScenes.slice(0, exploitCount);
    const exploreScenes = scoredScenes.slice(exploitCount);

    // Shuffle explore scenes
    for (let i = exploreScenes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [exploreScenes[i], exploreScenes[j]] = [exploreScenes[j], exploreScenes[i]];
    }

    // Interleave: every 3rd scene is an explore scene
    const result: ScoredScene[] = [];
    let exploitIdx = 0;
    let exploreIdx = 0;

    while (exploitIdx < exploitScenes.length || exploreIdx < exploreScenes.length) {
      // Add 2-3 exploit scenes
      for (let i = 0; i < 3 && exploitIdx < exploitScenes.length; i++) {
        result.push(exploitScenes[exploitIdx++]);
      }
      // Add 1 explore scene
      if (exploreIdx < exploreScenes.length) {
        result.push(exploreScenes[exploreIdx++]);
      }
    }

    return result;
  } else {
    // Calibration phase: breadth-first, ensure category coverage
    const byCategory = new Map<string, ScoredScene[]>();
    for (const scene of scoredScenes) {
      const category = scene.category;
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category)!.push(scene);
    }

    // Round-robin through categories
    const result: ScoredScene[] = [];
    const categories = Array.from(byCategory.keys());
    let categoryIdx = 0;

    while (result.length < scoredScenes.length) {
      const category = categories[categoryIdx % categories.length];
      const categoryScenes = byCategory.get(category)!;
      if (categoryScenes.length > 0) {
        result.push(categoryScenes.shift()!);
      }
      categoryIdx++;

      // Prevent infinite loop if all categories are empty
      if (categoryIdx > scoredScenes.length * 2) break;
    }

    return result;
  }
}

/**
 * Get the next scene to show
 */
export function getNextScene(scenes: Scene[], state: FlowState): ScoredScene | null {
  const ordered = getOrderedScenes(scenes, state);
  return ordered[0] || null;
}

/**
 * Runtime AI integration - call in background after each scene
 */
export async function triggerRuntimeAI(
  state: FlowState,
  remainingScenes: Scene[],
  responses: UserResponse[]
): Promise<Record<string, number>> {
  if (!state.runtimeAiEnabled) {
    return {};
  }

  const config = flowRules.flow_modes.runtime_ai.config;

  // Only trigger after N scenes
  if (state.seenScenes.size < config.analyze_after_n_scenes) {
    return {};
  }

  // Only recalibrate every N scenes
  if (state.seenScenes.size % config.recalibrate_every_n !== 0) {
    return state.aiPredictions || {};
  }

  try {
    // This would call your AI endpoint
    // const predictions = await callAIEndpoint(responses, remainingScenes);
    // return predictions;

    // Placeholder - in production, call actual AI
    console.log('[RuntimeAI] Would analyze responses and predict interests');
    return {};
  } catch (error) {
    console.error('[RuntimeAI] Error:', error);
    // Fallback to offline
    return {};
  }
}

// Export types and functions
export default {
  createFlowState,
  processBodyMapResponses,
  processSceneResponse,
  scoreScene,
  passesIntensityGates,
  getOrderedScenes,
  getNextScene,
  triggerRuntimeAI,
};
