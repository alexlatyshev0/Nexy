'use client';

import { motion } from 'framer-motion';
import { Heart, Star, X } from 'lucide-react';
import type { ZonePreference, Locale } from '@/lib/types';
import { PREFERENCE_COLORS } from './body-zones';

interface ColorPaletteProps {
  selectedColor: ZonePreference | null;
  onColorSelect: (color: ZonePreference) => void;
  locale?: Locale;
}

export function ColorPalette({
  selectedColor,
  onColorSelect,
  locale = 'ru',
}: ColorPaletteProps) {
  const colors: { pref: ZonePreference; icon: React.ReactNode }[] = [
    { pref: 'love', icon: <Heart className="w-5 h-5" /> },
    { pref: 'sometimes', icon: <Star className="w-5 h-5" /> },
    { pref: 'no', icon: <X className="w-5 h-5" /> },
  ];

  return (
    <div className="flex justify-center gap-3">
      {colors.map(({ pref, icon }) => {
        const colorConfig = PREFERENCE_COLORS[pref];
        const isSelected = selectedColor === pref;

        return (
          <motion.button
            key={pref}
            onClick={() => onColorSelect(pref)}
            whileTap={{ scale: 0.95 }}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-full
              transition-all duration-200
              ${
                isSelected
                  ? 'ring-2 ring-offset-2 shadow-lg scale-105'
                  : 'opacity-70 hover:opacity-100'
              }
            `}
            style={{
              backgroundColor: colorConfig.fill,
              borderColor: colorConfig.stroke,
              borderWidth: 2,
              color: colorConfig.stroke,
            }}
          >
            {icon}
            <span className="font-medium text-sm">
              {colorConfig.label[locale]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
