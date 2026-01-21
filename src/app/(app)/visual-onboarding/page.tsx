'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { X, Heart, Flame, ChevronLeft, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

// Response values: NO = 0, YES = 1, VERY = 2
type ResponseValue = 0 | 1 | 2;

interface OnboardingScene {
  id: string;
  slug: string;
  role_direction: string;
  title: { ru: string; en: string };
  subtitle: { ru: string; en: string } | null;
  user_description: { ru: string; en: string } | null;
  image_url: string | null;
  image_prompt: string | null;
  onboarding_order: number;
  onboarding_conditional: boolean;
  onboarding_condition: string | null;
  onboarding_category: string | null;  // Explicit category (oral, body_fluids, power_dynamic, etc.)
  onboarding_direction: string | null; // give, receive, or null
  gates_scenes: string[];
}

// Placeholder images (will be replaced with AI-generated)
const PLACEHOLDER_IMAGES: Record<string, string> = {
  oral: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=1200&fit=crop',
  anal: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&h=1200&fit=crop',
  group: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&h=1200&fit=crop',
  toys: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop',
  roleplay: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop',
  romantic: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&h=1200&fit=crop',
  default: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=1200&fit=crop',
};

// Get category ID from scene - uses explicit column with fallback to slug parsing
function getCategoryId(scene: OnboardingScene): string {
  // Prefer explicit category column (added in migration 020)
  if (scene.onboarding_category) {
    return scene.onboarding_category;
  }

  // Fallback: parse from slug (legacy support)
  return getCategoryFromSlug(scene.slug);
}

// Legacy: Get category ID from slug (e.g., 'onboarding-oral-hetero-m' -> 'oral')
// Kept for backward compatibility during migration
function getCategoryFromSlug(slug: string): string {
  const withoutPrefix = slug.replace('onboarding-', '');

  // Handle known multi-word categories that use hyphens in slug but underscores in TypeScript
  const multiWordMappings: Record<string, string> = {
    'body-fluids': 'body_fluids',
    'dirty-talk': 'dirty_talk',
    'power-dom': 'power_dynamic',
    'power-sub': 'power_dynamic',
  };

  for (const [slugPart, category] of Object.entries(multiWordMappings)) {
    if (withoutPrefix.startsWith(slugPart)) {
      return category;
    }
  }

  // Single-word: take first part before orientation suffix
  const parts = withoutPrefix.split('-');
  return parts[0];
}

// Map user orientation to role_direction
function getOrientationFilter(gender: string | null, interestedIn: string | null): string[] {
  // Return matching role_directions based on user preferences
  const directions: string[] = ['universal'];

  if (gender === 'male' && interestedIn === 'female') {
    directions.push('m_to_f');
  } else if (gender === 'female' && interestedIn === 'male') {
    directions.push('f_to_m');
  } else if (gender === 'male' && interestedIn === 'male') {
    directions.push('mlm');
  } else if (gender === 'female' && interestedIn === 'female') {
    directions.push('wlw');
  } else if (interestedIn === 'both') {
    // Show both perspectives for bi users
    if (gender === 'male') {
      directions.push('m_to_f', 'mlm');
    } else if (gender === 'female') {
      directions.push('f_to_m', 'wlw');
    } else {
      directions.push('m_to_f', 'f_to_m');
    }
  } else {
    // Default to hetero
    directions.push('m_to_f', 'f_to_m');
  }

  return directions;
}

