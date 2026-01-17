import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateQuestion } from '@/lib/ai';
import { isV3Scene, buildQuestionFromV3 } from '@/lib/question-v3';
import { isV4Scene, buildV4QuestionResponse } from '@/lib/question-v4';
import { getLocale } from '@/lib/locale';
import type { Scene, SceneV3, SceneV4, UserContext, V3QuestionResponse, V4QuestionResponse, Locale } from '@/lib/types';

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

    // Check if this is a V4 scene with question_config
    if (isV4Scene(scene)) {
      const sceneV4 = scene as SceneV4;

      // Build question from question_config (with topic response checking)
      const response: V4QuestionResponse = await buildV4QuestionResponse(
        sceneV4,
        locale,
        supabase,
        user.id
      );

      return NextResponse.json(response);
    }

    // Check if this is a V3 scene with predefined question angles
    if (isV3Scene(scene)) {
      const sceneV3 = scene as SceneV3;

      // Build question from predefined angles (no AI needed)
      const question = buildQuestionFromV3(sceneV3, locale);

      const response: V3QuestionResponse = {
        question,
        tabooContext: sceneV3.ai_context.taboo_context || null,
        followUp: sceneV3.follow_up || null,
        isV3: true,
      };

      return NextResponse.json(response);
    }

    // Legacy scene: use AI generation
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('gender, interested_in')
      .eq('id', user.id)
      .single();

    // Get user preferences
    const { data: prefProfile } = await supabase
      .from('preference_profiles')
      .select('preferences')
      .eq('user_id', user.id)
      .single();

    // Get recent responses
    const { data: recentResponses } = await supabase
      .from('scene_responses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    const userContext: UserContext = {
      gender: profile?.gender || 'undisclosed',
      interestedIn: profile?.interested_in || 'both',
      knownPreferences: prefProfile?.preferences || {},
      recentResponses: recentResponses || [],
    };

    // Generate question via AI for legacy scenes
    const question = await generateQuestion(scene as Scene, userContext);

    const response: V3QuestionResponse = {
      question,
      tabooContext: null,
      followUp: null,
      isV3: false,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Question generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    );
  }
}
