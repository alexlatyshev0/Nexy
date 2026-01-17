'use client';

import { motion } from 'framer-motion';
import type { BodyView, Locale } from '@/lib/types';

interface ViewToggleProps {
  currentView: BodyView;
  onViewChange: (view: BodyView) => void;
  locale?: Locale;
}

const VIEW_LABELS: Record<BodyView, Record<Locale, string>> = {
  front: { ru: 'Спереди', en: 'Front' },
  back: { ru: 'Сзади', en: 'Back' },
};

export function ViewToggle({
  currentView,
  onViewChange,
  locale = 'ru',
}: ViewToggleProps) {
  return (
    <div className="flex justify-center">
      <div className="relative flex bg-muted rounded-lg p-1">
        {/* Animated background */}
        <motion.div
          className="absolute inset-y-1 bg-background rounded-md shadow-sm"
          initial={false}
          animate={{
            x: currentView === 'front' ? 0 : '100%',
            width: '50%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {(['front', 'back'] as BodyView[]).map((view) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`
              relative z-10 px-6 py-2 text-sm font-medium rounded-md
              transition-colors duration-200
              ${
                currentView === view
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {VIEW_LABELS[view][locale]}
          </button>
        ))}
      </div>
    </div>
  );
}
