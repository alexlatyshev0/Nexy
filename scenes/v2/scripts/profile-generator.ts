/**
 * Profile Generator - Creates user profiles from discovery responses
 *
 * Implements:
 * - Archetype matching
 * - Tag score aggregation
 * - Insight generation
 * - Give/receive balance analysis
 */

import profileAnalysis from '../profile-analysis.json';
import { FlowState, TagScores, UserResponse, BodyMapResponse } from './flow-engine';

// Types
export interface Archetype {
  id: string;
  name: { ru: string; en: string };
  description: { ru: string; en: string };
  score: number;
  subtypes?: {
    id: string;
    name: { ru: string; en: string };
    score: number;
  }[];
}

export interface InsightMatch {
  templateId: string;
  pattern: string;
  insight: { ru: string; en: string };
}

export interface UserProfile {
  // Core stats
  tagScores: TagScores;
  topTags: { tag: string; score: number }[];
  bottomTags: { tag: string; score: number }[];

  // Archetypes
  primaryArchetype: Archetype;
  secondaryArchetypes: Archetype[];

  // Dynamics
  giveReceiveBalance: number; // -1 to 1
  giveReceiveLabel: { ru: string; en: string };
  preferredIntensity: number;
  intensityLabel: { ru: string; en: string };

  // Insights
  matchedInsights: InsightMatch[];

  // Exploration zones (moderate scores = potential growth)
  explorationZones: { tag: string; score: number }[];

  // Stats
  totalScenesCompleted: number;
  totalBodyMapActivities: number;
  completionPercentage: number;
}

const ARCHETYPES = profileAnalysis.archetypes;
const INSIGHT_TEMPLATES = profileAnalysis.insight_templates;
const ARCHETYPE_THRESHOLD = 0.4;
const MAX_ARCHETYPES = 3;

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
 * Calculate subtype scores for an archetype
 */
function calculateSubtypes(
  archetype: any,
  tagScores: TagScores
): { id: string; name: { ru: string; en: string }; score: number }[] {
  if (!archetype.subtypes) return [];

  const subtypes = [];
  for (const [subtypeId, subtype] of Object.entries(archetype.subtypes)) {
    const sub = subtype as { also_high: string[]; name: { ru: string; en: string } };
    let score = 0;
    let maxPossible = 0;

    for (const tag of sub.also_high) {
      score += Math.min(tagScores[tag] || 0, 5);
      maxPossible += 5;
    }

    const normalizedScore = maxPossible > 0 ? score / maxPossible : 0;

    if (normalizedScore > 0.3) {
      subtypes.push({
        id: subtypeId,
        name: sub.name,
        score: normalizedScore,
      });
    }
  }

  return subtypes.sort((a, b) => b.score - a.score);
}

/**
 * Match insight templates to user profile
 */
