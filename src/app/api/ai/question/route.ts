import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isV2Scene, buildV2QuestionResponse } from '@/lib/question-v2';
import { getLocale } from '@/lib/locale';
import type { SceneV2, V2QuestionResponse, Locale } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sceneId, locale: requestedLocale } = await request.json();

    if (!sceneId) {
      return NextResponse.json(
        { error: 'Scene ID is required' },
        { status: 400 }
      );
    }

    // Get scene with all fields
    const { data: scene, error: sceneError } = await supabase
      .from('scenes')
      .select('*')
      .eq('id', sceneId)
      .single();

    if (sceneError || !scene) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    const locale: Locale = requestedLocale || getLocale();

    // Debug logging
    console.log('[API/question] Scene loaded:', {
      id: scene.id,
      slug: scene.slug,
      question_type: scene.question_type,
      question_config_type: (scene as any).question_config?.type,
      version: (scene as any).version,
      hasQuestion: !!(scene as any).question,
      questionValue: (scene as any).question,
      questionType: (scene as any).question?.type,
      elementsCount: Array.isArray((scene as any).elements) ? (scene as any).elements.length : 0,
    });

    // Check if this is a body_map scene
    if (scene.question_type === 'body_map' || (scene as any).question_config?.type === 'body_map') {
      console.log('[API/question] Detected body_map scene, building response');
      // Build body_map question response
      const aiContext = (scene as any).ai_context || {};
      const questionConfig = (scene as any).question_config || {};
      
      // Build passes from ai_context or question_config
      const passes = (aiContext.passes || questionConfig.passes || []).map((p: any) => {
        // Handle both formats: { id: 'give', question: {...} } and { subject: 'give', question: {...} }
        const subject = p.id === 'give' || p.id === 'receive' ? p.id : (p.subject || 'give');
        return {
          subject: subject as 'give' | 'receive',
          question: p.question || { ru: '', en: '' },
        };
      });

      // Get available zones safely
      const zones = (aiContext as any).zones;
      const availableZones = (zones && typeof zones === 'object' && 'available' in zones) 
        ? zones.available 
        : [];

      // Build general question about body interaction
      // Questions should be about which body zones user likes/dislikes interaction with
      // User clicks on zone → popup shows actions (kiss, lick, touch, etc.) with preferences
      
      // Main question text - use question from first pass which has context about who with whom
      const firstPass = passes[0];
      const mainQuestionText = firstPass?.question || {
        ru: 'Где тебе нравится взаимодействовать? Нажми на зону, чтобы выбрать действия.',
        en: 'Where do you like to interact? Tap a zone to select actions.',
      };

      const response = {
        question: {
          question: mainQuestionText[locale] || mainQuestionText.en,
          answerType: 'body_map' as const,
          targetDimensions: [],
        },
        scene: scene,
        isV2: true,
        bodyMapConfig: {
          action: (aiContext.action || questionConfig.action || 'kiss') as any,
          passes: passes.map((p: any) => ({
            ...p,
            // Questions must clearly indicate who with whom
            question: {
              ru: p.subject === 'give' 
                ? 'Где ты любишь или не любишь касаться партнёра?'
                : 'Где тебе нравится или не нравится, когда партнёр(ша) тебя касается?',
              en: p.subject === 'give'
                ? 'Where do you like or dislike touching your partner?'
                : 'Where do you like or dislike your partner touching you?',
            },
          })),
          availableZones: availableZones,
        },
        // Store main question as LocalizedString for BodyMapAnswer component
        // Use first pass question which has the correct context
        mainQuestion: firstPass?.question || mainQuestionText,
      };

      return NextResponse.json(response);
    }

    // Check if this is a V2 composite scene
    if (isV2Scene(scene)) {
      const sceneV2 = scene as SceneV2;

      // Debug logging - detailed inspection
      console.log('[API/question] V2 scene detected:', {
        id: sceneV2.id,
        slug: sceneV2.slug,
        hasQuestion: !!sceneV2.question,
        questionType: sceneV2.question?.type,
        questionValue: sceneV2.question,
        questionTypeOf: typeof sceneV2.question,
        questionKeys: sceneV2.question && typeof sceneV2.question === 'object' ? Object.keys(sceneV2.question) : 'N/A',
        questionText: sceneV2.question?.text,
        elementsCount: sceneV2.elements?.length || 0,
        elements: sceneV2.elements?.map(e => ({ id: e.id, label: e.label })) || [],
      });

      // Build question from V2 scene structure
      const response: V2QuestionResponse = await buildV2QuestionResponse(
        sceneV2,
        locale,
        supabase,
        user.id
      );

      console.log('[API/question] Built question:', {
        answerType: response.question.answerType,
        hasOptions: !!response.question.options,
        optionsCount: response.question.options?.length || 0,
        allowMultiple: response.question.allowMultiple,
        questionText: response.question.question,
        scaleLabels: response.question.scaleLabels,
      });

      return NextResponse.json(response);
    }

    // If not V2 and not body_map, return error
    console.error('[API/question] Scene is neither V2 composite nor body_map:', {
      id: scene.id,
      slug: scene.slug,
      question_type: scene.question_type,
      version: (scene as any).version,
      hasElements: Array.isArray((scene as any).elements),
    });
    return NextResponse.json(
      { error: 'Only V2 composite scenes and body_map scenes are supported' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    );
  }
}
