'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import type { Locale, SceneV2Extended } from '@/lib/types';

interface PairedTextV3Props {
  scene: SceneV2Extended;
  locale?: Locale;
  onSubmit: (answers: { give: number; receive: number }) => void;
  loading?: boolean;
}

/**
 * Paired text component for V3 scene architecture.
 *
 * Displays two related text questions without images, each with a scale answer.
 * Used for questions like:
 * - "How do you like to initiate sex?" / "How do you like being invited?"
 * - "How do you like to talk about X?" / "How do you like when they talk about X?"
 */
export function PairedTextV3({
  scene,
  locale = 'ru',
  onSubmit,
  loading = false,
}: PairedTextV3Props) {
  const [giveValue, setGiveValue] = useState(50);
  const [receiveValue, setReceiveValue] = useState(50);
  const [activeQuestion, setActiveQuestion] = useState<'give' | 'receive'>('give');

  const pairedQuestions = scene.paired_questions;
  const title = scene.title[locale] || scene.title.ru;

  if (!pairedQuestions) {
    console.error('[PairedTextV3] No paired_questions provided');
    return null;
  }

  const giveText = pairedQuestions.give[locale] || pairedQuestions.give.ru;
  const receiveText = pairedQuestions.receive[locale] || pairedQuestions.receive.ru;

  const handleSubmit = () => {
    onSubmit({ give: giveValue, receive: receiveValue });
  };

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
      {/* Header */}
      <div className="px-6 py-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white mb-2"
        >
          {title}
        </motion.h1>
      </div>

      {/* Question tabs */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 p-1 bg-gray-800/50 rounded-lg">
          <button
            onClick={() => setActiveQuestion('give')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
              activeQuestion === 'give'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {locale === 'ru' ? 'Как ты делаешь' : 'How you do it'}
          </button>
          <button
            onClick={() => setActiveQuestion('receive')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
              activeQuestion === 'receive'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {locale === 'ru' ? 'Как нравится тебе' : 'How you like it'}
          </button>
        </div>
      </div>

      {/* Question and scale */}
      <div className="flex-1 px-6">
        {activeQuestion === 'give' ? (
          <motion.div
            key="give"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <p className="text-white text-lg text-center">{giveText}</p>

            <div className="space-y-4">
              <Slider
                value={[giveValue]}
                onValueChange={([v]) => setGiveValue(v)}
                min={0}
                max={100}
                step={1}
                disabled={loading}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>{labels.min}</span>
                <span className="text-pink-400 font-medium">{giveValue}</span>
                <span>{labels.max}</span>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={() => setActiveQuestion('receive')}
                className="text-pink-400 hover:text-pink-300"
              >
                {locale === 'ru' ? 'Далее →' : 'Next →'}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="receive"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <p className="text-white text-lg text-center">{receiveText}</p>

            <div className="space-y-4">
              <Slider
                value={[receiveValue]}
                onValueChange={([v]) => setReceiveValue(v)}
                min={0}
                max={100}
                step={1}
                disabled={loading}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>{labels.min}</span>
                <span className="text-pink-400 font-medium">{receiveValue}</span>
                <span>{labels.max}</span>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={() => setActiveQuestion('give')}
                className="text-gray-400 hover:text-gray-300"
              >
                {locale === 'ru' ? '← Назад' : '← Back'}
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Submit button */}
      <div className="p-4 border-t border-gray-800">
        <Button
          onClick={handleSubmit}
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
