'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import type { Locale } from '@/lib/types';

interface PassProgressProps {
  currentPass: number;
  totalPasses: number;
  canProceed: boolean;
  isLastPass: boolean;
  onNext: () => void;
  loading?: boolean;
  locale?: Locale;
}

const LABELS = {
  pass: { ru: 'Проход', en: 'Pass' },
  of: { ru: 'из', en: 'of' },
  next: { ru: 'Далее', en: 'Next' },
  done: { ru: 'Готово', en: 'Done' },
  markZones: { ru: 'Отметьте хотя бы одну зону', en: 'Mark at least one zone' },
};

export function PassProgress({
  currentPass,
  totalPasses,
  canProceed,
  isLastPass,
  onNext,
  loading,
  locale = 'ru',
}: PassProgressProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {LABELS.pass[locale]} {currentPass} {LABELS.of[locale]} {totalPasses}
        </span>

        {/* Progress dots */}
        <div className="flex gap-1">
          {Array.from({ length: totalPasses }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < currentPass
                  ? 'bg-primary'
                  : i === currentPass - 1
                    ? 'bg-primary'
                    : 'bg-muted'
              }`}
              initial={{ scale: 0.8 }}
              animate={{
                scale: i === currentPass - 1 ? 1.2 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
          ))}
        </div>
      </div>

      {/* Action button */}
      <div className="flex items-center gap-2">
        {!canProceed && (
          <span className="text-xs text-muted-foreground">
            {LABELS.markZones[locale]}
          </span>
        )}

        <Button
          onClick={onNext}
          disabled={!canProceed || loading}
          className="min-w-[100px]"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
          ) : isLastPass ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              {LABELS.done[locale]}
            </>
          ) : (
            <>
              {LABELS.next[locale]}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