function matchInsights(
  tagScores: TagScores,
  archetypes: Archetype[],
  giveReceiveBalance: number
): InsightMatch[] {
  const matches: InsightMatch[] = [];
  const archetypeIds = new Set(archetypes.map(a => a.id));

  for (const [templateId, template] of Object.entries(INSIGHT_TEMPLATES)) {
    if (templateId === '_note') continue;

    const t = template as { pattern: string; insight: { ru: string; en: string } };
    const pattern = t.pattern;

    // Simple pattern matching
    let matched = false;

    // Check for archetype combinations
    if (pattern.includes('dominant') && archetypeIds.has('dominant')) {
      if (pattern.includes('aftercare') && (tagScores['aftercare'] || 0) >= 3) {
        matched = true;
      } else if (!pattern.includes('+')) {
        matched = true;
      }
    }

    if (pattern.includes('submissive') && archetypeIds.has('submissive')) {
      if (pattern.includes('brat') && (tagScores['brat'] || 0) >= 2) {
        matched = true;
      } else if (!pattern.includes('+')) {
        matched = true;
      }
    }

    if (pattern.includes('primal') && pattern.includes('romantic')) {
      const hasPrimal = (tagScores['primal'] || 0) >= 3;
      const hasRomantic = (tagScores['romantic'] || 0) >= 3;
      if (hasPrimal && hasRomantic) matched = true;
    }

    if (pattern.includes('switch') && archetypeIds.has('switch')) {
      matched = true;
    }

    if (pattern.includes('sadist') && (tagScores['sadist'] || 0) >= 3) {
      if (pattern.includes('aftercare') && (tagScores['aftercare'] || 0) >= 2) {
        matched = true;
      }
    }

    if (pattern.includes('masochist') && (tagScores['masochist'] || 0) >= 3) {
      matched = true;
    }

    if (pattern.includes('exhibitionism') && (tagScores['exhibitionism'] || 0) >= 3) {
      matched = true;
    }

    if (pattern.includes('foot_fetish') && (tagScores['foot_fetish'] || 0) >= 3) {
      matched = true;
    }

    if (pattern.includes('bondage') && (tagScores['bondage'] || 0) >= 3) {
      matched = true;
    }

    if (pattern.includes('cnc') && (tagScores['cnc'] || 0) >= 3) {
      matched = true;
    }

    if (pattern.includes('edging') && (tagScores['edging'] || 0) >= 3) {
      matched = true;
    }

    if (pattern.includes('spanking') && (tagScores['spanking'] || 0) >= 3) {
      matched = true;
    }

    if (pattern.includes('romantic') && pattern.includes('sensual') &&
        !pattern.includes('primal')) {
      const hasRomantic = (tagScores['romantic'] || 0) >= 3;
      const hasSensual = (tagScores['sensual'] || 0) >= 3;
      const lowIntensity = archetypes.some(a =>
        a.id === 'romantic_lover' || a.id === 'gentle_explorer'
      );
      if (hasRomantic && hasSensual && lowIntensity) matched = true;
    }

    if (matched) {
      matches.push({
        templateId,
        pattern: t.pattern,
        insight: t.insight,
      });
    }
  }

  // Limit to top 5 insights
  return matches.slice(0, 5);
}

/**
 * Get give/receive balance label
 */
function getGiveReceiveLabel(balance: number): { ru: string; en: string } {
  if (balance > 0.5) {
    return { ru: 'Преимущественно даёт', en: 'Predominantly gives' };
  } else if (balance > 0.2) {
    return { ru: 'Склонен давать', en: 'Tends to give' };
  } else if (balance > -0.2) {
    return { ru: 'Баланс / Свитч', en: 'Balanced / Switch' };
  } else if (balance > -0.5) {
    return { ru: 'Склонен получать', en: 'Tends to receive' };
  } else {
    return { ru: 'Преимущественно получает', en: 'Predominantly receives' };
  }
}

/**
 * Get intensity label
 */
function getIntensityLabel(intensity: number): { ru: string; en: string } {
  if (intensity <= 1.5) {
    return { ru: 'Ванильный', en: 'Vanilla' };
  } else if (intensity <= 2.5) {
    return { ru: 'Лёгкий кинк', en: 'Light kink' };
  } else if (intensity <= 3.5) {
    return { ru: 'Умеренный кинк', en: 'Moderate kink' };
  } else if (intensity <= 4.5) {
    return { ru: 'Продвинутый кинк', en: 'Advanced kink' };
  } else {
    return { ru: 'Экстрим', en: 'Extreme' };
  }
}

/**
 * Generate user profile from flow state
 */
