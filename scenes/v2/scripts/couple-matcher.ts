/**
 * Couple Matcher - Analyzes compatibility between two profiles
 *
 * Implements:
 * - Role compatibility
 * - Intensity alignment
 * - Shared interests
 * - Complementary desires
 * - Growth opportunities
 * - Red flag detection
 */

import profileAnalysis from '../profile-analysis.json';
import { UserProfile, Archetype } from './profile-generator';

// Types
export interface CompatibilityDimension {
  id: string;
  name: { ru: string; en: string };
  score: number; // 0-100
  description: { ru: string; en: string };
  tips?: { ru: string; en: string }[];
}

export interface RedFlag {
  severity: 'high' | 'medium' | 'low';
  description: { ru: string; en: string };
  recommendation: { ru: string; en: string };
}

export interface SharedInterest {
  tag: string;
  partnerAScore: number;
  partnerBScore: number;
  combined: number;
}

export interface GrowthOpportunity {
  tag: string;
  leader: 'A' | 'B';
  leaderScore: number;
  followerScore: number;
  potential: { ru: string; en: string };
}

export interface DateNightIdea {
  title: { ru: string; en: string };
  description: { ru: string; en: string };
  basedOn: string[]; // tags this is based on
  intensity: number;
}

export interface CoupleCompatibility {
  overallScore: number; // 0-100
  overallLabel: { ru: string; en: string };

  dimensions: CompatibilityDimension[];

  sharedFavorites: SharedInterest[];
  complementaryDesires: { tag: string; giverScore: number; receiverScore: number }[];
  growthOpportunities: GrowthOpportunity[];

  redFlags: RedFlag[];
  discussionPoints: { ru: string; en: string }[];

  dateNightIdeas: DateNightIdea[];

  // Matched insight for this couple
  coupleInsight?: { ru: string; en: string };
}

const COMPATIBILITY_CONFIG = profileAnalysis.couple_compatibility;
const INSIGHT_TEMPLATES = profileAnalysis.insight_templates;

/**
 * Calculate role compatibility
 */
function calculateRoleCompatibility(
  profileA: UserProfile,
  profileB: UserProfile
): CompatibilityDimension {
  const archA = profileA.primaryArchetype.id;
  const archB = profileB.primaryArchetype.id;

  let score = 50; // Base score
  let description: { ru: string; en: string };
  const tips: { ru: string; en: string }[] = [];

  // Perfect matches
  if (
    (archA === 'dominant' && archB === 'submissive') ||
    (archA === 'submissive' && archB === 'dominant')
  ) {
    score = 95;
    description = {
      ru: 'Идеальное дополнение: дом и саб',
      en: 'Perfect complement: dom and sub',
    };
  } else if (archA === 'switch' || archB === 'switch') {
    score = 85;
    description = {
      ru: 'Свитч даёт гибкость в динамике',
      en: 'Switch provides flexibility in dynamics',
    };
    tips.push({
      ru: 'Обсудите, как часто хотите меняться ролями',
      en: 'Discuss how often you want to switch roles',
    });
  } else if (archA === 'switch' && archB === 'switch') {
    score = 90;
    description = {
      ru: 'Два свитча — бесконечные возможности',
      en: 'Two switches — endless possibilities',
    };
  } else if (archA === 'dominant' && archB === 'dominant') {
    score = 40;
    description = {
      ru: 'Два доминанта — нужна чёткая договорённость',
      en: 'Two dominants — clear negotiation needed',
    };
    tips.push({
      ru: 'Попробуйте чередовать роли или найти баланс',
      en: 'Try alternating roles or finding balance',
    });
  } else if (archA === 'submissive' && archB === 'submissive') {
    score = 45;
    description = {
      ru: 'Два саба — нужен внешний сценарий или свитчинг',
      en: 'Two subs — need external scenario or switching',
    };
    tips.push({
      ru: 'Рассмотрите ролевые игры с чередованием',
      en: 'Consider roleplay with role alternation',
    });
  } else {
    score = 70;
    description = {
      ru: 'Разные стили — есть пространство для роста',
      en: 'Different styles — room for growth',
    };
  }

  // Adjust for give/receive balance
  const balanceDiff = Math.abs(profileA.giveReceiveBalance - profileB.giveReceiveBalance);
  if (balanceDiff > 1) {
    // Complementary
    score = Math.min(100, score + 10);
  } else if (balanceDiff < 0.3) {
    // Similar
    score = Math.max(0, score - 5);
  }

  return {
    id: 'role_compatibility',
    name: { ru: 'Совместимость ролей', en: 'Role Compatibility' },
    score,
    description,
    tips: tips.length > 0 ? tips : undefined,
  };
}