export default function VisualOnboardingPage() {
  const [scenes, setScenes] = useState<OnboardingScene[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [userOrientation, setUserOrientation] = useState<{ gender: string | null; interestedIn: string | null }>({
    gender: null,
    interestedIn: null,
  });
  const router = useRouter();
  const supabase = createClient();
  const locale = 'ru'; // TODO: get from user preferences

  // Load user profile and scenes from DB
  useEffect(() => {
    async function loadData() {
      // Get user profile for orientation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('gender, interested_in')
        .eq('id', user.id)
        .single();

      const gender = profile?.gender || null;
      const interestedIn = profile?.interested_in || null;
      setUserOrientation({ gender, interestedIn });

      // Get orientation filter
      const orientationFilter = getOrientationFilter(gender, interestedIn);

      // Load onboarding scenes
      const { data, error } = await supabase
        .from('scenes')
        .select('id, slug, role_direction, title, subtitle, user_description, image_url, image_prompt, onboarding_order, onboarding_conditional, onboarding_condition, onboarding_category, onboarding_direction, gates_scenes')
        .eq('category', 'onboarding')
        .in('role_direction', orientationFilter)
        .order('onboarding_order', { ascending: true });

      if (error) {
        console.error('Error loading scenes:', error);
        return;
      }

      // Group by category and pick one per category (prefer exact orientation match)
      const byCategory = new Map<string, OnboardingScene>();
      for (const scene of (data || []) as OnboardingScene[]) {
        const category = getCategoryId(scene);
        const existing = byCategory.get(category);

        // Prefer non-universal scenes
        if (!existing || (existing.role_direction === 'universal' && scene.role_direction !== 'universal')) {
          byCategory.set(category, scene);
        }
      }

      // Convert to array sorted by order
      const sortedScenes = Array.from(byCategory.values())
        .sort((a, b) => a.onboarding_order - b.onboarding_order);

      setScenes(sortedScenes);
      setLoading(false);
    }

    loadData();
  }, [supabase, router]);

  // Get visible scenes (filter conditionals based on current responses)
  const getVisibleScenes = useCallback(() => {
    return scenes.filter((scene) => {
      if (!scene.onboarding_conditional) return true;

      const rule = scene.onboarding_condition;
      if (!rule) return true;

      // Simple parser for conditions like "power-dom >= 1 OR rough-give >= 1"
      try {
        const evalCondition = (condition: string): boolean => {
          // Match category IDs with hyphens (e.g., oral-give, power-dom)
          const match = condition.match(/([\w-]+)\s*(>=|==|>|<)\s*(\d+)/);
          if (!match) return false;

          const [, categoryId, operator, valueStr] = match;
          const currentValue = responses[categoryId] ?? -1;
          const targetValue = parseInt(valueStr);

          switch (operator) {
            case '>=':
              return currentValue >= targetValue;
            case '==':
              return currentValue === targetValue;
            case '>':
              return currentValue > targetValue;
            case '<':
              return currentValue < targetValue;
            default:
              return false;
          }
        };

        // Handle OR conditions
        if (rule.includes(' OR ')) {
          return rule.split(' OR ').some((part) => evalCondition(part.trim()));
        }

        // Handle AND conditions
        if (rule.includes(' AND ')) {
          return rule.split(' AND ').every((part) => evalCondition(part.trim()));
        }

        return evalCondition(rule);
      } catch {
        return true; // Show on parse error
      }
    });
  }, [scenes, responses]);

  const visibleScenes = getVisibleScenes();
  const currentScene = visibleScenes[currentIndex];
  const progress = visibleScenes.length > 0
    ? ((currentIndex + 1) / visibleScenes.length) * 100
    : 0;

  // Handle swipe/response
  const handleResponse = async (value: ResponseValue) => {
    if (!currentScene) return;

    setDirection(value === 0 ? 'left' : value === 1 ? 'right' : 'up');

    // Get category ID from scene (uses explicit column or falls back to slug parsing)
    const categoryId = getCategoryId(currentScene);

    // Update responses
    const newResponses = { ...responses, [categoryId]: value };
    setResponses(newResponses);

    // Wait for animation
    await new Promise((r) => setTimeout(r, 300));
    setDirection(null);

    // Check if this was the last scene
    if (currentIndex >= visibleScenes.length - 1) {
      // Complete onboarding
      await saveResponses(newResponses);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Handle drag
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocityThreshold = 500;

    // Swipe up = VERY (2)
    if (info.offset.y < -threshold || info.velocity.y < -velocityThreshold) {
      handleResponse(2);
      return;
    }

    // Swipe left = NO (0)
    if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      handleResponse(0);
      return;
    }

    // Swipe right = YES (1)
    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      handleResponse(1);
      return;
    }
  };

  // Save responses to database
  const saveResponses = async (finalResponses: Record<string, ResponseValue>) => {
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Upsert onboarding_responses
      // Note: gates are computed automatically by database trigger (019_unified_gates.sql)
      const { error: responseError } = await supabase
        .from('onboarding_responses')
        .upsert({
          user_id: user.id,
          responses: finalResponses,
          completed: true,
          current_index: visibleScenes.length,
        }, { onConflict: 'user_id' });

      if (responseError) {
        console.error('Error saving responses:', responseError);
        alert('Error saving responses');
        setSaving(false);
        return;
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({ visual_onboarding_completed: true })
        .eq('id', user.id);

      // Navigate to discover
      router.push('/discover');
    } catch (error) {
      console.error('Error:', error);
      setSaving(false);
    }
  };

  // Go back one card
  const handleBack = () => {
    if (currentIndex > 0) {
      // Remove response for previous scene
      const prevScene = visibleScenes[currentIndex - 1];
      if (prevScene) {
        const categoryId = getCategoryId(prevScene);
        const newResponses = { ...responses };
        delete newResponses[categoryId];
        setResponses(newResponses);
      }
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (saving) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-muted-foreground">Saving your preferences...</p>
      </div>
    );
  }

  if (!currentScene) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No scenes found</p>
      </div>
    );
  }

  // Intro screen with swipe instructions
  if (showIntro) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 safe-area-all">
        <div className="max-w-sm w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Узнаем твои предпочтения</h1>
            <p className="text-muted-foreground">
              Свайпай карточки, чтобы рассказать что тебе нравится
            </p>
          </div>

          {/* Visual swipe diagram */}
          <div className="relative flex items-center justify-center py-8">
            {/* Left arrow */}
            <div className="absolute left-0 flex flex-col items-center gap-1">
              <ArrowLeft className="size-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Нет</span>
            </div>

            {/* Center card mockup */}
            <div className="relative">
              {/* Up arrow */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                <span className="text-xs text-primary font-medium">Очень!</span>
                <ArrowUp className="size-8 text-primary" />
              </div>

              {/* Card */}
              <div className="w-32 h-44 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center shadow-lg">
                <Flame className="size-10 text-primary/40" />
              </div>
            </div>

            {/* Right arrow */}
            <div className="absolute right-0 flex flex-col items-center gap-1">
              <ArrowRight className="size-8 text-green-500" />
              <span className="text-xs text-green-600 font-medium">Да</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-muted-foreground" />
              <span className="text-muted-foreground">Не моё</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-green-500" />
              <span className="text-green-600">Интересно</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-primary" />
              <span className="text-primary">Обожаю</span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => setShowIntro(false)}
          >
            Начать
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            16-20 карточек • ~2 минуты
          </p>
        </div>
      </div>
    );
  }

  // Get image URL - use scene's image_url if available, otherwise placeholder
  const categoryId = getCategoryId(currentScene);
  const imageUrl = currentScene.image_url || PLACEHOLDER_IMAGES[categoryId] || PLACEHOLDER_IMAGES.default;

  return (
    <div className="min-h-screen bg-background flex flex-col safe-area-all">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          disabled={currentIndex === 0}
          className="tap-target"
        >
          <ChevronLeft className="size-6" />
        </Button>

        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {visibleScenes.length}
        </div>

        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card container */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene.id}
            className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl touch-none"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
              y: direction === 'up' ? -300 : 0,
              rotate: direction === 'left' ? -15 : direction === 'right' ? 15 : 0,
            }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            style={{ cursor: 'grab' }}
            whileDrag={{ cursor: 'grabbing' }}
          >
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Swipe indicators */}
            <motion.div
              className="absolute top-8 left-8 px-4 py-2 rounded-full bg-red-500/90 text-white font-bold text-xl rotate-[-15deg]"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: direction === 'left' ? 1 : 0, scale: direction === 'left' ? 1 : 0.5 }}
            >
              NOPE
            </motion.div>

            <motion.div
              className="absolute top-8 right-8 px-4 py-2 rounded-full bg-green-500/90 text-white font-bold text-xl rotate-[15deg]"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: direction === 'right' ? 1 : 0, scale: direction === 'right' ? 1 : 0.5 }}
            >
              YES
            </motion.div>

            <motion.div
              className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-primary/90 text-white font-bold text-xl"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: direction === 'up' ? 1 : 0, scale: direction === 'up' ? 1 : 0.5 }}
            >
              VERY!
            </motion.div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-2xl font-bold mb-1">
                {currentScene.title[locale] || currentScene.title.en}
              </h2>
              {currentScene.subtitle && (
                <p className="text-white/70 text-sm mb-3">
                  {currentScene.subtitle[locale] || currentScene.subtitle.en}
                </p>
              )}
              {currentScene.user_description && (
                <p className="text-white/90 text-sm leading-relaxed">
                  {currentScene.user_description[locale] || currentScene.user_description.en}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-6 p-6 safe-area-bottom">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-16 border-2 border-red-400 text-red-500 hover:bg-red-50 touch-feedback"
          onClick={() => handleResponse(0)}
        >
          <X className="size-8" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-20 border-2 border-primary text-primary hover:bg-primary/10 touch-feedback"
          onClick={() => handleResponse(2)}
        >
          <Flame className="size-10" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-16 border-2 border-green-400 text-green-500 hover:bg-green-50 touch-feedback"
          onClick={() => handleResponse(1)}
        >
          <Heart className="size-8" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center pb-4 text-xs text-muted-foreground safe-area-bottom">
        <span className="text-red-400">Swipe left</span> = No &nbsp;|&nbsp;
        <span className="text-green-400">Swipe right</span> = Yes &nbsp;|&nbsp;
        <span className="text-primary">Swipe up</span> = Very!
      </div>
    </div>
  );
}
