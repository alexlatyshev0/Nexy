'use client';

import { motion } from 'framer-motion';
import { Info, Heart } from 'lucide-react';
import type { TabooContext, Locale } from '@/lib/types';

interface NormalizationMessageProps {
  tabooContext: TabooContext;
  locale?: Locale;
}

export function NormalizationMessage({
  tabooContext,
  locale = 'ru',
}: NormalizationMessageProps) {
  // Only show for taboo level 3+ with normalization message
  if (tabooContext.level < 3 || !tabooContext.normalization) {
    return null;
  }

  // Get icon based on level
  const getIcon = () => {
    switch (tabooContext.level) {
      case 3:
        return <Info className="w-4 h-4 flex-shrink-0 text-blue-500" />;
      case 4:
      case 5:
        return <Heart className="w-4 h-4 flex-shrink-0 text-pink-500" />;
      default:
        return <Info className="w-4 h-4 flex-shrink-0 text-muted-foreground" />;
    }
  };

  // Get background color based on level
  const getBgColor = () => {
    switch (tabooContext.level) {
      case 3:
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
      case 4:
      case 5:
        return 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800';
      default:
        return 'bg-muted/50 border-muted';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg border p-3 ${getBgColor()}`}
    >
      <div className="flex gap-2 items-start">
        {getIcon()}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {tabooContext.normalization}
        </p>
      </div>

      {/* Show common concerns if present */}
      {tabooContext.common_concerns && tabooContext.common_concerns.length > 0 && (
        <div className="mt-2 pt-2 border-t border-current/10">
          <p className="text-xs text-muted-foreground/70">
            {locale === 'ru' ? 'Частые вопросы: ' : 'Common concerns: '}
            {tabooContext.common_concerns.join(', ')}
          </p>
        </div>
      )}
    </motion.div>
  );
}
