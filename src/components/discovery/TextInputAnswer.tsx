'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/locale';
import type { Locale, LocalizedString } from '@/lib/types';

interface TextInputAnswerProps {
  placeholder?: LocalizedString;
  onSubmit: (value: string) => void;
  onSkip?: () => void;
  locale?: Locale;
  loading?: boolean;
  required?: boolean;
}

export function TextInputAnswer({
  placeholder,
  onSubmit,
  onSkip,
  locale = 'ru',
  loading = false,
  required = false,
}: TextInputAnswerProps) {
  const [value, setValue] = useState('');

  const placeholderText = placeholder?.[locale] || placeholder?.en || placeholder?.ru || 
    (locale === 'ru' ? 'Введите текст...' : 'Enter text...');

  const canSubmit = !required || value.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="text-input">
          {locale === 'ru' ? 'Ваш ответ' : 'Your answer'}
        </Label>
        <Input
          id="text-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholderText}
          disabled={loading}
          className="w-full"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSubmit) {
              onSubmit(value.trim());
            }
          }}
        />
        {required && (
          <p className="text-xs text-muted-foreground">
            {locale === 'ru' ? 'Это поле обязательно для заполнения' : 'This field is required'}
          </p>
        )}
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
          onClick={() => onSubmit(value.trim())}
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
