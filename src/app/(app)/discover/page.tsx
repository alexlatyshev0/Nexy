'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { SceneCard } from '@/components/discovery/SceneCard';
import { CompositeSceneView } from '@/components/discovery/CompositeSceneView';
import { ElementSelector } from '@/components/discovery/ElementSelector';
import { FollowUpFlow } from '@/components/discovery/FollowUpFlow';
import { QuestionDisplay } from '@/components/discovery/QuestionDisplay';
import { ScaleAnswer } from '@/components/discovery/ScaleAnswer';
import { MultipleChoiceAnswer } from '@/components/discovery/MultipleChoiceAnswer';
import { TrinaryAnswer } from '@/components/discovery/TrinaryAnswer';
import { BodyMapAnswer } from '@/components/discovery/BodyMapAnswer';
import { ExclusionDialog } from '@/components/discovery/ExclusionDialog';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, ThumbsDown } from 'lucide-react';
import { getFilteredScenesClient, getSceneCategories } from '@/lib/scenes.client';
import { getElementFollowUps } from '@/lib/question-v2';
import {
  calculateSignalUpdates,
  calculateTestScoreUpdates,
  updatePsychologicalProfile,
} from '@/lib/profile-signals';
import { updateTagPreferences } from '@/lib/tag-preferences';
import { getLocale, t } from '@/lib/locale';
import type {
  Scene,
  SceneV2,
  GeneratedQuestion,
  Answer,
  Locale,
  Profile,
  V2QuestionResponse,
  V2Element,
} from '@/lib/types';

interface CategoryInfo {
  slug: string;
  name: string;
}

type DiscoveryPhase = 'question' | 'element_selection' | 'element_followup' | 'transitioning';
type DiscoveryStage = 'body_map' | 'scenes'; // Body Map stage before scenes

interface SelectedElement {
  elementId: string;
  element: V2Element;
  followUpIndex: number;
}

