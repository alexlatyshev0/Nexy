'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  IntroSlideV3,
  SwipeCardsGroupV3,
  SceneRendererV3,
  type SwipeCardResponse,
  type SceneV3Response,
} from '@/components/discovery/v3-index';
import {
  buildDiscoveryContextV3,
  getNextDiscoveryScenesV3,
  markClarificationShown,
  type DiscoveryContextV3,
  type NextScenesResult,
} from '@/lib/scene-sequencing-v3';
import { updateTagPreferences } from '@/lib/tag-preferences';
import type { SceneV2Extended, Locale, IntroSlide } from '@/lib/types';

type DiscoveryPhaseV3 = 'loading' | 'intro' | 'swipe_group' | 'single_scene' | 'completed';

export default function DiscoverV3Page() {
  const [phase, setPhase] = useState<DiscoveryPhaseV3>('loading');
  const [context, setContext] = useState<DiscoveryContextV3 | null>(null);
  const [currentResult, setCurrentResult] = useState<NextScenesResult | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const locale: Locale = 'ru';

  const supabase = createClient();
  const router = useRouter();

  // Initialize context and load first scenes
  const initialize = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Build discovery context
      const ctx = await buildDiscoveryContextV3(supabase, user.id, locale);
      if (!ctx) {
        console.error('[DiscoverV3] Failed to build context');
        setPhase('completed');
        setLoading(false);
        return;
      }

      setContext(ctx);

      // Get next scenes
      const result = await getNextDiscoveryScenesV3(supabase, ctx);

      if (result.scenes.length === 0) {
        setPhase('completed');
        setLoading(false);
        return;
      }

      setCurrentResult(result);
      setCurrentSceneIndex(0);

      // Determine phase based on result
      if (result.introSlide) {
        setPhase('intro');
      } else if (result.scenes.length > 1) {
        setPhase('swipe_group');
      } else {
        setPhase('single_scene');
      }
    } catch (error) {
      console.error('[DiscoverV3] Error initializing:', error);
      setPhase('completed');
    } finally {
      setLoading(false);
    }
  }, [supabase, router, locale]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle intro slide continue
  const handleIntroContinue = useCallback(() => {
    if (!currentResult) return;

    if (currentResult.scenes.length > 1) {
      setPhase('swipe_group');
    } else if (currentResult.scenes.length === 1) {
      setPhase('single_scene');
    } else {
      // Load next batch
      loadNextBatch();
    }
  }, [currentResult]);

  // Handle swipe group completion
  const handleSwipeGroupComplete = useCallback(async (responses: SwipeCardResponse[]) => {
    if (!context || !currentResult) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save each response
      for (const response of responses) {
        // Mark as shown for deduplication
        await markClarificationShown(
          supabase,
          user.id,
          response.sceneSlug,
          currentResult.triggeredByMain || ''
        );

        // Save response to scene_responses
        const scene = currentResult.scenes.find(s => s.slug === response.sceneSlug);
        if (scene) {
          await supabase
            .from('scene_responses')
            .upsert({
              user_id: user.id,
              scene_id: scene.id,
              scene_slug: scene.slug,
              question_type: 'swipe',
              answer: { value: response.value },
              skipped: response.value === 0, // NO = skipped
            }, {
              onConflict: 'user_id,scene_id'
            });

          // Update tag_preferences for positive responses (YES=1, VERY=2, IF_PARTNER=3)
          if (response.value > 0 && scene.elements && scene.elements.length > 0) {
            const elementIds = scene.elements.map(e => e.id);
            await updateTagPreferences(supabase, user.id, scene, elementIds, {});
          }
        }
      }

      // Update context with shown clarifications
      const newShown = new Set(context.shownClarifications);
      for (const response of responses) {
        newShown.add(response.sceneSlug);
      }
      setContext({ ...context, shownClarifications: newShown });

      // Load next batch
      await loadNextBatch();
    } catch (error) {
      console.error('[DiscoverV3] Error saving responses:', error);
    } finally {
      setSaving(false);
    }
  }, [context, currentResult, supabase]);

  // Handle single scene response
  const handleSingleSceneSubmit = useCallback(async (response: SceneV3Response) => {
    if (!context || !currentResult) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const scene = currentResult.scenes[currentSceneIndex];
      if (!scene) return;

      // Mark as shown
      await markClarificationShown(
        supabase,
        user.id,
        scene.slug,
        currentResult.triggeredByMain || ''
      );

      // Save response
      await supabase
        .from('scene_responses')
        .upsert({
          user_id: user.id,
          scene_id: scene.id,
          scene_slug: scene.slug,
          question_type: response.type,
          answer: response,
          skipped: false,
        }, {
          onConflict: 'user_id,scene_id'
        });

      // Update context
      const newShown = new Set(context.shownClarifications);
      newShown.add(scene.slug);
      setContext({ ...context, shownClarifications: newShown });

      // Move to next scene or load next batch
      if (currentSceneIndex < currentResult.scenes.length - 1) {
        setCurrentSceneIndex(prev => prev + 1);
      } else {
        await loadNextBatch();
      }
    } catch (error) {
      console.error('[DiscoverV3] Error saving response:', error);
    } finally {
      setSaving(false);
    }
  }, [context, currentResult, currentSceneIndex, supabase]);

  // Load next batch of scenes
  const loadNextBatch = useCallback(async () => {
    if (!context) return;

    setLoading(true);
    try {
      const result = await getNextDiscoveryScenesV3(supabase, context);

      if (result.scenes.length === 0) {
        setPhase('completed');
        return;
      }

      setCurrentResult(result);
      setCurrentSceneIndex(0);

      if (result.introSlide) {
        setPhase('intro');
      } else if (result.scenes.length > 1) {
        setPhase('swipe_group');
      } else {
        setPhase('single_scene');
      }
    } catch (error) {
      console.error('[DiscoverV3] Error loading next batch:', error);
      setPhase('completed');
    } finally {
      setLoading(false);
    }
  }, [context, supabase]);

  // Render loading state
  if (loading || phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  // Render completed state
  if (phase === 'completed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black p-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          {locale === 'ru' ? 'Отлично!' : 'Great!'}
        </h1>
        <p className="text-gray-400 mb-8">
          {locale === 'ru'
            ? 'На сегодня всё. Возвращайся позже за новыми сценами.'
            : 'That\'s all for now. Come back later for more scenes.'}
        </p>
        <Button
          onClick={() => router.push('/discover')}
          className="bg-gradient-to-r from-pink-500 to-purple-500"
        >
          {locale === 'ru' ? 'Вернуться' : 'Go back'}
        </Button>
      </div>
    );
  }

  // Render intro slide
  if (phase === 'intro' && currentResult?.introSlide) {
    return (
      <IntroSlideV3
        introSlide={currentResult.introSlide}
        locale={locale}
        onContinue={handleIntroContinue}
      />
    );
  }

  // Render swipe cards group
  if (phase === 'swipe_group' && currentResult?.scenes) {
    return (
      <SwipeCardsGroupV3
        scenes={currentResult.scenes}
        locale={locale}
        onComplete={handleSwipeGroupComplete}
        loading={saving}
      />
    );
  }

  // Render single scene
  if (phase === 'single_scene' && currentResult?.scenes[currentSceneIndex]) {
    const scene = currentResult.scenes[currentSceneIndex];
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <SceneRendererV3
          scene={scene}
          locale={locale}
          userGender={context?.userGender || 'male'}
          partnerGender={context?.userInterestedIn === 'male' ? 'male' : 'female'}
          onSubmit={handleSingleSceneSubmit}
          loading={saving}
        />
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <p className="text-gray-400">Something went wrong</p>
    </div>
  );
}