/**
 * Calculate intensity alignment
 */
function calculateIntensityAlignment(
  profileA: UserProfile,
  profileB: UserProfile
): CompatibilityDimension {
  const diff = Math.abs(profileA.preferredIntensity - profileB.preferredIntensity);

  let score: number;
  let description: { ru: string; en: string };
  const tips: { ru: string; en: string }[] = [];

  if (diff <= 0.5) {
    score = 95;
    description = {
      ru: 'Отлично совпадаете по интенсивности',
      en: 'Excellent intensity match',
    };
  } else if (diff <= 1) {
    score = 80;
    description = {
      ru: 'Близкие предпочтения по интенсивности',
      en: 'Close intensity preferences',
    };
  } else if (diff <= 1.5) {
    score = 65;
    description = {
      ru: 'Небольшая разница в интенсивности — можно адаптироваться',
      en: 'Small intensity gap — adaptable',
    };
    tips.push({
      ru: 'Начинайте с комфортного уровня для обоих',
      en: 'Start at the comfortable level for both',
    });
  } else if (diff <= 2) {
    score = 45;
    description = {
      ru: 'Заметная разница — нужен компромисс',
      en: 'Notable gap — compromise needed',
    };
    tips.push({
      ru: 'Обсудите границы и план постепенного исследования',
      en: 'Discuss boundaries and gradual exploration plan',
    });
  } else {
    score = 25;
    description = {
      ru: 'Большая разница в интенсивности — требует серьёзного разговора',
      en: 'Large intensity gap — serious conversation needed',
    };
    tips.push({
      ru: 'Один из вас значительно более интенсивен. Начните с минимума.',
      en: 'One of you is significantly more intense. Start from minimum.',
    });
  }

  return {
    id: 'intensity_alignment',
    name: { ru: 'Совпадение интенсивности', en: 'Intensity Alignment' },
    score,
    description,
    tips: tips.length > 0 ? tips : undefined,
  };
}

/**
 * Calculate shared interests
 */
function calculateSharedInterests(
  profileA: UserProfile,
  profileB: UserProfile
): { dimension: CompatibilityDimension; favorites: SharedInterest[] } {
  const sharedHigh: SharedInterest[] = [];

  // Find tags where both have positive scores
  const allTags = new Set([
    ...Object.keys(profileA.tagScores),
    ...Object.keys(profileB.tagScores),
  ]);

  for (const tag of allTags) {
    const scoreA = profileA.tagScores[tag] || 0;
    const scoreB = profileB.tagScores[tag] || 0;

    if (scoreA >= 2 && scoreB >= 2) {
      sharedHigh.push({
        tag,
        partnerAScore: scoreA,
        partnerBScore: scoreB,
        combined: scoreA + scoreB,
      });
    }
  }

  // Sort by combined score
  sharedHigh.sort((a, b) => b.combined - a.combined);

  const favorites = sharedHigh.slice(0, 10);
  const score = Math.min(100, favorites.length * 10);

  let description: { ru: string; en: string };
  if (favorites.length >= 8) {
    description = { ru: 'Много общих интересов!', en: 'Many shared interests!' };
  } else if (favorites.length >= 5) {
    description = { ru: 'Хорошее пересечение интересов', en: 'Good interest overlap' };
  } else if (favorites.length >= 2) {
    description = { ru: 'Несколько общих тем', en: 'A few shared themes' };
  } else {
    description = {
      ru: 'Мало пересечений — но это шанс открыть новое друг другу',
      en: 'Few overlaps — but a chance to discover new things together',
    };
  }

  return {
    dimension: {
      id: 'shared_interests',
      name: { ru: 'Общие интересы', en: 'Shared Interests' },
      score,
      description,
    },
    favorites,
  };
}

