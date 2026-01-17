'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  BodyZoneId,
  BodyView,
  BodyGender,
  ZonePreference,
  BodyMapSceneConfig,
  BodyMapAnswer as BodyMapAnswerType,
  BodyMapPassAnswer,
  BodyZoneMarking,
  Locale,
} from '@/lib/types';
import { BodySilhouette } from './BodySilhouette';
import { ColorPalette } from './ColorPalette';
import { ViewToggle } from './ViewToggle';
import { PassProgress } from './PassProgress';

interface BodyMapAnswerProps {
  config: BodyMapSceneConfig;
  partnerGender: BodyGender;
  userGender: BodyGender;
  onSubmit: (answer: BodyMapAnswerType) => void;
  loading?: boolean;
  locale?: Locale;
}

export function BodyMapAnswer({
  config,
  partnerGender,
  userGender,
  onSubmit,
  loading,
  locale = 'ru',
}: BodyMapAnswerProps) {
  const [currentPassIndex, setCurrentPassIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ZonePreference | null>(null);
  const [currentView, setCurrentView] = useState<BodyView>('front');
  const [markings, setMarkings] = useState<Map<BodyZoneId, ZonePreference>>(
    new Map()
  );
  const [completedPasses, setCompletedPasses] = useState<BodyMapPassAnswer[]>([]);

  const currentPass = config.passes[currentPassIndex];
  const isLastPass = currentPassIndex === config.passes.length - 1;

  // Determine which body to show based on pass subject
  const currentGender =
    currentPass.subject === 'give' ? partnerGender : userGender;

  const handleColorSelect = useCallback((color: ZonePreference) => {
    setSelectedColor(color);
  }, []);

  const handleZoneClick = useCallback(
    (zoneId: BodyZoneId) => {
      if (!selectedColor) return;

      setMarkings((prev) => {
        const newMarkings = new Map(prev);
        const existing = newMarkings.get(zoneId);

        if (existing === selectedColor) {
          // Toggle off if same color
          newMarkings.delete(zoneId);
        } else {
          // Set new color
          newMarkings.set(zoneId, selectedColor);
        }

        return newMarkings;
      });
    },
    [selectedColor]
  );

  const handleNext = useCallback(() => {
    // Convert markings to array
    const markingsArray: BodyZoneMarking[] = Array.from(markings.entries()).map(
      ([zoneId, preference]) => ({ zoneId, preference })
    );

    const passAnswer: BodyMapPassAnswer = {
      action: config.action,
      subject: currentPass.subject,
      markings: markingsArray,
    };

    if (isLastPass) {
      // Submit all passes
      const allPasses = [...completedPasses, passAnswer];
      onSubmit({ passes: allPasses });
    } else {
      // Move to next pass
      setCompletedPasses((prev) => [...prev, passAnswer]);
      setCurrentPassIndex((prev) => prev + 1);
      setMarkings(new Map());
      setSelectedColor(null);
      setCurrentView('front');
    }
  }, [
    markings,
    config.action,
    currentPass.subject,
    isLastPass,
    completedPasses,
    onSubmit,
  ]);

  const canProceed = markings.size > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPassIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="text-center"
        >
          <h3 className="text-lg font-semibold">
            {currentPass.question[locale]}
          </h3>
        </motion.div>
      </AnimatePresence>

      {/* View toggle */}
      <ViewToggle
        currentView={currentView}
        onViewChange={setCurrentView}
        locale={locale}
      />

      {/* Body silhouette */}
      <div className="flex justify-center py-4">
        <BodySilhouette
          gender={currentGender}
          view={currentView}
          markings={markings}
          selectedColor={selectedColor}
          onZoneClick={handleZoneClick}
          locale={locale}
        />
      </div>

      {/* Color palette */}
      <ColorPalette
        selectedColor={selectedColor}
        onColorSelect={handleColorSelect}
        locale={locale}
      />

      {/* Progress and next button */}
      <PassProgress
        currentPass={currentPassIndex + 1}
        totalPasses={config.passes.length}
        canProceed={canProceed}
        isLastPass={isLastPass}
        onNext={handleNext}
        loading={loading}
        locale={locale}
      />

      {/* Marked zones summary */}
      {markings.size > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-center text-sm text-muted-foreground"
        >
          {locale === 'ru'
            ? `Отмечено зон: ${markings.size}`
            : `Zones marked: ${markings.size}`}
        </motion.div>
      )}
    </motion.div>
  );
}
