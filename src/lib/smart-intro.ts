/**
 * Smart Intro - Personalized introduction based on onboarding responses
 *
 * Shows a tailored welcome message when user starts main discovery,
 * highlighting their top interests from onboarding.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Locale } from './types';

// Response value constants
const RESPONSE = {
  NO: 0,
  YES: 1,
  VERY: 2,
} as const;

// Category metadata for display
const CATEGORY_LABELS: Record<string, { ru: string; en: string; emoji?: string }> = {
  // Paired categories (give/receive combined for display)
  'oral-give': { ru: 'оральные ласки', en: 'oral pleasure', emoji: '👅' },
  'oral-receive': { ru: 'оральные ласки', en: 'oral pleasure', emoji: '👅' },
  'anal-give': { ru: 'анальные игры', en: 'anal play', emoji: '🍑' },
  'anal-receive': { ru: 'анальные игры', en: 'anal play', emoji: '🍑' },
  'rough-give': { ru: 'страсть и грубость', en: 'rough passion', emoji: '🔥' },
  'rough-receive': { ru: 'страсть и грубость', en: 'rough passion', emoji: '🔥' },
  'power-dom': { ru: 'доминирование', en: 'domination', emoji: '👑' },
  'power-sub': { ru: 'подчинение', en: 'submission', emoji: '🎀' },
  'dirty-talk-give': { ru: 'грязные разговоры', en: 'dirty talk', emoji: '💬' },
  'dirty-talk-receive': { ru: 'грязные разговоры', en: 'dirty talk', emoji: '💬' },
  'praise-give': { ru: 'похвала', en: 'praise', emoji: '⭐' },
  'praise-receive': { ru: 'похвала', en: 'praise', emoji: '⭐' },
  'foot-give': { ru: 'фут-фетиш', en: 'foot play', emoji: '🦶' },
  'foot-receive': { ru: 'фут-фетиш', en: 'foot play', emoji: '🦶' },
  'bondage-give': { ru: 'связывание', en: 'bondage', emoji: '🪢' },
  'bondage-receive': { ru: 'связывание', en: 'bondage', emoji: '🪢' },
  'body-fluids-give': { ru: 'телесные жидкости', en: 'body fluids', emoji: '💦' },
  'body-fluids-receive': { ru: 'телесные жидкости', en: 'body fluids', emoji: '💦' },

  // Single categories
  'group': { ru: 'групповой секс', en: 'group experiences', emoji: '👥' },
  'toys': { ru: 'игрушки', en: 'toys', emoji: '🎲' },
  'roleplay': { ru: 'ролевые игры', en: 'roleplay', emoji: '🎭' },
  'quickie': { ru: 'быстрый секс', en: 'quickies', emoji: '⚡' },
  'romantic': { ru: 'романтика', en: 'romance', emoji: '💕' },
  'public': { ru: 'секс вне спальни', en: 'outside bedroom', emoji: '🏠' },
  'exhibitionism': { ru: 'эксгибиционизм', en: 'exhibitionism', emoji: '👀' },
  'recording': { ru: 'съёмка', en: 'recording', emoji: '📹' },
  'lingerie': { ru: 'красивое бельё', en: 'lingerie', emoji: '👙' },
  'sexting': { ru: 'секстинг', en: 'sexting', emoji: '📱' },
  'extreme': { ru: 'экстрим', en: 'edge play', emoji: '⚠️' },
};

// Priority order for display (most interesting first)
const CATEGORY_PRIORITY = [
  'power-dom', 'power-sub', 'bondage-give', 'bondage-receive',
  'rough-give', 'rough-receive', 'roleplay', 'group',
  'toys', 'oral-give', 'oral-receive', 'anal-give', 'anal-receive',
  'dirty-talk-give', 'dirty-talk-receive', 'praise-give', 'praise-receive',
  'romantic', 'quickie', 'public', 'exhibitionism', 'recording',
  'lingerie', 'foot-give', 'foot-receive',
  'body-fluids-give', 'body-fluids-receive', 'sexting', 'extreme',
];

export interface SmartIntroData {
  hasIntro: boolean;
  headline: string;
  subtext: string;
  topInterests: Array<{
    id: string;
    label: string;
    level: 'yes' | 'very';
  }>;
  personalizedMessage: string;
}

/**
 * Fetch onboarding responses for a user
 */