/**
 * Calculate complementary desires (A gives what B receives)
 */
function calculateComplementaryDesires(
  profileA: UserProfile,
  profileB: UserProfile
): { dimension: CompatibilityDimension; pairs: { tag: string; giverScore: number; receiverScore: number }[] } {
  const pairs: { tag: string; giverScore: number; receiverScore: number }[] = [];

  // Tags that indicate giving vs receiving
  const giveReceivePairs = [
    { give: 'spanking', receive: 'being_spanked' },
    { give: 'dominant', receive: 'submissive' },
    { give: 'sadist', receive: 'masochist' },
    { give: 'service', receive: 'being_served' },
    { give: 'praise', receive: 'being_praised' },
    { give: 'degradation', receive: 'being_degraded' },
    { give: 'choking', receive: 'being_choked' },
    { give: 'bondage', receive: 'being_tied' },
  ];

  // Simple heuristic: A is giver if giveReceiveBalance > 0
  const aIsGiver = profileA.giveReceiveBalance > 0;
  const bIsGiver = profileB.giveReceiveBalance > 0;

  // If complementary give/receive
  if (aIsGiver !== bIsGiver) {
    // Check for matching tags
    for (const tag of profileA.topTags) {
      const bScore = profileB.tagScores[tag.tag] || 0;
      if (bScore >= 2) {
        pairs.push({
          tag: tag.tag,
          giverScore: aIsGiver ? tag.score : bScore,
          receiverScore: aIsGiver ? bScore : tag.score,
        });
      }
    }
  }

  pairs.sort((a, b) => (b.giverScore + b.receiverScore) - (a.giverScore + a.receiverScore));

  const topPairs = pairs.slice(0, 5);
  const score = topPairs.length > 0 ? Math.min(100, topPairs.length * 20) : 50;

  const description = topPairs.length >= 3
    ? { ru: 'Отлично дополняете друг друга', en: 'Excellent complementary dynamic' }
    : { ru: 'Есть потенциал для взаимодополнения', en: 'Potential for complementary play' };

  return {
    dimension: {
      id: 'complementary_desires',
      name: { ru: 'Взаимодополнение', en: 'Complementary Desires' },
      score,
      description,
    },
    pairs: topPairs,
  };
}

/**
 * Calculate growth opportunities
 */
function calculateGrowthOpportunities(
  profileA: UserProfile,
  profileB: UserProfile
): GrowthOpportunity[] {
  const opportunities: GrowthOpportunity[] = [];

  // A's high + B's exploration zone
  for (const topTag of profileA.topTags) {
    const bZone = profileB.explorationZones.find(z => z.tag === topTag.tag);
    if (bZone) {
      opportunities.push({
        tag: topTag.tag,
        leader: 'A',
        leaderScore: topTag.score,
        followerScore: bZone.score,
        potential: {
          ru: `Партнёр A может познакомить B с ${topTag.tag}`,
          en: `Partner A can introduce B to ${topTag.tag}`,
        },
      });
    }
  }

  // B's high + A's exploration zone
  for (const topTag of profileB.topTags) {
    const aZone = profileA.explorationZones.find(z => z.tag === topTag.tag);
    if (aZone) {
      opportunities.push({
        tag: topTag.tag,
        leader: 'B',
        leaderScore: topTag.score,
        followerScore: aZone.score,
        potential: {
          ru: `Партнёр B может познакомить A с ${topTag.tag}`,
          en: `Partner B can introduce A to ${topTag.tag}`,
        },
      });
    }
  }

  return opportunities.slice(0, 5);
}

