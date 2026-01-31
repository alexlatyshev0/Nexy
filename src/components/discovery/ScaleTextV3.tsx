'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { Locale, SceneV2Extended } from '@/lib/types';

interface ScaleTextV3Props {
  scene: SceneV2Extended;
  locale?: Locale;
  onSubmit: (value: number) => void;
  loading?: boolean;
}

/**
 * Scale text component for V3 scene architecture.
 *
 * Displays a text question with a scale answer, without an image.
 * Used for abstract questions where an image isn't needed.
 */
export function ScaleTextV3({
  scene,
  locale = 'ru',
  onSubmit,
  loading = false,
}: ScaleTextV3Props) {
  const [value, setValue] = useState(50);

  const title = scene.title[locale] || scene.title.ru;
  const questionText = scene.question?.text?.[locale] || scene.question?.text?.ru || title;

  const labels = {
    min: locale === 'ru' ? 'Совсем нет' : 'Not at all',
    max: locale === 'ru' ? 'Очень' : 'Very much',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black"
    >
      {/* Spacer for centering content */}
      <div className="flex-1" />

      {/* Content */}
      <div className="px-6 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-white text-center mb-8"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white text-lg text-center mb-12"
        >
          {questionText}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Value display */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{value}</span>
            </div>
          </div>

          {/* Slider */}
          <div className="px-4">
            <Slider
              value={[value]}
              onValueChange={([v]) => setValue(v)}
              min={0}
              max={100}
              step={1}
              disabled={loading}
              className="w-full"
            />
          </div>

          {/* Labels */}
          <div className="flex justify-between text-sm text-gray-400 px-4">
            <span>{labels.min}</span>
            <span>{labels.max}</span>
          </div>
        </motion.div>
      </div>

      {/* Spacer for centering content */}
      <div className="flex-1" />

      {/* Submit button */}
      <div className="p-4 border-t border-gray-800">
        <Button
          onClick={() => onSubmit(value)}
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium"
          size="lg"
        >
          {loading
            ? locale === 'ru'
              ? 'Сохранение...'
              : 'Saving...'
            : locale === 'ru'
            ? 'Готово'
            : 'Done'}
        </Button>
      </div>
    </motion.div>
  );
}
