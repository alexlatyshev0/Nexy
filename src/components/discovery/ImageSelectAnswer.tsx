'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { t } from '@/lib/locale';
import type { Locale, LocalizedString } from '@/lib/types';

interface ImageOption {
  id: string;
  label: LocalizedString;
  image_url?: string;
}

interface ImageSelectAnswerProps {
  options: ImageOption[];
  allowMultiple?: boolean;
  onSubmit: (selected: string[]) => void;
  onSkip?: () => void;
  locale?: Locale;
  loading?: boolean;
  minSelections?: number;
  maxSelections?: number;
}

export function ImageSelectAnswer({
  options,
  allowMultiple = false,
  onSubmit,
  onSkip,
  locale = 'ru',
  loading = false,
  minSelections = allowMultiple ? 0 : 1,
  maxSelections,
}: ImageSelectAnswerProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const handleToggle = (optionId: string) => {
    if (allowMultiple) {
      if (selected.includes(optionId)) {
        setSelected(selected.filter((id) => id !== optionId));
      } else {
        if (maxSelections && selected.length >= maxSelections) {
          return;
        }
        setSelected([...selected, optionId]);
      }
    } else {
      setSelected([optionId]);
    }
  };

  const canSubmit = selected.length >= minSelections;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => {
          const isSelected = selected.includes(option.id);
          const label = option.label[locale] || option.label.en || option.label.ru || option.id;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <button
                onClick={() => handleToggle(option.id)}
                className={`relative w-full aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                  isSelected
                    ? 'border-primary shadow-lg ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {option.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={option.image_url}
                    alt={label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-rose-200 to-pink-300 flex items-center justify-center">
                    <span className="text-4xl">🖼️</span>
                  </div>
                )}
                
                {/* Overlay with label */}
                <div className={`absolute inset-0 bg-black/40 flex items-end transition-opacity ${
                  isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                }`}>
                  <div className="w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-2">
                      {allowMultiple && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggle(option.id)}
                          className="border-white"
                        />
                      )}
                      <span className="text-white font-medium text-sm">{label}</span>
                    </div>
                  </div>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  >
                    <span className="text-primary-foreground text-xs font-bold">✓</span>
                  </motion.div>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-2 pt-2">
        {onSkip && (
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={loading}
            className="flex-1"
          >
            {t('skip', locale || 'en')}
          </Button>
        )}
        <Button
          onClick={() => onSubmit(selected)}
          disabled={loading || !canSubmit}
          className="flex-1"
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
