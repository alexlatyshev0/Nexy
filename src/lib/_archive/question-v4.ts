import type {
  SceneV4,
  QuestionConfig,
  GeneratedQuestion,
  Locale,
  AnswerType,
  TopicResponse,
  TabooContext,
  FollowUp,
  V4QuestionResponse,
  ContextOption,
} from './types';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Question config type to answer type mapping
 */
const CONFIG_TYPE_TO_ANSWER_TYPE: Record<string, AnswerType> = {
  scale: 'scale',
  yes_maybe_no: 'trinary',
  topic_drilldown: 'scale', // Default, may change based on topic
  what_appeals: 'multiple_choice',
  body_map: 'body_map',
};

/**
 * Scale labels for different question types (localized)
 */
const SCALE_LABELS: Record<string, Record<Locale, { min: string; max: string }>> = {
  scale: {
    ru: { min: 'Не привлекает', max: 'Очень хочу' },
    en: { min: 'Not interested', max: 'Very interested' },
  },
  topic_drilldown: {
    ru: { min: 'Совсем нет', max: 'Очень да' },
    en: { min: 'Not at all', max: 'Very much' },
  },
};

/**
 * Check if a scene is V4 (has question_config)
 */
export function isV4Scene(scene: unknown): scene is SceneV4 {
  const s = scene as SceneV4;
  if (!s.question_config || typeof s.question_config !== 'object') {
    return false;
  }

  // Check for valid type
  if (!('type' in s.question_config)) {
    return false;
  }

  // body_map type doesn't have 'question' field - has 'passes' instead
  if (s.question_config.type === 'body_map') {
    return 'passes' in s.question_config;
  }

  // All other types have 'question' field
  return 'question' in s.question_config;
}

/**
 * Get the answer type for a question config
 */
export function getAnswerTypeFromConfig(config: QuestionConfig): AnswerType {
  return CONFIG_TYPE_TO_ANSWER_TYPE[config.type] || 'scale';
}

/**
 * Get localized question text from config
 */
export function getQuestionText(config: QuestionConfig, locale: Locale = 'ru'): string {
  // body_map doesn't have a single question - it has passes
  if (config.type === 'body_map') {
    // Return first pass question as placeholder
    const firstPass = config.passes[0];
    return firstPass.question[locale] || firstPass.question.ru || firstPass.question.en;
  }

  return config.question[locale] || config.question.ru || config.question.en;
}

/**
 * Build a GeneratedQuestion from V4 scene question_config
 */
export function buildQuestionFromV4(
  scene: SceneV4,
  locale: Locale = 'ru'
): GeneratedQuestion {
  const config = scene.question_config;
  const questionText = getQuestionText(config, locale);
  const answerType = getAnswerTypeFromConfig(config);

  const result: GeneratedQuestion = {
    question: questionText,
    answerType,
    targetDimensions: scene.dimensions || [],
  };

  // Add scale labels for scale-type questions
  if (config.type === 'scale' || config.type === 'topic_drilldown') {
    result.scaleLabels = SCALE_LABELS[config.type]?.[locale] || SCALE_LABELS.scale[locale];
  }

  // Add options for what_appeals type
  if (config.type === 'what_appeals' && 'context_options' in config) {
    result.options = config.context_options.map((opt: ContextOption) => ({
      id: opt.id,
      text: opt.label[locale] || opt.label.ru || opt.label.en,
      dimension: opt.id,
    }));
    result.allowMultiple = true;
  }

  return result;
}

/**
 * Check if a topic has already been answered by the user
 */
export async function checkTopicAnswered(
  supabase: SupabaseClient,
  userId: string,
  topicRef: string
): Promise<TopicResponse | null> {
  const { data, error } = await supabase
    .from('topic_responses')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_ref', topicRef)
    .single();

  if (error || !data) {
    return null;
  }

  return data as TopicResponse;
}

/**
 * Save a topic response
 */
