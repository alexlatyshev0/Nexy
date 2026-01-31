import type {
  SceneV2,
  V2Question,
  V2Element,
  GeneratedQuestion,
  Locale,
  AnswerType,
} from './types';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Check if a scene is V2 (has version === 2 and elements)
 */
export function isV2Scene(scene: unknown): scene is SceneV2 {
  const s = scene as SceneV2;
  return s.version === 2 && Array.isArray(s.elements);
}

/**
 * Get the answer type for a V2 question
 */
export function getAnswerTypeFromV2Question(question: V2Question): AnswerType {
  switch (question.type) {
    case 'scale':
      return 'scale';
    case 'multi_select':
    case 'single_select':
      return 'multiple_choice';
    case 'yes_no':
      return 'trinary';
    default:
      return 'scale';
  }
}

/**
 * Build a GeneratedQuestion from V2 scene question
 */
export function buildQuestionFromV2(
  scene: SceneV2,
  locale: Locale = 'ru'
): GeneratedQuestion {
  console.log('[buildQuestionFromV2] Building question for scene:', {
    id: scene.id,
    slug: scene.slug,
    hasQuestion: !!scene.question,
    questionType: scene.question?.type,
    questionValue: scene.question,
    elementsCount: scene.elements?.length || 0,
  });

  // V2 composite scenes have a question field
  // Handle both object and parsed JSONB formats
  let question: V2Question | null = null;
  
  if (scene.question) {
    if (typeof scene.question === 'object' && 'type' in scene.question) {
      question = scene.question as V2Question;
    } else if (typeof scene.question === 'string') {
      // If it's a string, try to parse it
      try {
        question = JSON.parse(scene.question) as V2Question;
      } catch (e) {
        console.warn('[buildQuestionFromV2] Failed to parse question as JSON:', e);
      }
    }
  }

  if (question && question.type) {
    const questionType = question.type;
    
    console.log('[buildQuestionFromV2] Question field found:', {
      type: questionType,
      hasText: !!question.text,
      text: question.text,
    });

    // For multi_select, we need to create options from elements
    if (questionType === 'multi_select' && scene.elements && scene.elements.length > 0) {
      const options = scene.elements.map((element) => ({
        id: element.id,
        text: element.label[locale] || element.label.en || element.label.ru || element.id,
        dimension: element.tag_ref,
      }));

      const questionText = question.text?.[locale] || question.text?.en || question.text?.ru || 
        (locale === 'ru' ? 'Что тебе нравится на этой сцене?' : 'What appeals to you on this scene?');

      console.log('[buildQuestionFromV2] Returning multi_select question with', options.length, 'options');
      return {
        question: questionText,
        answerType: 'multiple_choice',
        options,
        allowMultiple: true,
        targetDimensions: scene.elements.map((e) => e.tag_ref),
      };
    }

    // For scale questions
    if (questionType === 'scale') {
      const questionText = question.text?.[locale] || question.text?.en || question.text?.ru || 
        (locale === 'ru' ? 'Насколько тебе интересна эта сцена?' : 'How much does this appeal to you?');
      
      console.log('[buildQuestionFromV2] Returning scale question');
      return {
        question: questionText,
        answerType: 'scale',
        scaleLabels: {
          min: (question as any).min_label?.[locale] || (question as any).min_label?.en || (locale === 'ru' ? 'Не привлекает' : 'Not interested'),
          max: (question as any).max_label?.[locale] || (question as any).max_label?.en || (locale === 'ru' ? 'Очень хочу' : 'Very interested'),
        },
        targetDimensions: scene.elements?.map((e) => e.tag_ref) || [],
      };
    }

    // For single_select
    if (questionType === 'single_select' && scene.elements && scene.elements.length > 0) {
      const options = scene.elements.map((element) => ({
        id: element.id,
        text: element.label[locale] || element.label.en || element.label.ru || element.id,
        dimension: element.tag_ref,
      }));

      const questionText = question.text?.[locale] || question.text?.en || question.text?.ru || 
        (locale === 'ru' ? 'Что тебе нравится на этой сцене?' : 'What appeals to you on this scene?');

      console.log('[buildQuestionFromV2] Returning single_select question with', options.length, 'options');
      return {
        question: questionText,
        answerType: 'multiple_choice',
        options,
        allowMultiple: false,
        targetDimensions: scene.elements.map((e) => e.tag_ref),
      };
    }

    // For yes_no
    if (questionType === 'yes_no') {
      const questionText = question.text?.[locale] || question.text?.en || question.text?.ru || 
        (locale === 'ru' ? 'Тебе это интересно?' : 'Is this interesting to you?');
      
      console.log('[buildQuestionFromV2] Returning yes_no (trinary) question');
      return {
        question: questionText,
        answerType: 'trinary',
        targetDimensions: scene.elements?.map((e) => e.tag_ref) || [],
      };
    }

    console.warn('[buildQuestionFromV2] Unknown question type:', questionType, 'falling back to elements');
  }

  // Fallback: create question from elements (most common case for V2)
  // This should be the DEFAULT for V2 composite scenes, not scale!
  if (scene.elements && scene.elements.length > 0) {
    const options = scene.elements.map((element) => ({
      id: element.id,
      text: element.label[locale] || element.label.en || element.label.ru || element.id,
      dimension: element.tag_ref,
    }));

    // Try to get question text from scene.question.text first, then fall back to title
    const sceneQuestion = scene.question as { text?: { ru?: string; en?: string } } | undefined;
    const questionText = sceneQuestion?.text?.[locale] || sceneQuestion?.text?.en || sceneQuestion?.text?.ru ||
      scene.title?.[locale] || scene.title?.en || scene.title?.ru ||
      (locale === 'ru' ? 'Что тебе нравится на этой сцене?' : 'What appeals to you on this scene?');

    console.log('[buildQuestionFromV2] Using fallback: multi_select from elements with', options.length, 'options');
    console.log('[buildQuestionFromV2] Fallback question text:', questionText);
    console.log('[buildQuestionFromV2] Fallback options:', options.map(o => ({ id: o.id, text: o.text })));
    
    return {
      question: questionText,
      answerType: 'multiple_choice',
      options,
      allowMultiple: true,
      targetDimensions: scene.elements.map((e) => e.tag_ref),
    };
  }

  // Ultimate fallback (should not happen for V2 scenes with elements)
  console.warn('[buildQuestionFromV2] Ultimate fallback: scale question (scene has no elements or question)');
  return {
    question: locale === 'ru' ? 'Насколько тебе интересна эта сцена?' : 'How much does this appeal to you?',
    answerType: 'scale',
    scaleLabels: {
      min: locale === 'ru' ? 'Не привлекает' : 'Not interested',
      max: locale === 'ru' ? 'Очень хочу' : 'Very interested',
    },
    targetDimensions: [],
  };
}

/**
 * V2 Question Response
 */
export interface V2QuestionResponse {
  question: GeneratedQuestion;
  scene: SceneV2;
  isV2: boolean;
  selectedElements?: string[]; // For element selection
}

/**
 * Build full V2 question response
 */
export async function buildV2QuestionResponse(
  scene: SceneV2,
  locale: Locale = 'ru',
  supabase?: SupabaseClient,
  userId?: string
): Promise<V2QuestionResponse> {
  const question = buildQuestionFromV2(scene, locale);

  return {
    question,
    scene,
    isV2: true,
  };
}

/**
 * Get follow-up questions for selected elements
 */
export function getElementFollowUps(
  scene: SceneV2,
  selectedElementIds: string[]
): Array<{ element: V2Element; followUps: V2Element['follow_ups'] }> {
  const result: Array<{ element: V2Element; followUps: V2Element['follow_ups'] }> = [];

  for (const elementId of selectedElementIds) {
    const element = scene.elements.find((e) => e.id === elementId);
    if (element && element.follow_ups && element.follow_ups.length > 0) {
      result.push({
        element,
        followUps: element.follow_ups,
      });
    }
  }

  return result;
}