async function fetchOnboardingResponses(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<string, number>> {
  // Get responses from scene_responses for scenes with sets_gate
  const { data, error } = await supabase
    .from('scene_responses')
    .select('scene_slug, answer, scenes!inner(sets_gate)')
    .eq('user_id', userId)
    .not('scenes.sets_gate', 'is', null);

  if (error || !data?.length) {
    console.warn('[SmartIntro] No onboarding responses found for user:', userId);
    return {};
  }

  // Build responses map: { gate_name: value }
  const responses: Record<string, number> = {};
  for (const r of data) {
    const gate = (r.scenes as { sets_gate: string })?.sets_gate;
    const value = (r.answer as { value?: number })?.value ?? 0;
    if (gate) {
      responses[gate] = value;
    }
  }

  return responses;
}

/**
 * Generate smart intro based on onboarding responses
 */
export async function generateSmartIntro(
  supabase: SupabaseClient,
  userId: string,
  locale: Locale = 'ru'
): Promise<SmartIntroData> {
  const responses = await fetchOnboardingResponses(supabase, userId);

  // No onboarding data - return generic intro
  if (Object.keys(responses).length === 0) {
    return {
      hasIntro: false,
      headline: locale === 'ru' ? 'Давай исследовать!' : "Let's explore!",
      subtext: locale === 'ru'
        ? 'Отвечай на вопросы, чтобы мы лучше узнали твои предпочтения'
        : 'Answer questions to help us learn your preferences',
      topInterests: [],
      personalizedMessage: '',
    };
  }

  // Collect interests by level
  const veryInterested: string[] = [];
  const interested: string[] = [];

  for (const [categoryId, level] of Object.entries(responses)) {
    if (level === RESPONSE.VERY) {
      veryInterested.push(categoryId);
    } else if (level === RESPONSE.YES) {
      interested.push(categoryId);
    }
  }

  // Combine and dedupe paired categories
  const dedupeAndSort = (categories: string[]): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];

    // Sort by priority
    const sorted = [...categories].sort((a, b) => {
      const priorityA = CATEGORY_PRIORITY.indexOf(a);
      const priorityB = CATEGORY_PRIORITY.indexOf(b);
      return (priorityA === -1 ? 999 : priorityA) - (priorityB === -1 ? 999 : priorityB);
    });

    for (const cat of sorted) {
      // Get base category (remove -give/-receive suffix for deduping)
      const base = cat.replace(/-(give|receive)$/, '');
      if (!seen.has(base)) {
        seen.add(base);
        result.push(cat);
      }
    }
    return result;
  };

  const uniqueVery = dedupeAndSort(veryInterested);
  const uniqueYes = dedupeAndSort(interested);

  // Take top 3-4 interests for display
  const topInterests: SmartIntroData['topInterests'] = [];

  // First add VERY interests (up to 2)
  for (const cat of uniqueVery.slice(0, 2)) {
    const label = CATEGORY_LABELS[cat];
    if (label) {
      topInterests.push({
        id: cat,
        label: label[locale] || label.en,
        level: 'very',
      });
    }
  }

  // Then add YES interests (up to 2 more)
  for (const cat of uniqueYes.slice(0, 4 - topInterests.length)) {
    const label = CATEGORY_LABELS[cat];
    if (label && !topInterests.some(i => i.label === label[locale])) {
      topInterests.push({
        id: cat,
        label: label[locale] || label.en,
        level: 'yes',
      });
    }
  }

  // Generate personalized message
  let personalizedMessage = '';

  if (topInterests.length > 0) {
    const interestLabels = topInterests.map(i => i.label);

    if (locale === 'ru') {
      if (topInterests.length === 1) {
        personalizedMessage = `Мы заметили интерес к ${interestLabels[0]}. Начнём с этого направления!`;
      } else {
        const last = interestLabels.pop();
        personalizedMessage = `Тебе интересны ${interestLabels.join(', ')} и ${last}. Давай исследуем эти темы глубже.`;
      }
    } else {
      if (topInterests.length === 1) {
        personalizedMessage = `We noticed your interest in ${interestLabels[0]}. Let's start exploring!`;
      } else {
        const last = interestLabels.pop();
        personalizedMessage = `You're interested in ${interestLabels.join(', ')} and ${last}. Let's dive deeper into these.`;
      }
    }
  }

  // Determine headline based on intensity
  let headline: string;
  let subtext: string;

  if (uniqueVery.length >= 2) {
    headline = locale === 'ru' ? 'Ты знаешь, чего хочешь!' : 'You know what you want!';
    subtext = locale === 'ru'
      ? 'Теперь давай узнаем детали'
      : "Now let's learn the details";
  } else if (uniqueVery.length + uniqueYes.length >= 4) {
    headline = locale === 'ru' ? 'Отлично, есть с чем работать!' : 'Great, lots to explore!';
    subtext = locale === 'ru'
      ? 'Давай узнаем больше о твоих предпочтениях'
      : "Let's learn more about your preferences";
  } else {
    headline = locale === 'ru' ? 'Давай исследовать вместе' : "Let's explore together";
    subtext = locale === 'ru'
      ? 'Отвечай интуитивно — нет правильных ответов'
      : 'Answer intuitively — there are no wrong answers';
  }

  return {
    hasIntro: topInterests.length > 0,
    headline,
    subtext,
    topInterests,
    personalizedMessage,
  };
}

/**
 * Check if user has seen the smart intro
 */
export async function hasSeenSmartIntro(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('user_flow_state')
    .select('tag_scores')
    .eq('user_id', userId)
    .single();

  return data?.tag_scores?.smart_intro_seen === true;
}

/**
 * Mark smart intro as seen
 */
export async function markSmartIntroSeen(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  // First get current tag_scores
  const { data: current } = await supabase
    .from('user_flow_state')
    .select('tag_scores')
    .eq('user_id', userId)
    .single();

  const currentScores = (current?.tag_scores || {}) as Record<string, unknown>;

  // Update with smart_intro_seen flag
  await supabase
    .from('user_flow_state')
    .upsert({
      user_id: userId,
      tag_scores: {
        ...currentScores,
        smart_intro_seen: true,
      },
    }, {
      onConflict: 'user_id',
    });
}
