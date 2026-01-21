'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/locale';
import type { Locale, LocalizedString } from '@/lib/types';

interface RoleOption {
  id: 'give' | 'receive' | 'both';
  label: LocalizedString;
}

interface RoleAnswerProps {
  options?: RoleOption[];
  onSubmit: (value: 'give' | 'receive' | 'both') => void;
  onSkip?: () => void;
  locale?: Locale;
  loading?: boolean;
}

const defaultOptions: RoleOption[] = [
  {
    id: 'give',
    label: { ru: 'Давать', en: 'Give' },
  },
  {
    id: 'receive',
    label: { ru: 'Получать', en: 'Receive' },
  },
  {
    id: 'both',
    label: { ru: 'Оба', en: 'Both' },
  },
];

export function RoleAnswer({
  options = defaultOptions,
  onSubmit,
  onSkip,
  locale = 'ru',
  loading = false,
}: RoleAnswerProps) {
  const [selected, setSelected] = useState<'give' | 'receive' | 'both' | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid gap-2">
        {options.map((option, index) => {
          const isSelected = selected === option.id;
          const label = option.label[locale] || option.label.en || option.label.ru || option.id;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <button
                onClick={() => setSelected(option.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-primary-foreground"
                      />
                    )}
                  </div>
                  <span className="flex-1 font-medium">{label}</span>
                </div>
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
          onClick={() => selected && onSubmit(selected)}
          disabled={loading || !selected}
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
