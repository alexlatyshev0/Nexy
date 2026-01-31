'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import type { Locale, SceneV2Extended } from '@/lib/types';

interface ImageSelectionV3Props {
  scene: SceneV2Extended;
  locale?: Locale;
  allowMultiple?: boolean;
  onSubmit: (selected: string[]) => void;
  loading?: boolean;
}

/**
 * Image selection component for V3 scene architecture.
 *
 * Displays a grid of small selectable images.
 * Used for selecting items like lingerie, positions, settings, etc.
 */
export function ImageSelectionV3({
  scene,
  locale = 'ru',
  allowMultiple = true,
  onSubmit,
  loading = false,
}: ImageSelectionV3Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const options = scene.image_options || [];
  const questionText = scene.question?.text?.[locale] || scene.question?.text?.ru || '';
  const title = scene.title[locale] || scene.title.ru;

  const handleToggle = (optionId: string) => {
    if (allowMultiple) {
      setSelected((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelected([optionId]);
    }
  };

  const canSubmit = selected.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black"
    >
      {/* Header section */}
      <div className="px-4 py-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-semibold text-white mb-2"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white text-lg mb-2"
        >
          {questionText}
        </motion.p>

        {allowMultiple && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-400"
          >
            {locale === 'ru' ? '(выбери всё, что нравится)' : '(select all you like)'}
          </motion.p>
        )}
      </div>

      {/* Image grid */}
      <div className="flex-1 px-4 py-2 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {options.map((option, index) => {
            const isSelected = selected.includes(option.id);
            const label = option.label?.[locale] || option.label?.ru;

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index + 0.3 }}
                onClick={() => handleToggle(option.id)}
                disabled={loading}
                className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                  isSelected
                    ? 'ring-3 ring-pink-500 scale-[1.02]'
                    : 'ring-1 ring-gray-700 hover:ring-pink-500/50'
                }`}
              >
                {/* Image */}
                {option.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={option.image_url}
                    alt={label || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-rose-200/20 to-pink-300/20 flex items-center justify-center">
                    <span className="text-3xl">✨</span>
                  </div>
                )}

                {/* Selection overlay */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-pink-500/20 flex items-center justify-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>
                )}

                {/* Label overlay */}
                {label && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <span className="text-white text-sm font-medium">{label}</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Submit button */}
      <div className="p-4 border-t border-gray-800">
        <Button
          onClick={() => onSubmit(selected)}
          disabled={loading || !canSubmit}
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
