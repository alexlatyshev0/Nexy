'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, X, Check } from 'lucide-react';
import type { Locale, ZonePreference } from '@/lib/types';
import { PREFERENCE_COLORS } from './body-zones';
import {
  type ZoneId,
  type ActionId,
  getActionsForZone,
  getZoneLabel,
  getActionLabel,
} from './zone-actions';

export type ZoneActionPreferences = Partial<Record<ActionId, ZonePreference | null>>;

interface ZoneActionPanelProps {
  zone: ZoneId;
  initialPreferences?: ZoneActionPreferences;
  onClose: () => void;
  onSave: (zoneId: ZoneId, preferences: ZoneActionPreferences) => void;
  locale?: Locale;
}

const PREFERENCE_OPTIONS: { pref: ZonePreference; icon: React.ReactNode }[] = [
  { pref: 'love', icon: <Heart className="w-4 h-4" /> },
  { pref: 'sometimes', icon: <Star className="w-4 h-4" /> },
  { pref: 'no', icon: <X className="w-4 h-4" /> },
];

export function ZoneActionPanel({
  zone,
  initialPreferences = {},
  onClose,
  onSave,
  locale = 'ru',
}: ZoneActionPanelProps) {
  const [preferences, setPreferences] = useState<ZoneActionPreferences>(initialPreferences);

  const actions = getActionsForZone(zone);
  const zoneLabel = getZoneLabel(zone, locale);

  const handlePreferenceChange = useCallback((actionId: ActionId, pref: ZonePreference) => {
    setPreferences((prev) => ({
      ...prev,
      [actionId]: prev[actionId] === pref ? null : pref, // Toggle off if same
    }));
  }, []);

  const handleSave = useCallback(() => {
    onSave(zone, preferences);
  }, [zone, preferences, onSave]);

  const hasSelections = Object.values(preferences).some((v) => v !== null && v !== undefined);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {zoneLabel}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Actions list */}
          <div className="overflow-y-auto max-h-[60vh] px-4 py-2">
            {actions.map((action) => {
              const currentPref = preferences[action.id];

              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {getActionLabel(action.id, locale)}
                  </span>

                  <div className="flex gap-2">
                    {PREFERENCE_OPTIONS.map(({ pref, icon }) => {
                      const colorConfig = PREFERENCE_COLORS[pref];
                      const isSelected = currentPref === pref;

                      return (
                        <motion.button
                          key={pref}
                          onClick={() => handlePreferenceChange(action.id, pref)}
                          whileTap={{ scale: 0.9 }}
                          className={`
                            p-2 rounded-full transition-all duration-200
                            ${isSelected
                              ? 'ring-2 ring-offset-1 shadow-md scale-110'
                              : 'opacity-40 hover:opacity-70'
                            }
                          `}
                          style={{
                            backgroundColor: colorConfig.fill,
                            borderColor: colorConfig.stroke,
                            borderWidth: 2,
                            color: colorConfig.stroke,
                            // Ring color is handled via Tailwind classes
                            ['--tw-ring-color' as string]: isSelected ? colorConfig.stroke : undefined,
                          }}
                        >
                          {icon}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer with save button */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            <motion.button
              onClick={handleSave}
              whileTap={{ scale: 0.98 }}
              disabled={!hasSelections}
              className={`
                w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2
                transition-all duration-200
                ${hasSelections
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <Check className="w-5 h-5" />
              {locale === 'ru' ? 'Готово' : 'Done'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
