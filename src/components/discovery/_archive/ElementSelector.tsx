'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { V2Element, Locale } from '@/lib/types';

interface ElementSelectorProps {
  elements: V2Element[];
  selectedElements: string[];
  onSelectionChange: (selected: string[]) => void;
  onSubmit: (selected: string[]) => void;
  locale?: Locale;
  loading?: boolean;
  minSelections?: number;
  maxSelections?: number;
  questionText?: string;
}

export function ElementSelector({
  elements,
  selectedElements,
  onSelectionChange,
  onSubmit,
  locale = 'ru',
  loading = false,
  minSelections = 0,
  maxSelections,
  questionText,
}: ElementSelectorProps) {
  const handleToggle = (elementId: string) => {
    if (selectedElements.includes(elementId)) {
      onSelectionChange(selectedElements.filter((id) => id !== elementId));
    } else {
      // Check max selections limit
      if (maxSelections && selectedElements.length >= maxSelections) {
        return;
      }
      onSelectionChange([...selectedElements, elementId]);
    }
  };

  const canSubmit = selectedElements.length >= minSelections;
  const selectionCount = selectedElements.length;
  const maxReached = maxSelections ? selectionCount >= maxSelections : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Question text */}
      {questionText && (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">{questionText}</h3>
          {minSelections > 0 && (
            <p className="text-sm text-muted-foreground">
              {locale === 'ru'
                ? `Выберите минимум ${minSelections} ${minSelections === 1 ? 'элемент' : minSelections < 5 ? 'элемента' : 'элементов'}`
                : `Select at least ${minSelections} ${minSelections === 1 ? 'element' : 'elements'}`}
            </p>
          )}
          {maxSelections && (
            <p className="text-sm text-muted-foreground">
              {locale === 'ru'
                ? `Максимум ${maxSelections} ${maxSelections === 1 ? 'элемент' : maxSelections < 5 ? 'элемента' : 'элементов'}`
                : `Maximum ${maxSelections} ${maxSelections === 1 ? 'element' : 'elements'}`}
            </p>
          )}
        </div>
      )}

      {/* Elements list */}
      <div className="space-y-2">
        {elements.map((element, index) => {
          const isSelected = selectedElements.includes(element.id);
          const elementLabel = element.label[locale] || element.label.en || element.label.ru || element.id;

          return (
            <motion.div
              key={element.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div
                role="button"
                tabIndex={!isSelected && maxReached ? -1 : 0}
                onClick={() => !(!isSelected && maxReached) && handleToggle(element.id)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !(!isSelected && maxReached)) {
                    e.preventDefault();
                    handleToggle(element.id);
                  }
                }}
                className={`w-full p-4 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : maxReached
                    ? 'border-border opacity-50 cursor-not-allowed'
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(element.id)}
                    disabled={!isSelected && maxReached}
                  />
                  <span className="flex-1 font-medium">{elementLabel}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <span className="text-primary-foreground text-xs">✓</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selection counter */}
      {maxSelections && (
        <div className="text-center text-sm text-muted-foreground">
          {locale === 'ru'
            ? `Выбрано: ${selectionCount} из ${maxSelections}`
            : `Selected: ${selectionCount} of ${maxSelections}`}
        </div>
      )}

      {/* Action button */}
      <div className="flex pt-2">
        <Button
          onClick={() => onSubmit(selectedElements)}
          disabled={loading || !canSubmit}
          className="flex-1"
          size="lg"
        >
          {loading
            ? locale === 'ru'
              ? 'Сохранение...'
              : 'Saving...'
            : locale === 'ru'
            ? 'Далее'
            : 'Next'}
        </Button>
      </div>
    </motion.div>
  );
}
