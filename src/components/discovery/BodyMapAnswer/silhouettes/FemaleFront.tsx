'use client';

import type { BodyZoneId, ZonePreference } from '@/lib/types';
import { ZONE_COORDINATES } from '../body-zones';
import { ZoneRenderer } from './ZoneRenderer';

interface FemaleFrontProps {
  markings: Map<BodyZoneId, ZonePreference>;
  selectedColor: ZonePreference | null;
  onZoneClick: (zoneId: BodyZoneId) => void;
  onZoneHover?: (zoneId: BodyZoneId | null) => void;
}

export function FemaleFront({
  markings,
  selectedColor,
  onZoneClick,
  onZoneHover,
}: FemaleFrontProps) {
  const zones = ZONE_COORDINATES['female-front'];

  return (
    <div className="relative w-full h-full max-h-[500px] flex items-center justify-center">
      {/* Background image */}
      <img
        src="/images/dolls/woman_front.jpeg"
        alt="Female body front"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      {/* SVG overlay for clickable zones */}
      <svg
        viewBox="0 0 100 200"
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'contain' }}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <ZoneRenderer
          zones={zones}
          markings={markings}
          selectedColor={selectedColor}
          onZoneClick={onZoneClick}
          onZoneHover={onZoneHover}
        />
      </svg>
    </div>
  );
}
