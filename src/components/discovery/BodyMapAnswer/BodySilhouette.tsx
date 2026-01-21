'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import type { BodyView, BodyGender, ZonePreference, Locale } from '@/lib/types';
import { PREFERENCE_COLORS } from './body-zones';
import { ZONE_REGIONS } from './zone-detection';

export interface MarkerData {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  color: ZonePreference;
  view: 'front' | 'back';
}

interface BodySilhouetteProps {
  gender: BodyGender;
  view: BodyView;
  markers: MarkerData[];
  selectedColor: ZonePreference | null;
  onAddMarker: (x: number, y: number) => void;
  onRemoveMarker: (id: string) => void;
  onMoveMarker: (id: string, x: number, y: number) => void;
  locale?: Locale;
  showZoneBounds?: boolean; // Debug mode: show zone boundaries
}

const BODY_IMAGES: Record<`${BodyGender}-${BodyView}`, string> = {
  'male-front': '/images/dolls/man_front.jpg',
  'male-back': '/images/dolls/man_back2.jpg',
  'female-front': '/images/dolls/woman_front.jpeg',
  'female-back': '/images/dolls/woman_back.jpeg',
};

export function BodySilhouette({
  gender,
  view,
  markers,
  selectedColor,
  onAddMarker,
  onRemoveMarker,
  onMoveMarker,
  locale = 'ru',
  showZoneBounds = false,
}: BodySilhouetteProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [draggingMarker, setDraggingMarker] = useState<string | null>(null);

  const getPositionFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      if (!imageRef.current) return null;

      const rect = imageRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      // Clamp to valid range
      return {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      };
    },
    []
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!selectedColor) return;
      if (draggingMarker) return; // Don't add marker if we just finished dragging

      const pos = getPositionFromEvent(e.clientX, e.clientY);
      if (pos) {
        onAddMarker(pos.x, pos.y);
      }
    },
    [selectedColor, draggingMarker, getPositionFromEvent, onAddMarker]
  );

  const handleMarkerDragEnd = useCallback(
    (markerId: string, event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const marker = markers.find((m) => m.id === markerId);
      if (!marker) return;

      // Calculate new position based on drag offset
      const currentPixelX = (marker.x / 100) * rect.width;
      const currentPixelY = (marker.y / 100) * rect.height;

      const newPixelX = currentPixelX + info.offset.x;
      const newPixelY = currentPixelY + info.offset.y;

      // Check if dragged outside the image bounds - delete if so
      const margin = 30; // pixels outside before deletion
      if (
        newPixelX < -margin ||
        newPixelX > rect.width + margin ||
        newPixelY < -margin ||
        newPixelY > rect.height + margin
      ) {
        onRemoveMarker(markerId);
        setTimeout(() => setDraggingMarker(null), 100);
        return;
      }

      const newX = Math.max(0, Math.min(100, (newPixelX / rect.width) * 100));
      const newY = Math.max(0, Math.min(100, (newPixelY / rect.height) * 100));

      onMoveMarker(markerId, newX, newY);

      // Delay clearing dragging state to prevent click from adding new marker
      setTimeout(() => setDraggingMarker(null), 100);
    },
    [markers, onMoveMarker, onRemoveMarker]
  );

  // Filter markers by current view
  const visibleMarkers = markers.filter((m) => m.view === view);

  const imageKey = `${gender}-${view}` as const;
  const imageSrc = BODY_IMAGES[imageKey];

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Image container */}
      <motion.div
        key={imageKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-[400px]"
      >
        <div
          onClick={handleClick}
          className={`relative ${selectedColor ? 'cursor-crosshair' : 'cursor-default'}`}
        >
          {/* Body image */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt={`${gender} body ${view}`}
            className="w-full h-auto pointer-events-none select-none"
            draggable={false}
          />

          {/* Zone bounds overlay (debug mode) */}
          {showZoneBounds && (
            <div className="absolute inset-0 pointer-events-none">
              {(ZONE_REGIONS[`${gender}-${view}`] || []).map((zone, index) => {
                const { x1, y1, x2, y2 } = zone.bounds;
                return (
                  <div
                    key={index}
                    className="absolute border border-yellow-400/50 bg-yellow-400/10"
                    style={{
                      left: `${x1}%`,
                      top: `${y1}%`,
                      width: `${x2 - x1}%`,
                      height: `${y2 - y1}%`,
                    }}
                  >
                    <div className="absolute top-0 left-0 bg-yellow-400/80 text-black text-[8px] px-1 rounded-br">
                      {zone.name[locale]}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Markers overlay */}
          <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence>
              {visibleMarkers.map((marker) => (
                <motion.div
                  key={marker.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  drag
                  dragMomentum={false}
                  dragElastic={0}
                  onDragStart={() => setDraggingMarker(marker.id)}
                  onDragEnd={(event, info) => handleMarkerDragEnd(marker.id, event, info)}
                  whileDrag={{ scale: 1.2, zIndex: 100 }}
                  className="absolute"
                  style={{
                    left: `${marker.x}%`,
                    top: `${marker.y}%`,
                    x: '-50%',
                    y: '-50%',
                  }}
                >
                  <div
                    onMouseEnter={() => setHoveredMarker(marker.id)}
                    onMouseLeave={() => setHoveredMarker(null)}
                    className="relative cursor-grab active:cursor-grabbing"
                  >
                    {/* Marker circle */}
                    <div
                      className="w-7 h-7 rounded-full border-2 shadow-lg flex items-center justify-center"
                      style={{
                        backgroundColor: PREFERENCE_COLORS[marker.color].fill,
                        borderColor: PREFERENCE_COLORS[marker.color].stroke,
                      }}
                    >
                      {/* Inner dot for better visibility */}
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: PREFERENCE_COLORS[marker.color].stroke }}
                      />
                    </div>
                    {/* Hint on hover */}
                    {hoveredMarker === marker.id && !draggingMarker && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50"
                      >
                        {locale === 'ru' ? 'Тащи за край = удалить' : 'Drag outside = delete'}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-sm text-muted-foreground mt-4"
      >
        {!selectedColor
          ? locale === 'ru'
            ? 'Сначала выберите цвет внизу'
            : 'First select a color below'
          : locale === 'ru'
            ? 'Кликните чтобы отметить • Перетащите чтобы двигать'
            : 'Click to mark • Drag to move'}
      </motion.p>

      {/* Markers count */}
      {visibleMarkers.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs text-muted-foreground mt-1"
        >
          {locale === 'ru'
            ? `Отмечено: ${visibleMarkers.length}`
            : `Marked: ${visibleMarkers.length}`}
        </motion.p>
      )}
    </div>
  );
}
