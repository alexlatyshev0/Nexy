'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BodyZoneId, BodyView, BodyGender, ZonePreference, Locale } from '@/lib/types';
import { MaleFront, MaleBack, FemaleFront, FemaleBack } from './silhouettes';
import { getZoneLabel } from './body-zones';

interface BodySilhouetteProps {
  gender: BodyGender;
  view: BodyView;
  markings: Map<BodyZoneId, ZonePreference>;
  selectedColor: ZonePreference | null;
  onZoneClick: (zoneId: BodyZoneId) => void;
  locale?: Locale;
}

export function BodySilhouette({
  gender,
  view,
  markings,
  selectedColor,
  onZoneClick,
  locale = 'ru',
}: BodySilhouetteProps) {
  const [hoveredZone, setHoveredZone] = useState<BodyZoneId | null>(null);

  const handleZoneHover = (zoneId: BodyZoneId | null) => {
    setHoveredZone(zoneId);
  };

  const renderSilhouette = () => {
    const props = {
      markings,
      selectedColor,
      onZoneClick,
      onZoneHover: handleZoneHover,
    };

    if (gender === 'male') {
      return view === 'front' ? <MaleFront {...props} /> : <MaleBack {...props} />;
    } else {
      return view === 'front' ? <FemaleFront {...props} /> : <FemaleBack {...props} />;
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Silhouette container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${gender}-${view}`}
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: -90 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[280px] aspect-[100/180]"
        >
          {renderSilhouette()}
        </motion.div>
      </AnimatePresence>

      {/* Zone label tooltip */}
      <AnimatePresence>
        {hoveredZone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-1.5 shadow-lg"
          >
            <span className="text-sm font-medium">
              {getZoneLabel(hoveredZone, locale)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {!selectedColor && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground mt-4"
        >
          {locale === 'ru'
            ? 'Сначала выберите цвет внизу'
            : 'First select a color below'}
        </motion.p>
      )}
    </div>
  );
}
