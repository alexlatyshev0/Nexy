'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/locale';
import type { Locale, LocalizedString } from '@/lib/types';

interface IntensityAnswerProps {
  labels?: {
    min?: LocalizedString;
    max?: LocalizedString;
  };
  onSubmit: (value: number) => void;
  onSkip?: () => void;
  locale?: Locale;
  loading?: boolean;
  defaultValue?: number;
}

export function IntensityAnswer({
  labels,
  onSubmit,
  onSkip,
  locale = 'ru',
  loading = false,
  defaultValue = 50,
}: IntensityAnswerProps) {
  const [value, setValue] = useState<number>(defaultValue);

  const minLabel = labels?.min?.[locale] || labels?.min?.en || labels?.min?.ru || 
    (locale === 'ru' ? 'Мягко' : 'Gentle');
  const maxLabel = labels?.max?.[locale] || labels?.max?.en || labels?.max?.ru || 
    (locale === 'ru' ? 'Экстрим' : 'Extreme');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{minLabel}</span>
          <span className="text-sm font-medium">{maxLabel}</span>
        </div>
        
        <Slider
          value={[value]}
          onValueChange={(values) => setValue(values[0])}
          min={0}
          max={100}
          step={1}
          disabled={loading}
          className="w-full"
        />

        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{value}</div>
          <div className="text-sm text-muted-foreground">
            {locale === 'ru' ? 'Интенсивность' : 'Intensity'}
          </div>
        </div>
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
          onClick={() => onSubmit(value)}
          disabled={loading}
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