export function generateProfile(
  state: FlowState,
  totalScenes: number,
  totalBodyMap: number
): UserProfile {
  const { tagScores, preferredIntensity, giveReceiveBalance } = state;

  // Sort tags by score
  const sortedTags = Object.entries(tagScores)
    .map(([tag, score]) => ({ tag, score }))
    .sort((a, b) => b.score - a.score);

  const topTags = sortedTags.filter(t => t.score > 0).slice(0, 10);
  const bottomTags = sortedTags.filter(t => t.score < 0).slice(-5).reverse();

  // Exploration zones: moderate scores (potential growth areas)
  const explorationZones = sortedTags
    .filter(t => t.score >= 1 && t.score <= 3)
    .slice(0, 5);

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

  // Sort by score
  archetypeScores.sort((a, b) => b.score - a.score);

  // Primary and secondary archetypes
  const primaryData = archetypeScores[0];
  const secondaryData = archetypeScores.slice(1, MAX_ARCHETYPES);

  const toArchetype = (data: { id: string; archetype: any; score: number }): Archetype => ({
    id: data.id,
    name: data.archetype.name,
    description: data.archetype.description,
    score: data.score,
    subtypes: calculateSubtypes(data.archetype, tagScores),
  });

  const primaryArchetype = primaryData
    ? toArchetype(primaryData)
    : {
        id: 'explorer',
        name: { ru: 'Исследователь', en: 'Explorer' },
        description: { ru: 'Открыт к экспериментам', en: 'Open to experimentation' },
        score: 0.5,
      };

  const secondaryArchetypes = secondaryData.map(toArchetype);

  // Match insights
  const matchedInsights = matchInsights(
    tagScores,
    [primaryArchetype, ...secondaryArchetypes],
    giveReceiveBalance
  );

  // Calculate completion
  const completedScenes = state.seenScenes.size;
  const completionPercentage = Math.round((completedScenes / totalScenes) * 100);

  return {
    tagScores,
    topTags,
    bottomTags,
    primaryArchetype,
    secondaryArchetypes,
    giveReceiveBalance,
    giveReceiveLabel: getGiveReceiveLabel(giveReceiveBalance),
    preferredIntensity,
    intensityLabel: getIntensityLabel(preferredIntensity),
    matchedInsights,
    explorationZones,
    totalScenesCompleted: completedScenes,
    totalBodyMapActivities: totalBodyMap,
    completionPercentage,
  };
}

/**
 * Generate profile summary text using templates
 */
export function generateProfileSummary(
  profile: UserProfile,
  language: 'ru' | 'en'
): string {
  const lines: string[] = [];

  // Archetype line
  const archName = profile.primaryArchetype.name[language];
  const archDesc = profile.primaryArchetype.description[language];
  lines.push(`**${archName}** — ${archDesc}`);

  // Subtypes
  if (profile.primaryArchetype.subtypes?.length) {
    const subtypeNames = profile.primaryArchetype.subtypes.map(s => s.name[language]).join(', ');
    lines.push(language === 'ru' ? `Подтипы: ${subtypeNames}` : `Subtypes: ${subtypeNames}`);
  }

  // Secondary archetypes
  if (profile.secondaryArchetypes.length > 0) {
    const secondaryNames = profile.secondaryArchetypes.map(a => a.name[language]).join(', ');
    lines.push(language === 'ru' ? `Также: ${secondaryNames}` : `Also: ${secondaryNames}`);
  }

  lines.push('');

  // Dynamics
  lines.push(language === 'ru' ? '**Динамика:**' : '**Dynamics:**');
  lines.push(`- ${profile.giveReceiveLabel[language]}`);
  lines.push(`- ${profile.intensityLabel[language]}`);

  lines.push('');

  // Top interests
  if (profile.topTags.length > 0) {
    const tagList = profile.topTags.slice(0, 5).map(t => t.tag).join(', ');
    lines.push(language === 'ru' ? `**Топ интересы:** ${tagList}` : `**Top interests:** ${tagList}`);
  }

  // Insights
  if (profile.matchedInsights.length > 0) {
    lines.push('');
    lines.push(language === 'ru' ? '**Инсайты:**' : '**Insights:**');
    for (const insight of profile.matchedInsights.slice(0, 3)) {
      lines.push(`- ${insight.insight[language]}`);
    }
  }

  // Exploration zones
  if (profile.explorationZones.length > 0) {
    lines.push('');
    const zoneList = profile.explorationZones.map(z => z.tag).join(', ');
    lines.push(
      language === 'ru'
        ? `**Зоны для исследования:** ${zoneList}`
        : `**Exploration zones:** ${zoneList}`
    );
  }

  return lines.join('\n');
}

export default {
  generateProfile,
  generateProfileSummary,
};