/**
 * Detect red flags
 */
function detectRedFlags(
  profileA: UserProfile,
  profileB: UserProfile
): RedFlag[] {
  const flags: RedFlag[] = [];

  // Hard limit conflict: one loves what other hates
  for (const topTag of profileA.topTags.slice(0, 5)) {
    const bScore = profileB.tagScores[topTag.tag] || 0;
    if (bScore < -2) {
      flags.push({
        severity: 'high',
        description: {
          ru: `A любит "${topTag.tag}", но B это не нравится`,
          en: `A loves "${topTag.tag}", but B dislikes it`,
        },
        recommendation: {
          ru: 'Обсудите это до любых экспериментов. Уважайте границы.',
          en: 'Discuss before any experiments. Respect boundaries.',
        },
      });
    }
  }

  for (const topTag of profileB.topTags.slice(0, 5)) {
    const aScore = profileA.tagScores[topTag.tag] || 0;
    if (aScore < -2) {
      flags.push({
        severity: 'high',
        description: {
          ru: `B любит "${topTag.tag}", но A это не нравится`,
          en: `B loves "${topTag.tag}", but A dislikes it`,
        },
        recommendation: {
          ru: 'Обсудите это до любых экспериментов. Уважайте границы.',
          en: 'Discuss before any experiments. Respect boundaries.',
        },
      });
    }
  }

  // Large intensity gap
  const intensityDiff = Math.abs(
    profileA.preferredIntensity - profileB.preferredIntensity
  );
  if (intensityDiff > 2) {
    flags.push({
      severity: 'medium',
      description: {
        ru: 'Большая разница в предпочтениях интенсивности',
        en: 'Large difference in intensity preferences',
      },
      recommendation: {
        ru: 'Начинайте с нижнего порога и двигайтесь постепенно.',
        en: 'Start from the lower threshold and progress gradually.',
      },
    });
  }

  return flags;
}

/**
 * Generate date night ideas based on shared interests
 */
