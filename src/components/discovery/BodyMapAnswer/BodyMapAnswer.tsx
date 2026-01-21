'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  BodyView,
  BodyGender,
  ZonePreference,
  BodyMapSceneConfig,
  BodyMapAnswer as BodyMapAnswerType,
  BodyMapPassAnswer,
  Locale,
} from '@/lib/types';
import { BodySilhouette, type MarkerData } from './BodySilhouette';
import { ColorPalette } from './ColorPalette';
import { ViewToggle } from './ViewToggle';
import { PassProgress } from './PassProgress';
import { DebugPanel } from './DebugPanel';
import { ZoneActionPanel, type ZoneActionPreferences } from './ZoneActionPanel';
import { detectZone, ZONE_REGIONS } from './zone-detection';
import { type ZoneId, ZONE_NAME_TO_ID, getZoneLabel } from './zone-actions';

// All zone preferences for a complete answer
export type AllZonePreferences = Partial<Record<ZoneId, ZoneActionPreferences>>;

interface BodyMapAnswerProps {
  config: BodyMapSceneConfig;
  partnerGender: BodyGender;
  userGender: BodyGender;
  onSubmit: (answer: BodyMapAnswerType) => void;
  loading?: boolean;
  locale?: Locale;
  /** Use new zone-first flow with action preferences */
  zoneFirstMode?: boolean;
  /** Optional main question text (overrides pass questions) */
  mainQuestion?: LocalizedString;
}

