import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getNextDiscoveryScene,
  getScoredScenes,
  getTopicIntro,
} from '@/lib/topic-flow';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get locale from query params or default to 'ru'
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get('locale') as 'ru' | 'en') || 'ru';

    // Get next discovery scene (v3: sorted by gate_keys match score)
    const nextScene = await getNextDiscoveryScene(supabase, user.id);

    if (!nextScene) {
      return NextResponse.json({
        completed: true,
        message: 'All scenes completed',
      });
    }

    const { topic, scene, score, matchingGateKeys, isNewTopic, sceneIndex, totalScenes } = nextScene;

    // Get topic intro if this is a new topic
    let topicIntro = null;
    if (isNewTopic) {
      topicIntro = getTopicIntro(topic, locale);
    }

    return NextResponse.json({
      completed: false,
      scene: {
        id: scene.id,
        gate_keys: scene.gate_keys,
        score,
        matchingGateKeys,
      },
      topic: {
        id: topic.id,
        title: topic.title[locale],
        intensity: topic.intensity,
      },
      isNewTopic,
      sceneIndex,
      totalScenes,
      topicIntro,
    });
  } catch (error) {
    console.error('[Discovery API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get next scene' },
      { status: 500 }
    );
  }
}

// Get discovery progress (v3: scene-level with scores)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { locale = 'ru' } = await request.json();

    // Get all scored scenes
    const scoredScenes = await getScoredScenes(supabase, user.id);

    // Get scene responses to calculate progress
    const { data: responses } = await supabase
      .from('scene_responses')
      .select('scene_slug')
      .eq('user_id', user.id);

    const seenSceneIds = new Set(
      responses?.map((r) => r.scene_slug).filter(Boolean) || []
    );

    // Group scenes by topic for progress display
    const topicMap = new Map<string, {
      id: string;
      title: string;
      intensity: number;
      totalScenes: number;
      completedScenes: number;
      maxScore: number;
    }>();

    for (const { scene, topic, score } of scoredScenes) {
      const existing = topicMap.get(topic.id);
      const isCompleted = seenSceneIds.has(scene.id);

      if (existing) {
        existing.totalScenes++;
        if (isCompleted) existing.completedScenes++;
        if (score > existing.maxScore) existing.maxScore = score;
      } else {
        topicMap.set(topic.id, {
          id: topic.id,
          title: topic.title[locale as 'ru' | 'en'],
          intensity: topic.intensity,
          totalScenes: 1,
          completedScenes: isCompleted ? 1 : 0,
          maxScore: score,
        });
      }
    }

    // Convert to array and add isCompleted flag
    const topicsWithProgress = Array.from(topicMap.values()).map((t) => ({
      ...t,
      isCompleted: t.completedScenes >= t.totalScenes,
    }));

    // Sort by maxScore DESC
    topicsWithProgress.sort((a, b) => b.maxScore - a.maxScore);

    return NextResponse.json({
      topics: topicsWithProgress,
      totalScenes: scoredScenes.length,
      totalAnswered: seenSceneIds.size,
    });
  } catch (error) {
    console.error('[Discovery API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}
