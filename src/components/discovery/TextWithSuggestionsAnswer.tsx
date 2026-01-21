'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { t } from '@/lib/locale';
import type { Locale, LocalizedString } from '@/lib/types';

interface Suggestion {
  label: LocalizedString;
  examples?: LocalizedString;
}

interface TextWithSuggestionsAnswerProps {
  suggestions: Suggestion[];
  placeholder?: LocalizedString;
  onSubmit: (selected: string[], customText?: string) => void;
  onSkip?: () => void;
  locale?: Locale;
  loading?: boolean;
  allowMultiple?: boolean;
}

export function TextWithSuggestionsAnswer({
  suggestions,
  placeholder,
  onSubmit,
  onSkip,
  locale = 'ru',
  loading = false,
  allowMultiple = true,
}: TextWithSuggestionsAnswerProps) {
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [customText, setCustomText] = useState('');

  const handleToggleSuggestion = (index: number) => {
    const suggestionId = `suggestion-${index}`;
    if (allowMultiple) {
      setSelectedSuggestions((prev) =>
        prev.includes(suggestionId)
          ? prev.filter((id) => id !== suggestionId)
          : [...prev, suggestionId]
      );
    } else {
      setSelectedSuggestions([suggestionId]);
    }
  };

  const placeholderText = placeholder?.[locale] || placeholder?.en || placeholder?.ru || 
    (locale === 'ru' ? 'Свой вариант...' : 'Your option...');

  const canSubmit = selectedSuggestions.length > 0 || customText.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Suggestions */}
      <div className="space-y-2">
        <Label>
          {locale === 'ru' ? 'Выберите из предложенных или введите свой вариант' : 'Select from suggestions or enter your own'}
        </Label>
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => {
            const suggestionId = `suggestion-${index}`;
            const isSelected = selectedSuggestions.includes(suggestionId);
            const label = suggestion.label[locale] || suggestion.label.en || suggestion.label.ru || '';
            const examples = suggestion.examples?.[locale] || suggestion.examples?.en || suggestion.examples?.ru;

            return (
              <motion.div
                key={suggestionId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <button
                  onClick={() => handleToggleSuggestion(index)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleSuggestion(index)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{label}</div>
                      {examples && (
                        <div className="text-sm text-muted-foreground mt-1">{examples}</div>
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Custom text input */}
      <div className="space-y-2">
        <Label htmlFor="custom-text">
          {locale === 'ru' ? 'Или введите свой вариант' : 'Or enter your own option'}
        </Label>
        <Input
          id="custom-text"
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder={placeholderText}
          disabled={loading}
          className="w-full"
        />
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
          onClick={() => {
            const selectedLabels = selectedSuggestions.map((id) => {
              const index = parseInt(id.replace('suggestion-', ''));
              const suggestion = suggestions[index];
              return suggestion.label[locale] || suggestion.label.en || suggestion.label.ru || '';
            });
            onSubmit(selectedLabels, customText.trim() || undefined);
          }}
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