export default function DiscoverPage() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Discovery stage: body_map or scenes
  const [discoveryStage, setDiscoveryStage] = useState<DiscoveryStage>('body_map');
  const [bodyMapActivities, setBodyMapActivities] = useState<Scene[]>([]);
  const [currentBodyMapIndex, setCurrentBodyMapIndex] = useState(0);
  const [bodyMapSkipped, setBodyMapSkipped] = useState(false);

  // V2 state
  const [phase, setPhase] = useState<DiscoveryPhase>('question');
  const [isV2Scene, setIsV2Scene] = useState(false);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [currentElementFollowUps, setCurrentElementFollowUps] = useState<SelectedElement[]>([]);
  const [currentFollowUpIndex, setCurrentFollowUpIndex] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<Answer | null>(null);
  const [lastResponseId, setLastResponseId] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>('ru');

  // Exclusion dialog state
  const [showExclusionDialog, setShowExclusionDialog] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<CategoryInfo | null>(null);
  const [sceneCategories, setSceneCategories] = useState<CategoryInfo[]>([]);

  // User profile state for body map
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  
  // Store body map config separately to avoid mutating scene object
  const [bodyMapConfigs, setBodyMapConfigs] = useState<Record<string, any>>({});
  const [bodyMapMainQuestions, setBodyMapMainQuestions] = useState<Record<string, any>>({});

  const supabase = createClient();
  const router = useRouter();

  // Get current scene based on stage
  const currentScene = discoveryStage === 'body_map' 
    ? bodyMapActivities[currentBodyMapIndex]
    : scenes[currentIndex];

  // Initialize locale from profile or default
  useEffect(() => {
    if (userProfile) {
      const userLocale = getLocale(userProfile);
      setLocale(userLocale);
    } else {
      setLocale(getLocale());
    }
  }, [userProfile]);

  // Check if user has completed or skipped Body Map
  const checkBodyMapStatus = useCallback(async (userId: string): Promise<'completed' | 'skipped' | 'pending'> => {
    // Check user flow state for body_map_skipped flag
    const { data: flowState } = await supabase
      .from('user_flow_state')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Check if user has skipped Body Map (stored in tag_scores as a flag)
    if (flowState?.tag_scores && (flowState.tag_scores as any).body_map_skipped === true) {
      console.log('[Discover] Body Map status: skipped (from user_flow_state)');
      return 'skipped';
    }

    // Check if user has responses for body map activities
    // For virtual body map scenes (bodymap-self, bodymap-partner-female, bodymap-partner-male),
    // we check scene_responses - these scenes have IDs like "bodymap-self-{userId}"
    // Also check by question_type = 'body_map' to catch any body map responses
    const { data: sceneResponses } = await supabase
      .from('scene_responses')
      .select('scene_id, question_type')
      .eq('user_id', userId)
      .or('question_type.eq.body_map,scene_id.like.bodymap-%');

    // Also check body_map_responses for legacy format
    const { data: bodyMapResponses } = await supabase
      .from('body_map_responses')
      .select('activity_id, pass')
      .eq('user_id', userId);

    // Count unique body map scenes/activities answered
    const answeredBodyMaps = new Set<string>();
    
    if (sceneResponses) {
      sceneResponses.forEach(r => {
        // Check if scene_id contains bodymap (for virtual scenes) or is a body_map response
        if (r.scene_id && (r.scene_id.includes('bodymap') || r.question_type === 'body_map')) {
          answeredBodyMaps.add(r.scene_id);
          console.log('[Discover] Found body map response:', r.scene_id, r.question_type);
        }
      });
    } else {
      console.log('[Discover] No scene_responses found for body map check');
    }
    
    if (bodyMapResponses) {
      bodyMapResponses.forEach(r => {
        if (r.activity_id) {
          answeredBodyMaps.add(r.activity_id);
        }
      });
    }

    console.log('[Discover] Body Map status check:', {
      sceneResponses: sceneResponses?.length || 0,
      bodyMapResponses: bodyMapResponses?.length || 0,
      answeredBodyMaps: answeredBodyMaps.size,
      bodyMapActivityIds: Array.from(answeredBodyMaps),
    });

    // User has completed Body Map if they have answered at least one body map scene
    // (we show 2-3 body maps: self + partner(s), but user only needs to complete one)
    if (answeredBodyMaps.size >= 1) {
      console.log('[Discover] Body Map status: completed');
      return 'completed';
    }

    console.log('[Discover] Body Map status: pending');
    return 'pending';
  }, [supabase]);

  // Fetch Body Map activities - create virtual scenes based on user profile
  const fetchBodyMapActivities = useCallback(async (userId: string) => {
    // Get user profile to determine which body maps to show
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: profile } = await supabase
      .from('profiles')
      .select('gender, interested_in')
      .eq('id', user.id)
      .single();

    if (!profile) return [];

    const userGender = (profile.gender === 'male' || profile.gender === 'female') 
      ? profile.gender 
      : 'male'; // fallback
    const interestedIn = profile.interested_in || 'female';

    // Create virtual body map scenes
    const virtualScenes: Scene[] = [];

    // 1. Body map for user's own body
    virtualScenes.push({
      id: `bodymap-self-${user.id}`, // Use consistent format with dashes
      slug: 'bodymap-self',
      version: 2,
      category: 'body_map',
      priority: 1,
      title: { 
        ru: 'Твоё тело', 
        en: 'Your body' 
      },
      subtitle: { 
        ru: 'Отметь зоны и действия для себя', 
        en: 'Mark zones and actions for yourself' 
      },
      user_description: {
        ru: 'Отметь на своём теле зоны и выбери действия, которые тебе нравятся или не нравятся',
        en: 'Mark zones on your body and select actions you like or dislike'
      },
      ai_description: {
        ru: 'Интерактивная карта тела пользователя',
        en: 'Interactive body map for user'
      },
      question_type: 'body_map',
      intensity: 1,
      tags: ['body_map', 'self'],
      dimensions: [], // Empty dimensions for body_map scenes
      question_config: {
        type: 'body_map',
        action: 'universal',
        passes: [
          {
            subject: 'receive',
            question: {
              ru: 'Где тебе нравится или не нравится, когда партнёр(ша) тебя касается?',
              en: 'Where do you like or dislike your partner touching you?'
            }
          }
        ],
      },
      ai_context: {
        action: 'universal',
        passes: [
          {
            id: 'receive',
            question: {
              ru: 'Где тебе нравится или не нравится, когда партнёр(ша) тебя касается?',
              en: 'Where do you like or dislike your partner touching you?'
            }
          }
        ],
        zones: {
          available: ['lips', 'ears', 'neck', 'shoulders', 'chest', 'breasts', 'nipples', 'stomach', 'back', 'lower_back', 'arms', 'hands', 'buttocks', 'anus', 'groin', 'penis', 'vulva', 'thighs', 'feet'],
        },
      },
    } as Scene);

    // 2. Body map for partner(s) based on interested_in
    if (interestedIn === 'female' || interestedIn === 'both') {
      virtualScenes.push({
        id: `bodymap-partner-female-${user.id}`, // Use consistent format with dashes
        slug: 'bodymap-partner-female',
        version: 2,
        category: 'body_map',
        priority: 2,
        title: { 
          ru: 'Тело партнёрши', 
          en: 'Partner\'s body (female)' 
        },
        subtitle: { 
          ru: 'Отметь зоны и действия для партнёрши', 
          en: 'Mark zones and actions for female partner' 
        },
        user_description: {
          ru: 'Отметь на теле партнёрши зоны и выбери действия, которые тебе нравятся или не нравятся',
          en: 'Mark zones on female partner\'s body and select actions you like or dislike'
        },
        ai_description: {
          ru: 'Интерактивная карта тела партнёрши',
          en: 'Interactive body map for female partner'
        },
        question_type: 'body_map',
        intensity: 1,
        tags: ['body_map', 'partner', 'female'],
        dimensions: [], // Empty dimensions for body_map scenes
        question_config: {
          type: 'body_map',
          action: 'universal',
          passes: [
            {
              subject: 'give',
              question: {
                ru: 'Где ты любишь или не любишь касаться партнёрши?',
                en: 'Where do you like or dislike touching your partner?'
              }
            }
          ],
        },
        ai_context: {
          action: 'universal',
          passes: [
            {
              id: 'give',
              question: {
                ru: 'Где ты любишь или не любишь касаться партнёрши?',
                en: 'Where do you like or dislike touching your partner?'
              }
            }
          ],
          zones: {
            available: ['lips', 'ears', 'neck', 'shoulders', 'chest', 'breasts', 'nipples', 'stomach', 'back', 'lower_back', 'arms', 'hands', 'buttocks', 'anus', 'groin', 'vulva', 'thighs', 'feet'],
          },
        },
      } as Scene);
    }

    if (interestedIn === 'male' || interestedIn === 'both') {
      virtualScenes.push({
        id: `bodymap-partner-male-${user.id}`, // Use consistent format with dashes
        slug: 'bodymap-partner-male',
        version: 2,
        category: 'body_map',
        priority: interestedIn === 'both' ? 3 : 2,
        title: { 
          ru: 'Тело партнёра', 
          en: 'Partner\'s body (male)' 
        },
        subtitle: { 
          ru: 'Отметь зоны и действия для партнёра', 
          en: 'Mark zones and actions for male partner' 
        },
        user_description: {
          ru: 'Отметь на теле партнёра зоны и выбери действия, которые тебе нравятся или не нравятся',
          en: 'Mark zones on male partner\'s body and select actions you like or dislike'
        },
        ai_description: {
          ru: 'Интерактивная карта тела партнёра',
          en: 'Interactive body map for male partner'
        },
        question_type: 'body_map',
        intensity: 1,
        tags: ['body_map', 'partner', 'male'],
        dimensions: [], // Empty dimensions for body_map scenes
        question_config: {
          type: 'body_map',
          action: 'universal',
          passes: [
            {
              subject: 'give',
              question: {
                ru: 'Где ты любишь или не любишь касаться партнёра?',
                en: 'Where do you like or dislike touching your partner?'
              }
            }
          ],
        },
        ai_context: {
          action: 'universal',
          passes: [
            {
              id: 'give',
              question: {
                ru: 'Где ты любишь или не любишь касаться партнёра?',
                en: 'Where do you like or dislike touching your partner?'
              }
            }
          ],
          zones: {
            available: ['lips', 'ears', 'neck', 'shoulders', 'chest', 'nipples', 'stomach', 'back', 'lower_back', 'arms', 'hands', 'buttocks', 'anus', 'groin', 'penis', 'thighs', 'feet'],
          },
        },
      } as Scene);
    }

    setBodyMapActivities(virtualScenes);
    setCurrentBodyMapIndex(0);
    return virtualScenes;
  }, [supabase]);

  // Fetch regular scenes (composite scenes, not body_map)
  const fetchRegularScenes = useCallback(async (userId: string) => {
    console.log('[Discover] Fetching regular scenes for user:', userId);
    
    try {
      // Use adaptive flow with dedupe, but disable dedupe initially if user just completed Body Map
      // (user might not have any composite scene responses yet)
      const scenesData = await getFilteredScenesClient(supabase, userId, {
        limit: 20, // Fetch more to ensure we have scenes
        orderByPriority: false, // Adaptive flow handles ordering
        enableAdaptiveFlow: true,
        enableDedupe: false, // Disable dedupe initially - user just completed Body Map, no composite responses yet
      });

      console.log('[Discover] Fetched scenes:', scenesData.length);
      
      if (scenesData.length === 0) {
        console.warn('[Discover] No scenes found, trying without adaptive flow');
        // Fallback: try without adaptive flow
        const fallbackScenes = await getFilteredScenesClient(supabase, userId, {
          limit: 20,
          orderByPriority: true,
          enableAdaptiveFlow: false,
          enableDedupe: false,
        });
        console.log('[Discover] Fallback scenes:', fallbackScenes.length);
        setScenes(fallbackScenes);
        setCurrentIndex(0);
        return fallbackScenes;
      }

      // Scenes are already filtered and sorted by adaptive flow
      setScenes(scenesData);
      setCurrentIndex(0);
      return scenesData;
    } catch (error) {
      console.error('[Discover] Error in fetchRegularScenes:', error);
      // Try simple fallback query
      try {
        const { data: simpleScenes, error: simpleError } = await supabase
          .from('scenes')
          .select('*')
          .eq('version', 2)
          .order('priority', { ascending: true })
          .limit(20);
        
        if (simpleError) {
          console.error('[Discover] Simple query also failed:', simpleError);
          return [];
        }
        
        console.log('[Discover] Simple query returned:', simpleScenes?.length || 0, 'scenes');
        if (simpleScenes && simpleScenes.length > 0) {
          setScenes(simpleScenes as Scene[]);
          setCurrentIndex(0);
          return simpleScenes as Scene[];
        }
      } catch (fallbackError) {
        console.error('[Discover] Fallback query also failed:', fallbackError);
      }
      
      return [];
    }
  }, [supabase]);

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
        const profileData = profile as Profile;
        setUserProfile(profileData);
        // Update locale from profile
        const userLocale = getLocale(profileData);
        setLocale(userLocale);

        // Check if visual onboarding is completed
        // If not, redirect to visual-onboarding page
        if (!(profile as any).visual_onboarding_completed) {
          console.log('[Discover] Visual onboarding not completed, redirecting...');
          router.push('/visual-onboarding');
          return;
        }
      }

      // Get answered count (only for regular scenes, not body_map)
      const { data: answered } = await supabase
        .from('scene_responses')
        .select('scene_id')
        .eq('user_id', user.id);

      setAnsweredCount(answered?.length || 0);

      // Check if user has completed or skipped Body Map
      const bodyMapStatus = await checkBodyMapStatus(user.id);
      console.log('[Discover] Initial Body Map status:', bodyMapStatus);
      
      if (bodyMapStatus === 'pending') {
        // Show Body Map stage first
        console.log('[Discover] Starting Body Map stage');
        setDiscoveryStage('body_map');
        const bodyMapScenes = await fetchBodyMapActivities(user.id);
        console.log('[Discover] Loaded Body Map scenes:', bodyMapScenes.length);
      } else {
        // Body Map completed or skipped, show regular scenes
        console.log('[Discover] Body Map completed/skipped, loading regular scenes');
        setDiscoveryStage('scenes');
        try {
          const regularScenes = await fetchRegularScenes(user.id);
          console.log('[Discover] Loaded regular scenes:', regularScenes.length);
          if (regularScenes.length === 0) {
            console.warn('[Discover] No regular scenes loaded, trying direct query...');
            // Direct query to check if scenes exist
            const { data: directScenes, error: directError } = await supabase
              .from('scenes')
              .select('id, slug, version, priority')
              .eq('version', 2)
              .order('priority', { ascending: true })
              .limit(10);
            
            console.log('[Discover] Direct query result:', {
              scenes: directScenes?.length || 0,
              error: directError,
              sample: directScenes?.[0],
            });
            
            if (directScenes && directScenes.length > 0) {
              // Scenes exist but weren't returned by getFilteredScenesClient
              // This might be due to exclusions or filtering
              console.warn('[Discover] Scenes exist in DB but were filtered out');
            }
          }
        } catch (error) {
          console.error('[Discover] Error loading regular scenes:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching scenes:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, checkBodyMapStatus, fetchBodyMapActivities, fetchRegularScenes]);

  const fetchQuestion = useCallback(
    async (sceneId: string) => {
      setQuestionLoading(true);
      setPhase('question');
      setLastAnswer(null);
      setSelectedElements([]);
      setCurrentElementFollowUps([]);
      setCurrentFollowUpIndex(0);
      setIsV2Scene(false);

      try {
        const response = await fetch('/api/ai/question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sceneId, locale }),
        });

        if (response.ok) {
          const data = await response.json();

          // V2 response (composite or body_map)
          if ('isV2' in data && data.isV2) {
            const v2Data = data as V2QuestionResponse & { bodyMapConfig?: any; mainQuestion?: any };
            console.log('[Discover] V2 response received:', {
              answerType: v2Data.question.answerType,
              hasBodyMapConfig: !!v2Data.bodyMapConfig,
              hasMainQuestion: !!v2Data.mainQuestion,
              sceneId: sceneId,
              sceneType: currentScene?.question_type,
              hasOptions: !!v2Data.question.options,
              optionsCount: v2Data.question.options?.length || 0,
              allowMultiple: v2Data.question.allowMultiple,
              questionText: v2Data.question.question,
            });
            setQuestion(v2Data.question);
            setIsV2Scene(true);
            // Store body map config if present (using state instead of mutating scene)
            if (v2Data.bodyMapConfig) {
              setBodyMapConfigs((prev) => ({
                ...prev,
                [sceneId]: v2Data.bodyMapConfig,
              }));
              // Store main question if present
              if (v2Data.mainQuestion) {
                setBodyMapMainQuestions((prev) => ({
                  ...prev,
                  [sceneId]: v2Data.mainQuestion,
                }));
              }
              console.log('[Discover] Body map config stored:', v2Data.bodyMapConfig);
            }
          } else {
            console.error('[Discover] Unexpected response format:', data);
            console.error('[Discover] Response data:', JSON.stringify(data, null, 2));
            // Check if scene is body_map but API didn't return it correctly
            if (currentScene?.question_type === 'body_map') {
              console.warn('[Discover] Scene is body_map but API returned non-V2 response, using fallback');
              // Try to build body map config from scene data
              const aiContext = (currentScene as any).ai_context || {};
              const questionConfig = (currentScene as any).question_config || {};
              const passes = (aiContext.passes || questionConfig.passes || []).map((p: any) => ({
                subject: p.id === 'give' || p.id === 'receive' ? p.id : (p.subject || 'give'),
                question: p.question || { ru: '', en: '' },
              }));
              setBodyMapConfigs((prev) => ({
                ...prev,
                [sceneId]: {
                  action: aiContext.action || questionConfig.action || 'kiss',
                  passes: passes,
                  availableZones: aiContext.zones?.available || [],
                },
              }));
              setBodyMapMainQuestions((prev) => ({
                ...prev,
                [sceneId]: {
                  ru: 'Отметь на теле участки, с которыми тебе нравится или не нравится взаимодействовать. Нажми на зону, чтобы выбрать действия и указать, что можно, а что нельзя.',
                  en: 'Mark on the body zones you like or dislike interacting with. Tap a zone to select actions and specify what\'s allowed and what\'s not.',
                },
              }));
              setQuestion({
                question: locale === 'ru' 
                  ? 'Отметь на теле участки, с которыми тебе нравится или не нравится взаимодействовать.'
                  : 'Mark on the body zones you like or dislike interacting with.',
                answerType: 'body_map',
                targetDimensions: [],
              });
              setIsV2Scene(true);
              console.log('[Discover] Fallback body_map question set');
            } else {
              console.warn('[Discover] Scene is not body_map, using scale fallback. Scene type:', currentScene?.question_type);
              setQuestion({
                question: 'Насколько тебе интересна эта сцена?',
                answerType: 'scale',
                scaleLabels: { min: 'Не привлекает', max: 'Очень хочу' },
                targetDimensions: [],
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching question:', error);
        // Fallback question
        setQuestion({
          question: 'Насколько тебе интересна эта сцена?',
          answerType: 'scale',
          scaleLabels: { min: 'Не привлекает', max: 'Очень хочу' },
          targetDimensions: [],
        });
      } finally {
        setQuestionLoading(false);
      }
    },
    [locale, currentScene]
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
      // Reset phase when scene changes
      setPhase('question');
      setSelectedElements([]);
      setCurrentElementFollowUps([]);
      setCurrentFollowUpIndex(0);
      
      // For body_map scenes, set question directly without API call
      if (currentScene.question_type === 'body_map') {
        console.log('[Discover] Setting up body_map scene directly:', currentScene.id, currentScene.slug);
        const aiContext = (currentScene as any).ai_context || {};
        const questionConfig = (currentScene as any).question_config || {};
        const passes = (aiContext.passes || questionConfig.passes || []).map((p: any) => ({
          subject: p.id === 'give' || p.id === 'receive' ? p.id : (p.subject || 'give'),
          question: p.question || { ru: '', en: '' },
        }));
        
        // Build body map config
        const zones = (aiContext as any).zones;
        const availableZones = (zones && typeof zones === 'object' && 'available' in zones) 
          ? zones.available 
          : [];
        
        const bodyMapConfig = {
          action: aiContext.action || questionConfig.action || 'universal',
          passes: passes.length > 0 ? passes : [
            {
              subject: currentScene.slug === 'bodymap-self' ? 'receive' : 'give',
              question: {
                ru: currentScene.slug === 'bodymap-self' 
                  ? 'Где тебе нравится или не нравится, когда партнёр(ша) тебя касается?'
                  : (currentScene.slug === 'bodymap-partner-female'
                    ? 'Где ты любишь или не любишь касаться партнёрши?'
                    : 'Где ты любишь или не любишь касаться партнёра?'),
                en: currentScene.slug === 'bodymap-self'
                  ? 'Where do you like or dislike your partner touching you?'
                  : 'Where do you like or dislike touching your partner?',
              },
            },
          ],
          availableZones: availableZones.length > 0 ? availableZones : ['lips', 'ears', 'neck', 'shoulders', 'chest', 'breasts', 'nipples', 'stomach', 'back', 'lower_back', 'arms', 'hands', 'buttocks', 'anus', 'groin', 'penis', 'vulva', 'thighs', 'feet'],
        };
        
        console.log('[Discover] BodyMapConfig created:', bodyMapConfig);
        
        setBodyMapConfigs((prev) => ({
          ...prev,
          [currentScene.id]: bodyMapConfig,
        }));
        
        // Set main question based on scene type - must clarify who with whom
        // Use the question from passes which already has the correct context
        const firstPass = bodyMapConfig.passes[0];
        const mainQuestion = firstPass?.question || {
          ru: currentScene.slug === 'bodymap-self' 
                  ? 'Где тебе нравится или не нравится, когда партнёр(ша) тебя касается? Нажми на зону, чтобы выбрать действия.'
                  : (currentScene.slug === 'bodymap-partner-female'
                    ? 'Где ты любишь или не любишь касаться партнёрши? Нажми на зону, чтобы выбрать действия.'
                    : 'Где ты любишь или не любишь касаться партнёра? Нажми на зону, чтобы выбрать действия.'),
                en: currentScene.slug === 'bodymap-self'
                  ? 'Where do you like or dislike your partner touching you? Tap a zone to select actions.'
                  : (currentScene.slug === 'bodymap-partner-female'
                    ? 'Where do you like or dislike touching your partner? Tap a zone to select actions.'
                    : 'Where do you like or dislike touching your partner? Tap a zone to select actions.'),
        };
        
        setBodyMapMainQuestions((prev) => ({
          ...prev,
          [currentScene.id]: mainQuestion,
        }));
        
        // Set question directly - use the contextual question
        const questionData = {
          question: mainQuestion[locale] || mainQuestion.en,
          answerType: 'body_map' as const,
          targetDimensions: [],
        };
        console.log('[Discover] Setting question for body_map:', questionData);
        setQuestion(questionData);
        setIsV2Scene(true);
        setQuestionLoading(false);
      } else {
        // For regular scenes, fetch question from API
        fetchQuestion(currentScene.id);
        if (discoveryStage === 'scenes') {
          fetchSceneCategories();
        }
      }
    }
  }, [currentScene, fetchQuestion, fetchSceneCategories, discoveryStage, locale]);


  const moveToNextScene = useCallback(async () => {
    setPhase('transitioning');
    
    // Reset V2 state
    setSelectedElements([]);
    setCurrentElementFollowUps([]);
    setCurrentFollowUpIndex(0);
    setPhase('question');
    
    if (discoveryStage === 'body_map') {
      // Move to next Body Map activity
      if (currentBodyMapIndex < bodyMapActivities.length - 1) {
        setCurrentBodyMapIndex((prev) => prev + 1);
      } else {
        // All Body Map activities completed, move to regular scenes
        console.log('[Discover] Body Map completed, transitioning to regular scenes');
        setDiscoveryStage('scenes');
        setLoading(true); // Show loading while fetching scenes
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            const fetchedScenes = await fetchRegularScenes(user.id);
            console.log('[Discover] Fetched regular scenes after Body Map:', fetchedScenes.length);
            if (fetchedScenes.length === 0) {
              console.warn('[Discover] No regular scenes found after Body Map completion, trying fallback');
              // Try to fetch again with different parameters (no adaptive flow, no dedupe)
              const retryScenes = await getFilteredScenesClient(supabase, user.id, {
                limit: 20,
                orderByPriority: true,
                enableAdaptiveFlow: false,
                enableDedupe: false,
              });
              console.log('[Discover] Retry fetched scenes:', retryScenes.length);
              if (retryScenes.length > 0) {
                setScenes(retryScenes);
                setCurrentIndex(0);
              } else {
                console.error('[Discover] Still no scenes found, checking database...');
                // Last resort: check if scenes exist in database
                const { data: allScenes } = await supabase
                  .from('scenes')
                  .select('id, slug, version')
                  .eq('version', 2)
                  .limit(5);
                console.log('[Discover] Scenes in database:', allScenes?.length);
              }
            }
          } catch (error) {
            console.error('[Discover] Error fetching regular scenes after Body Map:', error);
          } finally {
            setLoading(false);
          }
        }
      }
    } else {
      // Regular scenes
      setAnsweredCount((prev) => prev + 1);
      if (currentIndex < scenes.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        await fetchScenes();
      }
    }
  }, [discoveryStage, currentIndex, scenes.length, currentBodyMapIndex, bodyMapActivities.length, fetchScenes, fetchRegularScenes, supabase]);

  // Skip Body Map and move to regular scenes
  const skipBodyMap = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Save skip flag to user_flow_state
    const { data: flowState } = await supabase
      .from('user_flow_state')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const tagScores = flowState?.tag_scores || {};
    (tagScores as any).body_map_skipped = true;

    if (flowState) {
      // Update existing flow state
      await supabase
        .from('user_flow_state')
        .update({ tag_scores: tagScores })
        .eq('user_id', user.id);
    } else {
      // Create new flow state
      await supabase
        .from('user_flow_state')
        .insert({
          user_id: user.id,
          tag_scores: tagScores,
        });
    }

    setBodyMapSkipped(true);
    setDiscoveryStage('scenes');
    await fetchRegularScenes(user.id);
  }, [fetchRegularScenes, supabase]);

  const handleSubmit = async (answer: Answer) => {
    if (!currentScene || !question) return;

    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Handle body_map answers separately - save to body_map_responses table
      if (question.answerType === 'body_map' && 'passes' in answer) {
        const bodyMapAnswer = answer as any;
        const activityId = currentScene.slug || currentScene.id;
        
        // Save each pass to body_map_responses
        for (const pass of bodyMapAnswer.passes) {
          // Extract zones from zoneActionPreferences
          // zoneActionPreferences is a map: { zoneId: { actionId: preference } }
          const zones: string[] = [];
          if (pass.zoneActionPreferences) {
            // Get all zones that have at least one action preference set
            for (const [zoneId, actions] of Object.entries(pass.zoneActionPreferences)) {
              const actionPrefs = actions as Record<string, any>;
              // Check if zone has any preferences (not all null)
              const hasPreferences = Object.values(actionPrefs).some((pref) => pref !== null && pref !== undefined);
              if (hasPreferences) {
                zones.push(zoneId);
              }
            }
          }
          
          // Also check legacy markings format
          if (pass.markings && pass.markings.length > 0) {
            const zoneIds = pass.markings
              .map((m: any) => m.zoneId)
              .filter((id: string) => id && !zones.includes(id));
            zones.push(...zoneIds);
          }
          
          // Save to body_map_responses
          if (zones.length > 0) {
            const { data: bodyMapResponseData, error: bodyMapError } = await supabase
              .from('body_map_responses')
              .upsert({
                user_id: user.id,
                activity_id: activityId,
                pass: pass.subject, // 'give' or 'receive'
                zones_selected: zones,
              }, {
                onConflict: 'user_id,activity_id,pass'
              })
              .select('id')
              .single();
            
            if (bodyMapError) {
              console.error('[Discover] Error saving to body_map_responses:', {
                error: bodyMapError,
                activityId,
                pass: pass.subject,
                zones,
              });
            } else {
              console.log('[Discover] Saved to body_map_responses:', {
                id: bodyMapResponseData?.id,
                activityId,
                pass: pass.subject,
                zonesCount: zones.length,
              });
            }
          } else {
            console.warn('[Discover] No zones to save for pass:', pass.subject);
          }
        }
        
        // Also save full answer to scene_responses for compatibility and detailed preferences
        // BUT: Skip for virtual body map scenes (they have string IDs like "bodymap-self-{userId}")
        // Virtual scenes are already saved in body_map_responses table
        // Only save to scene_responses if scene_id is a valid UUID (real scene from DB)
        const isVirtualScene = typeof currentScene.id === 'string' && currentScene.id.includes('bodymap-');
        let responseData: any = null;
        
        if (!isVirtualScene) {
          // Only save real scenes (with UUID) to scene_responses
          try {
            const { data: sceneResponseData, error: responseError } = await supabase
              .from('scene_responses')
              .upsert({
                user_id: user.id,
                scene_id: currentScene.id,
                question_asked: question.question,
                question_type: question.answerType,
                answer, // Full answer with zoneActionPreferences
                profile_updates: { dimensions: question.targetDimensions },
              }, {
                onConflict: 'user_id,scene_id'
              })
              .select('id')
              .single();
            
            responseData = sceneResponseData;
            
            if (responseError) {
              console.error('[Discover] Error saving body map to scene_responses:', responseError);
            } else {
              console.log('[Discover] Saved body map response to scene_responses:', {
                sceneId: currentScene.id,
                responseId: responseData?.id,
              });
            }
          } catch (error) {
            console.error('[Discover] Exception saving body map to scene_responses:', error);
          }
        } else {
          console.log('[Discover] Skipping scene_responses save for virtual body map scene:', currentScene.id);
        }
        
        console.log('[Discover] Body map response summary:', {
          sceneId: currentScene.id,
          sceneSlug: currentScene.slug,
          isVirtual: isVirtualScene,
          responseId: responseData?.id || 'N/A (virtual scene)',
          passesCount: bodyMapAnswer.passes.length,
        });
          
        setLastResponseId(responseData?.id || null);
        setLastAnswer(answer);
        
        // Update preference profile from body map zone+action preferences
        // Use maybeSingle() to handle case where profile doesn't exist yet
        const { data: prefProfile, error: prefProfileError } = await supabase
          .from('preference_profiles')
          .select('preferences')
          .eq('user_id', user.id)
          .maybeSingle();

        if (prefProfileError) {
          console.error('[Discover] Error fetching preference profile:', prefProfileError);
        }

        const preferences = prefProfile?.preferences || {};
        
        // Process zone+action preferences from body map answer
        if (!preferences.body_map) {
          preferences.body_map = {};
        }
        
        const bodyMapPrefs = preferences.body_map as Record<string, any>;
        const sceneSlug = currentScene.slug || currentScene.id;
        
        // Store body map preferences by scene (self, partner-female, partner-male)
        const zoneActionPrefs = bodyMapAnswer.passes.map((pass: any) => ({
          subject: pass.subject,
          gender: pass.gender,
          zoneActionPreferences: pass.zoneActionPreferences || {},
        }));
        
        bodyMapPrefs[sceneSlug] = {
          zoneActionPreferences: zoneActionPrefs,
          updatedAt: new Date().toISOString(),
        };
        
        console.log('[Discover] Prepared body map preferences for scene:', {
          sceneSlug,
          passesCount: zoneActionPrefs.length,
          totalZones: zoneActionPrefs.reduce((sum, p) => sum + Object.keys(p.zoneActionPreferences || {}).length, 0),
        });
        
        // Also extract specific preferences for profile signals
        // For example: if user loves spanking on buttocks, boost spanking tag
        for (const pass of bodyMapAnswer.passes) {
          if (pass.zoneActionPreferences) {
            for (const [zoneId, actionPrefs] of Object.entries(pass.zoneActionPreferences)) {
              const actions = actionPrefs as Record<string, 'love' | 'sometimes' | 'no' | null>;
              for (const [actionId, preference] of Object.entries(actions)) {
                if (preference === 'love' || preference === 'sometimes') {
                  // Boost relevant tags based on zone+action combinations
                  // This could be expanded to map zone+action to specific tags
                  const tagKey = `${actionId}_${pass.subject}`;
                  if (!bodyMapPrefs.tags) {
                    bodyMapPrefs.tags = {};
                  }
                  const tags = bodyMapPrefs.tags as Record<string, any>;
                  if (!tags[tagKey]) {
                    tags[tagKey] = { score: 0, count: 0 };
                  }
                  tags[tagKey].score += preference === 'love' ? 2 : 1;
                  tags[tagKey].count += 1;
                }
              }
            }
          }
        }
        
        // Save to preference_profiles (upsert to handle case where profile doesn't exist)
        const { data: updatedPrefProfile, error: updateError } = await supabase
          .from('preference_profiles')
          .upsert({
            user_id: user.id,
            preferences,
          }, {
            onConflict: 'user_id'
          })
          .select('id, preferences')
          .single();
        
        if (updateError) {
          console.error('[Discover] Error saving preference profile:', updateError);
        } else {
          console.log('[Discover] Successfully saved preference profile:', {
            profileId: updatedPrefProfile?.id,
            bodyMapScenes: Object.keys((updatedPrefProfile?.preferences as any)?.body_map || {}),
            sceneSlug,
            hasData: !!updatedPrefProfile?.preferences,
          });
          
          // Verify the data was saved correctly
          const savedBodyMap = (updatedPrefProfile?.preferences as any)?.body_map?.[sceneSlug];
          if (savedBodyMap) {
            console.log('[Discover] Verified saved body map data:', {
              sceneSlug,
              hasZoneActionPrefs: !!savedBodyMap.zoneActionPreferences,
              passesCount: savedBodyMap.zoneActionPreferences?.length || 0,
              updatedAt: savedBodyMap.updatedAt,
            });
          } else {
            console.warn('[Discover] WARNING: Body map data not found in saved preferences for scene:', sceneSlug);
          }
        }
        
        await moveToNextScene();
        return;
      }

      // Save response for non-body_map answers
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

      // V2: Handle composite scene flow
      const sceneV2 = currentScene as SceneV2;
      if (sceneV2.version === 2 && Array.isArray(sceneV2.elements)) {
        
        // Extract selected elements from answer
        const elementsSelected = 'selected' in answer && Array.isArray(answer.selected) 
          ? (answer.selected as string[]) 
          : [];
        
        setSelectedElements(elementsSelected);
        
        // If no elements selected, save as skipped
        if (elementsSelected.length === 0) {
          const sceneSlug = sceneV2.slug || sceneV2.id;

          // Save to scene_responses as skipped
          await supabase
            .from('scene_responses')
            .upsert({
              user_id: user.id,
              scene_id: currentScene.id,
              scene_slug: sceneSlug,
              question_asked: question.question,
              question_type: question.answerType,
              answer,
              elements_selected: [],
              element_responses: {},
              follow_up_answers: {},
              skipped: true,
              profile_updates: { dimensions: question.targetDimensions },
            }, {
              onConflict: 'user_id,scene_id'
            });
          
          await moveToNextScene();
          return;
        }
        
        // Get follow-ups for selected elements
        const followUps = getElementFollowUps(sceneV2, elementsSelected);
        
        // If there are follow-ups, transition to follow-up phase
        if (followUps.length > 0) {
          // Check if any element has follow-ups
          const hasFollowUps = followUps.some(({ followUps: elementFollowUps }) => 
            elementFollowUps && elementFollowUps.length > 0
          );
          
          if (hasFollowUps) {
            // Transition to follow-up phase
            setPhase('element_followup');
            // Don't return here - let the FollowUpFlow handle saving
            return;
          }
        }
        
        // No follow-ups or all follow-ups are optional - save immediately
        const sceneSlug = sceneV2.slug || sceneV2.id;

        // Save to scene_responses
        await supabase
          .from('scene_responses')
          .upsert({
            user_id: user.id,
            scene_id: currentScene.id,
            scene_slug: sceneSlug,
            question_asked: question.question,
            question_type: question.answerType,
            answer,
            elements_selected: elementsSelected,
            element_responses: {},
            follow_up_answers: {},
            skipped: false,
            profile_updates: { dimensions: question.targetDimensions },
          }, {
            onConflict: 'user_id,scene_id'
          });

        // Update tag_preferences based on selected elements
        try {
          await updateTagPreferences(
            supabase,
            user.id,
            sceneV2,
            elementsSelected,
            {}
          );
        } catch (err) {
          console.error('Failed to update tag preferences:', err);
        }
        
        // Update psychological profile for V2
        try {
          const signalUpdates = calculateSignalUpdates(answer, sceneV2);
          const testScoreUpdates = calculateTestScoreUpdates(answer, sceneV2);
          
          if (signalUpdates.length > 0 || Object.keys(testScoreUpdates).length > 0) {
            await updatePsychologicalProfile(
              supabase,
              user.id,
              signalUpdates,
              testScoreUpdates,
              sceneV2
            );
          }
        } catch (err) {
          console.error('Failed to update psychological profile:', err);
        }
        
        await moveToNextScene();
        return;
      }
      
      // Move to next scene
      await moveToNextScene();
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleElementFollowUpSubmit = async (followUpAnswer: Answer) => {
    if (!currentScene) return;
    
    const sceneV2 = currentScene as SceneV2;
    if (sceneV2.version !== 2 || !Array.isArray(sceneV2.elements)) return;
    const currentFollowUp = currentElementFollowUps[currentFollowUpIndex];
    
    if (!currentFollowUp) {
      await moveToNextScene();
      return;
    }
    
    // Save follow-up answer
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Update scene response with follow-up data
      const { data: existingResponse } = await supabase
        .from('scene_responses')
        .select('follow_up_answers')
        .eq('user_id', user.id)
        .eq('scene_id', currentScene.id)
        .single();
      
      const followUpAnswers = existingResponse?.follow_up_answers || {};
      followUpAnswers[`${currentFollowUp.elementId}_${currentFollowUp.followUpIndex}`] = followUpAnswer;
      
      await supabase
        .from('scene_responses')
        .update({ follow_up_answers: followUpAnswers })
        .eq('user_id', user.id)
        .eq('scene_id', currentScene.id);
      
      // Move to next follow-up or finish
      if (currentFollowUpIndex < currentElementFollowUps.length - 1) {
        setCurrentFollowUpIndex((prev) => prev + 1);
      } else {
        await moveToNextScene();
      }
    } catch (error) {
      console.error('Error submitting follow-up:', error);
      await moveToNextScene();
    }
  };

  const handleElementFollowUpSkip = async () => {
    // Move to next follow-up or finish
    if (currentFollowUpIndex < currentElementFollowUps.length - 1) {
      setCurrentFollowUpIndex((prev) => prev + 1);
    } else {
      await moveToNextScene();
    }
  };

  const handleDislike = async () => {
    // Handle body_map scenes differently
    if (currentScene?.question_type === 'body_map') {
      // For body_map, just skip to next without exclusion dialog
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const sceneSlug = currentScene.slug || currentScene.id;
          
          // Save as skipped in scene_responses
          await supabase
            .from('scene_responses')
            .upsert({
              user_id: user.id,
              scene_id: currentScene.id,
              question_type: 'body_map',
              question_asked: currentScene.title?.ru || currentScene.title?.en || '',
              answer: { skipped: true },
            }, {
              onConflict: 'user_id,scene_id'
            });
        }
      } catch (error) {
        console.error('Error saving skipped body map:', error);
      }
      
      // Move to next body map or regular scenes
      await moveToNextScene();
      return;
    }
    
    // For V2 composite scenes, save as skipped
    const sceneV2 = currentScene as SceneV2;
    if (sceneV2.version === 2 && Array.isArray(sceneV2.elements)) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const sceneSlug = sceneV2.slug || sceneV2.id;

          // Save to scene_responses as skipped
          await supabase
            .from('scene_responses')
            .upsert({
              user_id: user.id,
              scene_id: currentScene.id,
              scene_slug: sceneSlug,
              elements_selected: [],
              element_responses: {},
              skipped: true,
            }, {
              onConflict: 'user_id,scene_id'
            });
        }
      } catch (error) {
        console.error('Error saving skipped scene:', error);
      }
    }
    
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
      // But still save as skipped in scene_responses for V2 scenes
      // Handle body_map scenes differently
      if (currentScene?.question_type === 'body_map') {
        // For body_map, save as skipped in scene_responses
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('scene_responses')
              .upsert({
                user_id: user.id,
                scene_id: currentScene.id,
                question_type: 'body_map',
                question_asked: currentScene.title?.ru || currentScene.title?.en || '',
                answer: { skipped: true },
              }, {
                onConflict: 'user_id,scene_id'
              });
          }
        } catch (error) {
          console.error('Error saving skipped body map:', error);
        }
        await moveToNextScene();
      } else {
        // For V2 composite scenes
        const sceneV2 = currentScene as SceneV2;
        if (sceneV2.version === 2 && Array.isArray(sceneV2.elements)) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const sceneSlug = sceneV2.slug || sceneV2.id;

              // Save to scene_responses as skipped
              await supabase
                .from('scene_responses')
                .upsert({
                  user_id: user.id,
                  scene_id: currentScene.id,
                  scene_slug: sceneSlug,
                  elements_selected: [],
                  element_responses: {},
                  skipped: true,
                }, {
                  onConflict: 'user_id,scene_id'
                });
            }
          } catch (error) {
            console.error('Error saving skipped scene:', error);
          }
        }

        // Move to next scene (only for regular scenes, not body_map)
        if (discoveryStage === 'scenes') {
          if (currentIndex < scenes.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            await fetchScenes();
          }
        } else {
          // Body Map stage - move to next activity
          await moveToNextScene();
        }
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

  // Show empty state only for regular scenes, not for Body Map
  // Only show if we're not loading and have actually tried to fetch scenes
  if (discoveryStage === 'scenes' && scenes.length === 0 && !loading && !questionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <p className="text-muted-foreground mb-4">
          {t('allScenesAnswered', locale)}
        </p>
        <Button 
          onClick={async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await fetchRegularScenes(user.id);
            }
          }} 
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('checkForNew', locale)}
        </Button>
      </div>
    );
  }

  // Show empty state for Body Map if no activities found
  if (discoveryStage === 'body_map' && bodyMapActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <p className="text-muted-foreground mb-4">
          {locale === 'ru' ? 'Body Map activities не найдены' : 'Body Map activities not found'}
        </p>
        <Button onClick={skipBodyMap} variant="outline">
          {locale === 'ru' ? 'Перейти к сценам' : 'Go to scenes'}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Progress indicator */}
      <div className="text-center text-sm text-muted-foreground">
        {discoveryStage === 'body_map' ? (
          <span>
            {locale === 'ru' 
              ? `Body Map: ${currentBodyMapIndex + 1} из ${bodyMapActivities.length}`
              : `Body Map: ${currentBodyMapIndex + 1} of ${bodyMapActivities.length}`}
          </span>
        ) : (
          <span>
            {t('questionsAnswered', locale, { count: answeredCount })}
          </span>
        )}
      </div>

      {/* Skip Body Map button - only show if question is not loaded yet */}
      {discoveryStage === 'body_map' && !question && !questionLoading && (
        <div className="flex justify-end">
          <Button 
            onClick={skipBodyMap} 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground"
          >
            {locale === 'ru' ? 'Пропустить Body Map' : 'Skip Body Map'}
          </Button>
        </div>
      )}

      {/* Scene card - hide for body_map scenes */}
      <AnimatePresence mode="wait">
        {currentScene && question?.answerType !== 'body_map' && (
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            {/* Use CompositeSceneView for V2 scenes, SceneCard for others */}
            {isV2Scene && (currentScene as SceneV2).version === 2 ? (
              <CompositeSceneView scene={currentScene as SceneV2} locale={locale} />
            ) : (
              <SceneCard scene={currentScene} />
            )}
          </motion.div>
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
                  <>
                    {/* Use ElementSelector for V2 scenes with elements, MultipleChoiceAnswer for others */}
                    {isV2Scene && currentScene && (currentScene as SceneV2).version === 2 && Array.isArray((currentScene as SceneV2).elements) ? (
                      <ElementSelector
                        elements={(currentScene as SceneV2).elements}
                        selectedElements={selectedElements}
                        onSelectionChange={setSelectedElements}
                        onSubmit={(selected) => handleSubmit({ selected })}
                        onSkip={async () => {
                          if (discoveryStage === 'body_map') {
                            await moveToNextScene();
                          } else if (currentIndex < scenes.length - 1) {
                            setCurrentIndex((prev) => prev + 1);
                          } else {
                            await fetchScenes();
                          }
                        }}
                        locale={locale}
                        loading={submitting}
                        minSelections={(currentScene as SceneV2).question?.min_selections || 0}
                        maxSelections={(currentScene as SceneV2).question?.max_selections}
                        questionText={question.question}
                      />
                    ) : (
                      <MultipleChoiceAnswer
                        options={question.options}
                        allowMultiple={question.allowMultiple}
                        onSubmit={(selected) => handleSubmit({ selected })}
                        loading={submitting}
                      />
                    )}
                  </>
                )}

                {question.answerType === 'trinary' && (
                  <TrinaryAnswer
                    onSubmit={(value) => handleSubmit({ value })}
                    loading={submitting}
                  />
                )}

                {question.answerType === 'body_map' && currentScene && (() => {
                  const sceneId = currentScene.id;
                  const bodyMapConfig = bodyMapConfigs[sceneId];
                  const mainQuestion = bodyMapMainQuestions[sceneId];
                  
                  // If config is not set, build from scene data
                  if (!bodyMapConfig) {
                    console.warn('[Discover] BodyMapConfig not found for sceneId:', sceneId, 'building from scene data');
                    const aiContext = (currentScene as any).ai_context || {};
                    const questionConfig = (currentScene as any).question_config || {};
                    const zones = (aiContext as any).zones;
                    const availableZones = (zones && typeof zones === 'object' && 'available' in zones) 
                      ? zones.available 
                      : [];
                    const fallbackConfig = {
                      action: aiContext.action || questionConfig.action || 'universal',
                      passes: (aiContext.passes || questionConfig.passes || []).map((p: any) => ({
                        subject: p.id === 'give' || p.id === 'receive' ? p.id : (p.subject || 'give'),
                        question: p.question || { ru: '', en: '' },
                      })),
                      availableZones: availableZones,
                    };
                    console.log('[Discover] Using fallback bodyMapConfig:', fallbackConfig);
                    return (
                      <BodyMapAnswer
                        key={`body-map-${currentScene.id}`}
                        mainQuestion={mainQuestion || (() => {
                          // Fallback with context based on scene
                          if (currentScene?.slug === 'bodymap-self') {
                            return {
                              ru: 'Где тебе нравится или не нравится, когда партнёр(ша) тебя касается? Нажми на зону, чтобы выбрать действия.',
                              en: 'Where do you like or dislike your partner touching you? Tap a zone to select actions.',
                            };
                          } else if (currentScene?.slug === 'bodymap-partner-female') {
                            return {
                              ru: 'Где ты любишь или не любишь касаться партнёрши? Нажми на зону, чтобы выбрать действия.',
                              en: 'Where do you like or dislike touching your partner? Tap a zone to select actions.',
                            };
                          } else {
                            return {
                              ru: 'Где ты любишь или не любишь касаться партнёра? Нажми на зону, чтобы выбрать действия.',
                              en: 'Where do you like or dislike touching your partner? Tap a zone to select actions.',
                            };
                          }
                        })()}
                        config={fallbackConfig}
                        partnerGender={(() => {
                          if (currentScene?.slug === 'bodymap-self') {
                            return (userProfile?.gender === 'male' || userProfile?.gender === 'female')
                              ? userProfile.gender
                              : 'male';
                          } else if (currentScene?.slug === 'bodymap-partner-female') {
                            return 'female';
                          } else if (currentScene?.slug === 'bodymap-partner-male') {
                            return 'male';
                          }
                          return 'male';
                        })()}
                        userGender={(() => {
                          if (currentScene?.slug === 'bodymap-self') {
                            return (userProfile?.gender === 'male' || userProfile?.gender === 'female')
                              ? userProfile.gender
                              : 'male';
                          } else if (currentScene?.slug === 'bodymap-partner-female') {
                            return 'female';
                          } else if (currentScene?.slug === 'bodymap-partner-male') {
                            return 'male';
                          }
                          return 'male';
                        })()}
                        onSubmit={(answer) => handleSubmit(answer)}
                        loading={submitting}
                        locale={locale}
                        zoneFirstMode={true}
                      />
                    );
                  }
                  
                  console.log('[Discover] Rendering BodyMapAnswer, answerType:', question.answerType, 'hasConfig:', !!bodyMapConfig, 'sceneId:', sceneId);
                  
                  // Determine body gender from scene slug/tags
                  // Logic: 
                  // - bodymap-self: shows user's own body (user's gender)
                  // - bodymap-partner-female: shows female partner's body
                  // - bodymap-partner-male: shows male partner's body
                  // Example: User M interested in F → shows M (self) first, then F (partner)
                  let bodyGender: 'male' | 'female' = 'male';
                  if (currentScene?.slug === 'bodymap-self') {
                    // For self body map, use user's gender (e.g., M user sees M body)
                    bodyGender = (userProfile?.gender === 'male' || userProfile?.gender === 'female')
                      ? userProfile.gender
                      : 'male';
                    console.log('[Discover] Self body map - using user gender:', bodyGender, 'userProfile:', userProfile?.gender);
                  } else if (currentScene?.slug === 'bodymap-partner-female') {
                    bodyGender = 'female';
                    console.log('[Discover] Partner body map - female');
                  } else if (currentScene?.slug === 'bodymap-partner-male') {
                    bodyGender = 'male';
                    console.log('[Discover] Partner body map - male');
                  } else if (currentScene?.tags?.includes('female')) {
                    bodyGender = 'female';
                  } else if (currentScene?.tags?.includes('male')) {
                    bodyGender = 'male';
                  }
                  
                  return (
                    <BodyMapAnswer
                      key={`body-map-${currentScene.id}`}
                      mainQuestion={mainQuestion}
                      config={bodyMapConfig}
                      partnerGender={bodyGender}
                      userGender={bodyGender}
                      onSubmit={(answer) => handleSubmit(answer)}
                      loading={submitting}
                      locale={locale}
                      zoneFirstMode={true}
                    />
                  );
                })()}
              </div>
            ) : null}
          </motion.div>
        )}

        {phase === 'element_followup' && currentScene && (currentScene as SceneV2).version === 2 && (
          <motion.div
            key="element-followup-phase"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FollowUpFlow
              followUps={getElementFollowUps(currentScene as SceneV2, selectedElements)}
              onComplete={async (responses) => {
                // Save all follow-up responses
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) return;

                  const sceneV2 = currentScene as SceneV2;
                  const sceneSlug = sceneV2.slug || sceneV2.id;

                  // Save to scene_responses
                  await supabase
                    .from('scene_responses')
                    .upsert({
                      user_id: user.id,
                      scene_id: currentScene.id,
                      scene_slug: sceneSlug,
                      question_asked: question?.question || '',
                      question_type: question?.answerType || 'multiple_choice',
                      answer: { selected: selectedElements },
                      elements_selected: selectedElements,
                      element_responses: responses,
                      follow_up_answers: responses,
                      skipped: false,
                      profile_updates: { dimensions: question?.targetDimensions || [] },
                    }, {
                      onConflict: 'user_id,scene_id'
                    });

                  // Update tag_preferences based on selected elements and follow-up responses
                  try {
                    await updateTagPreferences(
                      supabase,
                      user.id,
                      sceneV2,
                      selectedElements,
                      responses
                    );
                  } catch (err) {
                    console.error('Failed to update tag preferences:', err);
                  }

                  // Update psychological profile
                  try {
                    const answer = { selected: selectedElements };
                    const signalUpdates = calculateSignalUpdates(answer, sceneV2);
                    const testScoreUpdates = calculateTestScoreUpdates(answer, sceneV2);
                    
                    if (signalUpdates.length > 0 || Object.keys(testScoreUpdates).length > 0) {
                      await updatePsychologicalProfile(
                        supabase,
                        user.id,
                        signalUpdates,
                        testScoreUpdates,
                        sceneV2
                      );
                    }
                  } catch (err) {
                    console.error('Failed to update psychological profile:', err);
                  }

                  await moveToNextScene();
                } catch (error) {
                  console.error('Error saving follow-up responses:', error);
                  await moveToNextScene();
                }
              }}
              onSkip={handleElementFollowUpSkip}
              locale={locale}
              loading={submitting}
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
            {t('notForMe', locale)}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              // Handle body_map scenes
              if (currentScene?.question_type === 'body_map') {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    // Save as skipped in scene_responses
                    await supabase
                      .from('scene_responses')
                      .upsert({
                        user_id: user.id,
                        scene_id: currentScene.id,
                        question_type: 'body_map',
                        question_asked: currentScene.title?.ru || currentScene.title?.en || '',
                        answer: { skipped: true },
                      }, {
                        onConflict: 'user_id,scene_id'
                      });
                  }
                } catch (error) {
                  console.error('Error saving skipped body map:', error);
                }
                await moveToNextScene();
              } else if (discoveryStage === 'scenes') {
                // Regular scenes skip
                if (currentIndex < scenes.length - 1) {
                  setCurrentIndex((prev) => prev + 1);
                } else {
                  await fetchScenes();
                }
              } else {
                await moveToNextScene();
              }
            }}
            disabled={submitting}
          >
            {t('skip', locale)}
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
