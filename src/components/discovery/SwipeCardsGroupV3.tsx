'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { X, Heart, Flame, ChevronLeft, ArrowDown } from 'lucide-react';
import type { Locale, SceneV2Extended } from '@/lib/types';

// Response values: NO = 0, YES = 1, VERY = 2, PARTNER_REQUEST = 3
export type SwipeResponseValue = 0 | 1 | 2 | 3;

export interface SwipeCardResponse {
  sceneSlug: string;
  value: SwipeResponseValue;
}

interface SwipeCardsGroupV3Props {
  scenes: SceneV2Extended[];
  locale?: Locale;
  onComplete: (responses: SwipeCardResponse[]) => void;
  onBack?: () => void;
  loading?: boolean;
  showBackButton?: boolean;
}

/**
 * Swipe cards group component for V3 scene architecture.
 *
 * Shows a series of scenes as swipeable cards (like onboarding).
 * Used for clarification groups like bondage-type (6 cards), positions (8 cards).
 *
 * Swipe directions:
 * - Left (0): No / Not interested
 * - Right (1): Yes / Interested
 * - Up (2): Very / Love it
 * - Down (3): If partner asks / Would do for partner
 */
export function SwipeCardsGroupV3({
  scenes,
  locale = 'ru',
  onComplete,
  onBack,
  loading = false,
  showBackButton = true,
}: SwipeCardsGroupV3Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<SwipeCardResponse[]>([]);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

  const currentScene = scenes[currentIndex];
  const progress = scenes.length > 0 ? ((currentIndex + 1) / scenes.length) * 100 : 0;

  // Handle swipe response
  const handleResponse = useCallback(async (value: SwipeResponseValue) => {
    if (!currentScene || loading) return;

    // Map value to direction animation
    setDirection(value === 0 ? 'left' : value === 1 ? 'right' : value === 2 ? 'up' : 'down');

    // Record response
    const newResponse: SwipeCardResponse = {
      sceneSlug: currentScene.slug,
      value,
    };
    const newResponses = [...responses, newResponse];
    setResponses(newResponses);

    // Wait for animation
    await new Promise((r) => setTimeout(r, 300));
    setDirection(null);

    // Check if this was the last scene
    if (currentIndex >= scenes.length - 1) {
      onComplete(newResponses);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentScene, currentIndex, scenes.length, responses, onComplete, loading]);

  // Handle drag gesture
  const handleDragEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocityThreshold = 500;

    // Swipe up = VERY (2)
    if (info.offset.y < -threshold || info.velocity.y < -velocityThreshold) {
      handleResponse(2);
      return;
    }

    // Swipe down = PARTNER_REQUEST (3)
    if (info.offset.y > threshold || info.velocity.y > velocityThreshold) {
      handleResponse(3);
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
  }, [handleResponse]);

  // Go back one card
  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      // Remove last response
      setResponses((prev) => prev.slice(0, -1));
      setCurrentIndex((prev) => prev - 1);
    } else if (onBack) {
      onBack();
    }
  }, [currentIndex, onBack]);

  if (scenes.length === 0) {
    return null;
  }

  if (!currentScene) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No scenes</p>
      </div>
    );
  }

  const title = currentScene.title[locale] || currentScene.title.ru || currentScene.title.en;
  const description = currentScene.user_description?.[locale] ||
    currentScene.user_description?.ru ||
    currentScene.ai_description?.[locale] ||
    currentScene.ai_description?.ru || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col safe-area-all">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            disabled={currentIndex === 0 && !onBack}
            className="tap-target text-white hover:bg-white/10"
          >
            <ChevronLeft className="size-6" />
          </Button>
        )}

        <div className="text-sm text-gray-400">
          {currentIndex + 1} / {scenes.length}
        </div>

        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
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
            key={currentScene.slug}
            className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl touch-none"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
              y: direction === 'up' ? -300 : direction === 'down' ? 300 : 0,
              rotate: direction === 'left' ? -15 : direction === 'right' ? 15 : 0,
            }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            drag={!loading}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            style={{ cursor: loading ? 'default' : 'grab' }}
            whileDrag={{ cursor: 'grabbing' }}
          >
            {/* Background image carousel */}
            <ImageCarousel
              mainImage={currentScene.image_url}
              variants={currentScene.image_variants}
              alt={title}
              className="absolute inset-0"
              imageClassName="w-full h-full object-cover"
              autoRotateInterval={5000}
              showDots={true}
              dotsPosition="top"
              placeholder={
                <div className="absolute inset-0 bg-gradient-to-br from-rose-400/30 to-pink-500/30 flex items-center justify-center">
                  <span className="text-6xl opacity-50">✨</span>
                </div>
              }
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Swipe indicators */}
            <motion.div
              className="absolute top-8 left-8 px-4 py-2 rounded-full bg-red-500/90 text-white font-bold text-xl rotate-[-15deg]"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: direction === 'left' ? 1 : 0, scale: direction === 'left' ? 1 : 0.5 }}
            >
              {locale === 'ru' ? 'НЕТ' : 'NOPE'}
            </motion.div>

            <motion.div
              className="absolute top-8 right-8 px-4 py-2 rounded-full bg-green-500/90 text-white font-bold text-xl rotate-[15deg]"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: direction === 'right' ? 1 : 0, scale: direction === 'right' ? 1 : 0.5 }}
            >
              {locale === 'ru' ? 'ДА' : 'YES'}
            </motion.div>

            <motion.div
              className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-pink-500/90 text-white font-bold text-xl"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: direction === 'up' ? 1 : 0, scale: direction === 'up' ? 1 : 0.5 }}
            >
              {locale === 'ru' ? 'ОЧЕНЬ!' : 'VERY!'}
            </motion.div>

            <motion.div
              className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-amber-500/90 text-white font-bold text-lg"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: direction === 'down' ? 1 : 0, scale: direction === 'down' ? 1 : 0.5 }}
            >
              {locale === 'ru' ? 'ЕСЛИ ПОПРОСИТ' : 'IF ASKED'}
            </motion.div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-2xl font-bold mb-1">{title}</h2>
              {description && (
                <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                  {description}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 p-6 safe-area-bottom">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-14 border-2 border-red-400 text-red-500 hover:bg-red-500/10 bg-transparent"
          onClick={() => handleResponse(0)}
          disabled={loading}
        >
          <X className="size-7" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-12 border-2 border-amber-400 text-amber-500 hover:bg-amber-500/10 bg-transparent"
          onClick={() => handleResponse(3)}
          disabled={loading}
        >
          <ArrowDown className="size-6" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-16 border-2 border-pink-500 text-pink-500 hover:bg-pink-500/10 bg-transparent"
          onClick={() => handleResponse(2)}
          disabled={loading}
        >
          <Flame className="size-8" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-14 border-2 border-green-400 text-green-500 hover:bg-green-500/10 bg-transparent"
          onClick={() => handleResponse(1)}
          disabled={loading}
        >
          <Heart className="size-7" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center pb-4 text-xs text-gray-500 safe-area-bottom">
        <span className="text-red-400">←</span> {locale === 'ru' ? 'Нет' : 'No'} &nbsp;|&nbsp;
        <span className="text-green-400">→</span> {locale === 'ru' ? 'Да' : 'Yes'} &nbsp;|&nbsp;
        <span className="text-pink-400">↑</span> {locale === 'ru' ? 'Очень' : 'Very'} &nbsp;|&nbsp;
        <span className="text-amber-400">↓</span> {locale === 'ru' ? 'если попросит' : 'if asked'}
      </div>
    </div>
  );
}
