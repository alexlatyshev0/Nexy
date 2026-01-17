'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { SceneCard } from '@/components/discovery/SceneCard';
import { QuestionDisplay } from '@/components/discovery/QuestionDisplay';
import { ScaleAnswer } from '@/components/discovery/ScaleAnswer';
import { MultipleChoiceAnswer } from '@/components/discovery/MultipleChoiceAnswer';
import { TrinaryAnswer } from '@/components/discovery/TrinaryAnswer';
import { BodyMapAnswer } from '@/components/discovery/BodyMapAnswer';
import { ExclusionDialog } from '@/components/discovery/ExclusionDialog';
import { FollowUpQuestion } from '@/components/discovery/FollowUpQuestion';
import { TopicDrilldown } from '@/components/discovery/TopicDrilldown';
import { NormalizationMessage } from '@/components/discovery/NormalizationMessage';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, ThumbsDown } from 'lucide-react';
import { getFilteredScenesClient, getSceneCategories } from '@/lib/scenes.client';
import { shouldTriggerFollowUp } from '@/lib/question-v3';
import {
  saveTopicResponse,
  saveExperienceResponse,
  trinaryToNumeric,
  getTopicRef,
  shouldShowExperience,
} from '@/lib/question-v4';
import {
  calculateSignalUpdates,
  calculateTestScoreUpdates,
  updatePsychologicalProfile,
  isBodyMapAnswer,
  calculateBodyMapSignals,
  calculateBodyMapTestScores,
} from '@/lib/profile-signals';
import { getLocale } from '@/lib/locale';
import type {
  Scene,
  SceneV3,
  SceneV4,
  GeneratedQuestion,
  Answer,
  FollowUp,
  TabooContext,
  QuestionConfig,
  BodyMapQuestionConfig,
  V3QuestionResponse,
  V4QuestionResponse,
  TopicResponse,
  Locale,
  Profile,
  BodyGender,
  BodyMapSceneConfig,
  BodyMapAnswer as BodyMapAnswerType,
} from '@/lib/types';

interface CategoryInfo {
  slug: string;
  name: string;
}

type DiscoveryPhase = 'question' | 'follow_up' | 'drilldown' | 'transitioning';

interface TopicData {
  id: string;
  name: { en?: string; ru?: string };
  questions: Record<string, unknown>;
  experience?: unknown;
}