export function BodyMapAnswer({
  config,
  partnerGender,
  userGender,
  onSubmit,
  loading,
  locale = 'ru',
  zoneFirstMode = false,
  mainQuestion,
}: BodyMapAnswerProps) {
  const [currentPassIndex, setCurrentPassIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ZonePreference | null>(null);
  const [currentView, setCurrentView] = useState<BodyView>('front');
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [completedPasses, setCompletedPasses] = useState<BodyMapPassAnswer[]>([]);

  // Zone-first mode state
  const [selectedZone, setSelectedZone] = useState<ZoneId | null>(null);
  const [zonePreferences, setZonePreferences] = useState<AllZonePreferences>({});
  const [configuredZones, setConfiguredZones] = useState<Set<ZoneId>>(new Set());
  const [showZoneBounds, setShowZoneBounds] = useState(false);

  const currentPass = config.passes[currentPassIndex];
  const isLastPass = currentPassIndex === config.passes.length - 1;

  // Determine which body to show based on pass subject
  const currentGender =
    currentPass.subject === 'give' ? partnerGender : userGender;

  const handleColorSelect = useCallback((color: ZonePreference) => {
    setSelectedColor(color);
  }, []);

  // Zone-first mode: handle body tap to detect zone
  const handleZoneTap = useCallback(
    (x: number, y: number) => {
      const detected = detectZone(x, y, currentGender, currentView);
      if (!detected) {
        console.log('[BodyMapAnswer] No zone detected at', x, y);
        return;
      }

      console.log('[BodyMapAnswer] Detected zone:', detected.name, 'at', x, y, 'confidence:', detected.confidence);

      // Map detected zone name to ZoneId
      const zoneId = ZONE_NAME_TO_ID[detected.name.ru] || ZONE_NAME_TO_ID[detected.name.en];
      if (zoneId) {
        console.log('[BodyMapAnswer] Mapped to ZoneId:', zoneId);
        setSelectedZone(zoneId);
      } else {
        console.warn('[BodyMapAnswer] Zone name not found in ZONE_NAME_TO_ID:', detected.name);
      }
    },
    [currentGender, currentView]
  );

  // Zone-first mode: save preferences for a zone
  const handleZoneSave = useCallback(
    (zoneId: ZoneId, preferences: ZoneActionPreferences) => {
      setZonePreferences((prev) => ({
        ...prev,
        [zoneId]: preferences,
      }));
      setConfiguredZones((prev) => new Set([...prev, zoneId]));
      setSelectedZone(null);

      // Add a visual marker for the configured zone
      // Find approximate center coordinates for the zone on the body
      // For now, we'll add a marker at a default position - this could be improved
      const zoneLabel = getZoneLabel(zoneId, locale);
      const existingMarker = markers.find((m) => m.id === `zone-${zoneId}`);
      if (!existingMarker) {
        // Get approximate position for the zone from zone-detection
        const testPositions = getApproximateZonePosition(zoneId, currentGender, currentView);
        if (testPositions) {
          const newMarker: MarkerData = {
            id: `zone-${zoneId}`,
            x: testPositions.x,
            y: testPositions.y,
            color: 'love', // Just for visual - actual preferences are in zonePreferences
            view: currentView,
          };
          setMarkers((prev) => [...prev.filter((m) => m.id !== `zone-${zoneId}`), newMarker]);
        }
      }
    },
    [currentGender, currentView, locale, markers]
  );

  // Legacy mode: add colored markers
  const handleAddMarker = useCallback(
    (x: number, y: number) => {
      if (zoneFirstMode) {
        handleZoneTap(x, y);
        return;
      }

      if (!selectedColor) return;

      const newMarker: MarkerData = {
        id: `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x,
        y,
        color: selectedColor,
        view: currentView,
      };

      setMarkers((prev) => [...prev, newMarker]);
    },
    [zoneFirstMode, selectedColor, currentView, handleZoneTap]
  );

  const handleRemoveMarker = useCallback((markerId: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== markerId));
    // If it's a zone marker, also remove from configured zones
    if (markerId.startsWith('zone-')) {
      const zoneId = markerId.replace('zone-', '') as ZoneId;
      setConfiguredZones((prev) => {
        const next = new Set(prev);
        next.delete(zoneId);
        return next;
      });
      setZonePreferences((prev) => {
        const next = { ...prev };
        delete next[zoneId];
        return next;
      });
    }
  }, []);

  const handleMoveMarker = useCallback((markerId: string, x: number, y: number) => {
    setMarkers((prev) =>
      prev.map((m) => (m.id === markerId ? { ...m, x, y } : m))
    );
  }, []);

  const handleNext = useCallback(() => {
    if (zoneFirstMode) {
      // Zone-first mode: submit zone+action preferences
      const passAnswer: BodyMapPassAnswer = {
        action: config.action,
        subject: currentPass.subject,
        markings: [], // Not used in zone-first mode
        view: currentView,
        gender: currentGender,
        // Store zone preferences as extended data
        zoneActionPreferences: zonePreferences,
      };

      if (isLastPass) {
        const allPasses = [...completedPasses, passAnswer];
        onSubmit({ passes: allPasses });
      } else {
        setCompletedPasses((prev) => [...prev, passAnswer]);
        setCurrentPassIndex((prev) => prev + 1);
        setZonePreferences({} as AllZonePreferences);
        setConfiguredZones(new Set());
        setMarkers([]);
        setCurrentView('front');
      }
      return;
    }

    // Legacy mode: Convert markers to pass answer format
    const markersByPreference: Record<ZonePreference, Array<{ x: number; y: number }>> = {
      love: [],
      sometimes: [],
      no: [],
    };

    markers.forEach((marker) => {
      markersByPreference[marker.color].push({ x: marker.x, y: marker.y });
    });

    const passAnswer: BodyMapPassAnswer = {
      action: config.action,
      subject: currentPass.subject,
      markings: markers.map((m) => ({
        zoneId: `position_${Math.round(m.x)}_${Math.round(m.y)}` as never,
        preference: m.color,
        position: { x: m.x, y: m.y },
      })),
      rawMarkers: markersByPreference,
      view: currentView,
      gender: currentGender,
    };

    if (isLastPass) {
      const allPasses = [...completedPasses, passAnswer];
      onSubmit({ passes: allPasses });
    } else {
      setCompletedPasses((prev) => [...prev, passAnswer]);
      setCurrentPassIndex((prev) => prev + 1);
      setMarkers([]);
      setSelectedColor(null);
      setCurrentView('front');
    }
  }, [
    zoneFirstMode,
    markers,
    config.action,
    currentPass.subject,
    currentView,
    currentGender,
    isLastPass,
    completedPasses,
    onSubmit,
    zonePreferences,
  ]);

  const canProceed = zoneFirstMode ? configuredZones.size > 0 : markers.length > 0;

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
            {mainQuestion?.[locale] || currentPass.question[locale]}
          </h3>
        </motion.div>
      </AnimatePresence>

      {/* View toggle */}
      <ViewToggle
        currentView={currentView}
        onViewChange={setCurrentView}
        locale={locale}
      />

      {/* Debug toggle */}
      <div className="flex justify-center">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showZoneBounds}
            onChange={(e) => setShowZoneBounds(e.target.checked)}
            className="w-4 h-4"
          />
          <span>
            {locale === 'ru' ? 'Показать границы зон (отладка)' : 'Show zone bounds (debug)'}
          </span>
        </label>
      </div>

      {/* Body silhouette with markers */}
      <div className="flex justify-center py-4">
        <BodySilhouette
          gender={currentGender}
          view={currentView}
          markers={markers}
          selectedColor={zoneFirstMode ? 'love' : selectedColor}
          onAddMarker={handleAddMarker}
          onRemoveMarker={handleRemoveMarker}
          onMoveMarker={handleMoveMarker}
          locale={locale}
          showZoneBounds={showZoneBounds}
        />
      </div>

      {/* Color palette - only in legacy mode */}
      {!zoneFirstMode && (
        <ColorPalette
          selectedColor={selectedColor}
          onColorSelect={handleColorSelect}
          locale={locale}
        />
      )}

      {/* Zone-first mode: show configured zones summary */}
      {zoneFirstMode && configuredZones.size > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-sm font-medium mb-2">
            {locale === 'ru' ? 'Настроенные зоны:' : 'Configured zones:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from(configuredZones).map((zoneId) => (
              <motion.button
                key={zoneId}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedZone(zoneId)}
                className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm"
              >
                {getZoneLabel(zoneId, locale)}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Debug panel - only in legacy mode */}
      {!zoneFirstMode && (
        <DebugPanel
          markers={markers}
          gender={currentGender}
          view={currentView}
          locale={locale}
        />
      )}

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

      {/* Zone action panel */}
      {selectedZone && (
        <ZoneActionPanel
          zone={selectedZone}
          initialPreferences={zonePreferences[selectedZone] || {}}
          onClose={() => setSelectedZone(null)}
          onSave={handleZoneSave}
          locale={locale}
        />
      )}
    </motion.div>
  );
}

// Helper function to get approximate center position for a zone
function getApproximateZonePosition(
  zoneId: ZoneId,
  gender: BodyGender,
  view: BodyView
): { x: number; y: number } | null {
  // Approximate center coordinates for each zone
  const positions: Partial<Record<ZoneId, Record<string, { x: number; y: number }>>> = {
    lips: { 'front': { x: 50, y: 14 } },
    ears: { 'front': { x: 35, y: 10 } },
    neck: { 'front': { x: 50, y: 20 }, 'back': { x: 50, y: 16 } },
    shoulders: { 'front': { x: 30, y: 24 }, 'back': { x: 30, y: 22 } },
    chest: { 'front': { x: 50, y: 31 } },
    breasts: { 'front': { x: 50, y: 31 } },
    nipples: { 'front': { x: 40, y: 30 } },
    stomach: { 'front': { x: 50, y: 43 } },
    back: { 'back': { x: 50, y: 27 } },
    lower_back: { 'back': { x: 50, y: 37 } },
    arms: { 'front': { x: 20, y: 37 }, 'back': { x: 20, y: 36 } },
    hands: { 'front': { x: 15, y: 53 }, 'back': { x: 15, y: 53 } },
    buttocks: { 'back': { x: 50, y: 48 } },
    anus: { 'back': { x: 50, y: 50 } },
    groin: { 'front': { x: 50, y: 52 } },
    penis: { 'front': { x: 50, y: 52 } },
    vulva: { 'front': { x: 50, y: 52 }, 'back': { x: 50, y: 54 } },
    thighs: { 'front': { x: 40, y: 65 }, 'back': { x: 40, y: 63 } },
    feet: { 'front': { x: 40, y: 96 }, 'back': { x: 40, y: 96 } },
  };

  const zonePositions = positions[zoneId];
  if (!zonePositions) return null;

  return zonePositions[view] || zonePositions['front'] || null;
}
