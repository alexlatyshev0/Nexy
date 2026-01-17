'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { getMatchResults } from '@/lib/matching';
import { QuickSceneCard } from '@/components/date/QuickSceneCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import type { Scene } from '@/lib/types';

export default function DateSessionPage({ params }: { params: Promise<{ dateId: string }> }) {
  const { dateId } = use(params);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const currentScene = scenes[currentIndex];
  const progress = scenes.length > 0 ? `${currentIndex + 1}/${scenes.length}` : '';

  const fetchScenes = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get date details
      const { data: dateData } = await supabase
        .from('dates')
        .select('partnership_id, mood')
        .eq('id', dateId)
        .single();

      if (!dateData) return;

      // Get partnership to find partner
      const { data: partnership } = await supabase
        .from('partnerships')
        .select('user_id, partner_id')
        .eq('id', dateData.partnership_id)
        .single();

      if (!partnership) return;

      const partnerId = partnership.user_id === user.id
        ? partnership.partner_id
        : partnership.user_id;

      // Get both users' preferences
      const [myPrefs, partnerPrefs] = await Promise.all([
        supabase.from('preference_profiles').select('preferences').eq('user_id', user.id).single(),
        supabase.from('preference_profiles').select('preferences').eq('user_id', partnerId).single(),
      ]);

      // Get matches
      const { matches } = getMatchResults(
        (myPrefs.data?.preferences || {}) as Record<string, unknown>,
        (partnerPrefs.data?.preferences || {}) as Record<string, unknown>
      );

      const matchDimensions = matches.map(m => m.dimension);

      // Get already answered scenes for this date
      const { data: answered } = await supabase
        .from('date_responses')
        .select('scene_id')
        .eq('date_id', dateId)
        .eq('user_id', user.id);

      const answeredIds = answered?.map(a => a.scene_id) || [];

      // Fetch scenes from matched dimensions
      let query = supabase
        .from('scenes')
        .select('*')
        .limit(5);

      if (matchDimensions.length > 0) {
        query = query.overlaps('dimensions', matchDimensions);
      }

      if (answeredIds.length > 0) {
        query = query.not('id', 'in', `(${answeredIds.join(',')})`);
      }

      const { data: scenesData } = await query;

      if (scenesData && scenesData.length > 0) {
        setScenes(scenesData as Scene[]);
      } else {
        setCompleted(true);
      }
    } catch (error) {
      console.error('Error fetching scenes:', error);
    } finally {
      setLoading(false);
    }
  }, [dateId, supabase]);

  useEffect(() => {
    fetchScenes();
  }, [fetchScenes]);

  const handleAnswer = async (answer: 'yes' | 'maybe' | 'no') => {
    if (!currentScene) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('date_responses').insert({
        date_id: dateId,
        user_id: user.id,
        scene_id: currentScene.id,
        answer,
      });

      if (currentIndex < scenes.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Update date status
        await supabase
          .from('dates')
          .update({ status: 'ready' })
          .eq('id', dateId);

        setCompleted(true);
      }
    } catch (error) {
      console.error('Error saving answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (completed) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Готово!</h2>
            <p className="text-muted-foreground mb-6">
              Ваши ответы сохранены. Когда партнёр тоже ответит, вы увидите результаты.
            </p>
            <Button onClick={() => router.push(`/date/${dateId}/results`)}>
              Посмотреть результаты
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Progress */}
      <div className="text-center text-sm text-muted-foreground">
        {progress}
      </div>

      {/* Scene card */}
      <AnimatePresence mode="wait">
        {currentScene && (
          <QuickSceneCard
            key={currentScene.id}
            scene={currentScene}
            onAnswer={handleAnswer}
            loading={submitting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
