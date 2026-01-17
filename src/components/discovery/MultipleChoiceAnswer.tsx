'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { QuestionOption } from '@/lib/types';

interface MultipleChoiceAnswerProps {
  options: QuestionOption[];
  allowMultiple?: boolean;
  onSubmit: (selected: string[]) => void;
  loading?: boolean;
}

export function MultipleChoiceAnswer({
  options,
  allowMultiple = true,
  onSubmit,
  loading,
}: MultipleChoiceAnswerProps) {
  const [selected, setSelected] = useState<string[]>([]);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4 py-4"
    >
      {allowMultiple && (
        <p className="text-sm text-muted-foreground text-center">
          (выбери всё что подходит)
        </p>
      )}

      <div className="space-y-2">
        {options.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <button
              onClick={() => handleToggle(option.id)}
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                selected.includes(option.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selected.includes(option.id)}
                  onCheckedChange={() => handleToggle(option.id)}
                />
                <span className="flex-1">{option.text}</span>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={() => onSubmit(selected)}
        disabled={loading || selected.length === 0}
        className="w-full"
        size="lg"
      >
        {loading ? 'Сохранение...' : 'Готово'}
      </Button>
    </motion.div>
  );
}