export async function saveTopicResponse(
  supabase: SupabaseClient,
  userId: string,
  topicRef: string,
  interestLevel: number,
  sceneId: string,
  drilldownResponses?: Record<string, unknown>,
  experience?: { tried?: boolean; frequency?: string; want_to_try?: boolean }
): Promise<void> {
  await supabase
    .from('topic_responses')
    .upsert({
      user_id: userId,
      topic_ref: topicRef,
      interest_level: interestLevel,
      drilldown_responses: drilldownResponses || {},
      experience: experience || null,
      first_scene_id: sceneId,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,topic_ref',
    });
}

/**
 * Save an experience response
 */
export async function saveExperienceResponse(
  supabase: SupabaseClient,
  userId: string,
  sceneId: string,
  hasTried: boolean,
  experienceRating?: 'loved' | 'liked' | 'neutral' | 'disliked' | null,
  wantToTry?: boolean | null
): Promise<void> {
  await supabase
    .from('experience_responses')
    .upsert({
      user_id: userId,
      scene_id: sceneId,
      has_tried: hasTried,
      experience_rating: experienceRating || null,
      want_to_try: wantToTry ?? null,
    }, {
      onConflict: 'user_id,scene_id',
    });
}

/**
 * Get scenes that should be skipped because their topic is already answered
 */
export async function getAnsweredTopicSceneIds(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .rpc('get_answered_topic_scene_ids', { p_user_id: userId });

  if (error || !data) {
    return [];
  }

  return data as string[];
}

/**
 * Build full V4 question response with all metadata
 */
export async function buildV4QuestionResponse(
  scene: SceneV4,
  locale: Locale = 'ru',
  supabase?: SupabaseClient,
  userId?: string
): Promise<V4QuestionResponse> {
  const config = scene.question_config;
  const question = buildQuestionFromV4(scene, locale);

  // Check if topic already answered (for topic_drilldown type)
  let topicAlreadyAnswered = false;
  let existingTopicResponse: TopicResponse | null = null;

  if (
    config.type === 'topic_drilldown' &&
    config.topic_ref &&
    supabase &&
    userId
  ) {
    existingTopicResponse = await checkTopicAnswered(supabase, userId, config.topic_ref);
    topicAlreadyAnswered = existingTopicResponse !== null;
  }

  // Extract taboo context from ai_context
  const tabooContext: TabooContext | null = scene.ai_context?.taboo_context || null;

  // Get follow-up if exists
  const followUp: FollowUp | null = scene.follow_up || null;

  return {
    question,
    questionConfig: config,
    tabooContext,
    followUp,
    topicAlreadyAnswered,
    existingTopicResponse,
    isV4: true,
  };
}

/**
 * Determine the response category based on answer value (for V4)
 */
export function getResponseCategoryV4(
  answer: { value: number } | { value: string } | { selected: string[] }
): 'positive' | 'negative' | 'curious' {
  // Scale answer (0-100)
  if ('value' in answer && typeof answer.value === 'number') {
    if (answer.value >= 60) return 'positive';
    if (answer.value <= 40) return 'negative';
    return 'curious';
  }

  // Trinary answer (yes/maybe/no)
  if ('value' in answer && typeof answer.value === 'string') {
    const value = answer.value as string;
    if (value === 'yes') return 'positive';
    if (value === 'no') return 'negative';
    return 'curious';
  }

  // Multiple choice - positive if any selected
  if ('selected' in answer) {
    return answer.selected.length > 0 ? 'positive' : 'negative';
  }

  return 'curious';
}

/**
 * Convert trinary answer to numeric value for storage
 */
export function trinaryToNumeric(value: 'yes' | 'maybe' | 'no'): number {
  switch (value) {
    case 'yes': return 100;
    case 'maybe': return 50;
    case 'no': return 0;
  }
}

/**
 * Check if experience question should be shown
 */
export function shouldShowExperience(config: QuestionConfig): boolean {
  return config.show_experience === true;
}

/**
 * Get the topic ref from a question config if it exists
 */
export function getTopicRef(config: QuestionConfig): string | null {
  return config.topic_ref || null;
}
