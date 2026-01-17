'use client';

import type { BodyZoneId, ZonePreference } from '@/lib/types';
import {
  PREFERENCE_COLORS,
  type ZoneCoordinate,
  type ZoneShape,
  type EllipseShape,
  type RectShape,
  type CircleShape,
} from '../body-zones';

interface ZoneRendererProps {
  zones: ZoneCoordinate[];
  markings: Map<BodyZoneId, ZonePreference>;
  selectedColor: ZonePreference | null;
  onZoneClick: (zoneId: BodyZoneId) => void;
  onZoneHover?: (zoneId: BodyZoneId | null) => void;
}

export function ZoneRenderer({
  zones,
  markings,
  selectedColor,
  onZoneClick,
  onZoneHover,
}: ZoneRendererProps) {
  const getZoneFill = (zoneId: BodyZoneId) => {
    const pref = markings.get(zoneId);
    if (pref) {
      return PREFERENCE_COLORS[pref].fill;
    }
    return 'transparent';
  };

  const getZoneStroke = (zoneId: BodyZoneId) => {
    const pref = markings.get(zoneId);
    if (pref) {
      return PREFERENCE_COLORS[pref].stroke;
    }
    return 'rgba(100, 100, 100, 0.3)';
  };

  const zoneClass = selectedColor
    ? 'cursor-pointer hover:opacity-80 transition-opacity'
    : 'cursor-not-allowed opacity-50';

  const renderShape = (shape: ZoneShape, zoneId: BodyZoneId, index: number) => {
    const commonProps = {
      key: `${zoneId}-${index}`,
      'data-zone-id': zoneId,
      fill: getZoneFill(zoneId),
      stroke: getZoneStroke(zoneId),
      strokeWidth: 1,
      className: zoneClass,
      onClick: () => onZoneClick(zoneId),
      onMouseEnter: () => onZoneHover?.(zoneId),
      onMouseLeave: () => onZoneHover?.(null),
    };

    switch (shape.type) {
      case 'ellipse': {
        const s = shape as EllipseShape;
        return <ellipse {...commonProps} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />;
      }
      case 'rect': {
        const s = shape as RectShape;
        return (
          <rect
            {...commonProps}
            x={s.x}
            y={s.y}
            width={s.width}
            height={s.height}
            rx={s.rx}
          />
        );
      }
      case 'circle': {
        const s = shape as CircleShape;
        return <circle {...commonProps} cx={s.cx} cy={s.cy} r={s.r} />;
      }
    }
  };

  return (
    <>
      {zones.map((zone) =>
        zone.shapes.map((shape, index) => renderShape(shape, zone.zoneId, index))
      )}
    </>
  );
}