function generateDateNightIdeas(
  sharedFavorites: SharedInterest[],
  profileA: UserProfile,
  profileB: UserProfile
): DateNightIdea[] {
  const ideas: DateNightIdea[] = [];

  // Map tags to date night ideas
  const tagToIdea: Record<string, DateNightIdea> = {
    massage: {
      title: { ru: 'Вечер массажа', en: 'Massage Night' },
      description: {
        ru: 'Подготовьте масла, свечи, музыку. По очереди массируйте друг друга.',
        en: 'Prepare oils, candles, music. Take turns massaging each other.',
      },
      basedOn: ['massage', 'sensual'],
      intensity: 1,
    },
    blindfold: {
      title: { ru: 'Сенсорная игра', en: 'Sensory Play' },
      description: {
        ru: 'Один с повязкой на глазах, другой исследует тело разными текстурами.',
        en: 'One blindfolded, the other explores with different textures.',
      },
      basedOn: ['blindfold', 'sensory'],
      intensity: 2,
    },
    roleplay: {
      title: { ru: 'Вечер ролевой игры', en: 'Roleplay Night' },
      description: {
        ru: 'Выберите сценарий, оденьтесь в образ, отыграйте фантазию.',
        en: 'Pick a scenario, dress up, act out the fantasy.',
      },
      basedOn: ['roleplay', 'costumes'],
      intensity: 2,
    },
    spanking: {
      title: { ru: 'Вечер порки', en: 'Spanking Session' },
      description: {
        ru: 'Начните с разминки, постепенно наращивайте интенсивность, не забудьте aftercare.',
        en: 'Start with warm-up, gradually increase intensity, don\'t forget aftercare.',
      },
      basedOn: ['spanking', 'impact_play'],
      intensity: 3,
    },
    bondage: {
      title: { ru: 'Бондаж для начинающих', en: 'Beginner Bondage' },
      description: {
        ru: 'Мягкие верёвки или ленты. Начните с рук, проверяйте комфорт.',
        en: 'Soft ropes or ribbons. Start with hands, check comfort.',
      },
      basedOn: ['bondage', 'restraints'],
      intensity: 3,
    },
    romantic: {
      title: { ru: 'Романтический вечер', en: 'Romantic Evening' },
      description: {
        ru: 'Ужин при свечах, медленный танец, долгая прелюдия.',
        en: 'Candlelit dinner, slow dance, extended foreplay.',
      },
      basedOn: ['romantic', 'sensual'],
      intensity: 1,
    },
  };

  // Add ideas based on shared favorites
  const addedTags = new Set<string>();
  for (const fav of sharedFavorites) {
    if (addedTags.has(fav.tag)) continue;

    const idea = tagToIdea[fav.tag];
    if (idea) {
      ideas.push(idea);
      addedTags.add(fav.tag);
    }
  }

  // Add generic ideas if not enough
  if (ideas.length < 3) {
    ideas.push({
      title: { ru: 'Вечер без телефонов', en: 'Phone-Free Night' },
      description: {
        ru: 'Уберите телефоны. Только вы двое. Поговорите о фантазиях.',
        en: 'Put phones away. Just the two of you. Talk about fantasies.',
      },
      basedOn: ['communication'],
      intensity: 1,
    });
  }

  return ideas.slice(0, 5);
}

/**
 * Find matching couple insight
 */
function findCoupleInsight(
  profileA: UserProfile,
  profileB: UserProfile
): { ru: string; en: string } | undefined {
  const archA = profileA.primaryArchetype.id;
  const archB = profileB.primaryArchetype.id;

  // Check for specific pair insights
  if (
    (archA === 'dominant' && archB === 'submissive') ||
    (archA === 'submissive' && archB === 'dominant')
  ) {
    const template = INSIGHT_TEMPLATES['dom_sub_complementary' as keyof typeof INSIGHT_TEMPLATES] as any;
    if (template) return template.insight;
  }

  if (archA === 'switch' && archB === 'switch') {
    const template = INSIGHT_TEMPLATES['both_switches' as keyof typeof INSIGHT_TEMPLATES] as any;
    if (template) return template.insight;
  }

  // Voyeur + exhibitionist
  const aVoyeur = (profileA.tagScores['voyeurism'] || 0) >= 3;
  const bExhib = (profileB.tagScores['exhibitionism'] || 0) >= 3;
  const bVoyeur = (profileB.tagScores['voyeurism'] || 0) >= 3;
  const aExhib = (profileA.tagScores['exhibitionism'] || 0) >= 3;

  if ((aVoyeur && bExhib) || (bVoyeur && aExhib)) {
    const template = INSIGHT_TEMPLATES['voyeur_exhibitionist_pair' as keyof typeof INSIGHT_TEMPLATES] as any;
    if (template) return template.insight;
  }

  return undefined;
}

/**
 * Generate discussion points
 */
