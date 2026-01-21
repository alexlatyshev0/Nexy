'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { t } from '@/lib/locale';
import type { V2FollowUp, Locale } from '@/lib/types';

interface FollowUpQuestionProps {
  followUp: V2FollowUp;
  locale?: Locale;
  onSubmit: (optionId: string) => Promise<void>;
  onSkip?: () => void;
}

export function FollowUpQuestion({
  followUp,
  locale = 'ru',
  onSubmit,
  onSkip,
}: FollowUpQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const question = followUp.question[locale] || followUp.question.en || followUp.question.ru || '';
  const options = followUp.config.options || [];

  const handleSubmit = async () => {
    if (!selectedOption) return;

    const option = options.find((o) => o.id === selectedOption);
    if (!option) return;

    setLoading(true);
    try {
      await onSubmit(option.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium text-center">
            {locale === 'ru' ? 'Ещё один вопрос' : 'One more question'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">{question}</p>

          <div className="grid gap-2">
            {options.map((option) => (
              <Button
                key={option.id}
                variant={selectedOption === option.id ? 'default' : 'outline'}
                className="w-full justify-start text-left h-auto py-3 px-4"
                onClick={() => setSelectedOption(option.id)}
                disabled={loading}
              >
                <span className="flex items-center gap-2">
                  {selectedOption === option.id && (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{option.label[locale] || option.label.en || option.label.ru || option.id}</span>
                </span>
              </Button>
            ))}
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
              onClick={handleSubmit}
              disabled={!selectedOption || loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : locale === 'ru' ? (
                'Ответить'
              ) : (
                'Answer'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
