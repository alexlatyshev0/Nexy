import type {
  SceneV3,
  FollowUp,
  Answer,
  GeneratedQuestion,
  Locale,
  AnswerType,
} from './types';

/**
 * Question type to answer type mapping
 */
const QUESTION_TYPE_MAP: Record<string, AnswerType> = {
  interest_scale: 'scale',
  boundary: 'trinary',
  experience: 'multiple_choice',
  preference: 'scale',
};

/**
 * Scale labels for different question types (localized)
 */
const SCALE_LABELS: Record<string, Record<Locale, { min: string; max: string }>> = {
  interest_scale: {
    ru: { min: 'Не привлекает', max: 'Очень хочу' },
    en: { min: 'Not interested', max: 'Very interested' },
  },
  preference: {
    ru: { min: 'Совсем не моё', max: 'Именно так!' },
    en: { min: 'Not for me', max: 'Exactly!' },
  },
  boundary: {
    ru: { min: 'Точно нет', max: 'Готов(а) попробовать' },
    en: { min: 'Definitely not', max: 'Ready to try' },
  },
};

/**
 * Check if a scene is V3 (has ai_context with question_angles)
 */
export function isV3Scene(scene: unknown): scene is SceneV3 {
  const s = scene as SceneV3;
  return !!(
    s.ai_context &&
    s.ai_context.question_angles &&
    Object.keys(s.ai_context.question_angles).length > 0
  );
}

/**
 * Select the best question angle based on context
 * Priority: emotional → role → frequency → intensity → first available
 */
export function selectQuestionAngle(
  scene: SceneV3,
  _locale: Locale = 'ru'
): string {
  const angles = scene.ai_context.question_angles;

  // Priority order for question selection
  const priorityOrder = ['emotional', 'role', 'frequency', 'intensity'];

  for (const key of priorityOrder) {
    if (angles[key]) {
      return angles[key];
    }
  }

  // Return first available angle
  const keys = Object.keys(angles);
  return keys.length > 0 ? angles[keys[0]] : 'Насколько тебе интересна эта сцена?';
}

/**
 * Build a GeneratedQuestion from V3 scene data
 */
export function buildQuestionFromV3(
  scene: SceneV3,
  locale: Locale = 'ru'
): GeneratedQuestion {
  const questionText = selectQuestionAngle(scene, locale);
  const questionType = scene.question_type || 'interest_scale';
  const answerType = QUESTION_TYPE_MAP[questionType] || 'scale';

  const scaleLabels = SCALE_LABELS[questionType]?.[locale] || SCALE_LABELS.interest_scale[locale];

  return {
    question: questionText,
    answerType,
    scaleLabels,
    targetDimensions: scene.dimensions || [],
  };
}

/**
 * Determine if follow-up should be triggered based on answer
 */
export function shouldTriggerFollowUp(
  answer: Answer,
  followUp: FollowUp | null | undefined
): boolean {
  if (!followUp) return false;

  const trigger = followUp.trigger;

  // Scale answer (0-100)
  if ('value' in answer && typeof answer.value === 'number') {
    const value = answer.value;
    if (trigger === 'if_positive' && value >= 60) return true;
    if (trigger === 'if_negative' && value <= 40) return true;
    if (trigger === 'if_curious' && value > 40 && value < 60) return true;
  }

  // Trinary answer (yes/maybe/no)
  if ('value' in answer && typeof answer.value === 'string') {
    const value = answer.value as 'yes' | 'maybe' | 'no';
    if (trigger === 'if_positive' && value === 'yes') return true;
    if (trigger === 'if_negative' && value === 'no') return true;
    if (trigger === 'if_curious' && value === 'maybe') return true;
  }

  // Boolean answer
  if ('value' in answer && typeof answer.value === 'boolean') {
    if (trigger === 'if_positive' && answer.value === true) return true;
    if (trigger === 'if_negative' && answer.value === false) return true;
  }

  return false;
}

/**
 * Get localized follow-up question data
 */
export function getFollowUpQuestion(
  followUp: FollowUp,
  locale: Locale = 'ru'
): {
  question: string;
  options: Array<{ id: string; label: string; signal: string }>;
} {
  return {
    question: followUp.question[locale] || followUp.question.ru || followUp.question.en,
    options: followUp.options.map((opt) => ({
      id: opt.id,
      label: opt.label[locale] || opt.label.ru || opt.label.en,
      signal: opt.signal,
    })),
  };
}

/**
 * Determine the response category based on answer value
 */
export function getResponseCategory(
  answer: Answer
): 'positive' | 'negative' | 'curious' {
  if ('value' in answer && typeof answer.value === 'number') {
    if (answer.value >= 60) return 'positive';
    if (answer.value <= 40) return 'negative';
    return 'curious';
  }

  if ('value' in answer && typeof answer.value === 'string') {
    const value = answer.value as string;
    if (value === 'yes') return 'positive';
    if (value === 'no') return 'negative';
    return 'curious';
  }

  if ('value' in answer && typeof answer.value === 'boolean') {
    return answer.value ? 'positive' : 'negative';
  }

  return 'curious';
}