function generateDiscussionPoints(
  profileA: UserProfile,
  profileB: UserProfile,
  redFlags: RedFlag[]
): { ru: string; en: string }[] {
  const points: { ru: string; en: string }[] = [];

  // Always discuss safe words
  points.push({
    ru: 'Договоритесь о стоп-словах (красный/жёлтый/зелёный)',
    en: 'Agree on safe words (red/yellow/green)',
  });

  // Intensity difference
  const intensityDiff = Math.abs(
    profileA.preferredIntensity - profileB.preferredIntensity
  );
  if (intensityDiff > 1) {
    points.push({
      ru: 'Обсудите комфортный уровень интенсивности для обоих',
      en: 'Discuss comfortable intensity level for both',
    });
  }

  // Role dynamics
  if (profileA.primaryArchetype.id === profileB.primaryArchetype.id) {
    points.push({
      ru: 'У вас похожие роли — обсудите, как это работает',
      en: 'You have similar roles — discuss how this works',
    });
  }

  // Add from red flags
  for (const flag of redFlags) {
    if (flag.severity === 'high') {
      points.push(flag.recommendation);
    }
  }

  // Aftercare
  points.push({
    ru: 'Поговорите о том, что нужно каждому после секса',
    en: 'Talk about what each of you needs after sex',
  });

  return points.slice(0, 5);
}

/**
 * Calculate overall compatibility score
 */
function calculateOverallScore(dimensions: CompatibilityDimension[]): number {
  const weights = {
    role_compatibility: 0.25,
    intensity_alignment: 0.20,
    shared_interests: 0.25,
    complementary_desires: 0.20,
    growth_opportunities: 0.10,
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const dim of dimensions) {
    const weight = weights[dim.id as keyof typeof weights] || 0.1;
    weightedSum += dim.score * weight;
    totalWeight += weight;
  }

  return Math.round(weightedSum / totalWeight);
}

/**
 * Get overall label
 */
function getOverallLabel(score: number): { ru: string; en: string } {
  if (score >= 85) {
    return { ru: 'Отличная совместимость!', en: 'Excellent compatibility!' };
  } else if (score >= 70) {
    return { ru: 'Хорошая совместимость', en: 'Good compatibility' };
  } else if (score >= 55) {
    return { ru: 'Умеренная совместимость', en: 'Moderate compatibility' };
  } else if (score >= 40) {
    return { ru: 'Требует работы', en: 'Needs work' };
  } else {
    return { ru: 'Значительные различия', en: 'Significant differences' };
  }
}

/**
 * Main function: analyze couple compatibility
 */
export function analyzeCompatibility(
  profileA: UserProfile,
  profileB: UserProfile
): CoupleCompatibility {
  // Calculate dimensions
  const roleDim = calculateRoleCompatibility(profileA, profileB);
  const intensityDim = calculateIntensityAlignment(profileA, profileB);
  const { dimension: sharedDim, favorites: sharedFavorites } = calculateSharedInterests(profileA, profileB);
  const { dimension: compDim, pairs: complementaryPairs } = calculateComplementaryDesires(profileA, profileB);
  const growthOpportunities = calculateGrowthOpportunities(profileA, profileB);

  // Growth opportunities dimension
  const growthDim: CompatibilityDimension = {
    id: 'growth_opportunities',
    name: { ru: 'Возможности роста', en: 'Growth Opportunities' },
    score: Math.min(100, growthOpportunities.length * 20),
    description: growthOpportunities.length > 0
      ? { ru: 'Можете многому научить друг друга', en: 'You can teach each other a lot' }
      : { ru: 'Похожий уровень опыта', en: 'Similar experience levels' },
  };

  const dimensions = [roleDim, intensityDim, sharedDim, compDim, growthDim];

  // Detect issues
  const redFlags = detectRedFlags(profileA, profileB);

  // Generate content
  const discussionPoints = generateDiscussionPoints(profileA, profileB, redFlags);
  const dateNightIdeas = generateDateNightIdeas(sharedFavorites, profileA, profileB);
  const coupleInsight = findCoupleInsight(profileA, profileB);

  // Calculate overall
  const overallScore = calculateOverallScore(dimensions);
  const overallLabel = getOverallLabel(overallScore);

  return {
    overallScore,
    overallLabel,
    dimensions,
    sharedFavorites,
    complementaryDesires: complementaryPairs,
    growthOpportunities,
    redFlags,
    discussionPoints,
    dateNightIdeas,
    coupleInsight,
  };
}

export default {
  analyzeCompatibility,
};
