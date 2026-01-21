'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Locale } from '@/lib/types';
import type { DetectedZone } from './zone-detection';

interface ZoneConfirmDialogProps {
  zones: DetectedZone[];
  isOpen: boolean;
  onSelect: (zone: DetectedZone) => void;
  onClose: () => void;
  locale?: Locale;
}

/**
 * Dialog for confirming zone selection when multiple zones are detected
 * Used for Tap → Confirm flow on mobile devices
 */
export function ZoneConfirmDialog({
  zones,
  isOpen,
  onSelect,
  onClose,
  locale = 'ru',
}: ZoneConfirmDialogProps) {
  if (!isOpen || zones.length === 0) return null;

  const title = locale === 'ru' ? 'Какую зону ты выбрал(а)?' : 'Which zone did you select?';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm"
          >
            <div className="bg-card rounded-2xl shadow-xl border p-4">
              {/* Title */}
              <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>

              {/* Zone buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                {zones.map((zone, index) => (
                  <motion.button
                    key={zone.name.en}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onSelect(zone)}
                    className={`
                      px-4 py-3 rounded-xl font-medium transition-all
                      min-w-[100px] min-h-[44px]
                      ${
                        zone.confidence === 'high'
                          ? 'bg-primary text-primary-foreground'
                          : zone.confidence === 'medium'
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-muted text-muted-foreground'
                      }
                      hover:opacity-90 active:scale-95
                    `}
                  >
                    {zone.name[locale]}
                  </motion.button>
                ))}
              </div>

              {/* Cancel button */}
              <button
                onClick={onClose}
                className="mt-4 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {locale === 'ru' ? 'Отмена' : 'Cancel'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Compact inline version for showing below the silhouette
 */
export function ZoneConfirmInline({
  zones,
  onSelect,
  onClose,
  locale = 'ru',
}: Omit<ZoneConfirmDialogProps, 'isOpen'>) {
  if (zones.length === 0) return null;

  const title = locale === 'ru' ? 'Уточни зону:' : 'Clarify zone:';

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-muted/50 rounded-xl p-3 mt-3">
        <p className="text-sm text-muted-foreground text-center mb-2">{title}</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {zones.map((zone) => (
            <button
              key={zone.name.en}
              onClick={() => onSelect(zone)}
              className="px-3 py-2 rounded-lg bg-card border text-sm font-medium
                       hover:bg-accent active:scale-95 transition-all min-h-[44px]"
            >
              {zone.name[locale]}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground"
        >
          {locale === 'ru' ? 'Отмена' : 'Cancel'}
        </button>
      </div>
    </motion.div>
  );
}
