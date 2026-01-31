'use client';

import { useState, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { ExperienceSelector, type ExperienceLevel } from './ExperienceSelector';
import { X, Heart, Flame, ArrowDown } from 'lucide-react';
import type { Scene, Locale } from '@/lib/types';

// Response values: NO = 0, YES = 1, VERY = 2, PARTNER_REQUEST = 3
export type SwipeResponseValue = 0 | 1 | 2 | 3;

interface SwipeableSceneCardProps {
  scene: Scene;
  locale?: Locale;
  onResponse: (value: SwipeResponseValue) => void;
  experience?: ExperienceLevel;
  onExperienceChange?: (value: ExperienceLevel) => void;
  showExperienceSelector?: boolean;
  loading?: boolean;
}

// Map intensity to visual indicator
const intensityLabels = ['', 'Мягко', 'Легко', 'Средне', 'Интенсивно', 'Экстрим'];
const intensityColors = ['', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];

/**
 * Single swipeable scene card for discovery.
 *
 * Swipe directions:
 * - Left (0): No / Not interested
 * - Right (1): Yes / Interested
 * - Up (2): Very / Love it
 * - Down (3): If partner asks / Would do for partner
 */
export function SwipeableSceneCard({
  scene,
  locale = 'ru',
  onResponse,
  experience,
  onExperienceChange,
  showExperienceSelector = true,
  loading = false,
}: SwipeableSceneCardProps) {
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

  // Handle response with animation
  const handleResponse = useCallback(async (value: SwipeResponseValue) => {
    if (loading) return;

    // Set direction for exit animation
    setDirection(value === 0 ? 'left' : value === 1 ? 'right' : value === 2 ? 'up' : 'down');

    // Wait for animation
    await new Promise((r) => setTimeout(r, 250));

    // Call parent handler
    onResponse(value);

    // Reset direction for next card
    setDirection(null);
  }, [loading, onResponse]);

  // Handle drag gesture
  const handleDragEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 80;
    const velocityThreshold = 400;

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

  // Get description
  const title = scene.title?.[locale] || scene.title?.ru || scene.title?.en || '';
  const description = scene.user_description?.[locale] || scene.user_description?.ru ||
                     scene.ai_description?.[locale] || scene.ai_description?.ru || '';

  // Placeholder emoji
  const getPlaceholderEmoji = () => {
    const tag = scene.tags?.[0] || scene.category || '';
    if (tag.includes('bondage')) return '🔗';
    if (tag.includes('blindfold')) return '🙈';
    if (tag.includes('dominan') || tag.includes('submiss')) return '👑';
    if (tag.includes('pain') || tag.includes('spank') || tag.includes('impact')) return '🔥';
    if (tag.includes('romanti') || tag.includes('tender')) return '💕';
    if (tag.includes('oral')) return '💋';
    if (tag.includes('roleplay')) return '🎭';
    if (tag.includes('exhibi') || tag.includes('voyeur')) return '👀';
    if (tag.includes('group')) return '👥';
    return '✨';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Swipeable card */}
      <motion.div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-xl touch-none bg-white"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
          y: direction === 'up' ? -300 : direction === 'down' ? 300 : 0,
          rotate: direction === 'left' ? -15 : direction === 'right' ? 15 : 0,
        }}
        transition={{ duration: 0.25 }}
        drag={!loading}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={1}
        onDragEnd={handleDragEnd}
        style={{ cursor: loading ? 'default' : 'grab' }}
        whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
      >
        {/* Square image section */}
        <div className="relative aspect-square bg-gradient-to-br from-rose-200 to-pink-300">
          <ImageCarousel
            mainImage={scene.image_url}
            variants={scene.image_variants}
            alt={title}
            className="absolute inset-0"
            imageClassName="w-full h-full object-cover"
            autoRotateInterval={5000}
            showDots={true}
            dotsPosition="top"
            placeholder={
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-7xl opacity-60">{getPlaceholderEmoji()}</span>
              </div>
            }
          />

          {/* Intensity badge */}
          {scene.intensity > 0 && (
            <Badge
              className={`absolute top-3 right-3 z-20 ${intensityColors[scene.intensity]} text-white border-0`}
            >
              {intensityLabels[scene.intensity]}
            </Badge>
          )}

          {/* Swipe indicators */}
          <motion.div
            className="absolute top-1/3 left-6 px-4 py-2 rounded-full bg-red-500/90 text-white font-bold text-xl rotate-[-15deg]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: direction === 'left' ? 1 : 0, scale: direction === 'left' ? 1 : 0.5 }}
          >
            {locale === 'ru' ? 'НЕТ' : 'NOPE'}
          </motion.div>

          <motion.div
            className="absolute top-1/3 right-6 px-4 py-2 rounded-full bg-green-500/90 text-white font-bold text-xl rotate-[15deg]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: direction === 'right' ? 1 : 0, scale: direction === 'right' ? 1 : 0.5 }}
          >
            {locale === 'ru' ? 'ДА' : 'YES'}
          </motion.div>

          <motion.div
            className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-pink-500/90 text-white font-bold text-xl"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: direction === 'up' ? 1 : 0, scale: direction === 'up' ? 1 : 0.5 }}
          >
            {locale === 'ru' ? 'ОЧЕНЬ!' : 'LOVE IT!'}
          </motion.div>

          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-amber-500/90 text-white font-bold text-lg"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: direction === 'down' ? 1 : 0, scale: direction === 'down' ? 1 : 0.5 }}
          >
            {locale === 'ru' ? 'ЕСЛИ ПОПРОСИТ' : 'IF ASKED'}
          </motion.div>
        </div>

        {/* White bottom section with text */}
        <div className="p-4 bg-white">
          {title && <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>}
          {description && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
              {description}
            </p>
          )}

          {/* Experience selector (optional) */}
          {showExperienceSelector && onExperienceChange && (
            <ExperienceSelector
              value={experience ?? null}
              onChange={onExperienceChange}
              locale={locale}
            />
          )}
        </div>
      </motion.div>

      {/* Action buttons (for accessibility / non-touch users) */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-12 border-2 border-red-400 text-red-500 hover:bg-red-500/10 bg-transparent"
          onClick={() => handleResponse(0)}
          disabled={loading}
          aria-label={locale === 'ru' ? 'Нет' : 'No'}
        >
          <X className="size-6" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-10 border-2 border-amber-400 text-amber-500 hover:bg-amber-500/10 bg-transparent"
          onClick={() => handleResponse(3)}
          disabled={loading}
          aria-label={locale === 'ru' ? 'Если попросит' : 'If asked'}
        >
          <ArrowDown className="size-5" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-14 border-2 border-pink-500 text-pink-500 hover:bg-pink-500/10 bg-transparent"
          onClick={() => handleResponse(2)}
          disabled={loading}
          aria-label={locale === 'ru' ? 'Очень' : 'Love it'}
        >
          <Flame className="size-7" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full size-12 border-2 border-green-400 text-green-500 hover:bg-green-500/10 bg-transparent"
          onClick={() => handleResponse(1)}
          disabled={loading}
          aria-label={locale === 'ru' ? 'Да' : 'Yes'}
        >
          <Heart className="size-6" />
        </Button>
      </div>

      {/* Swipe hints */}
      <div className="text-center text-xs text-muted-foreground">
        <span className="text-red-400">←</span> {locale === 'ru' ? 'Нет' : 'No'} &nbsp;|&nbsp;
        <span className="text-green-400">→</span> {locale === 'ru' ? 'Да' : 'Yes'} &nbsp;|&nbsp;
        <span className="text-pink-400">↑</span> {locale === 'ru' ? 'Очень' : 'Very'} &nbsp;|&nbsp;
        <span className="text-amber-400">↓</span> {locale === 'ru' ? 'если попросит' : 'if asked'}
      </div>
    </div>
  );
}