export default function DiscoverPage() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

  // V3/V4 state
  const [phase, setPhase] = useState<DiscoveryPhase>('question');
  const [isV3Scene, setIsV3Scene] = useState(false);
  const [isV4Scene, setIsV4Scene] = useState(false);
  const [tabooContext, setTabooContext] = useState<TabooContext | null>(null);
  const [followUp, setFollowUp] = useState<FollowUp | null>(null);
  const [lastAnswer, setLastAnswer] = useState<Answer | null>(null);
  const [lastResponseId, setLastResponseId] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>('ru');

  // V4 specific state
  const [questionConfig, setQuestionConfig] = useState<QuestionConfig | null>(null);
  const [topicAlreadyAnswered, setTopicAlreadyAnswered] = useState(false);
  const [existingTopicResponse, setExistingTopicResponse] = useState<TopicResponse | null>(null);

  // Drilldown state
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [lastInterestLevel, setLastInterestLevel] = useState<number>(50);

  // Exclusion dialog state
  const [showExclusionDialog, setShowExclusionDialog] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<CategoryInfo | null>(null);
  const [sceneCategories, setSceneCategories] = useState<CategoryInfo[]>([]);

  // User profile state for body map
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  const supabase = createClient();

  const currentScene = scenes[currentIndex];

  // Initialize locale on client
  useEffect(() => {
    setLocale(getLocale());
  }, []);

  const fetchScenes = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile for body map
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserProfile(profile as Profile);
      }

      // Get answered count
      const { data: answered } = await supabase
        .from('scene_responses')
        .select('scene_id')
        .eq('user_id', user.id);

      setAnsweredCount(answered?.length || 0);

      // Fetch filtered scenes with priority ordering
      const scenesData = await getFilteredScenesClient(supabase, user.id, {
        limit: 20, // fetch more to ensure we get body_map scenes
        orderByPriority: true,
      });

      // Sort to put body_map scenes first
      const sortedScenes = [...scenesData].sort((a, b) => {
        const aScene = a as unknown as SceneV4;
        const bScene = b as unknown as SceneV4;
        const aIsBodyMap = aScene.question_config?.type === 'body_map' ||
          (a as SceneV3).body_map_config != null;
        const bIsBodyMap = bScene.question_config?.type === 'body_map' ||
          (b as SceneV3).body_map_config != null;

        if (aIsBodyMap && !bIsBodyMap) return -1;
        if (!aIsBodyMap && bIsBodyMap) return 1;
        return 0; // keep original order for same type
      });

      setScenes(sortedScenes.slice(0, 10)); // limit back to 10
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching scenes:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchQuestion = useCallback(
    async (sceneId: string) => {
      setQuestionLoading(true);
      setPhase('question');
      setTabooContext(null);
      setFollowUp(null);
      setLastAnswer(null);
      setLastResponseId(null);
      setQuestionConfig(null);
      setTopicAlreadyAnswered(false);
      setExistingTopicResponse(null);
      setIsV4Scene(false);

      try {
        const response = await fetch('/api/ai/question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sceneId, locale }),
        });

        if (response.ok) {
          const data = await response.json();

          // Check if V4 response
          if ('isV4' in data && data.isV4) {
            const v4Data = data as V4QuestionResponse;
            setQuestion(v4Data.question);
            setQuestionConfig(v4Data.questionConfig);
            setIsV4Scene(true);
            setIsV3Scene(false);
            setTabooContext(v4Data.tabooContext || null);
            setFollowUp(v4Data.followUp || null);
            setTopicAlreadyAnswered(v4Data.topicAlreadyAnswered || false);
            setExistingTopicResponse(v4Data.existingTopicResponse || null);
            // Note: If topicAlreadyAnswered, the useEffect below will handle auto-skip
          } else {
            // V3 or legacy response
            const v3Data = data as V3QuestionResponse;
            setQuestion(v3Data.question);
            setIsV3Scene(v3Data.isV3);
            setIsV4Scene(false);
            setTabooContext(v3Data.tabooContext || null);
            setFollowUp(v3Data.followUp || null);
          }
        }
      } catch (error) {
        console.error('Error fetching question:', error);
        // Fallback question
        setQuestion({
          question: 'Насколько тебе интересна эта сцена?',
          answerType: 'scale',
          scaleLabels: { min: 'Не привлекает', max: 'Очень хочу' },
          targetDimensions: currentScene?.dimensions || [],
        });
        setIsV3Scene(false);
        setIsV4Scene(false);
      } finally {
        setQuestionLoading(false);
      }
    },
    [currentScene?.dimensions, locale]
  );

  // Fetch categories for current scene
  const fetchSceneCategories = useCallback(async () => {
    if (!currentScene?.tags?.length) {
      setSceneCategories([]);
      return;
    }

    const cats = await getSceneCategories(supabase, currentScene.tags);
    setSceneCategories(cats);
  }, [currentScene?.tags, supabase]);

  useEffect(() => {
    fetchScenes();
  }, [fetchScenes]);

  useEffect(() => {
    if (currentScene) {
      fetchQuestion(currentScene.id);
      fetchSceneCategories();
    }
  }, [currentScene, fetchQuestion, fetchSceneCategories]);

  // Auto-skip scenes where topic is already answered (V4)
  useEffect(() => {
    if (topicAlreadyAnswered && existingTopicResponse && !questionLoading) {
      // Topic already answered, skip to next scene
      if (currentIndex < scenes.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        fetchScenes();
      }
    }
  }, [topicAlreadyAnswered, existingTopicResponse, questionLoading, currentIndex, scenes.length, fetchScenes]);

  const moveToNextScene = useCallback(async () => {
    setPhase('transitioning');
    setAnsweredCount((prev) => prev + 1);

    if (currentIndex < scenes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await fetchScenes();
    }
  }, [currentIndex, scenes.length, fetchScenes]);

  const handleSubmit = async (answer: Answer) => {
    if (!currentScene || !question) return;

    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Save response
      const { data: responseData } = await supabase
        .from('scene_responses')
        .insert({
          user_id: user.id,
          scene_id: currentScene.id,
          question_asked: question.question,
          question_type: question.answerType,
          answer,
          profile_updates: { dimensions: question.targetDimensions },
        })
        .select('id')
        .single();

      setLastResponseId(responseData?.id || null);
      setLastAnswer(answer);

      // Update preference profile (legacy system)
      const { data: prefProfile } = await supabase
        .from('preference_profiles')
        .select('preferences')
        .eq('user_id', user.id)
        .single();

      const preferences = prefProfile?.preferences || {};

      // Update preferences based on answer
      for (const dim of question.targetDimensions) {
        const parts = dim.split('.');
        let current: Record<string, unknown> = preferences as Record<string, unknown>;

        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]] as Record<string, unknown>;
        }

        const lastKey = parts[parts.length - 1];

        if ('value' in answer && typeof answer.value === 'number') {
          current[lastKey] = {
            value: answer.value,
            updatedAt: new Date().toISOString(),
          };
        } else if ('selected' in answer) {
          current[lastKey] = {
            selected: answer.selected,
            updatedAt: new Date().toISOString(),
          };
        }
      }

      await supabase
        .from('preference_profiles')
        .update({ preferences })
        .eq('user_id', user.id);

      // V4: Save topic response if there's a topic_ref
      let interestLevel = 50;
      let topicRef: string | undefined;

      if (isV4Scene && questionConfig) {
        try {
          topicRef = getTopicRef(questionConfig) ?? undefined;
          if (topicRef) {
            // Calculate interest level based on answer type
            if ('value' in answer && typeof answer.value === 'number') {
              interestLevel = answer.value;
            } else if ('value' in answer && typeof answer.value === 'string') {
              interestLevel = trinaryToNumeric(answer.value as 'yes' | 'maybe' | 'no');
            }

            setLastInterestLevel(interestLevel);

            // Don't save topic response yet if we're going to show drilldown
            // It will be saved after drilldown with the collected responses
          }
        } catch (err) {
          console.error('Failed to process V4 topic response:', err);
        }
      }

      // V3/V4: Update psychological profile
      if (isV3Scene || isV4Scene) {
        try {
          // Cast to SceneV3 for profile signal functions (V4 has compatible ai_context)
          const sceneWithContext = currentScene as SceneV3;
          let signalUpdates;
          let testScoreUpdates;

          // Handle body map answers differently
          if (isBodyMapAnswer(answer)) {
            signalUpdates = calculateBodyMapSignals(answer, sceneWithContext);
            testScoreUpdates = calculateBodyMapTestScores(answer, sceneWithContext);
          } else {
            signalUpdates = calculateSignalUpdates(answer, sceneWithContext);
            testScoreUpdates = calculateTestScoreUpdates(answer, sceneWithContext);
          }

          if (signalUpdates.length > 0 || Object.keys(testScoreUpdates).length > 0) {
            await updatePsychologicalProfile(
              supabase,
              user.id,
              signalUpdates,
              testScoreUpdates,
              sceneWithContext
            );
          }
        } catch (err) {
          console.error('Failed to update psychological profile:', err);
        }
      }

      // Check if drilldown should be shown (V4: positive answer + topic has questions)
      if (isV4Scene && topicRef && interestLevel >= 50) {
        try {
          // Fetch topic data to check if it has drilldown questions
          const topicResponse = await fetch(`/api/topics/${topicRef}`);
          if (topicResponse.ok) {
            const topic = await topicResponse.json();
            // Check if topic has questions beyond the initial interest check
            const hasQuestions = topic.questions && Object.keys(topic.questions).length > 0;
            if (hasQuestions) {
              setTopicData(topic);
              setPhase('drilldown');
              return;
            }
          }
        } catch (err) {
          console.error('Failed to fetch topic for drilldown:', err);
        }
      }

      // Check if follow-up should be shown (V3)
      if (followUp && shouldTriggerFollowUp(answer, followUp)) {
        setPhase('follow_up');
      } else {
        // Save topic response now (no drilldown)
        if (isV4Scene && topicRef) {
          try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
              await saveTopicResponse(
                supabase,
                currentUser.id,
                topicRef,
                interestLevel,
                currentScene.id
              );
            }
          } catch (err) {
            console.error('Failed to save topic response:', err);
          }
        }
        // Move to next scene
        await moveToNextScene();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFollowUpSubmit = async (optionId: string, signal: string) => {
    try {
      await fetch('/api/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneId: currentScene?.id,
          parentResponseId: lastResponseId,
          optionId,
          profileSignal: signal,
        }),
      });
    } catch (error) {
      console.error('Error submitting follow-up:', error);
    }

    // Move to next scene
    await moveToNextScene();
  };

  const handleFollowUpSkip = async () => {
    await moveToNextScene();
  };

  const handleDrilldownComplete = async (responses: Record<string, unknown>) => {
    if (!currentScene || !questionConfig) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const topicRef = getTopicRef(questionConfig);
      if (topicRef) {
        // Save topic response with drilldown data
        await saveTopicResponse(
          supabase,
          user.id,
          topicRef,
          lastInterestLevel,
          currentScene.id,
          responses // drilldown_responses
        );
      }
    } catch (err) {
      console.error('Failed to save drilldown responses:', err);
    }

    setTopicData(null);
    await moveToNextScene();
  };

  const handleDrilldownSkip = async () => {
    if (!currentScene || !questionConfig) {
      await moveToNextScene();
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const topicRef = getTopicRef(questionConfig);
      if (topicRef) {
        // Save topic response without drilldown data
        await saveTopicResponse(
          supabase,
          user.id,
          topicRef,
          lastInterestLevel,
          currentScene.id
        );
      }
    } catch (err) {
      console.error('Failed to save topic response on skip:', err);
    }

    setTopicData(null);
    await moveToNextScene();
  };

  const handleDislike = () => {
    // Show exclusion dialog with the first detected category
    if (sceneCategories.length > 0) {
      setDetectedCategory(sceneCategories[0]);
    } else {
      setDetectedCategory(null);
    }
    setShowExclusionDialog(true);
  };

  const handleExclusionConfirm = async (
    type: 'category' | 'tag' | 'scene',
    value: string,
    level: 'soft' | 'hard'
  ) => {
    try {
      if (type === 'category') {
        await fetch('/api/exclusions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categorySlug: value, level }),
        });
      } else if (type === 'tag') {
        await fetch('/api/exclusions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag: value, level }),
        });
      }
      // For 'scene' type, we just skip to next without saving exclusion

      // Move to next scene
      if (currentIndex < scenes.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        await fetchScenes();
      }
    } catch (error) {
      console.error('Error saving exclusion:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <p className="text-muted-foreground mb-4">
          Вы ответили на все доступные сцены!
        </p>
        <Button onClick={fetchScenes} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Проверить новые
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Progress indicator */}
      <div className="text-center text-sm text-muted-foreground">
        {answeredCount} вопросов отвечено
      </div>

      {/* Scene card - hide for body_map scenes */}
      <AnimatePresence mode="wait">
        {currentScene && question?.answerType !== 'body_map' && (
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <SceneCard scene={currentScene} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taboo normalization message */}
      <AnimatePresence>
        {tabooContext && phase === 'question' && (
          <NormalizationMessage tabooContext={tabooContext} locale={locale} />
        )}
      </AnimatePresence>

      {/* Question and answer */}
      <AnimatePresence mode="wait">
        {phase === 'question' && (
          <motion.div
            key="question-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {questionLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : question ? (
              <div className="space-y-4">
                {question.answerType !== 'body_map' && (
                  <QuestionDisplay question={question} />
                )}

                {question.answerType === 'scale' && question.scaleLabels && (
                  <ScaleAnswer
                    labels={question.scaleLabels}
                    onSubmit={(value) => handleSubmit({ value })}
                    loading={submitting}
                  />
                )}

                {question.answerType === 'multiple_choice' && question.options && (
                  <MultipleChoiceAnswer
                    options={question.options}
                    allowMultiple={question.allowMultiple}
                    onSubmit={(selected) => handleSubmit({ selected })}
                    loading={submitting}
                  />
                )}

                {question.answerType === 'trinary' && (
                  <TrinaryAnswer
                    onSubmit={(value) => handleSubmit({ value })}
                    loading={submitting}
                  />
                )}

                {question.answerType === 'body_map' && currentScene && (
                  <BodyMapAnswer
                    config={
                      // V4: get config from question_config if it's body_map type
                      isV4Scene && questionConfig?.type === 'body_map'
                        ? {
                            action: (questionConfig as BodyMapQuestionConfig).action,
                            passes: (questionConfig as BodyMapQuestionConfig).passes,
                          }
                        // V3: get config from body_map_config
                        : (currentScene as SceneV3).body_map_config as BodyMapSceneConfig
                    }
                    partnerGender={
                      userProfile?.interested_in === 'male'
                        ? 'male'
                        : userProfile?.interested_in === 'female'
                          ? 'female'
                          : 'male'
                    }
                    userGender={
                      (userProfile?.gender === 'male' || userProfile?.gender === 'female')
                        ? userProfile.gender
                        : 'male'
                    }
                    onSubmit={(answer: BodyMapAnswerType) => handleSubmit(answer)}
                    loading={submitting}
                    locale={locale}
                  />
                )}
              </div>
            ) : null}
          </motion.div>
        )}

        {phase === 'follow_up' && followUp && (
          <motion.div
            key="followup-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FollowUpQuestion
              followUp={followUp}
              locale={locale}
              onSubmit={handleFollowUpSubmit}
              onSkip={handleFollowUpSkip}
            />
          </motion.div>
        )}

        {phase === 'drilldown' && topicData && (
          <motion.div
            key="drilldown-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card rounded-lg p-6 shadow-lg"
          >
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">Уточняющие вопросы</p>
              <h2 className="text-lg font-medium">
                {topicData.name?.ru || topicData.name?.en || topicData.id}
              </h2>
            </div>
            <TopicDrilldown
              topic={topicData as Parameters<typeof TopicDrilldown>[0]['topic']}
              initialInterest={lastInterestLevel}
              locale={locale}
              onComplete={handleDrilldownComplete}
              onSkip={handleDrilldownSkip}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      {phase === 'question' && (
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDislike}
            disabled={submitting}
            className="text-muted-foreground hover:text-destructive hover:border-destructive"
          >
            <ThumbsDown className="w-4 h-4 mr-2" />
            Не моё
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (currentIndex < scenes.length - 1) {
                setCurrentIndex((prev) => prev + 1);
              } else {
                fetchScenes();
              }
            }}
            disabled={submitting}
          >
            Пропустить
          </Button>
        </div>
      )}

      {/* Exclusion Dialog */}
      <ExclusionDialog
        isOpen={showExclusionDialog}
        onClose={() => setShowExclusionDialog(false)}
        category={detectedCategory}
        tags={currentScene?.tags || []}
        onConfirm={handleExclusionConfirm}
      />
    </div>
  );
}
